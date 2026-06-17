import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/student/me')
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;
  if (!data) return null;

  const { stats, testHistory, chapterPerformance } = data;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Score', value: `${stats?.avgScore || 0}%`, icon: '📊', color: 'text-indigo-600' },
          { label: 'Tests Taken', value: stats?.totalTests || 0, icon: '📝', color: 'text-green-600' },
          { label: 'Best Score', value: `${stats?.bestScore || 0}%`, icon: '🏆', color: 'text-yellow-600' },
          { label: 'Current Rank', value: `#${stats?.rank || '—'}`, icon: '🎯', color: 'text-purple-600' },
        ].map((s, i) => (
          <div key={i} className="card text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {testHistory?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Score Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={testHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="testName" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
              <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {chapterPerformance?.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-bold text-gray-700 mb-4">Chapter-wise Performance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chapterPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="chapter" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                <Bar dataKey="avg" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="font-bold text-gray-700 mb-4">Strength Radar</h2>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={chapterPerformance.slice(0, 6)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="chapter" tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="avg" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {chapterPerformance?.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-bold text-gray-700 mb-4">Chapter Breakdown</h2>
          <div className="space-y-3">
            {chapterPerformance.map((ch, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{ch.chapter}</span>
                  <span className={`font-medium ${ch.avg >= 75 ? 'text-green-600' : ch.avg >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>{ch.avg}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${ch.avg >= 75 ? 'bg-green-500' : ch.avg >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                    style={{ width: `${ch.avg}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
