-- Bank Reconciliation Query
-- Identifies unreconciled transactions for bank reconciliation

-- Get unreconciled transactions
SELECT
  id,
  date,
  account,
  debit,
  credit,
  party,
  note,
  reference,
  reconciled,
  CASE
    WHEN debit > 0 THEN 'debit'
    WHEN credit > 0 THEN 'credit'
    ELSE 'none'
  END AS transaction_type,
  CASE
    WHEN reconciled = FALSE THEN 'Unreconciled'
    ELSE 'Reconciled'
  END AS status
FROM AccountingLedgerEntry
WHERE companyid = $1
  AND bankaccount = $2
  AND reconciled = FALSE
ORDER BY date, id;