const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, username, phone, password, role, studentId, batch } = req.body;

    if (!name || !password) return res.status(400).json({ message: 'Name and password are required' });
    if (!username && !phone) return res.status(400).json({ message: 'Username or phone is required' });

    // Check duplicates
    if (username) {
      const exists = await User.findOne({ username: username.toLowerCase() });
      if (exists) return res.status(400).json({ message: 'Username already taken' });
    }
    if (phone) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(400).json({ message: 'Phone number already registered' });
    }

    const user = await User.create({
      name,
      username: username?.toLowerCase(),
      phone: phone || '',
      password,
      role: role || 'student',
      studentId: studentId || undefined,
      batch: batch || '',
    });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, username: user.username, phone: user.phone, role: user.role, xp: user.xp, level: user.level, badges: user.badges }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login — accepts username OR phone number
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Please provide username/phone and password' });

    // Try username first, then phone, then email (legacy)
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { phone: username },
        { email: username.toLowerCase() },
      ]
    }).select('+password');

    if (!user) return res.status(401).json({ message: 'No account found with that username or phone number' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, username: user.username, phone: user.phone, role: user.role, xp: user.xp, level: user.level, badges: user.badges }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, phone, batch } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, batch }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user.notifications || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/notifications/read', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].isRead': true } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
