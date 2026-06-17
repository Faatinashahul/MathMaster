const { LiveSession } = require('../models/index');

module.exports = (io) => {
  const rooms = {};

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join class room
    socket.on('join-room', ({ roomId, user }) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = { users: [] };
      rooms[roomId].users.push({ socketId: socket.id, ...user });
      io.to(roomId).emit('room-users', rooms[roomId].users);
    });

    // Live quiz - teacher launches question
    socket.on('launch-question', ({ roomId, question, sessionId }) => {
      io.to(roomId).emit('new-question', { question, sessionId, startTime: Date.now() });
    });

    // Student submits live quiz answer
    socket.on('live-answer', async ({ roomId, sessionId, studentId, studentName, answer, timeTaken }) => {
      try {
        const session = await LiveSession.findById(sessionId);
        if (!session) return;
        const already = session.responses.find(r => r.student?.toString() === studentId);
        if (!already) {
          session.responses.push({ student: studentId, answer, timeTaken });
          await session.save();
        }
        // Compute live leaderboard for quiz
        const leaderboard = session.responses.map((r, i) => ({
          studentId: r.student, answer: r.answer, timeTaken: r.timeTaken
        }));
        io.to(roomId).emit('answer-received', { totalAnswers: session.responses.length, leaderboard });
      } catch (err) { console.error(err); }
    });

    // Poll / word cloud
    socket.on('poll-answer', ({ roomId, answer, studentName }) => {
      io.to(roomId).emit('poll-update', { answer, studentName });
    });

    // Word cloud answer
    socket.on('wordcloud-word', ({ roomId, word }) => {
      io.to(roomId).emit('word-added', { word });
    });

    // Live Q&A - student submits question
    socket.on('submit-question', ({ roomId, question, isAnonymous, studentName }) => {
      io.to(roomId).emit('new-question-qa', { question, studentName: isAnonymous ? 'Anonymous' : studentName, timestamp: new Date() });
    });

    // Teacher upvotes / answers a Q&A question
    socket.on('answer-question', ({ roomId, questionId, answer }) => {
      io.to(roomId).emit('question-answered', { questionId, answer });
    });

    // Attendance code display
    socket.on('show-attendance', ({ roomId, code, expiresAt }) => {
      io.to(roomId).emit('attendance-code', { code, expiresAt });
    });

    // Disconnect
    socket.on('disconnect', () => {
      Object.keys(rooms).forEach(roomId => {
        if (rooms[roomId]) {
          rooms[roomId].users = rooms[roomId].users.filter(u => u.socketId !== socket.id);
          io.to(roomId).emit('room-users', rooms[roomId].users);
        }
      });
    });
  });
};
