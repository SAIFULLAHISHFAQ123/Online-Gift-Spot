const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: String,
  images: [String],
  price: Number,
  stockQuantity: { type: Number, default: 0 },
  isOutOfStock: { type: Boolean, default: false },
  category: { 
    type: String, 
    enum: ["bakery", "mart", "gift-shop", "florist", "jewelry", "electronics", "clothing", "accessories", "toys", "home", "other"] 
  }
}, { timestamps: true });

productSchema.pre('save', function() {
  if (this.stockQuantity <= 0) {
    this.isOutOfStock = true;
  } else {
    this.isOutOfStock = false;
  }
});

module.exports = mongoose.model('Product', productSchema);
