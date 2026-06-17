import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Users, BookOpen, TrendingUp, Plus, Calendar, Bell, CheckCircle } from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tests: 0, students: 0, materials: 0 });
  const [recentTests, setRecentTests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tests/teacher/all'),
      api.get('/teacher/students'),
      api.get('/materials'),
      api.get('/announcements')
    ]).then(([tests, students, materials, ann]) => {
      setStats({ tests: tests.data.tests.length, students: students.data.students.length, materials: materials.data.materials.length });
      setRecentTests(tests.data.tests.slice(0, 5));
      setAnnouncements(ann.data.announcements.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Tests', value: stats.tests, icon: FileText, color: 'bg-blue-500', link: '/teacher/tests' },
    { label: 'Students', value: stats.students, icon: Users, color: 'bg-green-500', link: '/teacher/students' },
    { label: 'Materials', value: stats.materials, icon: BookOpen, color: 'bg-purple-500', link: '/teacher/materials' },
    { label: 'Analytics', value: 'View', icon: TrendingUp, color: 'bg-orange-500', link: '/teacher/analytics' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;

  return (
    
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Link to="/teacher/tests/create" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Test
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, link }) => (
            <Link key={label} to={link} className="card hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className="text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Tests</h2>
              <Link to="/teacher/tests" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
            </div>
            {recentTests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tests yet</p>
                <Link to="/teacher/tests/create" className="text-blue-600 text-sm font-medium mt-1 inline-block">Create your first test →</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTests.map(test => (
                  <div key={test._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${test.isPublished ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{test.title}</p>
                      <p className="text-xs text-gray-400">{test.totalMarks} marks • {test.duration} min • {test.questions?.length} Qs</p>
                    </div>
                    <span className={`badge ${test.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements & Quick Actions */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Create Test', to: '/teacher/tests/create', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                  { label: 'Upload Material', to: '/teacher/materials', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                  { label: 'Mark Attendance', to: '/teacher/attendance', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                  { label: 'Start Live Quiz', to: '/teacher/live', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
                ].map(({ label, to, color }) => (
                  <Link key={label} to={to} className={`p-4 rounded-xl text-sm font-semibold text-center transition-colors ${color}`}>{label}</Link>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Announcements</h2>
                <Link to="/teacher/announcements" className="text-blue-600 text-sm">Manage</Link>
              </div>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No announcements yet</p>
              ) : (
                <div className="space-y-2">
                  {announcements.map(ann => (
                    <div key={ann._id} className="flex gap-3 p-3 bg-blue-50 rounded-xl">
                      <Bell size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(ann.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
}
