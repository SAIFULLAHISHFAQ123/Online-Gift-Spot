const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

// ======================
// User Signup
// ======================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, city, zone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: 'Name, Email and Password are required.'
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: 'User already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      city,
      zone,
      address,
      role: 'USER',
      isApproved: true,
      walletCoins: 10000  // Welcome bonus: 10,000 digital coins for new users
    });

    await user.save();

    res.status(201).json({
      msg: 'Registration successful',
      token: `user-token-${user._id}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        walletCoins: user.walletCoins
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      msg: 'Server Error',
      error: err.message
    });
  }
});


// ======================
// Vendor Signup
// ======================
router.post('/signup-vendor', async (req, res) => {
  try {

    const {
      ownerName,
      email,
      password,
      businessName,
      businessAddress,
      businessPhone,
      description,
      category,
      city,
      zone
    } = req.body;

    if (!ownerName || !email || !password || !businessName) {
      return res.status(400).json({
        msg: 'Please fill all required fields.'
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        msg: 'Email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name: ownerName,
      email,
      password: hashedPassword,
      phone: businessPhone,
      city,
      zone,
      role: 'VENDOR',
      isApproved: false
    });

    await user.save();

    const vendor = new Vendor({
      userId: user._id,
      name: ownerName,
      email,
      businessName,
      businessAddress,
      businessPhone,
      description,
      category,
      city,
      zone,
      isApproved: false
    });

    await vendor.save();

    res.status(201).json({
      msg: 'Vendor registration successful. Waiting for admin approval.'
    });

  } catch (err) {
    console.error("Vendor Signup Error:", err);

    res.status(500).json({
      msg: 'Server Error',
      error: err.message
    });
  }
});


// ======================
// Login
// ======================
// User Login
router.post('/login', async (req, res) => {
  try {
    console.log("========== LOGIN REQUEST ==========");
    console.log("Request Body:", req.body);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: "Email and password are required."
      });
    }

    // Find user (case-insensitive)
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    console.log("User Found:", user);

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "No account found with this email."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Incorrect password."
      });
    }

    // Role mapping
    const roleMap = {
      USER: "User",
      VENDOR: "Vendor",
      ADMIN: "Admin"
    };

    let vendorId = null;

    if (user.role === "VENDOR") {
      const vendor = await Vendor.findOne({
        userId: user._id
      });

      if (vendor) vendorId = vendor._id;
    }

    return res.status(200).json({
      success: true,
      msg: "Login successful",
      token: `token-${user._id}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: roleMap[user.role],
        vendorId,
        isApproved: user.isApproved,
        walletCoins: user.walletCoins
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: err.message
    });
  }
});

// PUT /api/auth/wallet/deposit — Add digital coins/currency
router.put('/wallet/deposit', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, msg: 'Valid userId and positive amount are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found.' });
    }

    user.walletCoins = (user.walletCoins || 0) + Number(amount);
    await user.save();

    res.json({
      success: true,
      msg: `Successfully deposited PKR ${amount} coins.`,
      walletCoins: user.walletCoins
    });
  } catch (err) {
    console.error('Wallet deposit error:', err);
    res.status(500).json({ success: false, msg: 'Server Error', error: err.message });
  }
});

// GET /api/auth/user/:userId — Get latest user profile details (like walletCoins)
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found.' });
    }

    const roleMap = {
      USER: "User",
      VENDOR: "Vendor",
      ADMIN: "Admin"
    };

    let vendorId = null;
    if (user.role === "VENDOR") {
      const vendor = await Vendor.findOne({ userId: user._id });
      if (vendor) vendorId = vendor._id;
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: roleMap[user.role],
        vendorId,
        isApproved: user.isApproved,
        walletCoins: user.walletCoins
      }
    });
  } catch (err) {
    console.error('Fetch user details error:', err);
    res.status(500).json({ success: false, msg: 'Server Error', error: err.message });
  }
});

module.exports = router;