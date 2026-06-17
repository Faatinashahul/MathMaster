import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, FileText, Video, BookOpen, Filter } from 'lucide-react';

const CATEGORIES = ['Notes', 'Formula Sheet', 'Practice Problems', 'Previous Year', 'Recorded Video', 'Other'];
const CHAPTERS = ['Algebra', 'Calculus', 'Trigonometry', 'Probability', 'Statistics', 'Coordinate Geometry', 'Matrices', 'Integration', 'Differentiation', 'Other'];

const fileIcon = (type) => {
  if (type === 'video') return <Video size={20} className="text-purple-500" />;
  if (type === 'pdf') return <FileText size={20} className="text-red-500" />;
  return <BookOpen size={20} className="text-blue-500" />;
};

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterChapter, setFilterChapter] = useState('');
  const [form, setForm] = useState({ title: '', description: '', chapter: '', topic: '', category: 'Notes', difficulty: 'Medium', batch: 'All' });
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchMaterials = () => {
    api.get('/materials').then(r => setMaterials(r.data.materials)).finally(() => setLoading(false));
  };
  useEffect(fetchMaterials, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!form.title || !form.chapter) return toast.error('Title and chapter are required');
    setUploading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    try {
      await api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Material uploaded!');
      setShowForm(false);
      setFile(null);
      setForm({ title: '', description: '', chapter: '', topic: '', category: 'Notes', difficulty: 'Medium', batch: 'All' });
      fetchMaterials();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    await api.delete(`/materials/${id}`);
    setMaterials(materials.filter(m => m._id !== id));
    toast.success('Deleted');
  };

  // Group by chapter
  const grouped = {};
  materials.filter(m => !filterChapter || m.chapter === filterChapter).forEach(m => {
    if (!grouped[m.chapter]) grouped[m.chapter] = [];
    grouped[m.chapter].push(m);
  });

  return (
    
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"><Upload size={16} /> Upload Material</button>
        </div>

        {showForm && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Upload New Material</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Integration Notes - Class 12" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chapter *</label>
                  <select className="input" value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })}>
                    <option value="">Select Chapter</option>
                    {CHAPTERS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <input className="input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="Specific topic" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select className="input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input className="input" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} placeholder="All" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => document.getElementById('material-file').click()}>
                  <input id="material-file" type="file" className="hidden" accept=".pdf,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
                  {file ? <p className="text-green-700 font-medium">{file.name}</p> : (
                    <>
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload PDF, PPT, or Video</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Uploading...' : 'Upload'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-gray-400" />
          <select className="input w-48" value={filterChapter} onChange={e => setFilterChapter(e.target.value)}>
            <option value="">All Chapters</option>
            {CHAPTERS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Materials grouped by chapter */}
        {Object.entries(grouped).map(([chapter, items]) => (
          <div key={chapter}>
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">{chapter}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {items.map(m => (
                <div key={m._id} className="card flex items-start gap-3 hover:shadow-md transition-shadow">
                  <div className="mt-0.5">{fileIcon(m.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{m.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.category} • {m.difficulty}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.downloadCount} downloads</p>
                  </div>
                  <div className="flex gap-1">
                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary p-2 text-xs">Open</a>
                    <button onClick={() => deleteMaterial(m._id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {materials.length === 0 && !loading && (
          <div className="card text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>No materials uploaded yet</p>
          </div>
        )}
      </div>
    
  );
}
