const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Friend = require('../models/Friend');
const mongoose = require('mongoose');

// POST /api/events — Create a new event
router.post('/', async (req, res) => {
  try {
    const { userId, title, type, date, friendId, friendName, wishlistItems, recommendedItems } = req.body;

    if (!userId || !title || !date) {
      return res.status(400).json({ msg: 'userId, title, and date are required' });
    }

    const event = new Event({
      userId,
      title,
      type: type || 'Birthday',
      date,
      friendId: friendId || null,
      friendName: friendName || '',
      wishlistItems: wishlistItems || [],
      recommendedItems: recommendedItems || []
    });

    await event.save();
    res.status(201).json({ msg: 'Event created successfully', event });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/events/my/:userId — Get events created by a user
router.get('/my/:userId', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.params.userId })
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/events/friends/:userId — Get events of accepted friends
router.get('/friends/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all accepted friendships involving this user
    const friendships = await Friend.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    });

    // Collect the friend IDs
    const friendIds = friendships.map(f => {
      return f.senderId.toString() === userId ? f.receiverId : f.senderId;
    });

    if (friendIds.length === 0) {
      return res.json([]);
    }

    // Get events of friends, populated with user info
    const friendEvents = await Event.find({ userId: { $in: friendIds } })
      .populate('userId', 'name email city')
      .sort({ date: 1 });

    res.json(friendEvents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/events/:eventId — Get a single event
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('userId', 'name email city')
      .populate('friendId', 'name email city')
      .populate({
        path: 'wishlistItems.productId',
        populate: {
          path: 'vendorId',
          model: 'Vendor',
          select: 'businessName city'
        }
      })
      .populate({
        path: 'recommendedItems.productId',
        populate: {
          path: 'vendorId',
          model: 'Vendor',
          select: 'businessName city'
        }
      });
    
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// DELETE /api/events/:eventId — Delete an event
router.delete('/:eventId', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ msg: 'Event deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
