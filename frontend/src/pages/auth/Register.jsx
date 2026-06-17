import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', phone: '', password: '', confirmPassword: '', role: 'student', studentId: '', batch: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.phone || !form.password) return toast.error('Please fill in all required fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!/^\d{10}$/.test(form.phone)) return toast.error('Enter a valid 10-digit phone number');
    setLoading(true);
    try {
      const user = await register({ ...form });
      toast.success('Account created successfully!');
      navigate(user.role === 'teacher' || user.role === 'admin' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="font-black text-2xl text-gray-900">MathMaster</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500">Join thousands of students and teachers</p>
        </div>

        {/* Role toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-6">
          <button type="button" onClick={() => set('role', 'student')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${form.role === 'student' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
            👨‍🎓 I'm a Student
          </button>
          <button type="button" onClick={() => set('role', 'teacher')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${form.role === 'teacher' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
            👩‍🏫 I'm a Teacher
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Username *</label>
                <input value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="e.g. john123" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-600 text-sm font-medium">+91</span>
                <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="10-digit mobile number" maxLength={10} />
              </div>
            </div>

            {form.role === 'student' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student ID</label>
                  <input value={form.studentId} onChange={e => set('studentId', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                    placeholder="e.g. STU2024" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batch / Class</label>
                  <input value={form.batch} onChange={e => set('batch', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                    placeholder="e.g. Class 11A" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 focus:bg-white transition-all"
                  placeholder="Repeat password" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold py-3.5 rounded-xl transition-all text-lg mt-2 shadow-lg shadow-indigo-100">
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
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
