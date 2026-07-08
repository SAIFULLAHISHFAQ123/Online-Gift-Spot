const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  avatar: String,
  city: String,
  zone: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  address: {
    street: String,
    city: String,
    zone: String,
    state: String,
    zipCode: String,
    country: String
  },
  role: { 
    type: String, 
    enum: ['USER', 'VENDOR', 'ADMIN'], 
    default: 'USER' 
  },
  isApproved: { type: Boolean, default: false },
  walletCoins: { type: Number, default: 10000 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
