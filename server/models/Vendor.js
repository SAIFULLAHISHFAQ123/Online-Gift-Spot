const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    enum: ["bakery", "mart", "gift-shop", "florist", "jewelry", "electronics", "other"] 
  },
  businessName: { type: String, required: true },
  businessAddress: { type: String, required: true },
  businessPhone: String,
  description: String,
  city: { type: String, required: true },
  zone: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  deliveryRadiusKm: { type: Number, default: 15 },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
