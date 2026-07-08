const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  eventType: { 
    type: String, 
    enum: ['Birthday', 'Anniversary', 'Baby Shower', 'Wedding', 'Other'],
    default: 'Birthday'
  },
  contributionEnabled: { type: Boolean, default: false },
  progress: { type: Number, default: 0 }
}, { timestamps: true });

// Prevent duplicate wishlist entries per user+product
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
