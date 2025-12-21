const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    // Filter out null products from orders (products that were deleted)
    // Note: We keep the order but filter items on the frontend for better UX
    // This preserves order history even if products are deleted
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order from cart
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress: shippingAddress || {}
    });

    await order.save();
    
    // Clear cart after order
    cart.items = [];
    await cart.save();

    await order.populate('items.product');

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

