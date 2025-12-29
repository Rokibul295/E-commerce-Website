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

// @desc    Create a product (Admin only - add admin check in production)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    // Ensure user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const { name, category, price, img, description, stock } = req.body;
    const product = new Product({ name, category, price, img, description, stock });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

