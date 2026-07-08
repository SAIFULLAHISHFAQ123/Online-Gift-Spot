const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/products/'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// GET /api/products — Get All Products (For User Marketplace)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendorId', 'businessName city zone category isApproved')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/products/city/:city — Get Products by Vendor City
router.get('/city/:city', async (req, res) => {
  try {
    const city = req.params.city;

    // Find vendors in that city (show all vendors regardless of approval)
    const vendors = await Vendor.find({ 
      city: { $regex: city, $options: 'i' }
    });

    if (vendors.length === 0) {
      return res.json([]);
    }

    const vendorIds = vendors.map(v => v._id);

    const products = await Product.find({ vendorId: { $in: vendorIds } })
      .populate('vendorId', 'businessName city zone category')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/products/vendor/:vendorId — Get Products by Vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId })
      .populate('vendorId', 'businessName city zone category')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// POST /api/products/:vendorId — Add Product
router.post('/:vendorId', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    const vendorId = req.params.vendorId;

    // Construct image URLs
    const images = req.files ? req.files.map(file => {
      return `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;
    }) : [];

    const product = new Product({
      vendorId,
      name,
      description,
      price,
      stockQuantity,
      category,
      images
    });

    await product.save();
    res.status(201).json({ msg: 'Product added successfully', product });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// DELETE /api/products/:productId — Delete product
router.delete('/:productId', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
