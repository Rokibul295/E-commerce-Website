const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const BrowsingHistory = require('../models/BrowsingHistory');
const DismissedRecommendation = require('../models/DismissedRecommendation');

// @desc    Get personalized product recommendations
// @route   GET /api/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const recommendations = [];
    const recommendationScores = new Map(); // Track scores for better ranking

    // 1. Get dismissed recommendations
    const dismissedProducts = await DismissedRecommendation.find({ user: userId })
      .select('product');
    const dismissedIds = dismissedProducts.map(d => d.product.toString());

    // 2. Get user's order history
    const userOrders = await Order.find({ user: userId, status: 'delivered' })
      .populate('items.product')
      .limit(10);

    // 3. Get user's cart items
    const userCart = await Cart.findOne({ user: userId }).populate('items.product');

    // 4. Get user's reviewed products
    const userReviews = await Review.find({ user: userId }).select('product');

    // 5. Get user's browsing history (recent views)
    const browsingHistory = await BrowsingHistory.find({ user: userId })
      .populate('product')
      .sort({ lastViewedAt: -1 })
      .limit(20);

    // Analyze purchase history
    const purchasedCategories = {};
    const purchasedProducts = new Set();
    const purchasedProductIds = [];

    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) {
          const productId = item.product._id.toString();
          purchasedProducts.add(productId);
          purchasedProductIds.push(productId);
          const category = item.product.category;
          purchasedCategories[category] = (purchasedCategories[category] || 0) + item.quantity;
        }
      });
    });

    // Analyze browsing history
    const browsedCategories = {};
    const browsedProducts = new Set();
    const recentlyViewed = [];

    browsingHistory.forEach(history => {
      if (history.product) {
        const productId = history.product._id.toString();
        browsedProducts.add(productId);
        recentlyViewed.push({
          productId,
          viewCount: history.viewCount,
          lastViewed: history.lastViewedAt
        });
        const category = history.product.category;
        browsedCategories[category] = (browsedCategories[category] || 0) + history.viewCount;
      }
    });

    // Get cart product categories
    if (userCart && userCart.items.length > 0) {
      userCart.items.forEach(item => {
        if (item.product) {
          const category = item.product.category;
          purchasedCategories[category] = (purchasedCategories[category] || 0) + 1;
        }
      });
    }

    // Combine category preferences (purchases weighted higher than browsing)
    const categoryPreferences = {};
    Object.keys(purchasedCategories).forEach(cat => {
      categoryPreferences[cat] = (categoryPreferences[cat] || 0) + purchasedCategories[cat] * 3; // Purchase weight: 3x
    });
    Object.keys(browsedCategories).forEach(cat => {
      categoryPreferences[cat] = (categoryPreferences[cat] || 0) + browsedCategories[cat]; // Browse weight: 1x
    });

    // Find top categories
    const topCategories = Object.keys(categoryPreferences)
      .sort((a, b) => categoryPreferences[b] - categoryPreferences[a])
      .slice(0, 3);

    // Products to exclude
    const excludedIds = [
      ...Array.from(purchasedProducts),
      ...Array.from(browsedProducts),
      ...dismissedIds
    ];

    // Strategy 1: Products from frequently browsed categories (high priority)
    if (topCategories.length > 0) {
      const categoryProducts = await Product.find({
        _id: { $nin: excludedIds },
        category: { $in: topCategories }
      })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(8);

      categoryProducts.forEach(p => {
        const category = p.category;
        const score = categoryPreferences[category] || 0;
        recommendationScores.set(p._id.toString(), {
          product: p,
          score: score + (p.averageRating || 0) * 2, // Boost by rating
          reason: `Based on your ${category} interests`
        });
      });
    }

    // Strategy 2: Similar to recently viewed products
    if (recentlyViewed.length > 0) {
      const recentProductIds = recentlyViewed.slice(0, 5).map(v => v.productId);
      const recentProducts = await Product.find({ _id: { $in: recentProductIds } })
        .select('category');
      
      const similarCategories = [...new Set(recentProducts.map(p => p.category))];
      
      if (similarCategories.length > 0) {
        const similarProducts = await Product.find({
          _id: { $nin: [...excludedIds, ...recentProductIds] },
          category: { $in: similarCategories }
        })
        .sort({ averageRating: -1, reviewCount: -1 })
        .limit(6);

        similarProducts.forEach(p => {
          const existing = recommendationScores.get(p._id.toString());
          if (!existing) {
            recommendationScores.set(p._id.toString(), {
              product: p,
              score: 50 + (p.averageRating || 0) * 2,
              reason: 'Similar to products you viewed'
            });
          } else {
            existing.score += 30; // Boost for similarity
            existing.reason = 'Similar to products you viewed and purchased';
          }
        });
      }
    }

    // Strategy 3: Highly rated products in preferred categories
    if (topCategories.length > 0) {
      const highlyRated = await Product.find({
        _id: { $nin: excludedIds },
        category: { $in: topCategories },
        averageRating: { $gte: 4 }
      })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(6);

      highlyRated.forEach(p => {
        const existing = recommendationScores.get(p._id.toString());
        if (!existing) {
          recommendationScores.set(p._id.toString(), {
            product: p,
            score: 40 + (p.averageRating || 0) * 3,
            reason: 'Highly rated in categories you like'
          });
        }
      });
    }

    // Strategy 4: Fill remaining slots with trending/highly rated products
    if (recommendationScores.size < 6) {
      const trending = await Product.find({
        _id: { $nin: excludedIds }
      })
      .sort({ reviewCount: -1, averageRating: -1, createdAt: -1 })
      .limit(6 - recommendationScores.size);

      trending.forEach(p => {
        const existing = recommendationScores.get(p._id.toString());
        if (!existing) {
          recommendationScores.set(p._id.toString(), {
            product: p,
            score: 20 + (p.averageRating || 0) * 2,
            reason: 'Trending now'
          });
        }
      });
    }

    // Convert to array, sort by score, and format
    const scoredRecommendations = Array.from(recommendationScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => ({
        _id: item.product._id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        img: item.product.img || '/images/placeholder.svg',
        description: item.product.description,
        averageRating: item.product.averageRating,
        reviewCount: item.product.reviewCount,
        reason: item.reason
      }));

    res.json({
      recommendations: scoredRecommendations,
      basedOn: {
        purchaseHistory: userOrders.length > 0,
        browsingHistory: browsingHistory.length > 0,
        topCategories: topCategories,
        reviewedProducts: userReviews.length,
        recentlyViewed: recentlyViewed.length
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Track product view (for browsing history)
// @route   POST /api/recommendations/view
exports.trackProductView = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update or create browsing history
    const browsingHistory = await BrowsingHistory.findOneAndUpdate(
      { user: userId, product: productId },
      {
        $inc: { viewCount: 1 },
        $set: { lastViewedAt: new Date() }
      },
      { upsert: true, new: true }
    );

    res.json({ 
      message: 'View tracked',
      viewCount: browsingHistory.viewCount
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Dismiss a recommendation
// @route   POST /api/recommendations/dismiss
exports.dismissRecommendation = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Store dismissed recommendation
    await DismissedRecommendation.findOneAndUpdate(
      { user: userId, product: productId },
      { dismissedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Recommendation dismissed' });
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
