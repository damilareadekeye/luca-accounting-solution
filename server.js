const express = require('express');
const cors = require('cors');
require('dotenv').config();

const accountingRoutes = require('./routes/accountingRoutes');
const pool = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// API routes
app.use('/api', accountingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Accounting API Server',
    version: '1.0.0',
    endpoints: {
      cashFlow: 'GET /api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31',
      reconciliation: 'GET /api/reconciliation?companyid=1&bankaccount=MainBank',
      health: 'GET /health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Cash Flow API: http://localhost:${PORT}/api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31`);
  console.log(`Reconciliation API: http://localhost:${PORT}/api/reconciliation?companyid=1&bankaccount=MainBank`);
});