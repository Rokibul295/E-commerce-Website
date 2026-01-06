const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// @route   GET /api/notifications
router.get('/', auth, notificationController.getNotifications);

// @route   GET /api/notifications/unread-count
router.get('/unread-count', auth, notificationController.getUnreadCount);

// @route   PUT /api/notifications/:id/read
router.put('/:id/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
router.put('/read-all', auth, notificationController.markAllAsRead);

module.exports = router;

