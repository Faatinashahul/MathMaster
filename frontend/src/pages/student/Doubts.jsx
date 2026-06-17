import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function StudentDoubts() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', chapter: '' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchDoubts(); }, []);

  const fetchDoubts = async () => {
    try {
      const res = await api.get('/doubts');
      const data = Array.isArray(res.data) ? res.data : (res.data?.doubts || res.data?.data || []);
      setDoubts(data);
    } catch { toast.error('Failed to load doubts'); }
    finally { setLoading(false); }
  };

  const submitDoubt = async () => {
    if (!form.title.trim()) return toast.error('Please enter a title');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('chapter', form.chapter);
      if (image) fd.append('image', image);
      await api.post('/doubts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Doubt posted!');
      setForm({ title: '', description: '', chapter: '' });
      setImage(null);
      setShowForm(false);
      fetchDoubts();
    } catch { toast.error('Failed to post doubt'); }
    finally { setSubmitting(false); }
  };

  const upvote = async (id) => {
    try {
      await api.post(`/doubts/${id}/upvote`);
      fetchDoubts();
    } catch { toast.error('Failed to upvote'); }
  };

  const filtered = doubts.filter(d => {
    if (filter === 'mine') return d.student?._id === user?._id;
    if (filter === 'resolved') return d.isResolved;
    if (filter === 'pending') return !d.isResolved;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doubt Corner</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Ask Doubt'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-2 border-indigo-200">
          <h2 className="font-bold text-gray-700 mb-4">Post a New Doubt</h2>
          <div className="space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="input" placeholder="Doubt title (e.g. How to integrate by parts?)" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="input min-h-[100px]" placeholder="Describe your doubt in detail..." />
            <input value={form.chapter} onChange={e => setForm({ ...form, chapter: e.target.value })}
              className="input" placeholder="Chapter (e.g. Integration)" />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Attach image (optional)</label>
              <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
                className="text-sm text-gray-500 file:btn-primary file:mr-3 file:text-sm" />
            </div>
            <button onClick={submitDoubt} disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Posting...' : 'Post Doubt'}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['all','mine','pending','resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🤔</div>
          <p>No doubts found. Ask your first question!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doubt => (
            <div key={doubt._id} className={`card ${doubt.isResolved ? 'border-green-200' : ''}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => upvote(doubt._id)}
                  className="flex flex-col items-center pt-1 text-gray-400 hover:text-indigo-600 transition-colors">
                  <span className="text-lg">▲</span>
                  <span className="text-xs font-bold">{doubt.upvotes?.length || 0}</span>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{doubt.title}</h3>
                    {doubt.isResolved && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Resolved</span>}
                    {doubt.chapter && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{doubt.chapter}</span>}
                  </div>
                  {doubt.description && <p className="text-sm text-gray-600 mb-2">{doubt.description}</p>}
                  {doubt.imageUrl && <img src={doubt.imageUrl} alt="doubt" className="rounded-lg max-h-48 object-cover mb-2" />}
                  <div className="text-xs text-gray-400">
                    by {doubt.student?.name} · {new Date(doubt.createdAt).toLocaleDateString()}
                  </div>

                  {doubt.answers?.length > 0 && (
                    <div className="mt-3">
                      <button onClick={() => setExpandedId(expandedId === doubt._id ? null : doubt._id)}
                        className="text-sm text-indigo-600 hover:underline">
                        {expandedId === doubt._id ? 'Hide' : 'Show'} {doubt.answers.length} answer(s)
                      </button>
                      {expandedId === doubt._id && (
                        <div className="mt-2 space-y-2">
                          {doubt.answers.map((ans, i) => (
                            <div key={i} className="bg-indigo-50 rounded-lg p-3 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-indigo-700">{ans.answeredBy?.name}</span>
                                {ans.answeredBy?.role === 'teacher' && <span className="text-xs bg-indigo-200 text-indigo-700 px-1.5 rounded">Teacher</span>}
                                <span className="text-gray-400 text-xs">{new Date(ans.answeredAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-700">{ans.text}</p>
                              {ans.imageUrl && <img src={ans.imageUrl} alt="answer" className="rounded mt-2 max-h-36 object-cover" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
