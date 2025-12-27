const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sellerId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (sellerId) query.sellerId = sellerId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalItems = await Transaction.countDocuments(query);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    
    const revenueData = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'sale' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const refundData = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'refund' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalRevenue = revenueData[0]?.total || 0;
    const totalRefunds = refundData[0]?.total || 0;
    const netRevenue = totalRevenue - totalRefunds;
    
    res.json({
      success: true,
      data: {
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        totalRevenue: totalRevenue.toFixed(2),
        totalRefunds: totalRefunds.toFixed(2),
        netRevenue: netRevenue.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, action } = req.query;
    
    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const totalItems = await ActivityLog.countDocuments(query);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalItems,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};