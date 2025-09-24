-- Cash Flow Statement Query
-- This query retrieves and classifies cash flows by activity type

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
ORDER BY
  CASE activity_type
    WHEN 'operating' THEN 1
    WHEN 'investing' THEN 2
    WHEN 'financing' THEN 3
  END;