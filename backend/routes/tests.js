const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// ─── TEACHER: Create Test ─────────────────────────────────────────────────────
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const test = await Test.create({ ...req.body, teacher: req.user._id });
    // Notify all students
    const students = await User.find({ role: 'student' });
    const notification = { message: `New test created: ${test.title}`, type: 'test' };
    await User.updateMany({ role: 'student' }, { $push: { notifications: notification } });
    res.status(201).json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TEACHER: Get all tests ───────────────────────────────────────────────────
router.get('/teacher/all', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const tests = await Test.find({ teacher: req.user._id }).sort('-createdAt');
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TEACHER: Update Test ─────────────────────────────────────────────────────
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TEACHER: Delete Test ─────────────────────────────────────────────────────
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Test.findOneAndDelete({ _id: req.params.id, teacher: req.user._id });
    res.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── STUDENT: Get available tests ─────────────────────────────────────────────
router.get('/student/available', protect, async (req, res) => {
  try {
    const now = new Date();
    const tests = await Test.find({ isPublished: true, $or: [{ scheduledAt: { $lte: now } }, { scheduledAt: null }] })
      .select('-questions.options.isCorrect').sort('-scheduledAt');
    res.json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── STUDENT: Start/Get Test ──────────────────────────────────────────────────
router.get('/:id/start', protect, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test || !test.isPublished) return res.status(404).json({ success: false, message: 'Test not found' });
    const existing = await Submission.findOne({ test: req.params.id, student: req.user._id, status: 'submitted' });
    if (existing) return res.status(400).json({ success: false, message: 'Already submitted' });

    let inProgress = await Submission.findOne({ test: req.params.id, student: req.user._id, status: 'in-progress' });
    if (!inProgress) {
      inProgress = await Submission.create({ test: req.params.id, student: req.user._id, startedAt: new Date(), totalMarks: test.totalMarks });
    }

    // Shuffle if settings say so
    let questions = [...test.questions];
    if (test.settings.shuffleQuestions) questions.sort(() => Math.random() - 0.5);
    if (test.settings.shuffleOptions) {
      questions = questions.map(q => {
        if (q.options && q.options.length) {
          const shuffled = [...q.options].sort(() => Math.random() - 0.5);
          return { ...q.toObject(), options: shuffled };
        }
        return q;
      });
    }
    // Remove correct answer indicators
    const safeQuestions = questions.map(q => ({
      ...q.toObject ? q.toObject() : q,
      options: q.options?.map(o => ({ _id: o._id, text: o.text, image: o.image }))
    }));

    res.json({ success: true, test: { ...test.toObject(), questions: safeQuestions }, submissionId: inProgress._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── STUDENT: Submit Answer (auto-save) ───────────────────────────────────────
router.put('/:id/save-answer', protect, async (req, res) => {
  try {
    const { submissionId, questionId, answer, timeTaken } = req.body;
    const submission = await Submission.findOne({ _id: submissionId, student: req.user._id });
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const idx = submission.answers.findIndex(a => a.questionId?.toString() === questionId);
    if (idx >= 0) submission.answers[idx] = { ...submission.answers[idx].toObject(), answer, timeTaken };
    else submission.answers.push({ questionId, answer, timeTaken });
    await submission.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── STUDENT: Final Submit ────────────────────────────────────────────────────
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { submissionId, answers, timeTaken, tabSwitchCount } = req.body;
    const test = await Test.findById(req.params.id);
    const submission = await Submission.findOne({ _id: submissionId, student: req.user._id });
    if (!submission || !test) return res.status(404).json({ success: false, message: 'Not found' });

    let mcqMarks = 0;
    const evaluatedAnswers = answers.map(ans => {
      const question = test.questions.id(ans.questionId);
      if (!question) return ans;
      let isCorrect = false;
      let marksAwarded = 0;

      if (question.type === 'mcq-single' || question.type === 'mcq-multi') {
        const correctOpts = question.options.filter(o => o.isCorrect).map(o => o._id.toString());
        if (question.type === 'mcq-single') {
          isCorrect = ans.answer === correctOpts[0] || (Array.isArray(ans.answer) && ans.answer[0] === correctOpts[0]);
        } else {
          const given = Array.isArray(ans.answer) ? ans.answer.sort() : [ans.answer];
          isCorrect = JSON.stringify(given.sort()) === JSON.stringify(correctOpts.sort());
        }
        marksAwarded = isCorrect ? question.marks : -question.negativeMarks;
        mcqMarks += marksAwarded;
      } else if (question.type === 'numerical') {
        isCorrect = parseFloat(ans.answer) === parseFloat(question.correctAnswer);
        marksAwarded = isCorrect ? question.marks : -question.negativeMarks;
        mcqMarks += marksAwarded;
      }
      return { ...ans, isCorrect, marksAwarded, questionType: question.type, isEvaluated: question.type !== 'descriptive' };
    });

    submission.answers = evaluatedAnswers;
    submission.mcqMarks = mcqMarks;
    submission.marksObtained = mcqMarks;
    submission.totalMarks = test.totalMarks;
    submission.percentage = Math.round((mcqMarks / test.totalMarks) * 100);
    submission.timeTaken = timeTaken;
    submission.tabSwitchCount = tabSwitchCount || 0;
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    await submission.save();

    // Compute rank
    const allSubs = await Submission.find({ test: test._id, status: { $in: ['submitted', 'evaluated'] } }).sort('-marksObtained');
    const rank = allSubs.findIndex(s => s.student.toString() === req.user._id.toString()) + 1;
    submission.rank = rank;
    await submission.save();

    // XP reward
    const xp = Math.round(mcqMarks * 2);
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp } });

    res.json({ success: true, submission, rank });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TEACHER: Get Submissions for a test ──────────────────────────────────────
router.get('/:id/submissions', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ test: req.params.id })
      .populate('student', 'name email studentId batch')
      .sort('-marksObtained');
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── TEACHER: Evaluate descriptive answer ─────────────────────────────────────
router.put('/:testId/submissions/:submissionId/evaluate', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { answers } = req.body;
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    let descriptiveMarks = 0;
    answers.forEach(({ questionId, marksAwarded, teacherComment, annotatedImage }) => {
      const ans = submission.answers.find(a => a.questionId?.toString() === questionId);
      if (ans) {
        ans.marksAwarded = marksAwarded;
        ans.teacherComment = teacherComment;
        ans.annotatedImage = annotatedImage;
        ans.isEvaluated = true;
        if (ans.questionType === 'descriptive') descriptiveMarks += marksAwarded;
      }
    });
    submission.descriptiveMarks = descriptiveMarks;
    submission.marksObtained = submission.mcqMarks + descriptiveMarks;
    submission.percentage = Math.round((submission.marksObtained / submission.totalMarks) * 100);
    submission.status = 'evaluated';
    await submission.save();

    await User.findByIdAndUpdate(submission.student, {
      $push: { notifications: { message: `Your ${req.params.testId} test has been evaluated!`, type: 'marks' } }
    });
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── STUDENT: My Submissions ──────────────────────────────────────────────────
router.get('/my/submissions', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('test', 'title totalMarks type scheduledAt')
      .sort('-submittedAt');
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Alias used by frontend
router.get('/my-submissions', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('test', 'title totalMarks type scheduledAt')
      .sort('-submittedAt');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single submission detail
router.get('/submission/:id', protect, async (req, res) => {
  try {
    const sub = await Submission.findById(req.params.id)
      .populate('test', 'title totalMarks questions')
      .populate('student', 'name');
    if (!sub) return res.status(404).json({ message: 'Submission not found' });
    if (sub.student._id.toString() !== req.user._id.toString() && req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(sub);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload question image
router.post('/upload-image', protect, authorize('teacher', 'admin'), upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: req.file.path });
});

module.exports = router;
