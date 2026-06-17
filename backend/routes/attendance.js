const express = require('express');
const router = express.Router();
const { Attendance } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

// Generate attendance code
router.post('/generate', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { batch, topic, duration = 15 } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);
    const attendance = await Attendance.create({ teacher: req.user._id, code, batch, topic, expiresAt });
    res.status(201).json({ success: true, attendance, code });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Student marks attendance
router.post('/mark', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const attendance = await Attendance.findOne({ code, isActive: true, expiresAt: { $gt: new Date() } });
    if (!attendance) return res.status(404).json({ success: false, message: 'Invalid or expired code' });
    const alreadyMarked = attendance.students.find(s => s.student.toString() === req.user._id.toString());
    if (alreadyMarked) return res.status(400).json({ success: false, message: 'Attendance already marked' });
    attendance.students.push({ student: req.user._id });
    await attendance.save();
    res.json({ success: true, message: 'Attendance marked successfully!' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Teacher: Get attendance records
router.get('/teacher', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const records = await Attendance.find({ teacher: req.user._id })
      .populate('students.student', 'name studentId batch').sort('-createdAt');
    res.json({ success: true, records });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Student: Get my attendance
router.get('/my', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ 'students.student': req.user._id }).sort('-date');
    const total = await Attendance.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
    const attended = records.length;
    res.json({ success: true, records, percentage: total > 0 ? Math.round((attended / total) * 100) : 0, attended, total });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
