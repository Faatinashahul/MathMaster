import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Megaphone, Plus, Trash2, Pin } from 'lucide-react';

const TYPE_COLORS = { general: 'bg-gray-100 text-gray-700', test: 'bg-blue-100 text-blue-700', material: 'bg-purple-100 text-purple-700', holiday: 'bg-green-100 text-green-700', urgent: 'bg-red-100 text-red-700' };

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', batch: 'All', isPinned: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/announcements').then(r => setAnnouncements(r.data.announcements)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Title and content required');
    setLoading(true);
    try {
      const res = await api.post('/announcements', form);
      setAnnouncements([res.data.announcement, ...announcements]);
      setShowForm(false);
      setForm({ title: '', content: '', type: 'general', batch: 'All', isPinned: false });
      toast.success('Announcement posted!');
    } catch { toast.error('Failed to post'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    await api.delete(`/announcements/${id}`);
    setAnnouncements(announcements.filter(a => a._id !== id));
    toast.success('Deleted');
  };

  return (
    
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Plus size={16} /> New Announcement</button>
        </div>

        {showForm && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Post Announcement</h2>
            <form onSubmit={submit} className="space-y-4">
              <input className="input" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <textarea className="input h-32 resize-none" placeholder="Content *" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              <div className="flex gap-3">
                <select className="input flex-1" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="general">General</option>
                  <option value="test">Test</option>
                  <option value="material">Material</option>
                  <option value="holiday">Holiday</option>
                  <option value="urgent">Urgent</option>
                </select>
                <input className="input flex-1" placeholder="Batch (All)" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} />
                <span className="text-sm text-gray-700 flex items-center gap-1"><Pin size={14} /> Pin this announcement</span>
              </label>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Posting...' : 'Post'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {announcements.length === 0 && <div className="card text-center py-12 text-gray-400"><Megaphone size={32} className="mx-auto mb-2 opacity-40" /><p>No announcements yet</p></div>}
          {announcements.map(ann => (
            <div key={ann._id} className={`card ${ann.isPinned ? 'border-l-4 border-blue-500' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {ann.isPinned && <Pin size={14} className="text-blue-500" />}
                    <h3 className="font-bold text-gray-900">{ann.title}</h3>
                    <span className={`badge ${TYPE_COLORS[ann.type]}`}>{ann.type}</span>
                  </div>
                  <p className="text-sm text-gray-600">{ann.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <button onClick={() => remove(ann._id)} className="text-red-400 hover:text-red-600 ml-3"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    
  );
}
