const express = require('express');
const router = express.Router();
const { LiveSession } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const session = await LiveSession.create({ ...req.body, teacher: req.user._id });
    res.status(201).json({ success: true, session });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/active', protect, async (req, res) => {
  try {
    const session = await LiveSession.findOne({ isActive: true }).populate('teacher', 'name');
    res.json({ success: true, session });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/:id/respond', protect, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session || !session.isActive) return res.status(400).json({ success: false, message: 'Session not active' });
    const already = session.responses.find(r => r.student?.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'Already responded' });
    session.responses.push({ student: req.user._id, answer: req.body.answer, timeTaken: req.body.timeTaken });
    await session.save();
    res.json({ success: true, totalResponses: session.responses.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/end', protect, authorize('teacher', 'admin'), async (req, res) => {
  await LiveSession.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true });
});

router.get('/:id/results', protect, async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('responses.student', 'name');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    // Compute results
    const optionCounts = {};
    const words = [];
    session.responses.forEach(r => {
      if (typeof r.answer === 'string') {
        if (session.type === 'wordcloud') words.push(...r.answer.toLowerCase().split(/\s+/));
        else { optionCounts[r.answer] = (optionCounts[r.answer] || 0) + 1; }
      }
    });
    res.json({ success: true, session, optionCounts, words, totalResponses: session.responses.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
