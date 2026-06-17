import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    try {
      const res = await api.get('/tests/student/available');
      const data = Array.isArray(res.data) ? res.data : (res.data?.tests || res.data?.data || []);
      setTests(data);
    } catch { toast.error('Failed to load tests'); }
    finally { setLoading(false); }
  };

  const now = new Date();
  const filtered = tests.filter(t => {
    if (filter === 'upcoming') return t.isPublished && (!t.startTime || new Date(t.startTime) > now) && !t.mySubmission;
    if (filter === 'ongoing') return t.isPublished && t.startTime && new Date(t.startTime) <= now && new Date(t.endTime) >= now && !t.mySubmission;
    if (filter === 'completed') return !!t.mySubmission;
    return true;
  });

  const getStatus = (test) => {
    if (test.mySubmission) return { label: 'Completed', color: 'bg-green-100 text-green-700' };
    if (!test.startTime) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (new Date(test.startTime) > now) return { label: 'Scheduled', color: 'bg-yellow-100 text-yellow-700' };
    if (new Date(test.endTime) < now) return { label: 'Missed', color: 'bg-red-100 text-red-700' };
    return { label: 'Live Now', color: 'bg-green-100 text-green-700 animate-pulse' };
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tests</h1>

      <div className="flex gap-2 mb-6">
        {['all','upcoming','ongoing','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter===f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📝</div>
          <p>No tests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(test => {
            const status = getStatus(test);
            const isLive = status.label === 'Live Now';
            return (
              <div key={test._id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800">{test.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{test.description}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>⏱ {test.duration} mins</span>
                    <span>📊 {test.totalMarks} marks</span>
                    <span>❓ {test.questions?.length || 0} questions</span>
                    {test.startTime && <span>🗓 {new Date(test.startTime).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="ml-4">
                  {test.mySubmission ? (
                    <Link to={`/student/results/${test.mySubmission}`}
                      className="btn-primary bg-green-600 hover:bg-green-700">View Result</Link>
                  ) : isLive ? (
                    <Link to={`/student/test/${test._id}`}
                      className="btn-primary animate-pulse">Start Now!</Link>
                  ) : (
                    <button disabled className="px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm cursor-not-allowed">
                      {status.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
