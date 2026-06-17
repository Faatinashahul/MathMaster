import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const medalColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const medals = ['🥇', '🥈', '🥉'];
const levelColors = { Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-blue-100 text-blue-700', Advanced: 'bg-purple-100 text-purple-700', Expert: 'bg-yellow-100 text-yellow-700' };

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('xp');

  useEffect(() => { fetchLeaderboard(); }, [tab]);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/analytics/leaderboard?type=${tab}`);
      setLeaders(res.data);
    } catch { toast.error('Failed to load leaderboard'); }
    finally { setLoading(false); }
  };

  const myRank = leaders.findIndex(l => l._id === user?._id) + 1;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Leaderboard</h1>
      <p className="text-gray-500 mb-6">Compete with your classmates!</p>

      <div className="flex gap-2 mb-6">
        {[{ key: 'xp', label: '⭐ XP Points' }, { key: 'avg', label: '📊 Avg Score' }, { key: 'tests', label: '📝 Tests Done' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {myRank > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <span className="text-indigo-700 font-medium">Your rank</span>
          <span className="text-2xl font-black text-indigo-600">#{myRank}</span>
        </div>
      )}

      {leaders.slice(0, 3).length > 0 && (
        <div className="flex justify-center items-end gap-4 mb-8">
          {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
            if (!l) return <div key={i} className="w-24" />;
            const positions = [1, 0, 2];
            const pos = positions[i];
            const heights = ['h-24', 'h-32', 'h-20'];
            return (
              <div key={l._id} className="flex flex-col items-center">
                <div className="text-3xl mb-1">{medals[pos]}</div>
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 mb-1">
                  {l.name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center truncate w-20">{l.name}</p>
                <p className="text-xs text-gray-500">{tab === 'xp' ? `${l.xp} XP` : tab === 'avg' ? `${l.avgScore}%` : `${l.testsCount} tests`}</p>
                <div className={`${heights[i]} w-20 mt-2 rounded-t-lg ${i === 1 ? 'bg-indigo-500' : i === 0 ? 'bg-gray-300' : 'bg-amber-400'} flex items-start justify-center pt-2`}>
                  <span className="text-white font-black">#{pos + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {leaders.map((l, i) => {
          const isMe = l._id === user?._id;
          return (
            <div key={l._id} className={`flex items-center gap-3 p-3 rounded-xl ${isMe ? 'bg-indigo-50 border-2 border-indigo-300' : 'bg-white border'}`}>
              <div className={`w-8 text-center font-black ${i < 3 ? medalColors[i] : 'text-gray-400'}`}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                {l.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${isMe ? 'text-indigo-700' : 'text-gray-800'}`}>
                    {l.name} {isMe && '(You)'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[l.level] || levelColors.Beginner}`}>{l.level}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                  <span>⭐ {l.xp} XP</span>
                  {l.badges?.length > 0 && <span>🏅 {l.badges.length} badges</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-700">
                  {tab === 'xp' ? `${l.xp} XP` : tab === 'avg' ? `${l.avgScore || 0}%` : `${l.testsCount || 0}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
