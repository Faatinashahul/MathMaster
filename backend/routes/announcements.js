const express = require('express');
const router = express.Router();
const { Announcement } = require('../models/index');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, teacher: req.user._id });
    await User.updateMany({ role: 'student' }, { $push: { notifications: { message: req.body.title, type: 'announcement' } } });
    res.status(201).json({ success: true, announcement });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const announcements = await Announcement.find({ $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }] })
      .populate('teacher', 'name').sort('-isPinned -createdAt');
    res.json({ success: true, announcements });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
