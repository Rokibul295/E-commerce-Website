const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Get user's orders
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
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
};

// @desc    Create a new order from cart
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { 
      customerName,
      customerPhone,
      shippingAddress, 
      paymentMethod = 'credit_card',
      paymentDetails 
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone) {
      return res.status(400).json({ message: 'Customer name and phone number are required' });
    }

    console.log('Creating order for user:', req.user._id);
    
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Filter out items with null products (products that were deleted)
    const validItems = cart.items.filter(item => item.product && item.product._id);
    
    if (validItems.length === 0) {
      // Clear invalid cart
      cart.items = [];
      await cart.save();
      return res.status(400).json({ 
        message: 'Cart contains invalid items. Please refresh and add products again.' 
      });
    }

    // Map valid items to order items
    const items = validItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid order total' });
    }

    console.log('Creating order with items:', items.length, 'Total:', totalAmount);

    // Secure payment processing with validation
    let paymentStatus = 'pending';
    let paymentInfo = {};

    // Validate payment method
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Process payment based on method
    if (paymentMethod === 'cash_on_delivery') {
      paymentStatus = 'pending';
      paymentInfo = { transactionId: null };
    } else {
      // Validate payment details for card payments
      if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
        if (!paymentDetails || !paymentDetails.cardNumber || !paymentDetails.cvv || !paymentDetails.expiryDate) {
          return res.status(400).json({ message: 'Payment details are required for card payments' });
        }

        // Validate card number (Luhn algorithm simulation)
        const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
        if (cardNumber.length < 13 || cardNumber.length > 19) {
          return res.status(400).json({ message: 'Invalid card number' });
        }

        // Validate CVV
        if (paymentDetails.cvv.length < 3 || paymentDetails.cvv.length > 4) {
          return res.status(400).json({ message: 'Invalid CVV' });
        }

        // Validate expiry date
        const [month, year] = paymentDetails.expiryDate.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiryDate < new Date()) {
          return res.status(400).json({ message: 'Card has expired' });
        }

        // Extract card brand from first digit
        const firstDigit = cardNumber[0];
        let cardBrand = 'Unknown';
        if (firstDigit === '4') cardBrand = 'Visa';
        else if (firstDigit === '5') cardBrand = 'Mastercard';
        else if (firstDigit === '3') cardBrand = 'American Express';
        else if (firstDigit === '6') cardBrand = 'Discover';

        // Store only last 4 digits for security (never store full card number)
        paymentInfo = {
          cardLast4: cardNumber.slice(-4),
          cardBrand: cardBrand,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };

        // Simulate payment processing (in production, integrate with payment gateway)
        // For demo purposes, simulate 95% success rate
        const paymentSuccess = Math.random() > 0.05; // 95% success rate
        
        if (paymentSuccess) {
          paymentStatus = 'completed';
        } else {
          return res.status(400).json({ 
            message: 'Payment failed. Please check your card details and try again.',
            paymentStatus: 'failed'
          });
        }
      } else if (paymentMethod === 'paypal') {
        // Simulate PayPal payment
        paymentInfo = {
          transactionId: `PP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
        paymentStatus = 'completed';
      } else if (paymentMethod === 'bank_transfer') {
        paymentStatus = 'pending';
        paymentInfo = {
          transactionId: `BT${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
      }
    }

    const order = new Order({
      user: req.user._id,
      items,
      totalAmount,
      customerName: customerName,
      customerPhone: customerPhone,
      shippingAddress: shippingAddress || {},
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paymentDetails: paymentInfo
    });

    await order.save();
    console.log('Order created:', order._id, 'Payment Status:', paymentStatus);
    
    // Clear cart after successful order
    if (paymentStatus === 'completed' || paymentMethod === 'cash_on_delivery') {
      cart.items = [];
      await cart.save();
      console.log('Cart cleared after order');
    }

    await order.populate('items.product');

    // Create notification (if notification controller exists)
    try {
      const notificationController = require('./notificationController');
      if (notificationController && notificationController.createNotification) {
        await notificationController.createNotification(
          req.user._id,
          `Your order #${order._id.toString().slice(-6)} has been placed successfully${paymentStatus === 'completed' ? ' and payment confirmed' : '. Payment pending.'}`,
          'order',
          `/orders`
        );
      }
    } catch (notifError) {
      console.warn('Could not create notification:', notifError.message);
      // Don't fail the order if notification fails
    }

    // Create transaction record
    try {
      const Transaction = require('../models/Transaction');
      await Transaction.create({
        user: req.user._id,
        order: order._id,
        amount: totalAmount,
        type: 'purchase',
        status: paymentStatus === 'completed' ? 'completed' : 'pending',
        paymentMethod: paymentMethod,
        transactionId: paymentInfo.transactionId
      });
    } catch (transError) {
      console.warn('Could not create transaction record:', transError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get order receipt
// @route   GET /api/orders/:id/receipt
exports.getOrderReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization - allow if user owns the order or is admin/seller
    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    const isAdminOrSeller = req.user.isAdmin || req.user.role === 'seller';
    
    if (!isOwner && !isAdminOrSeller) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }

    // Format payment method name
    const paymentMethodNames = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'paypal': 'PayPal',
      'cash_on_delivery': 'Cash on Delivery',
      'bank_transfer': 'Bank Transfer'
    };

    const paymentStatusNames = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'refunded': 'Refunded'
    };

    // Get customer info - use order customerName/customerPhone if available, otherwise use user info
    const customerName = order.customerName || (order.user ? order.user.name : 'Unknown');
    const customerPhone = order.customerPhone || 'N/A';
    const customerEmail = order.user ? order.user.email : 'N/A';

    const receipt = {
      orderId: order._id,
      orderNumber: order._id.toString().slice(-6).toUpperCase(),
      date: order.createdAt,
      customer: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail
      },
      items: order.items.map(item => ({
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      subtotal: order.totalAmount,
      tax: 0,
      shipping: 0,
      total: order.totalAmount,
      status: order.status || 'pending',
      shippingAddress: order.shippingAddress || {},
      paymentMethod: paymentMethodNames[order.paymentMethod] || (order.paymentMethod || 'Not specified'),
      paymentStatus: paymentStatusNames[order.paymentStatus] || (order.paymentStatus || 'pending'),
      paymentDetails: order.paymentDetails || {},
      transactionId: order.paymentDetails?.transactionId || 'N/A'
    };

    res.json(receipt);
  } catch (error) {
    console.error('Error generating receipt:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message || 'Server error while generating receipt' });
  }
};

// @desc    Get all orders (Admin/Seller only)
// @route   GET /api/orders/all
exports.getAllOrders = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const orders = await Order.find()
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status (Admin/Seller only)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    await order.populate('items.product');
    await order.populate('user', 'name email');

    // Create notification for the customer
    try {
      const notificationController = require('./notificationController');
      if (notificationController && notificationController.createNotification) {
        await notificationController.createNotification(
          order.user._id,
          `Your order #${order._id.toString().slice(-6)} status has been updated to: ${status}`,
          'order',
          `/orders`
        );
      }
    } catch (notifError) {
      console.warn('Could not create notification:', notifError.message);
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get sales report (Admin/Seller only)
// @route   GET /api/orders/reports/sales
exports.getSalesReport = async (req, res) => {
  try {
    // Ensure user is admin or seller
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'seller')) {
      return res.status(403).json({ message: 'Forbidden: Admins and Sellers only' });
    }

    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // Sales by product
    const salesByProduct = {};
    orders.forEach(order => {
      if (order.status === 'delivered') {
        order.items.forEach(item => {
          const productName = item.product?.name || 'Unknown Product';
          if (!salesByProduct[productName]) {
            salesByProduct[productName] = {
              productName,
              quantitySold: 0,
              totalRevenue: 0
            };
          }
          salesByProduct[productName].quantitySold += item.quantity;
          salesByProduct[productName].totalRevenue += item.price * item.quantity;
        });
      }
    });

    res.json({
      summary: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue.toFixed(2)
      },
      salesByProduct: Object.values(salesByProduct),
      orders: orders.map(o => ({
        _id: o._id,
        orderId: o._id.toString().slice(-6),
        user: o.user,
        status: o.status,
        totalAmount: o.totalAmount,
        itemsCount: o.items.length,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel delivered order. Please use return instead.' });
    }

    order.status = 'cancelled';
    await order.save();
    await order.populate('items.product');

    // Create notification
    try {
      const notificationController = require('./notificationController');
      if (notificationController && notificationController.createNotification) {
        await notificationController.createNotification(
          req.user._id,
          `Your order #${order._id.toString().slice(-6)} has been cancelled`,
          'cancel',
          `/orders`
        );
      }
    } catch (notifError) {
      console.warn('Could not create notification:', notifError.message);
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request return for an order
// @route   PUT /api/orders/:id/return
exports.requestReturn = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only delivered orders can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'Only delivered orders can be returned' 
      });
    }

    // Check if return already requested
    if (order.returnRequested) {
      return res.status(400).json({ message: 'Return already requested for this order' });
    }

    // Time limit: 7 days from delivery
    const daysSinceDelivery = (Date.now() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 7) {
      return res.status(400).json({ 
        message: 'Return request must be made within 7 days of delivery' 
      });
    }

    order.returnRequested = true;
    order.returnReason = reason || 'No reason provided';
    order.returnRequestedAt = new Date();
    await order.save();
    await order.populate('items.product');

    // Create notification
    try {
      const notificationController = require('./notificationController');
      if (notificationController && notificationController.createNotification) {
        await notificationController.createNotification(
          req.user._id,
          `Return requested for order #${order._id.toString().slice(-6)}`,
          'return',
          `/orders`
        );
      }
    } catch (notifError) {
      console.warn('Could not create notification:', notifError.message);
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
