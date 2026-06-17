import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Award, Clock, AlertTriangle } from 'lucide-react';

export default function EvaluateSubmissions() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/tests/${id}/submissions`).then(r => setSubmissions(r.data.submissions)).finally(() => setLoading(false));
  }, [id]);

  const updateMark = (ansId, field, value) => {
    setSelected(prev => ({ ...prev, answers: prev.answers.map(a => a._id === ansId ? { ...a, [field]: value } : a) }));
  };

  const saveEvaluation = async () => {
    const descriptiveAnswers = selected.answers.filter(a => a.questionType === 'descriptive');
    setSaving(true);
    try {
      const res = await api.put(`/tests/${id}/submissions/${selected._id}/evaluate`, { answers: descriptiveAnswers.map(a => ({ questionId: a.questionId, marksAwarded: a.marksAwarded, teacherComment: a.teacherComment })) });
      toast.success('Evaluation saved!');
      setSubmissions(prev => prev.map(s => s._id === selected._id ? { ...s, status: 'evaluated', marksObtained: res.data.submission.marksObtained } : s));
      setSelected(null);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;

  return (
    
      <div className="space-y-6 fade-in">
        <h1 className="text-2xl font-bold text-gray-900">Submissions ({submissions.length})</h1>

        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selected.student?.name}</h2>
                <p className="text-sm text-gray-500">MCQ: {selected.mcqMarks} marks | Submitted: {new Date(selected.submittedAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelected(null)} className="btn-secondary">Back</button>
                <button onClick={saveEvaluation} disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </div>

            {selected.answers.filter(a => a.questionType === 'descriptive').map((ans, i) => (
              <div key={ans._id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Descriptive Answer #{i + 1}</h3>
                  {ans.tabSwitchCount > 3 && <span className="badge bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle size={12} /> Tab switched {ans.tabSwitchCount}x</span>}
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {ans.descriptiveAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                </div>
                {ans.imageAnswer && <img src={ans.imageAnswer} alt="Student answer" className="max-h-48 rounded-xl mb-4 border" />}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks Awarded</label>
                    <input type="number" min="0" className="input" value={ans.marksAwarded || 0} onChange={e => updateMark(ans._id, 'marksAwarded', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <input className="input" placeholder="Feedback for student..." value={ans.teacherComment || ''} onChange={e => updateMark(ans._id, 'teacherComment', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {selected.answers.filter(a => a.questionType !== 'descriptive').length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-4">MCQ / Numerical Answers</h3>
                <div className="space-y-3">
                  {selected.answers.filter(a => a.questionType !== 'descriptive').map((ans, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${ans.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className="text-sm text-gray-700">Q{i + 1}: {String(ans.answer)}</span>
                      <div className="flex items-center gap-2">
                        {ans.isCorrect ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-500" />}
                        <span className={`text-sm font-semibold ${ans.marksAwarded >= 0 ? 'text-green-700' : 'text-red-600'}`}>{ans.marksAwarded > 0 ? '+' : ''}{ans.marksAwarded}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.length === 0 && <div className="card text-center py-12 text-gray-400">No submissions yet</div>}
            {submissions.map((sub, i) => (
              <div key={sub._id} className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelected(sub)}>
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{sub.student?.name}</p>
                    <p className="text-xs text-gray-500">{sub.student?.studentId} • {sub.student?.batch}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{sub.marksObtained}/{sub.totalMarks}</p>
                    <p className="text-xs text-gray-500">{sub.percentage}%</p>
                  </div>
                  <span className={`badge ${sub.status === 'evaluated' ? 'bg-green-100 text-green-700' : sub.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {sub.status}
                  </span>
                  {sub.tabSwitchCount > 3 && <AlertTriangle size={16} className="text-red-500" title="Multiple tab switches" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    
  );
}
