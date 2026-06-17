import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function TeacherAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    api.get('/analytics/teacher/class').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const loadStudent = async (studentId) => {
    const r = await api.get(`/analytics/teacher/student/${studentId}`);
    setStudentData(r.data);
    setSelectedStudent(studentId);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  const top10 = data?.studentStats?.slice(0, 10) || [];

  return (
    
      <div className="space-y-6 fade-in">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Avg Class Score', value: `${data?.avgClassScore || 0}%`, icon: Target, color: 'text-blue-600 bg-blue-50' },
            { label: 'Total Tests', value: data?.totalTests || 0, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
            { label: 'Total Students', value: data?.studentStats?.length || 0, icon: Users, color: 'text-purple-600 bg-purple-50' },
            { label: 'Submissions', value: data?.totalSubmissions || 0, icon: Award, color: 'text-orange-600 bg-orange-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={20} /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Top performers bar chart */}
        {top10.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Top 10 Students by Average Score</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={top10.map(s => ({ name: s.student?.name?.split(' ')[0], score: s.averageScore }))}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {top10.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Student list */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">All Students Performance</h2>
          <div className="space-y-2">
            {data?.studentStats?.map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors ${selectedStudent === s.student?._id ? 'bg-blue-50 border border-blue-200' : ''}`}
                onClick={() => loadStudent(s.student?._id)}>
                <span className="w-6 text-sm font-bold text-gray-500">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{s.student?.name}</p>
                  <p className="text-xs text-gray-400">{s.totalTests} tests taken</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{s.averageScore}%</p>
                  <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${s.averageScore}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual student detail */}
        {studentData && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Student Score History</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={studentData.submissions.slice(0, 10).reverse().map(s => ({ name: s.test?.title?.substring(0, 12), score: s.percentage }))}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => `${v}%`} />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    
  );
}
