import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const user = await login(form.username.trim(), form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'teacher' || user.role === 'admin' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="font-black text-2xl text-gray-900">MathMaster</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username or Phone Number</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter username or phone number"
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition-all text-lg mt-2 shadow-lg shadow-indigo-100">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">Create one free</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-indigo-500 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
