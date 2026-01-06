const express = require('express');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/orders
router.get('/', auth, orderController.getOrders);

// @route   POST /api/orders
router.post('/', auth, orderController.createOrder);

// @route   PUT /api/orders/:id/cancel
router.put('/:id/cancel', auth, orderController.cancelOrder);

// @route   GET /api/orders/all (Admin/Seller only)
router.get('/all', auth, orderController.getAllOrders);

// @route   PUT /api/orders/:id/status (Admin/Seller only)
router.put('/:id/status', auth, orderController.updateOrderStatus);

// @route   GET /api/orders/reports/sales (Admin/Seller only)
router.get('/reports/sales', auth, orderController.getSalesReport);

// @route   PUT /api/orders/:id/return
router.put('/:id/return', auth, orderController.requestReturn);

// @route   GET /api/orders/:id/receipt
router.get('/:id/receipt', auth, orderController.getOrderReceipt);

module.exports = router;

