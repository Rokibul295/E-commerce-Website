const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Generate sales report
router.get('/sales', reportController.generateSalesReport);

// Generate user activity report
router.get('/user-activity', reportController.generateUserActivityReport);

// Generate comprehensive report
router.get('/comprehensive', reportController.generateComprehensiveReport);

module.exports = router;