const { users, transactions, activityLogs } = require('../mockData');

// Generate Sales Report
exports.generateSalesReport = (req, res) => {
  const { startDate, endDate, sellerId } = req.query;
  
  let filteredTransactions = [...transactions];
  
  // Filter by date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredTransactions = filteredTransactions.filter(t => {
      const txnDate = new Date(t.timestamp);
      return txnDate >= start && txnDate <= end;
    });
  }
  
  // Filter by seller
  if (sellerId) {
    filteredTransactions = filteredTransactions.filter(t => t.sellerId === sellerId);
  }
  
  // Calculate metrics
  const totalSales = filteredTransactions.filter(t => t.type === 'sale').length;
  const totalRefunds = filteredTransactions.filter(t => t.type === 'refund').length;
  const completedSales = filteredTransactions.filter(t => t.status === 'completed' && t.type === 'sale').length;
  const pendingSales = filteredTransactions.filter(t => t.status === 'pending' && t.type === 'sale').length;
  
  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'completed' && t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalRefundAmount = filteredTransactions
    .filter(t => t.status === 'completed' && t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netRevenue = totalRevenue - totalRefundAmount;
  const averageOrderValue = completedSales > 0 ? totalRevenue / completedSales : 0;
  
  // Group by seller
  const salesBySeller = {};
  filteredTransactions.forEach(t => {
    if (!salesBySeller[t.sellerId]) {
      salesBySeller[t.sellerId] = {
        sellerName: t.sellerName,
        totalSales: 0,
        totalRevenue: 0,
        transactions: 0
      };
    }
    salesBySeller[t.sellerId].transactions++;
    if (t.status === 'completed' && t.type === 'sale') {
      salesBySeller[t.sellerId].totalSales++;
      salesBySeller[t.sellerId].totalRevenue += t.amount;
    }
  });
  
  // Group by product
  const salesByProduct = {};
  filteredTransactions.forEach(t => {
    if (t.type === 'sale' && t.status === 'completed') {
      if (!salesByProduct[t.productName]) {
        salesByProduct[t.productName] = {
          productName: t.productName,
          quantitySold: 0,
          totalRevenue: 0
        };
      }
      salesByProduct[t.productName].quantitySold++;
      salesByProduct[t.productName].totalRevenue += t.amount;
    }
  });
  
  res.json({
    success: true,
    data: {
      summary: {
        totalSales,
        totalRefunds,
        completedSales,
        pendingSales,
        totalRevenue: totalRevenue.toFixed(2),
        totalRefundAmount: totalRefundAmount.toFixed(2),
        netRevenue: netRevenue.toFixed(2),
        averageOrderValue: averageOrderValue.toFixed(2)
      },
      salesBySeller: Object.values(salesBySeller),
      salesByProduct: Object.values(salesByProduct),
      transactions: filteredTransactions,
      reportGeneratedAt: new Date().toISOString(),
      filters: { startDate, endDate, sellerId }
    }
  });
};

// Generate User Activity Report
exports.generateUserActivityReport = (req, res) => {
  const { startDate, endDate, userId, action } = req.query;
  
  let filteredLogs = [...activityLogs];
  
  // Filter by date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }
  
  // Filter by user
  if (userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === userId);
  }
  
  // Filter by action
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  // Calculate metrics
  const totalActivities = filteredLogs.length;
  const uniqueUsers = [...new Set(filteredLogs.map(log => log.userId))].length;
  
  // Group by action type
  const activitiesByAction = {};
  filteredLogs.forEach(log => {
    if (!activitiesByAction[log.action]) {
      activitiesByAction[log.action] = {
        action: log.action,
        count: 0
      };
    }
    activitiesByAction[log.action].count++;
  });
  
  // Group by user
  const activitiesByUser = {};
  filteredLogs.forEach(log => {
    if (!activitiesByUser[log.userId]) {
      activitiesByUser[log.userId] = {
        userId: log.userId,
        userName: log.userName,
        totalActivities: 0,
        actions: {}
      };
    }
    activitiesByUser[log.userId].totalActivities++;
    
    if (!activitiesByUser[log.userId].actions[log.action]) {
      activitiesByUser[log.userId].actions[log.action] = 0;
    }
    activitiesByUser[log.userId].actions[log.action]++;
  });
  
  // Get most active users
  const mostActiveUsers = Object.values(activitiesByUser)
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
      activitiesByAction: Object.values(activitiesByAction),
      activitiesByUser: Object.values(activitiesByUser),
      mostActiveUsers,
      activityLogs: filteredLogs,
      reportGeneratedAt: new Date().toISOString(),
      filters: { startDate, endDate, userId, action }
    }
  });
};

// Generate Comprehensive Report
exports.generateComprehensiveReport = (req, res) => {
  const { startDate, endDate } = req.query;
  
  // Get all sellers
  const totalSellers = users.filter(u => u.role === 'seller').length;
  const activeSellers = users.filter(u => u.role === 'seller' && u.status === 'active').length;
  const pendingSellers = users.filter(u => u.role === 'seller' && u.status === 'pending').length;
  
  // Get transactions data
  let filteredTransactions = [...transactions];
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredTransactions = filteredTransactions.filter(t => {
      const txnDate = new Date(t.timestamp);
      return txnDate >= start && txnDate <= end;
    });
  }
  
  const totalTransactions = filteredTransactions.length;
  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed').length;
  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'completed' && t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Get activity data
  let filteredLogs = [...activityLogs];
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }
  
  res.json({
    success: true,
    data: {
      userMetrics: {
        totalSellers,
        activeSellers,
        pendingSellers,
        deactivatedSellers: users.filter(u => u.role === 'seller' && u.status === 'deactivated').length
      },
      transactionMetrics: {
        totalTransactions,
        completedTransactions,
        pendingTransactions: filteredTransactions.filter(t => t.status === 'pending').length,
        totalRevenue: totalRevenue.toFixed(2)
      },
      activityMetrics: {
        totalActivities: filteredLogs.length,
        uniqueUsers: [...new Set(filteredLogs.map(log => log.userId))].length
      },
      reportGeneratedAt: new Date().toISOString(),
      filters: { startDate, endDate }
    }
  });
};