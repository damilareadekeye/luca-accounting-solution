# Accounting API Service

## Quick Start

1. Install dependencies: `npm install`
2. Setup database: `npm run setup-db`
3. Start server: `npm start`

## API Endpoints

### Cash Flow Statement
```
GET /api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31
```

### Bank Reconciliation
```
GET /api/reconciliation?companyid=1&bankaccount=MainBank
```

## Environment Configuration

Create a `.env` file with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=accounting_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
```

## Testing

Run the test script:
```bash
node test-api.js
```

See `damilare_readme.md` for detailed documentation, `damilare_output` for detailed output, and `screenshots-deliverables` for the detailed screenshots.