const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  questionType: String,
  answer: mongoose.Schema.Types.Mixed,
  descriptiveAnswer: { type: String, default: '' },
  imageAnswer: { type: String, default: '' },
  marksAwarded: { type: Number, default: 0 },
  isCorrect: { type: Boolean, default: false },
  teacherComment: { type: String, default: '' },
  annotatedImage: { type: String, default: '' },
  isEvaluated: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 }
});

const submissionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [answerSchema],
  totalMarks: { type: Number, default: 0 },
  marksObtained: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // minutes
  submittedAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  status: { type: String, enum: ['in-progress', 'submitted', 'evaluated'], default: 'in-progress' },
  tabSwitchCount: { type: Number, default: 0 },
  isDisqualified: { type: Boolean, default: false },
  disqualifyReason: { type: String, default: '' },
  mcqMarks: { type: Number, default: 0 },
  descriptiveMarks: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
