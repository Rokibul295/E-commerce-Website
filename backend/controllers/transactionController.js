const { transactions, activityLogs } = require('../mockData');

// Get all transactions
exports.getAllTransactions = (req, res) => {
  const { page = 1, limit = 10, status, sellerId } = req.query;
  
  let filteredTransactions = [...transactions];
  
  // Filter by status
  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }
  
  // Filter by seller
  if (sellerId) {
    filteredTransactions = filteredTransactions.filter(t => t.sellerId === sellerId);
  }
  
  // Sort by timestamp (newest first)
  filteredTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredTransactions.length / limit),
      totalItems: filteredTransactions.length,
      itemsPerPage: parseInt(limit)
    }
  });
};

// Get transaction by ID
exports.getTransactionById = (req, res) => {
  const { id } = req.params;
  
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }
  
  res.json({ success: true, data: transaction });
};

// Get transaction statistics
exports.getTransactionStats = (req, res) => {
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
  
  const totalRevenue = transactions
    .filter(t => t.status === 'completed' && t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalRefunds = transactions
    .filter(t => t.status === 'completed' && t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);
  
  res.json({
    success: true,
    data: {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      totalRevenue: totalRevenue.toFixed(2),
      totalRefunds: totalRefunds.toFixed(2),
      netRevenue: (totalRevenue - totalRefunds).toFixed(2)
    }
  });
};

// Get activity logs
exports.getActivityLogs = (req, res) => {
  const { page = 1, limit = 20, userId, action } = req.query;
  
  let filteredLogs = [...activityLogs];
  
  // Filter by user
  if (userId) {
    filteredLogs = filteredLogs.filter(log => log.userId === userId);
  }
  
  // Filter by action
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action);
  }
  
  // Sort by timestamp (newest first)
  filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedLogs,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredLogs.length / limit),
      totalItems: filteredLogs.length,
      itemsPerPage: parseInt(limit)
    }
  });
};