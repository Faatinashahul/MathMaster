import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { MessageCircle, CheckCircle, Send } from 'lucide-react';

export default function TeacherDoubts() {
  const [doubts, setDoubts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { api.get('/doubts').then(r => setDoubts(r.data.doubts)).finally(() => setLoading(false)); }, []);

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    try {
      const res = await api.post(`/doubts/${selected._id}/answer`, { text: answer });
      setDoubts(doubts.map(d => d._id === selected._id ? res.data.doubt : d));
      setSelected(res.data.doubt);
      setAnswer('');
      toast.success('Answer posted!');
    } catch { toast.error('Failed to post answer'); }
  };

  const resolve = async (id) => {
    await api.put(`/doubts/${id}/resolve`);
    setDoubts(doubts.map(d => d._id === id ? { ...d, status: 'resolved' } : d));
    if (selected?._id === id) setSelected({ ...selected, status: 'resolved' });
    toast.success('Marked as resolved');
  };

  const filtered = doubts.filter(d => filter === 'all' || d.status === filter);
  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', answered: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    
      <div className="space-y-6 fade-in">
        <h1 className="text-2xl font-bold text-gray-900">Student Doubts</h1>

        <div className="flex gap-2">
          {['pending', 'answered', 'resolved', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {filtered.length === 0 && <div className="card text-center py-10 text-gray-400"><MessageCircle size={32} className="mx-auto mb-2 opacity-40" /><p>No doubts</p></div>}
            {filtered.map(doubt => (
              <div key={doubt._id} onClick={() => setSelected(doubt)}
                className={`card cursor-pointer hover:shadow-md transition-all ${selected?._id === doubt._id ? 'border-2 border-blue-400' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{doubt.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{doubt.isAnonymous ? 'Anonymous' : doubt.student?.name} • {doubt.chapter}</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doubt.description}</p>
                  </div>
                  <span className={`badge shrink-0 ml-2 ${statusColors[doubt.status]}`}>{doubt.status}</span>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{selected.title}</h3>
                {selected.status !== 'resolved' && (
                  <button onClick={() => resolve(selected._id)} className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium">
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700">{selected.description}</p>
              {selected.image && <img src={selected.image} alt="Doubt" className="max-h-48 rounded-xl border" />}

              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase">Answers ({selected.answers?.length || 0})</p>
                {selected.answers?.map((ans, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${ans.responder?.role === 'teacher' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
                    <p className="font-semibold text-xs text-gray-500 mb-1">{ans.responder?.name} ({ans.responder?.role})</p>
                    <p className="text-gray-700">{ans.text}</p>
                  </div>
                ))}
              </div>

              {selected.status !== 'resolved' && (
                <div className="flex gap-2">
                  <textarea className="input flex-1 h-20 resize-none" placeholder="Type your answer..." value={answer} onChange={e => setAnswer(e.target.value)} />
                  <button onClick={submitAnswer} className="btn-primary px-3"><Send size={16} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    
  );
}
