import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, BookOpen, BarChart2, Trophy, Clock, Bell, Award, Flame } from 'lucide-react';

const LEVEL_PROGRESS = { Beginner: 0, Intermediate: 25, Advanced: 50, Expert: 75 };
const BADGE_ICONS = { 'Top Performer': '🏆', 'Consistent Learner': '📚', 'Quiz Master': '⚡', 'Perfect Attendance': '✅', 'Most Improved': '📈' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tests/student/available'),
      api.get('/announcements'),
      api.get('/analytics/student/me'),
      api.get('/student/rank')
    ]).then(([t, a, an, r]) => {
      setTests(t.data.tests?.slice(0, 5) || []);
      setAnnouncements(a.data.announcements?.slice(0, 4) || []);
      setAnalytics(an.data);
      setRank(r.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  const xpToNext = { Beginner: 500, Intermediate: 1500, Advanced: 3000, Expert: 9999 };
  const xpPct = Math.min(100, Math.round(((user?.xp || 0) / xpToNext[user?.level || 'Beginner']) * 100));

  return (
    
      <div className="space-y-6 fade-in">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold mt-1">{user?.name} 🎓</h1>
          <div className="flex items-center gap-6 mt-4">
            <div>
              <p className="text-3xl font-black">{analytics?.avgScore || 0}%</p>
              <p className="text-blue-200 text-xs">Avg Score</p>
            </div>
            <div>
              <p className="text-3xl font-black">#{rank?.rank || '—'}</p>
              <p className="text-blue-200 text-xs">Class Rank</p>
            </div>
            <div>
              <p className="text-3xl font-black">{user?.xp || 0}</p>
              <p className="text-blue-200 text-xs">XP Points</p>
            </div>
          </div>
          {/* Level progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>{user?.level || 'Beginner'}</span>
              <span>{xpPct}% to next level</span>
            </div>
            <div className="h-2 bg-blue-500 rounded-full">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Take Test', to: '/student/tests', icon: FileText, color: 'bg-blue-50 text-blue-700' },
            { label: 'My Results', to: '/student/results', icon: BarChart2, color: 'bg-green-50 text-green-700' },
            { label: 'Materials', to: '/student/materials', icon: BookOpen, color: 'bg-purple-50 text-purple-700' },
            { label: 'Leaderboard', to: '/student/leaderboard', icon: Trophy, color: 'bg-amber-50 text-amber-700' },
          ].map(({ label, to, icon: Icon, color }) => (
            <Link key={label} to={to} className={`p-4 rounded-xl text-center font-semibold text-sm transition-all hover:shadow-md ${color}`}>
              <Icon size={24} className="mx-auto mb-2" />
              {label}
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming tests */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Upcoming Tests</h2>
              <Link to="/student/tests" className="text-blue-600 text-sm">View all</Link>
            </div>
            {tests.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">No tests available right now</p> : (
              <div className="space-y-3">
                {tests.map(test => (
                  <div key={test._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${test.type === 'sunday-test' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{test.title}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {test.duration} min • {test.questions?.length} Qs • {test.totalMarks} marks</p>
                    </div>
                    <Link to={`/student/tests/${test._id}/take`} className="btn-primary text-xs px-3 py-1.5">Start</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: badges + announcements */}
          <div className="space-y-4">
            {/* Badges */}
            {user?.badges?.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Award size={16} /> My Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {user.badges.map(b => (
                    <span key={b} className="flex items-center gap-1 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold">
                      {BADGE_ICONS[b] || '🏅'} {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Announcements */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Bell size={16} /> Announcements</h2>
              {announcements.length === 0 ? <p className="text-gray-400 text-xs py-2">No announcements</p> : (
                <div className="space-y-2">
                  {announcements.map(ann => (
                    <div key={ann._id} className={`p-3 rounded-xl text-sm ${ann.type === 'urgent' ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
                      <p className="font-medium text-gray-900">{ann.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(ann.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak */}
            {(user?.streakDays || 0) > 0 && (
              <div className="card bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-3">
                  <Flame size={28} className="text-orange-500" />
                  <div>
                    <p className="text-xl font-black text-orange-700">{user.streakDays} Day Streak</p>
                    <p className="text-xs text-orange-500">Keep it going!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    
  );
}
