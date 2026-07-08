const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Birthday', 'Anniversary', 'Baby Shower', 'Wedding', 'Other'],
    default: 'Birthday'
  },
  date: { type: Date, required: true },
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  friendName: { type: String, default: '' },
  wishlistItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      vendor: String
    }
  ],
  recommendedItems: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      vendor: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
