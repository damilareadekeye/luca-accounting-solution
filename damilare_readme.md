# Accounting API Solution - Technical Documentation

## Project Overview
This solution implements two REST APIs for accounting operations:
1. **Cash Flow Statement API** - Generates cash flow statements categorized by operating, investing, and financing activities
2. **Bank Reconciliation API** - Performs bank reconciliation to identify discrepancies between ledger and bank balances

## Architecture Decisions

### Database Schema Extension
I extended the original schema with a `cashflow_category` column to improve query performance and maintainability. This allows for explicit categorization of transactions rather than relying solely on pattern matching.

### Project Structure
```
luca-accounting-solution/
├── controllers/          # Business logic for API endpoints
├── database/            # Database connection and setup scripts
├── queries/             # SQL queries (for documentation)
├── routes/              # API route definitions
├── .env                 # Environment configuration
├── package.json         # Dependencies
├── server.js           # Main application entry point
└── test-api.js         # API testing script
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd luca-accounting-solution
   npm install
   ```

2. **Configure Database**
   Edit `.env` file with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=accounting_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   PORT=3000
   ```

3. **Create Database**
   ```sql
   CREATE DATABASE accounting_db;
   ```

4. **Setup Database Schema**
   ```bash
   npm run setup-db
   ```
   This creates the tables and inserts sample data.

5. **Start the Server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

## API Endpoints

### 1. Cash Flow Statement API

**Endpoint:** `GET /api/cashflow`

**Query Parameters:**
- `companyid` (optional, default: 1)
- `fromDate` (required, format: YYYY-MM-DD)
- `toDate` (required, format: YYYY-MM-DD)

**Request:**
```
GET http://localhost:3000/api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31
```

**My Response Structure:**
```json
{
  "companyId": 1,
  "period": {
    "from": "2025-01-01",
    "to": "2025-01-31"
  },
  "cashFlowStatement": {
    "operatingActivities": {
      "inflows": 8000,
      "outflows": 6000,
      "netCashFromOperating": 2000
    },
    "investingActivities": {
      "inflows": 0,
      "outflows": 0,
      "netCashFromInvesting": 0
    },
    "financingActivities": {
      "inflows": 17000,
      "outflows": 7000,
      "netCashFromFinancing": 10000
    },
    "summary": {
      "openingCashBalance": 0,
      "netChangeInCash": 12000,
      "closingCashBalance": 12000
    }
  }
}
```

### 2. Bank Reconciliation API

**Endpoint:** `GET /api/reconciliation`

**Query Parameters:**
- `companyid` (optional, default: 1)
- `bankaccount` (required)

**Request:**
```
GET http://localhost:3000/api/reconciliation?companyid=1&bankaccount=MainBank
```

**My Response Structure:**
```json
{
  "companyId": 1,
  "bankAccount": "MainBank",
  "reconciliationDate": "2025-01-31",
  "balances": {
    "ledgerBalance": 22500,
    "bankStatementBalance": 19000
  },
  "reconcilingItems": {
    "addToBank": {
      "description": "Cheques issued but not yet presented",
      "items": [
        {
          "id": 3,
          "date": "2025-01-09T23:00:00.000Z", 
          "reference": "CHQ102",
          "party": "Supplier A",
          "description": "Purchase inventory",
          "amount": 3000
        }
      ],
      "total": 3000
    },
    "deductFromLedger": {
      "description": "Bank charges not yet recorded in ledger",
      "items": [
        {
          "id": 9,
          "date": "2025-01-27T23:00:00.000Z", 
          "reference": "CHQ104",
          "description": "Monthly service charge",
          "amount": 500
        }
      ],
      "total": 500
    }
  },
  "adjustedBalances": {
    "adjustedLedgerBalance": 22000,
    "adjustedBankBalance": 22000,
    "difference": 0
  },
  "reconciliationStatus": "Reconciled"
}
```

## Technical Implementation Details

### Cash Flow Classification Logic
Transactions are classified into three categories:
- **Operating Activities**: Day-to-day business operations (sales, expenses, inventory)
- **Investing Activities**: Purchase/sale of long-term assets and investments
- **Financing Activities**: Capital contributions, loans, dividends

The classification uses both the `cashflow_category` field and intelligent pattern matching on transaction notes.

### Reconciliation Logic
The reconciliation process:
1. Identifies unreconciled transactions (`reconciled = FALSE`)
2. Calculates ledger balance from all cash transactions
3. Compares with bank statement balance
4. Lists reconciling items (unpresented cheques, unrecorded charges)
5. Computes adjusted balances to verify reconciliation

## Testing the APIs

### Method 1: Using the Test Script
```bash
node test-api.js
```

### Method 2: Using curl
```bash
# Cash Flow Statement
curl "http://localhost:3000/api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31"

# Bank Reconciliation
curl "http://localhost:3000/api/reconciliation?companyid=1&bankaccount=MainBank"
```

### Method 3: Using Postman
Import these endpoints:
1. Cash Flow: `GET http://localhost:3000/api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31`
2. Reconciliation: `GET http://localhost:3000/api/reconciliation?companyid=1&bankaccount=MainBank`

## Key Features Implemented

1. **Robust Error Handling**: Validates input parameters and handles database errors gracefully
2. **Scalable Architecture**: Modular design with separated concerns (routes, controllers, database)
3. **Performance Optimization**: Extended schema reduces query complexity
4. **Clean JSON Responses**: Well-structured output for easy frontend integration
5. **Database Connection Pooling**: Efficient connection management for production use

## Production Considerations

For deployment:
1. Use environment variables for all sensitive configurations
2. Implement authentication/authorization middleware
3. Add request rate limiting
4. Set up proper logging (Winston/Morgan)
5. Configure HTTPS with SSL certificates
6. Implement database migrations for schema changes
7. Add comprehensive unit and integration tests
8. Set up monitoring and alerting

## Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists

**API Not Responding:**
- Check if port 3000 is available
- Verify Node.js installation
- Check console for error messages

**Reconciliation Discrepancies:**
- Ensure all transactions have proper `reconciled` flags
- Verify `bankaccount` parameter matches database records

## Contact
For any questions about this implementation, the approach taken prioritizes:
- Clean, maintainable code
- Proper accounting principles
- Production-ready architecture
- Clear documentation