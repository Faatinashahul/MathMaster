const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq-single', 'mcq-multi', 'descriptive', 'numerical', 'image-based'], required: true },
  questionText: { type: String, required: true },
  questionImage: { type: String, default: '' },
  latexExpression: { type: String, default: '' },
  options: [{ text: String, image: String, isCorrect: Boolean }],
  correctAnswer: mongoose.Schema.Types.Mixed,
  marks: { type: Number, required: true, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  descriptiveMarks: { type: Number, enum: [2, 6, 12], default: 2 },
  chapter: { type: String, default: '' },
  topic: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  explanation: { type: String, default: '' },
  order: { type: Number, default: 0 }
});

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batch: { type: String, default: 'All' },
  questions: [questionSchema],
  totalMarks: { type: Number, default: 0 },
  duration: { type: Number, required: true, default: 60 }, // in minutes
  scheduledAt: { type: Date },
  startTime: { type: Date },
  endTime: { type: Date },
  isActive: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  isSundayTest: { type: Boolean, default: false },
  settings: {
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    showResultImmediately: { type: Boolean, default: false },
    preventTabSwitch: { type: Boolean, default: true },
    fullScreenMode: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 1 }
  },
  chapters: [String],
  type: { type: String, enum: ['practice', 'sunday-test', 'chapter-test', 'mock'], default: 'practice' }
}, { timestamps: true });

testSchema.pre('save', function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  next();
});

module.exports = mongoose.model('Test', testSchema);
