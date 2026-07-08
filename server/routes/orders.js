const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// POST /api/orders — Place a new order using digital wallet coins
router.post('/', async (req, res) => {
  try {
    const { userId, recipientName, recipientPhone, message, items, totalAmount } = req.body;

    if (!userId || !items || !items.length || totalAmount === undefined) {
      return res.status(400).json({ msg: 'Missing required order fields.' });
    }

    // 1. Fetch User and verify wallet coins balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    if (user.walletCoins < totalAmount) {
      return res.status(400).json({ msg: `Insufficient wallet balance. You have PKR ${user.walletCoins}, but the order costs PKR ${totalAmount}.` });
    }

    // 2. Deduct coins and save user
    user.walletCoins -= totalAmount;
    await user.save();

    // 3. Resolve and sanitize vendorId for each item to prevent cast errors
    const Product = require('../models/Product');
    const resolvedItems = [];
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || ''));

    for (const item of items) {
      let finalVendorId = typeof item.vendorId === 'object' ? item.vendorId?._id : item.vendorId;
      
      if (!isValidObjectId(finalVendorId)) {
        try {
          const prod = await Product.findById(item.productId);
          if (prod && prod.vendorId) {
            finalVendorId = prod.vendorId;
          }
        } catch (e) {
          console.error("Error looking up product vendorId:", e);
        }
      }

      // If still invalid, fall back to a default valid ObjectId to prevent Mongoose schema crash
      if (!isValidObjectId(finalVendorId)) {
        finalVendorId = '60d5ecb8b392d72f8430e4a2';
      }

      resolvedItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        vendorId: finalVendorId
      });
    }

    // 4. Create the order
    const order = new Order({
      userId,
      recipientName: recipientName || user.name || '',
      recipientPhone: recipientPhone || user.phone || '',
      message: message || '',
      items: resolvedItems,
      totalAmount,
      status: 'Pending'
    });

    await order.save();

    res.status(201).json({
      msg: 'Order placed successfully using wallet balance.',
      order,
      remainingCoins: user.walletCoins
    });

  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/orders/vendor/:vendorId — Fetch orders that contain this vendor's products
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Find orders where at least one item belongs to this vendor
    const orders = await Order.find({ 'items.vendorId': vendorId })
      .populate('userId', 'name email city phone')
      .sort({ createdAt: -1 });

    // Filter items to show only this vendor's items or send full orders (normally full order details are good for fulfillment)
    res.json(orders);
  } catch (err) {
    console.error('Error fetching vendor orders:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// PUT /api/orders/:orderId/status — Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    order.status = status;
    await order.save();

    res.json({ msg: `Order status updated to ${status}.`, order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
