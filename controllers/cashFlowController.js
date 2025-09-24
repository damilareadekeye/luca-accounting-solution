const pool = require('../database/connection');

const getCashFlowStatement = async (req, res) => {
  try {
    const { companyid = 1, fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        error: 'Missing required parameters: fromDate and toDate'
      });
    }

    // Main cash flow query
    const cashFlowQuery = `
      WITH cash_movements AS (
        SELECT
          date,
          account,
          party,
          note,
          reference,
          CASE
            WHEN account = 'Cash' AND debit > 0 THEN debit
            ELSE 0
          END AS cash_inflow,
          CASE
            WHEN account = 'Cash' AND credit > 0 THEN credit
            WHEN account != 'Cash' AND bankaccount IS NOT NULL AND credit > 0 THEN credit
            ELSE 0
          END AS cash_outflow,
          COALESCE(cashflow_category,
            CASE
              WHEN note ILIKE '%capital%' OR note ILIKE '%investor%' THEN 'financing'
              WHEN note ILIKE '%loan%' AND party ILIKE '%bank%' THEN 'financing'
              WHEN note ILIKE '%dividend%' THEN 'financing'
              WHEN note ILIKE '%equipment%' OR note ILIKE '%property%' OR note ILIKE '%asset%' THEN 'investing'
              WHEN note ILIKE '%investment%' AND NOT note ILIKE '%inventory%' THEN 'investing'
              ELSE 'operating'
            END
          ) AS activity_type
        FROM AccountingLedgerEntry
        WHERE companyid = $1
          AND date >= $2
          AND date <= $3
          AND (account = 'Cash' OR bankaccount IS NOT NULL)
      )
      SELECT
        activity_type,
        SUM(cash_inflow) AS total_inflows,
        SUM(cash_outflow) AS total_outflows,
        SUM(cash_inflow) - SUM(cash_outflow) AS net_cash_flow
      FROM cash_movements
      GROUP BY activity_type
    `;

    // Query for opening balance (cash before the period)
    const openingBalanceQuery = `
      SELECT COALESCE(SUM(
        CASE
          WHEN account = 'Cash' THEN debit - credit
          ELSE 0
        END
      ), 0) AS opening_balance
      FROM AccountingLedgerEntry
      WHERE companyid = $1
        AND date < $2
        AND account = 'Cash'
    `;

    // Execute queries
    const [cashFlowResult, openingBalanceResult] = await Promise.all([
      pool.query(cashFlowQuery, [companyid, fromDate, toDate]),
      pool.query(openingBalanceQuery, [companyid, fromDate])
    ]);

    // Process results
    const cashFlows = {
      operating: { inflows: 0, outflows: 0, netFlow: 0 },
      investing: { inflows: 0, outflows: 0, netFlow: 0 },
      financing: { inflows: 0, outflows: 0, netFlow: 0 }
    };

    cashFlowResult.rows.forEach(row => {
      const activity = row.activity_type;
      if (cashFlows[activity]) {
        cashFlows[activity].inflows = parseFloat(row.total_inflows) || 0;
        cashFlows[activity].outflows = parseFloat(row.total_outflows) || 0;
        cashFlows[activity].netFlow = parseFloat(row.net_cash_flow) || 0;
      }
    });

    const openingBalance = parseFloat(openingBalanceResult.rows[0].opening_balance) || 0;

    const totalNetChange =
      cashFlows.operating.netFlow +
      cashFlows.investing.netFlow +
      cashFlows.financing.netFlow;

    const closingBalance = openingBalance + totalNetChange;

    // Format response
    const response = {
      companyId: parseInt(companyid),
      period: {
        from: fromDate,
        to: toDate
      },
      cashFlowStatement: {
        operatingActivities: {
          inflows: cashFlows.operating.inflows,
          outflows: cashFlows.operating.outflows,
          netCashFromOperating: cashFlows.operating.netFlow
        },
        investingActivities: {
          inflows: cashFlows.investing.inflows,
          outflows: cashFlows.investing.outflows,
          netCashFromInvesting: cashFlows.investing.netFlow
        },
        financingActivities: {
          inflows: cashFlows.financing.inflows,
          outflows: cashFlows.financing.outflows,
          netCashFromFinancing: cashFlows.financing.netFlow
        },
        summary: {
          openingCashBalance: openingBalance,
          netChangeInCash: totalNetChange,
          closingCashBalance: closingBalance
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error generating cash flow statement:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  getCashFlowStatement
};