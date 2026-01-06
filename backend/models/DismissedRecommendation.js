const mongoose = require('mongoose');

const dismissedRecommendationSchema = new mongoose.Schema({
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
  dismissedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
dismissedRecommendationSchema.index({ user: 1, product: 1 }, { unique: true });
dismissedRecommendationSchema.index({ user: 1, dismissedAt: -1 });

module.exports = mongoose.model('DismissedRecommendation', dismissedRecommendationSchema);
