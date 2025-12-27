const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');

// Export Users Data
exports.exportUsers = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const users = await User.find({});
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: users.length,
      data: users
    };
    
    if (format === 'csv') {
      const csv = convertToCSV(users, ['_id', 'name', 'email', 'role', 'status', 'phone', 'createdAt']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
      return res.send(csv);
    }
    
    res.json({
      success: true,
      ...exportData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export Transactions Data
exports.exportTransactions = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const transactions = await Transaction.find(query).sort({ timestamp: -1 });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: transactions.length,
      filters: { startDate, endDate },
      data: transactions
    };
    
    if (format === 'csv') {
      const csv = convertToCSV(transactions, 
        ['_id', 'sellerId', 'sellerName', 'buyerName', 'amount', 'type', 'status', 'timestamp', 'productName']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
      return res.send(csv);
    }
    
    res.json({
      success: true,
      ...exportData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export Activity Logs
exports.exportActivityLogs = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const logs = await ActivityLog.find(query).sort({ timestamp: -1 });
    
    const exportData = {
      exportDate: new Date().toISOString(),
      totalRecords: logs.length,
      filters: { startDate, endDate },
      data: logs
    };
    
    if (format === 'csv') {
      const csv = convertToCSV(logs, 
        ['_id', 'userId', 'userName', 'action', 'timestamp', 'ipAddress', 'details']);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activity_logs_export.csv');
      return res.send(csv);
    }
    
    res.json({
      success: true,
      ...exportData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Backup All Data
exports.backupAllData = async (req, res) => {
  try {
    const users = await User.find({});
    const transactions = await Transaction.find({});
    const logs = await ActivityLog.find({});
    
    const backupData = {
      backupDate: new Date().toISOString(),
      version: '1.0',
      data: {
        users: users,
        transactions: transactions,
        activityLogs: logs
      },
      metadata: {
        totalUsers: users.length,
        totalTransactions: transactions.length,
        totalLogs: logs.length
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=system_backup.json');
    res.json(backupData);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export Complete Report
exports.exportCompleteReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const users = await User.find({});
    const transactions = await Transaction.find({});
    const logs = await ActivityLog.find({});
    
    const totalRevenue = transactions
      .filter(t => t.status === 'completed' && t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const reportData = {
      reportDate: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalSellers: users.filter(u => u.role === 'seller').length,
        activeSellers: users.filter(u => u.role === 'seller' && u.status === 'active').length,
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter(t => t.status === 'completed').length,
        totalRevenue: totalRevenue.toFixed(2),
        totalActivities: logs.length
      },
      users: users,
      transactions: transactions,
      activityLogs: logs
    };
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=complete_report.json');
      return res.json(reportData);
    }
    
    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to convert JSON to CSV
function convertToCSV(data, columns) {
  if (data.length === 0) return '';
  
  const header = columns.join(',');
  const rows = data.map(item => {
    return columns.map(col => {
      let value = item[col];
      if (value instanceof Date) {
        value = value.toISOString();
      }
      if (value && typeof value === 'object') {
        value = value.toString();
      }
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}
