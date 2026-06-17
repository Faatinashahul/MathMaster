const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  username: { type: String, unique: true, sparse: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  phone: { type: String, unique: true, sparse: true, default: '' },
  // Student-specific
  studentId: { type: String, unique: true, sparse: true },
  batch: { type: String, default: '' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
  xp: { type: Number, default: 0 },
  badges: [{ type: String }],
  streakDays: { type: Number, default: 0 },
  lastLogin: { type: Date },
  // Notifications
  notifications: [{
    message: String,
    type: { type: String, enum: ['test', 'material', 'marks', 'announcement', 'badge'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
