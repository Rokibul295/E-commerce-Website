const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

// @route   GET /api/products
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
router.get('/:id', productController.getProductById);

// @route   POST /api/products
router.post('/', productController.createProduct);

module.exports = router;

