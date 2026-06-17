// pages/teacher/Students.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Search, Award } from 'lucide-react';

const BADGES = ['Top Performer', 'Consistent Learner', 'Quiz Master', 'Perfect Attendance', 'Most Improved'];

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/teacher/students').then(r => setStudents(r.data.students)).finally(() => setLoading(false)); }, []);

  const awardBadge = async (studentId, badge) => {
    await api.put(`/teacher/students/${studentId}/badge`, { badge });
    toast.success(`Badge awarded: ${badge}`);
    setStudents(students.map(s => s._id === studentId ? { ...s, badges: [...(s.badges || []), badge] } : s));
  };

  const filtered = students.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.includes(search) || s.studentId?.includes(search));

  const levelColors = { Beginner: 'bg-gray-100 text-gray-700', Intermediate: 'bg-blue-100 text-blue-700', Advanced: 'bg-purple-100 text-purple-700', Expert: 'bg-yellow-100 text-yellow-700' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Students ({students.length})</h1>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9 w-64" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(student => (
            <div key={student._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">{student.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.studentId} • {student.batch}</p>
                </div>
                <span className={`badge ml-auto ${levelColors[student.level] || 'bg-gray-100 text-gray-700'}`}>{student.level}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">XP: <strong className="text-gray-900">{student.xp}</strong></span>
                <span className="text-gray-500">Streak: <strong className="text-gray-900">{student.streakDays}d</strong></span>
              </div>
              {student.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {student.badges.map(b => <span key={b} className="badge bg-amber-100 text-amber-700 text-xs">{b}</span>)}
                </div>
              )}
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Award size={12} /> Award Badge</p>
                <div className="flex flex-wrap gap-1">
                  {BADGES.filter(b => !student.badges?.includes(b)).slice(0, 3).map(b => (
                    <button key={b} onClick={() => awardBadge(student._id, b)} className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">{b}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    
  );
}
