const Product = require('../models/Product');

// @desc    Get all products with filters
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
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

    let products = await Product.find(query).sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      console.warn('No products found for query', query);
    }

    // Ensure each product has a usable img path (fall back to placeholder)
    products = products.map(p => ({
      _id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      img: p.img || '/images/placeholder.svg',
      description: p.description,
      stock: p.stock,
      averageRating: p.averageRating || 0,
      reviewCount: p.reviewCount || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Provide img fallback
    const result = {
      _id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      img: product.img || '/images/placeholder.svg',
      description: product.description,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product (Admin/Seller only)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const { name, category, price, img, description, stock } = req.body;
    
    if (!name || !category || !price || !img) {
      return res.status(400).json({ message: 'Name, category, price, and image are required' });
    }

    const product = new Product({ name, category, price, img, description, stock: stock || 0 });
    await product.save();
    
    // Check for low stock after creation
    if (product.stock < 10) {
      await checkLowStock(product);
    }
    
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update a product (Admin/Seller only)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const { name, category, price, img, description, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    if (name) product.name = name;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (img) product.img = img;
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = stock;

    await product.save();
    
    // Check for low stock after update
    if (product.stock < 10) {
      await checkLowStock(product);
    }
    
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a product (Admin/Seller only)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get product stock and sales data (Admin/Seller only)
// @route   GET /api/products/reports/stock
exports.getStockReport = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const products = await Product.find().sort({ stock: 1 });
    
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock < 10);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const totalStockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    res.json({
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalStockValue: totalStockValue.toFixed(2),
      lowStockProducts: lowStockProducts.map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        price: p.price,
        category: p.category
      })),
      outOfStockProducts: outOfStockProducts.map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        price: p.price,
        category: p.category
      })),
      allProducts: products.map(p => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        price: p.price,
        category: p.category,
        totalValue: (p.price * p.stock).toFixed(2)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Helper function to check and create low stock notifications
async function checkLowStock(product) {
  try {
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    
    // Get all admin users
    const admins = await User.find({ $or: [{ role: 'admin' }, { role: 'seller' }] });
    
    // Create notification for each admin/seller
    for (const admin of admins) {
      const existingNotification = await Notification.findOne({
        user: admin._id,
        message: { $regex: product.name, $options: 'i' },
        type: 'system',
        read: false
      });
      
      if (!existingNotification) {
        await Notification.create({
          user: admin._id,
          message: `⚠️ Low stock alert: ${product.name} has only ${product.stock} units left`,
          type: 'system',
          link: '/admin/products'
        });
      }
    }
  } catch (error) {
    console.error('Error creating low stock notification:', error);
  }
}
