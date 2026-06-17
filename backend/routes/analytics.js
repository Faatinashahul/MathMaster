const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Test = require('../models/Test');
const User = require('../models/User');
const { Attendance } = require('../models/index');
const { protect, authorize } = require('../middleware/auth');

// Teacher: Class analytics
router.get('/teacher/class', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const tests = await Test.find({ teacher: req.user._id });
    const testIds = tests.map(t => t._id);
    const submissions = await Submission.find({ test: { $in: testIds }, status: { $in: ['submitted', 'evaluated'] } })
      .populate('student', 'name studentId batch').populate('test', 'title totalMarks');

    const studentMap = {};
    submissions.forEach(sub => {
      const id = sub.student._id.toString();
      if (!studentMap[id]) studentMap[id] = { student: sub.student, scores: [], totalTests: 0 };
      studentMap[id].scores.push(sub.percentage);
      studentMap[id].totalTests++;
    });

    const studentStats = Object.values(studentMap).map(s => ({
      ...s, averageScore: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
    })).sort((a, b) => b.averageScore - a.averageScore);

    const avgClassScore = submissions.length ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length) : 0;
    res.json({ success: true, studentStats, avgClassScore, totalTests: tests.length, totalSubmissions: submissions.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Teacher: Individual student analytics
router.get('/teacher/student/:studentId', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.params.studentId, status: { $in: ['submitted', 'evaluated'] } })
      .populate('test', 'title chapters totalMarks type').sort('-submittedAt');
    const avgScore = submissions.length ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length) : 0;
    res.json({ success: true, submissions, avgScore });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Student: My analytics
router.get('/student/me', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id, status: { $in: ['submitted', 'evaluated'] } })
      .populate('test', 'title chapters totalMarks type').sort('-submittedAt');
    const user = await User.findById(req.user._id);
    const totalStudents = await User.countDocuments({ role: 'student' });

    const avgScore = submissions.length ? Math.round(submissions.reduce((s, sub) => s + sub.percentage, 0) / submissions.length) : 0;
    const bestScore = submissions.length ? Math.max(...submissions.map(s => s.percentage)) : 0;

    // Chapter-wise breakdown
    const chapterMap = {};
    submissions.forEach(sub => {
      (sub.test.chapters || []).forEach(ch => {
        if (!chapterMap[ch]) chapterMap[ch] = { chapter: ch, scores: [] };
        chapterMap[ch].scores.push(sub.percentage);
      });
    });
    const chapterStats = Object.values(chapterMap).map(c => ({ ...c, avg: Math.round(c.scores.reduce((a, b) => a + b, 0) / c.scores.length) }));

    const testHistory = submissions.map(sub => ({ testName: sub.test?.title?.substring(0,15) || 'Test', percentage: sub.percentage || 0 }));
    const allSubs = await Submission.aggregate([{ $match: { status: { $in: ['submitted','evaluated'] } } },{ $group: { _id: '$student', avgPct: { $avg: '$percentage' } } },{ $sort: { avgPct: -1 } }]);
    const rank = allSubs.findIndex(s => s._id.toString() === req.user._id.toString()) + 1;
    res.json({ success: true, stats: { avgScore, bestScore, totalTests: submissions.length, rank }, testHistory, chapterPerformance: chapterStats, xp: user.xp, level: user.level, badges: user.badges });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// Leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name xp level badges batch studentId');
    const ranked = students.sort((a, b) => b.xp - a.xp).map((s, i) => ({ ...s.toObject(), rank: i + 1 }));
    res.json(ranked);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
