const mongoose = require('mongoose');

const browsingHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  viewCount: {
    type: Number,
    default: 1
  },
  lastViewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
browsingHistorySchema.index({ user: 1, product: 1 }, { unique: true });
browsingHistorySchema.index({ user: 1, lastViewedAt: -1 });

module.exports = mongoose.model('BrowsingHistory', browsingHistorySchema);
