import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BookOpen, FileText, BarChart2, Users, Radio,
  ClipboardList, MessageCircle, LogOut, Menu, X,
  Trophy, GraduationCap, CheckSquare, Megaphone, ChevronLeft
} from 'lucide-react';

const teacherLinks = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/create-test', icon: FileText, label: 'Create Test' },
  { to: '/teacher/tests', icon: ClipboardList, label: 'Manage Tests' },
  { to: '/teacher/materials', icon: BookOpen, label: 'Materials' },
  { to: '/teacher/live', icon: Radio, label: 'Live Session' },
  { to: '/teacher/attendance', icon: CheckSquare, label: 'Attendance' },
  { to: '/teacher/doubts', icon: MessageCircle, label: 'Doubts' },
  { to: '/teacher/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/teacher/students', icon: Users, label: 'Students' },
  { to: '/teacher/announcements', icon: Megaphone, label: 'Announcements' },
];

const studentLinks = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/tests', icon: FileText, label: 'My Tests' },
  { to: '/student/results', icon: BarChart2, label: 'Results' },
  { to: '/student/materials', icon: BookOpen, label: 'Materials' },
  { to: '/student/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/student/doubts', icon: MessageCircle, label: 'Doubts' },
  { to: '/student/live', icon: Radio, label: 'Live Quiz' },
  { to: '/student/attendance', icon: CheckSquare, label: 'Attendance' },
];

// These are "home" pages that show the full sidebar layout
const dashboardRoutes = ['/teacher', '/student'];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === 'teacher' || user?.role === 'admin' ? teacherLinks : studentLinks;
  const handleLogout = () => { logout(); navigate('/login'); };
  const isDashboard = dashboardRoutes.includes(location.pathname);

  const isActive = (to) =>
    to === '/teacher' || to === '/student'
      ? location.pathname === to
      : location.pathname.startsWith(to);

  // ── INNER PAGE LAYOUT (no sidebar, just top bar with back button) ──
  if (!isDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>
        {/* Page content */}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
    );
  }

  // ── DASHBOARD LAYOUT (full sidebar) ──
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-64 bg-white z-50 shadow-2xl flex flex-col">
            <SidebarContent links={links} user={user} isActive={isActive} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="flex flex-col fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-100 z-30">
        <SidebarContent links={links} user={user} isActive={isActive} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {user?.role === 'student' && (
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                <Trophy size={13} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-700">{user?.xp || 0} XP</span>
              </div>
            )}
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ links, user, isActive, setSidebarOpen, handleLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">MathMaster</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role} Portal</p>
          </div>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        {user?.role === 'student' && (
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-xl mb-3">
            <Trophy size={14} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{user?.xp || 0} XP · {user?.level || 'Beginner'}</span>
          </div>
        )}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.username || user?.phone}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}
