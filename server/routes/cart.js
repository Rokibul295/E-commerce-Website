const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Remove items with null products (products that were deleted)
    const validItems = cart.items.filter(item => item.product !== null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemId = req.params.itemId;
    const itemIndex = cart.items.findIndex(i => i._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item by splicing the array
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');

    res.json(cart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemId = req.params.itemId;
    console.log(`Removing cart item ${itemId} for user ${req.user._id}`);

    // Find item index by string comparison (more reliable)
    const itemIndex = cart.items.findIndex(i => i._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Remove item by splicing the array
    cart.items.splice(itemIndex, 1);

    await cart.save();
    await cart.populate('items.product');

    console.log(`Cart item removed successfully. Remaining items: ${cart.items.length}`);
    res.json(cart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

