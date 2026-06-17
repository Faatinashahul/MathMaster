import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ResultDetail({ submissionId }) {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tests/submission/${submissionId}`)
      .then(r => setSub(r.data))
      .catch(() => toast.error('Failed to load result'))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;
  if (!sub) return <div className="text-center py-16 text-gray-400">Result not found</div>;

  const pct = sub.test?.totalMarks ? Math.round((sub.marksObtained / sub.test.totalMarks) * 100) : 0;
  const grade = pct >= 90 ? { label: 'A+', color: 'text-green-600' } : pct >= 75 ? { label: 'A', color: 'text-green-500' } : pct >= 60 ? { label: 'B', color: 'text-blue-500' } : pct >= 40 ? { label: 'C', color: 'text-yellow-500' } : { label: 'F', color: 'text-red-500' };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/student/results" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">← Back to Results</Link>
      
      <div className="card mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{sub.test?.title}</h2>
        <div className={`text-6xl font-black mb-2 ${grade.color}`}>{grade.label}</div>
        <div className="text-3xl font-bold text-gray-700 mb-1">{sub.marksObtained} / {sub.test?.totalMarks}</div>
        <div className="text-gray-500 mb-4">{pct}% · Rank #{sub.rank || '—'}</div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      <div className="space-y-4">
        {sub.answers?.map((ans, i) => {
          const q = sub.test?.questions?.[i];
          if (!q) return null;
          const isCorrect = ans.isCorrect;
          const isPending = ans.marksAwarded === undefined || ans.marksAwarded === null;
          return (
            <div key={i} className={`card border-l-4 ${isCorrect ? 'border-green-500' : isPending ? 'border-yellow-500' : 'border-red-400'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-500">Q{i+1} · {q.type?.toUpperCase()}</span>
                <span className={`text-sm font-bold ${isCorrect ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-red-500'}`}>
                  {isPending ? 'Pending' : `${ans.marksAwarded ?? 0}/${q.marks}`}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{q.questionText}</p>
              {q.type === 'mcq' && (
                <div className="space-y-1">
                  {q.options?.map((opt, oi) => {
                    const isSelected = ans.selectedOptions?.includes(oi);
                    const isRight = q.correctOptions?.includes(oi);
                    return (
                      <div key={oi} className={`text-sm px-3 py-1.5 rounded-lg ${isRight ? 'bg-green-100 text-green-800' : isSelected ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
                        {isRight ? '✓' : isSelected ? '✗' : '○'} {opt.text}
                      </div>
                    );
                  })}
                </div>
              )}
              {(q.type === 'descriptive' || q.type === 'numerical') && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mt-1">
                  <strong>Your answer:</strong> {ans.descriptiveAnswer || ans.numericalAnswer || '—'}
                </div>
              )}
              {ans.teacherComment && (
                <div className="mt-2 bg-blue-50 rounded-lg p-2 text-sm text-blue-700">
                  💬 <strong>Teacher:</strong> {ans.teacherComment}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function StudentResults() {
  const { submissionId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) {
      api.get('/tests/my-submissions')
        .then(r => setSubmissions(r.data))
        .catch(() => toast.error('Failed to load results'))
        .finally(() => setLoading(false));
    }
  }, [submissionId]);

  if (submissionId) return (
    <div className="p-6"><ResultDetail submissionId={submissionId} /></div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Results</h1>
      {submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📊</div>
          <p>No results yet. Take a test to see your results here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map(sub => {
            const pct = sub.test?.totalMarks ? Math.round((sub.marksObtained / sub.test.totalMarks) * 100) : 0;
            return (
              <div key={sub._id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{sub.test?.title}</h3>
                  <p className="text-sm text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                  <div className="flex gap-3 mt-2 text-sm">
                    <span className="text-indigo-600 font-bold">{sub.marksObtained}/{sub.test?.totalMarks}</span>
                    <span className="text-gray-400">Rank #{sub.rank || '—'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                        strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{pct}%</span>
                  </div>
                  <Link to={`/student/results/${sub._id}`} className="text-indigo-600 text-sm hover:underline">View →</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
