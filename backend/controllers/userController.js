const { users, activityLogs } = require('../mockData');

// Get all sellers
exports.getAllSellers = (req, res) => {
  const sellers = users.filter(user => user.role === 'seller');
  res.json({ success: true, data: sellers });
};

// Get pending sellers
exports.getPendingSellers = (req, res) => {
  const pendingSellers = users.filter(
    user => user.role === 'seller' && user.status === 'pending'
  );
  res.json({ success: true, data: pendingSellers });
};

// Approve seller account
exports.approveSeller = (req, res) => {
  const { id } = req.params;
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Seller not found' });
  }
  
  if (users[userIndex].role !== 'seller') {
    return res.status(400).json({ success: false, message: 'User is not a seller' });
  }
  
  users[userIndex].status = 'active';
  
  // Add activity log
  activityLogs.push({
    id: `log${activityLogs.length + 1}`,
    userId: '3',
    userName: 'Admin User',
    action: 'approved_seller',
    timestamp: new Date(),
    details: `Approved seller: ${users[userIndex].name}`
  });
  
  res.json({ 
    success: true, 
    message: 'Seller approved successfully',
    data: users[userIndex]
  });
};

// Deactivate seller account
exports.deactivateSeller = (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'Seller not found' });
  }
  
  if (users[userIndex].role !== 'seller') {
    return res.status(400).json({ success: false, message: 'User is not a seller' });
  }
  
  users[userIndex].status = 'deactivated';
  
  // Add activity log
  activityLogs.push({
    id: `log${activityLogs.length + 1}`,
    userId: '3',
    userName: 'Admin User',
    action: 'deactivated_seller',
    timestamp: new Date(),
    details: `Deactivated seller: ${users[userIndex].name}. Reason: ${reason || 'Not specified'}`
  });
  
  res.json({ 
    success: true, 
    message: 'Seller deactivated successfully',
    data: users[userIndex]
  });
};

// Get user statistics
exports.getUserStats = (req, res) => {
  const totalSellers = users.filter(u => u.role === 'seller').length;
  const activeSellers = users.filter(u => u.role === 'seller' && u.status === 'active').length;
  const pendingSellers = users.filter(u => u.role === 'seller' && u.status === 'pending').length;
  const deactivatedSellers = users.filter(u => u.role === 'seller' && u.status === 'deactivated').length;
  
  res.json({
    success: true,
    data: {
      totalSellers,
      activeSellers,
      pendingSellers,
      deactivatedSellers
    }
  });
};