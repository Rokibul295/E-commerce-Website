const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products called with query:', req.query);
    const { category, search, maxPrice, minPrice } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      console.warn('No products found for query', query);
    }
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a product (Admin only - add admin check in production)
router.post('/', async (req, res) => {
  try {
    const { name, category, price, img, description, stock } = req.body;
    const product = new Product({ name, category, price, img, description, stock });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

