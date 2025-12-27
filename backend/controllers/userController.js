const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).sort({ createdAt: -1 });
    res.json({ success: true, data: sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending sellers
exports.getPendingSellers = async (req, res) => {
  try {
    const pendingSellers = await User.find({ 
      role: 'seller', 
      status: 'pending' 
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: pendingSellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve seller account
exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    
    if (user.role !== 'seller') {
      return res.status(400).json({ success: false, message: 'User is not a seller' });
    }
    
    user.status = 'active';
    await user.save();
    
    // Add activity log
    await ActivityLog.create({
      userId: id,
      userName: 'Admin User',
      action: 'approved_seller',
      details: `Approved seller: ${user.name}`
    });
    
    res.json({ 
      success: true, 
      message: 'Seller approved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deactivate seller account
exports.deactivateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    
    if (user.role !== 'seller') {
      return res.status(400).json({ success: false, message: 'User is not a seller' });
    }
    
    user.status = 'deactivated';
    await user.save();
    
    // Add activity log
    await ActivityLog.create({
      userId: id,
      userName: 'Admin User',
      action: 'deactivated_seller',
      details: `Deactivated seller: ${user.name}. Reason: ${reason || 'Not specified'}`
    });
    
    res.json({ 
      success: true, 
      message: 'Seller deactivated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const activeSellers = await User.countDocuments({ role: 'seller', status: 'active' });
    const pendingSellers = await User.countDocuments({ role: 'seller', status: 'pending' });
    const deactivatedSellers = await User.countDocuments({ role: 'seller', status: 'deactivated' });
    
    res.json({
      success: true,
      data: {
        totalSellers,
        activeSellers,
        pendingSellers,
        deactivatedSellers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};