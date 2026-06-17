const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/doubts', require('./routes/doubts'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/live', require('./routes/live'));
app.use('/api/analytics', require('./routes/analytics'));

// Socket.io for live features
require('./utils/socket')(io);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

// Connect DB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err); process.exit(1); });

module.exports = { app, io };
