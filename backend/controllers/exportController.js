const { users, transactions, activityLogs } = require('../mockData');

// Export Users Data
exports.exportUsers = (req, res) => {
  const { format = 'json' } = req.query;
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalRecords: users.length,
    data: users
  };
  
  if (format === 'csv') {
    const csv = convertToCSV(users, ['id', 'name', 'email', 'role', 'status', 'phone', 'createdAt']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    return res.send(csv);
  }
  
  res.json({
    success: true,
    ...exportData
  });
};

// Export Transactions Data
exports.exportTransactions = (req, res) => {
  const { format = 'json', startDate, endDate } = req.query;
  
  let filteredTransactions = [...transactions];
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredTransactions = filteredTransactions.filter(t => {
      const txnDate = new Date(t.timestamp);
      return txnDate >= start && txnDate <= end;
    });
  }
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalRecords: filteredTransactions.length,
    filters: { startDate, endDate },
    data: filteredTransactions
  };
  
  if (format === 'csv') {
    const csv = convertToCSV(filteredTransactions, 
      ['id', 'sellerId', 'sellerName', 'buyerName', 'amount', 'type', 'status', 'timestamp', 'productName']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_export.csv');
    return res.send(csv);
  }
  
  res.json({
    success: true,
    ...exportData
  });
};

// Export Activity Logs
exports.exportActivityLogs = (req, res) => {
  const { format = 'json', startDate, endDate } = req.query;
  
  let filteredLogs = [...activityLogs];
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalRecords: filteredLogs.length,
    filters: { startDate, endDate },
    data: filteredLogs
  };
  
  if (format === 'csv') {
    const csv = convertToCSV(filteredLogs, 
      ['id', 'userId', 'userName', 'action', 'timestamp', 'ipAddress', 'details']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity_logs_export.csv');
    return res.send(csv);
  }
  
  res.json({
    success: true,
    ...exportData
  });
};

// Backup All Data
exports.backupAllData = (req, res) => {
  const backupData = {
    backupDate: new Date().toISOString(),
    version: '1.0',
    data: {
      users: users,
      transactions: transactions,
      activityLogs: activityLogs
    },
    metadata: {
      totalUsers: users.length,
      totalTransactions: transactions.length,
      totalLogs: activityLogs.length
    }
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=system_backup.json');
  res.json(backupData);
};

// Export Complete Report
exports.exportCompleteReport = (req, res) => {
  const { format = 'json' } = req.query;
  
  const reportData = {
    reportDate: new Date().toISOString(),
    summary: {
      totalUsers: users.length,
      totalSellers: users.filter(u => u.role === 'seller').length,
      activeSellers: users.filter(u => u.role === 'seller' && u.status === 'active').length,
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      totalRevenue: transactions
        .filter(t => t.status === 'completed' && t.type === 'sale')
        .reduce((sum, t) => sum + t.amount, 0).toFixed(2),
      totalActivities: activityLogs.length
    },
    users: users,
    transactions: transactions,
    activityLogs: activityLogs
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
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
}