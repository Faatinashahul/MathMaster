import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [result, setResult] = useState(null);
  const startTime = useRef(Date.now());
  const tabRef = useRef(0);

  useEffect(() => {
    api.get(`/tests/${id}/start`).then(r => {
      setTest(r.data.test);
      setSubmissionId(r.data.submissionId);
      setTimeLeft(r.data.test.duration * 60);
    }).catch(err => {
      toast.error(err.response?.data?.message || 'Cannot start test');
      navigate('/student/tests');
    }).finally(() => setLoading(false));
  }, [id]);

  // Timer
  useEffect(() => {
    if (!test || result) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [test, result]);

  // Anti-cheat: tab switch detection
  useEffect(() => {
    if (!test?.settings?.preventTabSwitch) return;
    const onVisChange = () => {
      if (document.hidden) {
        tabRef.current++;
        setTabSwitches(tabRef.current);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [test]);

  // Fullscreen
  useEffect(() => {
    if (test?.settings?.fullScreenMode && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    return () => { if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, [test]);

  const setAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    // Auto-save
    api.put(`/tests/${id}/save-answer`, { submissionId, questionId, answer }).catch(() => {});
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000 / 60);
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    try {
      const res = await api.post(`/tests/${id}/submit`, { submissionId, answers: answersArray, timeTaken, tabSwitchCount: tabRef.current });
      setResult(res.data);
      if (document.exitFullscreen && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      toast.success('Test submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Submission failed'); setSubmitting(false); }
  }, [answers, submissionId, submitting, result, tabSwitches]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;

  // Result screen
  if (result) {
    const pct = result.submission?.percentage || 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${pct >= 60 ? 'bg-green-100' : 'bg-red-100'}`}>
            {pct >= 60 ? <CheckCircle size={40} className="text-green-600" /> : <AlertTriangle size={40} className="text-red-500" />}
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">{pct}%</h1>
          <p className="text-gray-500 mb-4">{result.submission?.marksObtained}/{result.submission?.totalMarks} marks</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900">#{result.rank}</p>
              <p className="text-xs text-gray-500">Class Rank</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-2xl font-bold text-gray-900">{result.submission?.timeTaken}m</p>
              <p className="text-xs text-gray-500">Time Taken</p>
            </div>
          </div>
          {tabRef.current > 0 && <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mb-4">Tab switched {tabRef.current} times (recorded)</p>}
          <div className="flex gap-3">
            <button onClick={() => navigate('/student/results')} className="btn-primary flex-1">View Results</button>
            <button onClick={() => navigate('/student')} className="btn-secondary flex-1">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) return null;
  const question = test.questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div className="exam-mode flex flex-col">
      {/* Tab switch warning */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-center py-3 font-semibold animate-bounce">
          ⚠️ Tab switch detected! ({tabSwitches} times). This is being recorded.
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between z-10 shadow-sm">
        <div>
          <p className="font-bold text-gray-900 text-sm">{test.title}</p>
          <p className="text-xs text-gray-500">{answered}/{test.questions.length} answered</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
        <button onClick={() => { if (window.confirm('Submit test now?')) handleSubmit(); }} disabled={submitting}
          className="btn-primary flex items-center gap-2 text-sm">
          <Send size={14} /> {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Question panel */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">{current + 1}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{question.marks} marks{question.negativeMarks > 0 ? ` | -${question.negativeMarks} negative` : ''}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">{question.type.replace('-', ' ')}</span>
              </div>
              <p className="text-gray-900 text-base leading-relaxed mb-4">{question.questionText}</p>
              {question.questionImage && <img src={question.questionImage} alt="Question" className="max-h-64 rounded-xl mb-4 border" />}
              {question.latexExpression && (
                <div className="bg-gray-50 p-3 rounded-xl font-mono text-sm text-blue-800 mb-4">
                  {question.latexExpression}
                </div>
              )}

              {/* MCQ Options */}
              {(question.type === 'mcq-single' || question.type === 'mcq-multi') && (
                <div className="space-y-2">
                  {question.options?.map((opt, oi) => {
                    const selected = question.type === 'mcq-single' ? answers[question._id] === opt._id : (answers[question._id] || []).includes(opt._id);
                    return (
                      <button key={oi} onClick={() => {
                        if (question.type === 'mcq-single') setAnswer(question._id, opt._id);
                        else {
                          const curr = answers[question._id] || [];
                          setAnswer(question._id, curr.includes(opt._id) ? curr.filter(x => x !== opt._id) : [...curr, opt._id]);
                        }
                      }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}>
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-300 text-gray-600'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <span className="text-sm text-gray-800">{opt.text}</span>
                        {opt.image && <img src={opt.image} alt="" className="h-12 ml-auto rounded" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Numerical */}
              {question.type === 'numerical' && (
                <input type="number" step="any" className="input text-lg font-mono" placeholder="Enter your answer" value={answers[question._id] || ''} onChange={e => setAnswer(question._id, e.target.value)} />
              )}

              {/* Descriptive */}
              {(question.type === 'descriptive' || question.type === 'image-based') && (
                <textarea className="input h-40 resize-none" placeholder="Write your answer here..." value={answers[question._id] || ''} onChange={e => setAnswer(question._id, e.target.value)}
                  onCopy={e => e.preventDefault()} onPaste={e => e.preventDefault()} />
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)} className="btn-secondary flex items-center gap-2 flex-1">
                <ChevronLeft size={16} /> Previous
              </button>
              {current < test.questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex items-center gap-2 flex-1">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={() => { if (window.confirm('Submit test?')) handleSubmit(); }} className="btn-primary flex items-center gap-2 flex-1">
                  <Send size={16} /> Submit Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question navigator */}
        <div className="hidden md:block w-56 border-l bg-gray-50 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">Questions</p>
          <div className="grid grid-cols-5 gap-1.5">
            {test.questions.map((q, i) => {
              const ans = answers[q._id];
              const isAnswered = ans !== undefined && ans !== '' && (!Array.isArray(ans) || ans.length > 0);
              return (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${i === current ? 'bg-blue-600 text-white' : isAnswered ? 'bg-green-100 text-green-700' : 'bg-white border text-gray-600 hover:border-blue-300'}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1 text-xs">
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-600 rounded" /><span className="text-gray-600">Current</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-100 border border-green-300 rounded" /><span className="text-gray-600">Answered</span></div>
            <div className="flex items-center gap-2"><span className="w-4 h-4 bg-white border rounded" /><span className="text-gray-600">Unanswered</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
