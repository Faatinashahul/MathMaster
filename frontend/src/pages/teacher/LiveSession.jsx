import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { Radio, Users, BarChart2, MessageCircle, Cloud } from 'lucide-react';

const SESSION_TYPES = [
  { value: 'quiz', label: 'Live Quiz', icon: BarChart2, desc: 'Students answer MCQs, see leaderboard' },
  { value: 'poll', label: 'Quick Poll', icon: Radio, desc: 'Instant poll with live results' },
  { value: 'wordcloud', label: 'Word Cloud', icon: Cloud, desc: 'Students type words, most common gets bigger' },
  { value: 'qa', label: 'Live Q&A', icon: MessageCircle, desc: 'Anonymous question submission' },
];

export default function LiveSession() {
  const [session, setSession] = useState(null);
  const [type, setType] = useState('poll');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [results, setResults] = useState({ optionCounts: {}, words: [], totalResponses: 0 });
  const [roomUsers, setRoomUsers] = useState(0);
  const [qaQuestions, setQaQuestions] = useState([]);
  const socketRef = useRef(null);
  const { user } = require('../../context/AuthContext').useAuth();
  const ROOM = 'main-class';

  useEffect(() => {
    socketRef.current = io('/', { path: '/socket.io' });
    socketRef.current.emit('join-room', { roomId: ROOM, user: { name: user?.name, role: 'teacher' } });
    socketRef.current.on('room-users', users => setRoomUsers(users.length));
    socketRef.current.on('answer-received', ({ totalAnswers }) => setResults(prev => ({ ...prev, totalResponses: totalAnswers })));
    socketRef.current.on('poll-update', ({ answer }) => setResults(prev => ({ ...prev, optionCounts: { ...prev.optionCounts, [answer]: (prev.optionCounts[answer] || 0) + 1 }, totalResponses: prev.totalResponses + 1 })));
    socketRef.current.on('word-added', ({ word }) => setResults(prev => ({ ...prev, words: [...prev.words, word] })));
    socketRef.current.on('new-question-qa', (q) => setQaQuestions(prev => [q, ...prev]));
    return () => socketRef.current?.disconnect();
  }, []);

  const startSession = async () => {
    if (!question) return toast.error('Enter a question');
    try {
      const res = await api.post('/live', { type, question, options: type === 'poll' || type === 'quiz' ? options.filter(Boolean) : [], batch: 'All' });
      setSession(res.data.session);
      setResults({ optionCounts: {}, words: [], totalResponses: 0 });
      socketRef.current.emit('launch-question', { roomId: ROOM, question, sessionId: res.data.session._id });
      toast.success('Session started! Students can join now.');
    } catch (err) { toast.error('Failed to start session'); }
  };

  const endSession = async () => {
    if (!session) return;
    await api.put(`/live/${session._id}/end`);
    const r = await api.get(`/live/${session._id}/results`);
    setResults(r.data);
    setSession(null);
    toast.success('Session ended');
  };

  const wordCounts = results.words.reduce((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc; }, {});
  const maxCount = Math.max(...Object.values(wordCounts), 1);

  return (
    
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Live Session</h1>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <Users size={14} className="text-gray-500" />
            <span className="text-sm font-medium">{roomUsers} online</span>
          </div>
        </div>

        {/* Session type selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SESSION_TYPES.map(({ value, label, icon: Icon, desc }) => (
            <button key={value} onClick={() => setType(value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${type === value ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'}`}>
              <Icon size={20} className={type === value ? 'text-blue-600 mb-2' : 'text-gray-400 mb-2'} />
              <p className={`font-semibold text-sm ${type === value ? 'text-blue-700' : 'text-gray-700'}`}>{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {/* Setup */}
        {!session ? (
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question / Prompt</label>
              <textarea className="input h-24 resize-none" placeholder={type === 'wordcloud' ? "What topic do you struggle with most?" : type === 'qa' ? "Ask me anything!" : "Which chapter is toughest?"} value={question} onChange={e => setQuestion(e.target.value)} />
            </div>
            {(type === 'poll' || type === 'quiz') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                {options.map((opt, i) => (
                  <input key={i} className="input mb-2" placeholder={`Option ${i + 1}`} value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }} />
                ))}
              </div>
            )}
            <button onClick={startSession} className="btn-primary flex items-center gap-2">
              <Radio size={16} /> Launch Session
            </button>
          </div>
        ) : (
          <div className="card bg-green-50 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-green-900 flex items-center gap-2">
                  <span className="relative w-3 h-3"><span className="live-badge absolute w-3 h-3 bg-red-500 rounded-full" /></span>
                  Session Live
                </p>
                <p className="text-green-700 text-sm mt-1">{question}</p>
              </div>
              <button onClick={endSession} className="btn-danger">End Session</button>
            </div>
            <p className="text-2xl font-bold text-green-900">{results.totalResponses} responses</p>
          </div>
        )}

        {/* Results */}
        {results.totalResponses > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Live Results ({results.totalResponses} responses)</h2>

            {/* Poll / Quiz results */}
            {(type === 'poll' || type === 'quiz') && Object.keys(results.optionCounts).length > 0 && (
              <div className="space-y-3">
                {options.filter(Boolean).map((opt, i) => {
                  const count = results.optionCounts[opt] || 0;
                  const pct = Math.round((count / results.totalResponses) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{opt}</span>
                        <span className="text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Word cloud */}
            {type === 'wordcloud' && (
              <div className="word-cloud flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl min-h-32">
                {Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).map(([word, count]) => (
                  <span key={word} style={{ fontSize: `${Math.max(12, Math.round((count / maxCount) * 40))}px`, color: `hsl(${(word.charCodeAt(0) * 37) % 360}, 70%, 45%)`, fontWeight: count > maxCount / 2 ? 700 : 400 }}>
                    {word}
                  </span>
                ))}
              </div>
            )}

            {/* Live Q&A */}
            {type === 'qa' && (
              <div className="space-y-3">
                {qaQuestions.map((q, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-800">{q.question}</p>
                    <p className="text-xs text-gray-400 mt-1">{q.studentName} • {new Date(q.timestamp).toLocaleTimeString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    
  );
}
