const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/orders
router.get('/', auth, orderController.getOrders);

// @route   POST /api/orders
router.post('/', auth, orderController.createOrder);

module.exports = router;

