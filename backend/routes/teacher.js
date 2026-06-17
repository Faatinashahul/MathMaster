// routes/teacher.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/students', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { batch, search } = req.query;
    const query = { role: 'student' };
    if (batch) query.batch = batch;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { studentId: { $regex: search, $options: 'i' } }];
    const students = await User.find(query).select('-password').sort('name');
    res.json({ success: true, students });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/students/:id/badge', protect, authorize('teacher', 'admin'), async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { $addToSet: { badges: req.body.badge } });
  res.json({ success: true });
});

module.exports = router;
