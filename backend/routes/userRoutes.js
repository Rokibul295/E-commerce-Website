const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all sellers
router.get('/sellers', userController.getAllSellers);

// Get pending sellers
router.get('/sellers/pending', userController.getPendingSellers);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Approve seller
router.put('/sellers/:id/approve', userController.approveSeller);

// Deactivate seller
router.put('/sellers/:id/deactivate', userController.deactivateSeller);

module.exports = router;