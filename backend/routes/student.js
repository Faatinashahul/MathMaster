const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/rank', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name xp').sort('-xp');
    const rank = students.findIndex(s => s._id.toString() === req.user._id.toString()) + 1;
    res.json({ success: true, rank, total: students.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
