const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

// Generate Sales Report
exports.generateSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, sellerId } = req.query;
    
    const matchQuery = { type: 'sale' };
    
    if (startDate && endDate) {
      matchQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (sellerId) {
      matchQuery.sellerId = sellerId;
    }
    
    const transactions = await Transaction.find(matchQuery);
    
    const totalSales = transactions.length;
    const completedSales = transactions.filter(t => t.status === 'completed').length;
    const pendingSales = transactions.filter(t => t.status === 'pending').length;
    
    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const refunds = await Transaction.find({
      ...matchQuery,
      type: 'refund',
      status: 'completed'
    });
    
    const totalRefundAmount = refunds.reduce((sum, t) => sum + t.amount, 0);
    const netRevenue = totalRevenue - totalRefundAmount;
    const averageOrderValue = completedSales > 0 ? totalRevenue / completedSales : 0;
    
    // Group by seller
    const salesBySellerMap = {};
    transactions.forEach(t => {
      if (!salesBySellerMap[t.sellerId]) {
        salesBySellerMap[t.sellerId] = {
          sellerName: t.sellerName,
          totalSales: 0,
          totalRevenue: 0,
          transactions: 0
        };
      }
      salesBySellerMap[t.sellerId].transactions++;
      if (t.status === 'completed') {
        salesBySellerMap[t.sellerId].totalSales++;
        salesBySellerMap[t.sellerId].totalRevenue += t.amount;
      }
    });
    
    // Group by product
    const salesByProductMap = {};
    transactions.forEach(t => {
      if (t.status === 'completed') {
        if (!salesByProductMap[t.productName]) {
          salesByProductMap[t.productName] = {
            productName: t.productName,
            quantitySold: 0,
            totalRevenue: 0
          };
        }
        salesByProductMap[t.productName].quantitySold++;
        salesByProductMap[t.productName].totalRevenue += t.amount;
      }
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalRefunds: refunds.length,
          completedSales,
          pendingSales,
          totalRevenue: totalRevenue.toFixed(2),
          totalRefundAmount: totalRefundAmount.toFixed(2),
          netRevenue: netRevenue.toFixed(2),
          averageOrderValue: averageOrderValue.toFixed(2)
        },
        salesBySeller: Object.values(salesBySellerMap),
        salesByProduct: Object.values(salesByProductMap),
        transactions: transactions,
        reportGeneratedAt: new Date().toISOString(),
        filters: { startDate, endDate, sellerId }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate User Activity Report
exports.generateUserActivityReport = async (req, res) => {
  try {
    const { startDate, endDate, userId, action } = req.query;
    
    const matchQuery = {};
    
    if (startDate && endDate) {
      matchQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (userId) matchQuery.userId = userId;
    if (action) matchQuery.action = action;
    
    const logs = await ActivityLog.find(matchQuery).sort({ timestamp: -1 });
    
    const totalActivities = logs.length;
    const uniqueUsers = [...new Set(logs.map(log => log.userId.toString()))].length;
    
    // Group by action type
    const activitiesByActionMap = {};
    logs.forEach(log => {
      if (!activitiesByActionMap[log.action]) {
        activitiesByActionMap[log.action] = {
          action: log.action,
          count: 0
        };
      }
      activitiesByActionMap[log.action].count++;
    });
    
    // Group by user
    const activitiesByUserMap = {};
    logs.forEach(log => {
      const userIdStr = log.userId.toString();
      if (!activitiesByUserMap[userIdStr]) {
        activitiesByUserMap[userIdStr] = {
          userId: userIdStr,
          userName: log.userName,
          totalActivities: 0
        };
      }
      activitiesByUserMap[userIdStr].totalActivities++;
    });
    
    const mostActiveUsers = Object.values(activitiesByUserMap)
      .sort((a, b) => b.totalActivities - a.totalActivities)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalActivities,
          uniqueUsers,
          dateRange: { startDate, endDate }
        },
        activitiesByAction: Object.values(activitiesByActionMap),
        activitiesByUser: Object.values(activitiesByUserMap),
        mostActiveUsers,
        activityLogs: logs,
        reportGeneratedAt: new Date().toISOString(),
        filters: { startDate, endDate, userId, action }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate Comprehensive Report
exports.generateComprehensiveReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Get all sellers
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const activeSellers = await User.countDocuments({ role: 'seller', status: 'active' });
    const pendingSellers = await User.countDocuments({ role: 'seller', status: 'pending' });
    const deactivatedSellers = await User.countDocuments({ role: 'seller', status: 'deactivated' });
    
    // Get transactions data
    const transactionQuery = {};
    if (startDate && endDate) {
      transactionQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await Transaction.find(transactionQuery);
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const totalRevenue = transactions
      .filter(t => t.status === 'completed' && t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Get activity data
    const logQuery = {};
    if (startDate && endDate) {
      logQuery.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await ActivityLog.find(logQuery);
    const uniqueUserIds = [...new Set(logs.map(log => log.userId.toString()))];
    
    res.json({
      success: true,
      data: {
        userMetrics: {
          totalSellers,
          activeSellers,
          pendingSellers,
          deactivatedSellers
        },
        transactionMetrics: {
          totalTransactions,
          completedTransactions,
          pendingTransactions: transactions.filter(t => t.status === 'pending').length,
          totalRevenue: totalRevenue.toFixed(2)
        },
        activityMetrics: {
          totalActivities: logs.length,
          uniqueUsers: uniqueUserIds.length
        },
        reportGeneratedAt: new Date().toISOString(),
        filters: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
