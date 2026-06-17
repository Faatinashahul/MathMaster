import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function MarkAttendance() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/attendance/my');
      const data = Array.isArray(res.data) ? res.data : (res.data?.records || res.data?.data || []);
      setHistory(data);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  };

  const markAttendance = async () => {
    if (!code.trim() || code.length < 4) return toast.error('Enter valid attendance code');
    setSubmitting(true);
    try {
      await api.post('/attendance/mark', { code: code.toUpperCase().trim() });
      toast.success('Attendance marked successfully! ✅');
      setSuccess(true);
      setCode('');
      fetchHistory();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    } finally { setSubmitting(false); }
  };

  const totalClasses = history.length;
  const presentCount = history.filter(h => h.status === 'present').length;
  const pct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h1>

      <div className="card mb-6 text-center">
        {success ? (
          <div className="py-8">
            <div className="text-6xl mb-3 animate-bounce">✅</div>
            <h2 className="text-xl font-bold text-green-600">Attendance Marked!</h2>
            <p className="text-gray-500 mt-1">You're marked present for today's class</p>
          </div>
        ) : (
          <>
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="font-bold text-gray-700 mb-2">Enter Attendance Code</h2>
            <p className="text-sm text-gray-400 mb-6">Your teacher will display this code during class</p>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && markAttendance()}
              maxLength={8}
              className="input text-center text-2xl font-black tracking-widest mb-4 uppercase"
              placeholder="MATH123"
            />
            <button onClick={markAttendance} disabled={submitting || !code.trim()}
              className="btn-primary w-full text-lg py-3">
              {submitting ? 'Marking...' : 'Mark Present ✓'}
            </button>
          </>
        )}
      </div>

      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-4">Attendance Summary</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.8" />
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={pct >= 75 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="3.8"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-black text-gray-700">{pct}%</span>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-xs text-gray-500">Present</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{totalClasses - presentCount}</div>
              <div className="text-xs text-gray-500">Absent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">{totalClasses}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        {pct < 75 && totalClasses > 0 && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-600">
            ⚠️ Attendance below 75%. Please attend more classes.
          </div>
        )}
      </div>

      {!loadingHistory && history.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-700 mb-4">Recent History</h2>
          <div className="space-y-2">
            {history.slice(0, 10).map((rec, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                <span className="text-gray-600">{new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${rec.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                  {rec.status === 'present' ? '✓ Present' : '✗ Absent'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
