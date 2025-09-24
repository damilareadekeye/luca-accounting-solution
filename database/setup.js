const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Drop existing table if exists
    await client.query('DROP TABLE IF EXISTS AccountingLedgerEntry CASCADE');
    console.log('Dropped existing table if any');

    // Create table with extended schema
    const createTableQuery = `
      CREATE TABLE AccountingLedgerEntry (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        account VARCHAR(255) NOT NULL,
        debit NUMERIC DEFAULT 0,
        credit NUMERIC DEFAULT 0,
        party VARCHAR(255),
        note TEXT,
        bankaccount VARCHAR(255),
        reference VARCHAR(255),
        reconciled BOOLEAN DEFAULT FALSE,
        companyid INT NOT NULL DEFAULT 1,
        cashflow_category VARCHAR(50)
      )
    `;

    await client.query(createTableQuery);
    console.log('Created AccountingLedgerEntry table with extended schema');

    // Insert sample data with cash flow categories
    const insertDataQuery = `
      INSERT INTO AccountingLedgerEntry
      (date, account, debit, credit, party, note, bankaccount, reference, reconciled, companyid, cashflow_category)
      VALUES
      ('2025-01-02', 'Cash', 10000, 0, 'Investor', 'Capital Contribution', 'MainBank', 'DEP001', TRUE, 1, 'financing'),
      ('2025-01-05', 'Office Rent', 0, 2000, 'Landlord Ltd.', 'January rent', 'MainBank', 'CHQ101', TRUE, 1, 'operating'),
      ('2025-01-10', 'Inventory', 0, 3000, 'Supplier A', 'Purchase inventory', 'MainBank', 'CHQ102', FALSE, 1, 'operating'),
      ('2025-01-15', 'Sales', 0, 8000, 'Customer B', 'Sales Invoice', NULL, NULL, NULL, 1, 'operating'),
      ('2025-01-16', 'Cash', 8000, 0, 'Customer B', 'Payment received', 'MainBank', 'DEP002', TRUE, 1, 'operating'),
      ('2025-01-20', 'Utilities Expense', 0, 500, 'Power Co', 'Electricity bill', 'MainBank', 'CHQ103', TRUE, 1, 'operating'),
      ('2025-01-25', 'Bank Loan', 0, 7000, 'BigBank', 'Loan received', 'MainBank', 'DEP003', TRUE, 1, 'financing'),
      ('2025-01-26', 'Cash', 7000, 0, 'BigBank', 'Loan deposit', 'MainBank', 'DEP003', TRUE, 1, 'financing'),
      ('2025-01-28', 'Bank Charges', 0, 500, 'BigBank', 'Monthly service charge', 'MainBank', 'CHQ104', FALSE, 1, 'operating')
    `;

    await client.query(insertDataQuery);
    console.log('Inserted sample data with cash flow categories');

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();