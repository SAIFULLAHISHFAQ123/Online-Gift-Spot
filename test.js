const mongoose = require('mongoose');
const Product = require('./server/models/Product');

mongoose.connect('mongodb://127.0.0.1:27017/online_gift_spot')
  .then(async () => {
    try {
      const p = new Product({
        vendorId: '60d5ecb8b392d72f8430e4a2',
        name: 'Test',
        price: 100,
        category: 'gift-shop'
      });
      await p.save();
      console.log('Saved successfully');
    } catch (e) {
      console.error('Error saving:', e);
    }
    process.exit(0);
  });
