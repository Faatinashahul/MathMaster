import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function StudentLiveQuiz() {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [qaInput, setQaInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [liveResults, setLiveResults] = useState(null);
  const [waitingMsg, setWaitingMsg] = useState('Waiting for teacher to start an activity...');

  useEffect(() => {
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', { room: 'main-class', userId: user?._id, userName: user?.name });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('question-launched', (data) => {
      setCurrentActivity(data);
      setAnswered(false);
      setFeedback(null);
      setLiveResults(null);
      setWordInput('');
      setQaInput('');
    });

    socket.on('activity-ended', (results) => {
      setLiveResults(results);
      setCurrentActivity(null);
      setWaitingMsg('Activity ended. Waiting for next one...');
    });

    socket.on('answer-correct', () => setFeedback({ type: 'correct', msg: '🎉 Correct! Great job!' }));
    socket.on('answer-wrong', () => setFeedback({ type: 'wrong', msg: '❌ Wrong answer. Better luck next time!' }));

    return () => socket.disconnect();
  }, [token, user]);

  const submitMCQ = (optionIndex) => {
    if (answered) return;
    socketRef.current.emit('live-answer', {
      room: 'main-class',
      userId: user?._id,
      userName: user?.name,
      answer: optionIndex,
      activityId: currentActivity?.id,
    });
    setAnswered(true);
    toast.success('Answer submitted!');
  };

  const submitPoll = (option) => {
    if (answered) return;
    socketRef.current.emit('poll-answer', { room: 'main-class', userId: user?._id, answer: option, activityId: currentActivity?.id });
    setAnswered(true);
    toast.success('Vote submitted!');
  };

  const submitWord = () => {
    if (!wordInput.trim() || answered) return;
    socketRef.current.emit('wordcloud-answer', { room: 'main-class', userId: user?._id, word: wordInput.trim(), activityId: currentActivity?.id });
    setAnswered(true);
    setWordInput('');
    toast.success('Word submitted!');
  };

  const submitQA = () => {
    if (!qaInput.trim()) return;
    socketRef.current.emit('qa-question', { room: 'main-class', userId: user?._id, userName: user?.name, question: qaInput.trim() });
    setQaInput('');
    toast.success('Question submitted!');
  };

  const renderActivity = () => {
    if (!currentActivity) return null;

    switch (currentActivity.type) {
      case 'quiz':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{currentActivity.question}</h2>
            {currentActivity.imageUrl && <img src={currentActivity.imageUrl} alt="question" className="mx-auto rounded-xl max-h-48 object-contain mb-6" />}
            {answered ? (
              <div className={`text-center p-6 rounded-2xl text-xl font-bold ${feedback?.type === 'correct' ? 'bg-green-100 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                {feedback?.msg || '✅ Answer submitted! Waiting for results...'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentActivity.options?.map((opt, i) => (
                  <button key={i} onClick={() => submitMCQ(i)}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-left font-medium text-gray-700 transition-all text-lg">
                    <span className="inline-block w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-center leading-8 mr-3">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'poll':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{currentActivity.question}</h2>
            {answered ? (
              <div className="text-center p-6 bg-green-50 rounded-2xl text-green-700 font-bold text-lg">✅ Vote recorded!</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentActivity.options?.map((opt, i) => (
                  <button key={i} onClick={() => submitPoll(opt)}
                    className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 text-gray-700 font-medium transition-all text-lg">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'wordcloud':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">{currentActivity.question}</h2>
            {answered ? (
              <div className="text-center p-6 bg-green-50 rounded-2xl text-green-700 font-bold text-lg">✅ Word submitted!</div>
            ) : (
              <div>
                <input value={wordInput} onChange={e => setWordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitWord()}
                  className="input text-lg text-center mb-4" placeholder="Type your word..." />
                <button onClick={submitWord} className="btn-primary w-full text-lg py-3">Submit Word</button>
              </div>
            )}
          </div>
        );

      case 'qa':
        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Live Q&A</h2>
            <p className="text-gray-500 text-center mb-6">Submit your questions anonymously</p>
            <textarea value={qaInput} onChange={e => setQaInput(e.target.value)}
              className="input min-h-[100px] mb-3" placeholder="Type your question here..." />
            <button onClick={submitQA} className="btn-primary w-full text-lg py-3">Submit Question</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Live Session</h1>
        <div className={`flex items-center gap-2 text-sm font-medium ${connected ? 'text-green-600' : 'text-red-500'}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></div>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {currentActivity ? (
        <div className="card">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mb-4 uppercase tracking-wide">
            {currentActivity.type}
          </div>
          {renderActivity()}
        </div>
      ) : liveResults ? (
        <div className="card text-center">
          <div className="text-5xl mb-3">🏁</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Activity Ended!</h2>
          {liveResults.correctAnswer !== undefined && (
            <p className="text-gray-600">Correct answer: <strong>{liveResults.correctAnswer}</strong></p>
          )}
          <p className="text-gray-400 mt-4 text-sm">Waiting for next activity...</p>
        </div>
      ) : (
        <div className="card text-center py-20">
          <div className="text-6xl mb-4 animate-bounce">📡</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{waitingMsg}</h2>
          <p className="text-gray-400 text-sm">Your teacher will launch the next activity</p>
        </div>
      )}

      <div className="mt-6 card bg-indigo-50 border-indigo-200">
        <p className="text-sm text-indigo-700 font-medium">👋 Joined as: {user?.name}</p>
        <p className="text-xs text-indigo-400 mt-1">Room: Main Class</p>
      </div>
    </div>
  );
}
