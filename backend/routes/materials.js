// routes/materials.js
const express = require('express');
const router = express.Router();
const { Material } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/', protect, authorize('teacher', 'admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const material = await Material.create({ ...req.body, teacher: req.user._id, fileUrl: req.file.path, fileName: req.file.originalname });
    res.status(201).json({ success: true, material });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const { chapter, category, search } = req.query;
    const query = { isPublished: true };
    if (chapter) query.chapter = chapter;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    const materials = await Material.find(query).populate('teacher', 'name').sort('-createdAt');
    res.json({ success: true, materials });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Material.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/download', protect, async (req, res) => {
  await Material.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
  res.json({ success: true });
});

module.exports = router;
