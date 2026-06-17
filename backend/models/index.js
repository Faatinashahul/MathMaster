const mongoose = require('mongoose');

// Study Material
const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['pdf', 'ppt', 'video', 'image', 'other'], required: true },
  fileName: { type: String, default: '' },
  chapter: { type: String, required: true },
  topic: { type: String, default: '' },
  category: { type: String, enum: ['Notes', 'Formula Sheet', 'Practice Problems', 'Previous Year', 'Recorded Video', 'Other'], default: 'Notes' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  batch: { type: String, default: 'All' },
  downloadCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

// Attendance
const attendanceSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  code: { type: String, required: true, unique: true },
  batch: { type: String, default: 'All' },
  topic: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  students: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    markedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Doubt
const doubtSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  chapter: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'answered', 'resolved'], default: 'pending' },
  answers: [{
    responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    image: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [String]
}, { timestamps: true });

// Announcement
const announcementSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['general', 'test', 'material', 'holiday', 'urgent'], default: 'general' },
  batch: { type: String, default: 'All' },
  isPinned: { type: Boolean, default: false },
  expiresAt: { type: Date }
}, { timestamps: true });

// Live Session
const liveSessionSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['quiz', 'poll', 'wordcloud', 'qa'], required: true },
  batch: { type: String, default: 'All' },
  isActive: { type: Boolean, default: true },
  question: { type: String, default: '' },
  options: [String],
  responses: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answer: mongoose.Schema.Types.Mixed,
    timeTaken: Number,
    createdAt: { type: Date, default: Date.now }
  }],
  leaderboard: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    score: Number,
    rank: Number
  }]
}, { timestamps: true });

module.exports = {
  Material: mongoose.model('Material', materialSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Doubt: mongoose.model('Doubt', doubtSchema),
  Announcement: mongoose.model('Announcement', announcementSchema),
  LiveSession: mongoose.model('LiveSession', liveSessionSchema)
};
