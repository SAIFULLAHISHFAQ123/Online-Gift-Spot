const express = require('express');
const router = express.Router();
const Friend = require('../models/Friend');
const User = require('../models/User');

// GET /api/friends/search?q=query&currentUserId=id — Search users
router.get('/search', async (req, res) => {
  try {
    const { q, currentUserId } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).select('name email city').limit(10);

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// POST /api/friends/request — Send friend request
router.post('/request', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ msg: 'senderId and receiverId are required' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ msg: 'Cannot send friend request to yourself' });
    }

    // Check if request already exists in either direction
    const existing = await Friend.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({ msg: 'You are already friends' });
      }
      return res.status(400).json({ msg: 'Friend request already sent' });
    }

    const friendRequest = new Friend({ senderId, receiverId, status: 'pending' });
    await friendRequest.save();

    res.status(201).json({ msg: 'Friend request sent!', request: friendRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/friends/:userId — Get friends list (accepted)
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const friendships = await Friend.find({
      $or: [
        { senderId: userId, status: 'accepted' },
        { receiverId: userId, status: 'accepted' }
      ]
    })
    .populate('senderId', 'name email city')
    .populate('receiverId', 'name email city');

    const friends = friendships.map(f => {
      const isSender = f.senderId._id.toString() === userId;
      const friend = isSender ? f.receiverId : f.senderId;
      return {
        friendshipId: f._id,
        _id: friend._id,
        name: friend.name,
        email: friend.email,
        city: friend.city,
        status: 'accepted'
      };
    });

    res.json(friends);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/friends/requests/:userId — Get incoming pending requests
router.get('/requests/:userId', async (req, res) => {
  try {
    const requests = await Friend.find({
      receiverId: req.params.userId,
      status: 'pending'
    }).populate('senderId', 'name email city');

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// GET /api/friends/sent/:userId — Get sent pending requests
router.get('/sent/:userId', async (req, res) => {
  try {
    const requests = await Friend.find({
      senderId: req.params.userId,
      status: 'pending'
    }).populate('receiverId', 'name email city');

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// PATCH /api/friends/:requestId — Accept or decline
router.patch('/:requestId', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'declined'

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ msg: 'Status must be accepted or declined' });
    }

    const request = await Friend.findByIdAndUpdate(
      req.params.requestId,
      { status },
      { new: true }
    );

    if (!request) return res.status(404).json({ msg: 'Request not found' });

    res.json({ msg: `Friend request ${status}`, request });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// DELETE /api/friends/:friendshipId — Remove friend
router.delete('/:friendshipId', async (req, res) => {
  try {
    await Friend.findByIdAndDelete(req.params.friendshipId);
    res.json({ msg: 'Friend removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;
