const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// POST /api/wishlist — Add product to wishlist
router.post('/', async (req, res) => {
  try {
    const { userId, productId, eventType } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ msg: 'userId and productId are required' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      return res.status(400).json({ msg: 'Product already in wishlist' });
    }

    const wishlistItem = new Wishlist({
      userId,
      productId,
      eventType: eventType || 'Birthday',
      contributionEnabled: false,
      progress: 0
    });

    await wishlistItem.save();

    // Populate product info before returning
    const populated = await Wishlist.findById(wishlistItem._id)
      .populate({
        path: 'productId',
        populate: { path: 'vendorId', select: 'businessName city' }
      });

    res.status(201).json({ msg: 'Added to wishlist', wishlistItem: populated });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/wishlist/:userId — Get user's wishlist
router.get('/:userId', async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.params.userId })
      .populate({
        path: 'productId',
        populate: { path: 'vendorId', select: 'businessName city' }
      })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// PATCH /api/wishlist/:id/contribute — Add contribution amount
router.patch('/:id/contribute', async (req, res) => {
  try {
    const { amount } = req.body;
    const item = await Wishlist.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item not found' });

    const product = await Product.findById(item.productId);
    const maxPrice = product ? product.price : Infinity;

    item.progress = Math.min(maxPrice, (item.progress || 0) + Number(amount));
    await item.save();

    res.json({ msg: 'Contribution added', item });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// DELETE /api/wishlist/:id — Remove from wishlist
router.delete('/:id', async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Removed from wishlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
