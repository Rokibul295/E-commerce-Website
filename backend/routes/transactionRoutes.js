const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Get transaction statistics
router.get('/stats', transactionController.getTransactionStats);

// Get activity logs
router.get('/logs', transactionController.getActivityLogs);

// Get transaction by ID
router.get('/:id', transactionController.getTransactionById);

module.exports = router;