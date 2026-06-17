import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Eye, Users, Clock, CheckCircle, XCircle, Edit } from 'lucide-react';

export default function ManageTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tests/teacher/all').then(r => setTests(r.data.tests)).finally(() => setLoading(false));
  }, []);

  const togglePublish = async (test) => {
    try {
      await api.put(`/tests/${test._id}`, { ...test, isPublished: !test.isPublished });
      setTests(tests.map(t => t._id === test._id ? { ...t, isPublished: !t.isPublished } : t));
      toast.success(test.isPublished ? 'Test unpublished' : 'Test published!');
    } catch { toast.error('Failed to update'); }
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await api.delete(`/tests/${id}`);
      setTests(tests.filter(t => t._id !== id));
      toast.success('Test deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const typeColors = { 'sunday-test': 'bg-orange-100 text-orange-700', 'chapter-test': 'bg-blue-100 text-blue-700', 'mock': 'bg-purple-100 text-purple-700', 'practice': 'bg-gray-100 text-gray-700' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Manage Tests</h1>
          <Link to="/teacher/tests/create" className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Test</Link>
        </div>

        {tests.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-400 mb-4">No tests created yet</p>
            <Link to="/teacher/tests/create" className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Create your first test</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {tests.map(test => (
              <div key={test._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{test.title}</h3>
                      <span className={`badge ${typeColors[test.type] || 'bg-gray-100 text-gray-700'}`}>{test.type}</span>
                      {test.isSundayTest && <span className="badge bg-orange-100 text-orange-700">Sunday Test</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{test.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {test.duration} min</span>
                      <span>{test.questions?.length || 0} questions</span>
                      <span>{test.totalMarks} marks</span>
                      {test.scheduledAt && <span>Scheduled: {new Date(test.scheduledAt).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => togglePublish(test)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${test.isPublished ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {test.isPublished ? <><CheckCircle size={12} /> Published</> : <><XCircle size={12} /> Draft</>}
                    </button>
                    <Link to={`/teacher/tests/${test._id}/evaluate`} className="btn-secondary p-2" title="View Submissions"><Users size={16} /></Link>
                    <button onClick={() => deleteTest(test._id)} className="btn-danger p-2" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
}
