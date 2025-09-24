const express = require('express');
const router = express.Router();
const { getCashFlowStatement } = require('../controllers/cashFlowController');
const { getBankReconciliation } = require('../controllers/reconciliationController');

// Cash Flow Statement endpoint
router.get('/cashflow', getCashFlowStatement);

// Bank Reconciliation endpoint
router.get('/reconciliation', getBankReconciliation);

module.exports = router;