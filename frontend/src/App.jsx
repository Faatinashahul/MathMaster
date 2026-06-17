import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/shared/Layout';

// Landing
import Landing from './pages/Landing';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard';
import CreateTest from './pages/teacher/CreateTest';
import ManageTests from './pages/teacher/ManageTests';
import EvaluateSubmissions from './pages/teacher/EvaluateSubmissions';
import Materials from './pages/teacher/Materials';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherStudents from './pages/teacher/Students';
import LiveSession from './pages/teacher/LiveSession';
import AttendanceManager from './pages/teacher/AttendanceManager';
import TeacherDoubts from './pages/teacher/Doubts';
import Announcements from './pages/teacher/Announcements';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import StudentTests from './pages/student/Tests';
import TakeTest from './pages/student/TakeTest';
import StudentMaterials from './pages/student/Materials';
import StudentResults from './pages/student/Results';
import StudentAnalytics from './pages/student/Analytics';
import Leaderboard from './pages/student/Leaderboard';
import StudentDoubts from './pages/student/Doubts';
import LiveQuiz from './pages/student/LiveQuiz';
import MarkAttendance from './pages/student/MarkAttendance';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px' } }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<PrivateRoute role="teacher"><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/create-test" element={<PrivateRoute role="teacher"><CreateTest /></PrivateRoute>} />
          <Route path="/teacher/tests/create" element={<PrivateRoute role="teacher"><CreateTest /></PrivateRoute>} />
          <Route path="/teacher/tests" element={<PrivateRoute role="teacher"><ManageTests /></PrivateRoute>} />
          <Route path="/teacher/tests/:id/evaluate" element={<PrivateRoute role="teacher"><EvaluateSubmissions /></PrivateRoute>} />
          <Route path="/teacher/materials" element={<PrivateRoute role="teacher"><Materials /></PrivateRoute>} />
          <Route path="/teacher/analytics" element={<PrivateRoute role="teacher"><TeacherAnalytics /></PrivateRoute>} />
          <Route path="/teacher/students" element={<PrivateRoute role="teacher"><TeacherStudents /></PrivateRoute>} />
          <Route path="/teacher/live" element={<PrivateRoute role="teacher"><LiveSession /></PrivateRoute>} />
          <Route path="/teacher/attendance" element={<PrivateRoute role="teacher"><AttendanceManager /></PrivateRoute>} />
          <Route path="/teacher/doubts" element={<PrivateRoute role="teacher"><TeacherDoubts /></PrivateRoute>} />
          <Route path="/teacher/announcements" element={<PrivateRoute role="teacher"><Announcements /></PrivateRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<PrivateRoute role="student"><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/tests" element={<PrivateRoute role="student"><StudentTests /></PrivateRoute>} />
          <Route path="/student/tests/:id/take" element={<PrivateRoute role="student"><TakeTest /></PrivateRoute>} />
          <Route path="/student/test/:id" element={<PrivateRoute role="student"><TakeTest /></PrivateRoute>} />
          <Route path="/student/materials" element={<PrivateRoute role="student"><StudentMaterials /></PrivateRoute>} />
          <Route path="/student/results" element={<PrivateRoute role="student"><StudentResults /></PrivateRoute>} />
          <Route path="/student/results/:submissionId" element={<PrivateRoute role="student"><StudentResults /></PrivateRoute>} />
          <Route path="/student/analytics" element={<PrivateRoute role="student"><StudentAnalytics /></PrivateRoute>} />
          <Route path="/student/leaderboard" element={<PrivateRoute role="student"><Leaderboard /></PrivateRoute>} />
          <Route path="/student/doubts" element={<PrivateRoute role="student"><StudentDoubts /></PrivateRoute>} />
          <Route path="/student/live" element={<PrivateRoute role="student"><LiveQuiz /></PrivateRoute>} />
          <Route path="/student/attendance" element={<PrivateRoute role="student"><MarkAttendance /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
