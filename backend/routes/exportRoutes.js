const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Export users
router.get('/users', exportController.exportUsers);

// Export transactions
router.get('/transactions', exportController.exportTransactions);

// Export activity logs
router.get('/logs', exportController.exportActivityLogs);

// Backup all data
router.get('/backup', exportController.backupAllData);

// Export complete report
router.get('/complete-report', exportController.exportCompleteReport);

module.exports = router;