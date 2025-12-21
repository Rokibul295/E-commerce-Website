const express = require('express');
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/cart
router.get('/', auth, cartController.getCart);

// @route   POST /api/cart
router.post('/', auth, cartController.addToCart);

// @route   PUT /api/cart/:itemId
router.put('/:itemId', auth, cartController.updateCartItem);

// @route   DELETE /api/cart/:itemId
router.delete('/:itemId', auth, cartController.removeCartItem);

// @route   DELETE /api/cart
router.delete('/', auth, cartController.clearCart);

module.exports = router;

