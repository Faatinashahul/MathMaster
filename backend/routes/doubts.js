const express = require('express');
const router = express.Router();
const { Doubt } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const doubt = await Doubt.create({
      ...req.body, student: req.user._id,
      image: req.file ? req.file.path : ''
    });
    res.status(201).json({ success: true, doubt });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const { chapter, status } = req.query;
    const query = {};
    if (chapter) query.chapter = chapter;
    if (status) query.status = status;
    const doubts = await Doubt.find(query)
      .populate('student', 'name avatar')
      .populate('answers.responder', 'name role avatar')
      .sort('-createdAt');
    res.json({ success: true, doubts });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/:id/answer', protect, upload.single('image'), async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });
    doubt.answers.push({ responder: req.user._id, text: req.body.text, image: req.file ? req.file.path : '' });
    if (req.user.role === 'teacher') doubt.status = 'answered';
    await doubt.save();
    res.json({ success: true, doubt });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    const idx = doubt.upvotes.indexOf(req.user._id);
    if (idx >= 0) doubt.upvotes.splice(idx, 1);
    else doubt.upvotes.push(req.user._id);
    await doubt.save();
    res.json({ success: true, upvotes: doubt.upvotes.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/resolve', protect, authorize('teacher', 'admin'), async (req, res) => {
  await Doubt.findByIdAndUpdate(req.params.id, { status: 'resolved' });
  res.json({ success: true });
});

module.exports = router;
