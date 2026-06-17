// pages/teacher/AttendanceManager.jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ClipboardCheck, Users, Clock } from 'lucide-react';

export default function AttendanceManager() {
  const [records, setRecords] = useState([]);
  const [activeCode, setActiveCode] = useState(null);
  const [form, setForm] = useState({ topic: '', duration: 15, batch: 'All' });
  const [generating, setGenerating] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => { api.get('/attendance/teacher').then(r => setRecords(r.data.records)); }, []);
  useEffect(() => {
    if (!activeCode) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((new Date(activeCode.expiresAt) - Date.now()) / 1000));
      setTimer(remaining);
      if (remaining === 0) setActiveCode(null);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCode]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/attendance/generate', form);
      setActiveCode(res.data.attendance);
      setTimer(form.duration * 60);
      toast.success(`Code generated: ${res.data.code}`);
    } catch { toast.error('Failed to generate code'); }
    finally { setGenerating(false); }
  };

  return (
    
      <div className="space-y-6 fade-in">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="font-bold text-gray-900">Generate Attendance Code</h2>
            <input className="input" placeholder="Topic (e.g., Integration Lecture)" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Duration (minutes)</label>
                <input className="input" type="number" min="5" max="60" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Batch</label>
                <input className="input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
              </div>
            </div>
            <button onClick={generate} disabled={generating} className="btn-primary w-full">
              {generating ? 'Generating...' : 'Generate Code'}
            </button>
          </div>

          {activeCode && (
            <div className="card flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <p className="text-sm text-blue-600 font-medium mb-2">Share this code with students</p>
              <p className="text-6xl font-black text-blue-700 tracking-widest mb-3">{activeCode.code}</p>
              <div className="flex items-center gap-2 text-blue-500">
                <Clock size={16} />
                <span className="text-sm font-medium">Expires in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{activeCode.students?.length || 0} students marked</p>
            </div>
          )}
        </div>

        {/* Records */}
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4">Attendance Records</h2>
          <div className="space-y-3">
            {records.map(r => (
              <div key={r._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <ClipboardCheck size={18} className="text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.topic || 'Class'} <span className="text-gray-400 font-mono">• {r.code}</span></p>
                  <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                  <Users size={14} /> {r.students?.length || 0}
                </div>
              </div>
            ))}
            {records.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No records yet</p>}
          </div>
        </div>
      </div>
    
  );
}
