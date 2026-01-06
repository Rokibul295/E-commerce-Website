const express = require('express');
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/products
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
router.get('/:id', productController.getProductById);

// @route   POST /api/products (Admin/Seller only)
router.post('/', auth, productController.createProduct);

// @route   PUT /api/products/:id (Admin/Seller only)
router.put('/:id', auth, productController.updateProduct);

// @route   DELETE /api/products/:id (Admin/Seller only)
router.delete('/:id', auth, productController.deleteProduct);

// @route   GET /api/products/reports/stock (Admin/Seller only)
router.get('/reports/stock', auth, productController.getStockReport);

module.exports = router;

