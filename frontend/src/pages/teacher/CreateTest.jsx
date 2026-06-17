import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Image, ChevronDown, ChevronUp, Save, Eye } from 'lucide-react';

const QUESTION_TYPES = [
  { value: 'mcq-single', label: 'MCQ - Single Correct' },
  { value: 'mcq-multi', label: 'MCQ - Multiple Correct' },
  { value: 'numerical', label: 'Numerical' },
  { value: 'descriptive', label: 'Descriptive' },
  { value: 'image-based', label: 'Image Based' },
];

const defaultQuestion = () => ({
  type: 'mcq-single', questionText: '', questionImage: '', latexExpression: '',
  options: [{ text: '', image: '', isCorrect: false }, { text: '', image: '', isCorrect: false }, { text: '', image: '', isCorrect: false }, { text: '', image: '', isCorrect: false }],
  correctAnswer: '', marks: 4, negativeMarks: 1, descriptiveMarks: 2,
  chapter: '', topic: '', difficulty: 'Medium', explanation: ''
});

export default function CreateTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({
    title: '', description: '', duration: 60, batch: 'All', type: 'practice',
    isSundayTest: false, scheduledAt: '',
    settings: { shuffleQuestions: true, shuffleOptions: true, showResultImmediately: false, preventTabSwitch: true, fullScreenMode: true, maxAttempts: 1 },
    chapters: []
  });
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [collapsed, setCollapsed] = useState({});
  const [uploading, setUploading] = useState({});

  const addQuestion = () => { setQuestions([...questions, defaultQuestion()]); };
  const removeQuestion = (i) => { setQuestions(questions.filter((_, idx) => idx !== i)); };
  const updateQuestion = (i, field, value) => {
    const qs = [...questions];
    qs[i] = { ...qs[i], [field]: value };
    setQuestions(qs);
  };
  const updateOption = (qi, oi, field, value) => {
    const qs = [...questions];
    qs[qi].options[oi] = { ...qs[qi].options[oi], [field]: value };
    if (field === 'isCorrect' && qs[qi].type === 'mcq-single' && value) {
      qs[qi].options.forEach((opt, idx) => { if (idx !== oi) opt.isCorrect = false; });
    }
    setQuestions(qs);
  };

  const uploadImage = async (e, qi, field, optIdx) => {
    const file = e.target.files[0];
    if (!file) return;
    const key = `${qi}-${field}-${optIdx}`;
    setUploading({ ...uploading, [key]: true });
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await api.post('/tests/upload-image', fd);
      if (field === 'option') updateOption(qi, optIdx, 'image', res.data.url);
      else updateQuestion(qi, field, res.data.url);
    } catch { toast.error('Image upload failed'); }
    finally { setUploading({ ...uploading, [key]: false }); }
  };

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const handleSubmit = async (publish = false) => {
    if (!meta.title) return toast.error('Title is required');
    if (questions.length === 0) return toast.error('Add at least one question');
    setLoading(true);
    try {
      await api.post('/tests', { ...meta, questions, isPublished: publish });
      toast.success(publish ? 'Test published!' : 'Test saved as draft');
      navigate('/teacher/tests');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save test'); }
    finally { setLoading(false); }
  };

  return (
    
      <div className="max-w-4xl mx-auto space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Create Test</h1>
          <div className="flex gap-2">
            <button onClick={() => handleSubmit(false)} disabled={loading} className="btn-secondary flex items-center gap-2"><Save size={16} /> Save Draft</button>
            <button onClick={() => handleSubmit(true)} disabled={loading} className="btn-primary flex items-center gap-2"><Eye size={16} /> Publish</button>
          </div>
        </div>

        {/* Test Meta */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">Test Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input className="input" placeholder="e.g., Chapter 5 - Integration Test" value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input h-20 resize-none" placeholder="Instructions for students..." value={meta.description} onChange={e => setMeta({ ...meta, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input className="input" type="number" value={meta.duration} onChange={e => setMeta({ ...meta, duration: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <input className="input" placeholder="e.g., All, Batch-A" value={meta.batch} onChange={e => setMeta({ ...meta, batch: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select className="input" value={meta.type} onChange={e => setMeta({ ...meta, type: e.target.value })}>
                <option value="practice">Practice</option>
                <option value="sunday-test">Sunday Test</option>
                <option value="chapter-test">Chapter Test</option>
                <option value="mock">Mock Exam</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule At (optional)</label>
              <input className="input" type="datetime-local" value={meta.scheduledAt} onChange={e => setMeta({ ...meta, scheduledAt: e.target.value })} />
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Test Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'shuffleQuestions', label: 'Shuffle Questions' },
                { key: 'shuffleOptions', label: 'Shuffle Options' },
                { key: 'preventTabSwitch', label: 'Tab Switch Detection' },
                { key: 'fullScreenMode', label: 'Full Screen Mode' },
                { key: 'showResultImmediately', label: 'Show Results Immediately' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" checked={meta.settings[key]} onChange={e => setMeta({ ...meta, settings: { ...meta.settings, [key]: e.target.checked } })} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Total marks bar */}
        <div className="flex items-center justify-between bg-blue-50 px-5 py-3 rounded-xl">
          <span className="text-sm font-medium text-blue-800">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
          <span className="text-lg font-bold text-blue-900">Total: {totalMarks} marks</span>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, qi) => (
            <div key={qi} className="card border-l-4 border-blue-500">
              {/* Question header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{qi + 1}</span>
                <select className="input flex-1" value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)}>
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCollapsed({ ...collapsed, [qi]: !collapsed[qi] })} className="btn-secondary p-2">
                    {collapsed[qi] ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                  <button onClick={() => removeQuestion(qi)} className="btn-danger p-2"><Trash2 size={16} /></button>
                </div>
              </div>

              {!collapsed[qi] && (
                <div className="space-y-4">
                  {/* Question text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                    <textarea className="input h-24 resize-none" placeholder="Enter question text. You can use LaTeX syntax like $\int_0^1 x^2 dx$" value={q.questionText} onChange={e => updateQuestion(qi, 'questionText', e.target.value)} />
                  </div>

                  {/* LaTeX expression */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LaTeX Expression (optional)</label>
                    <input className="input font-mono text-sm" placeholder="e.g., \int_0^1 x^2\,dx" value={q.latexExpression} onChange={e => updateQuestion(qi, 'latexExpression', e.target.value)} />
                  </div>

                  {/* Question image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (optional)</label>
                    <div className="flex gap-2">
                      <input type="file" accept="image/*" onChange={e => uploadImage(e, qi, 'questionImage')} className="hidden" id={`qimg-${qi}`} />
                      <label htmlFor={`qimg-${qi}`} className="btn-secondary flex items-center gap-2 cursor-pointer text-sm">
                        <Image size={14} /> {uploading[`${qi}-questionImage-undefined`] ? 'Uploading...' : 'Upload Image'}
                      </label>
                      {q.questionImage && <img src={q.questionImage} alt="Q" className="h-10 w-10 object-cover rounded-lg border" />}
                    </div>
                  </div>

                  {/* MCQ Options */}
                  {(q.type === 'mcq-single' || q.type === 'mcq-multi') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Options (mark correct answer{q.type === 'mcq-multi' ? 's' : ''})</label>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${opt.isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}>
                            <input type={q.type === 'mcq-single' ? 'radio' : 'checkbox'} name={`q-${qi}-correct`} checked={opt.isCorrect} onChange={e => updateOption(qi, oi, 'isCorrect', e.target.checked)}
                              className="accent-green-600" />
                            <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <input className="flex-1 bg-transparent border-none outline-none text-sm" placeholder={`Option ${String.fromCharCode(65 + oi)}`} value={opt.text} onChange={e => updateOption(qi, oi, 'text', e.target.value)} />
                            <input type="file" accept="image/*" onChange={e => uploadImage(e, qi, 'option', oi)} className="hidden" id={`opt-${qi}-${oi}`} />
                            <label htmlFor={`opt-${qi}-${oi}`} className="cursor-pointer text-gray-400 hover:text-gray-600"><Image size={14} /></label>
                            {opt.image && <img src={opt.image} alt="" className="h-8 w-8 object-cover rounded" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Numerical answer */}
                  {q.type === 'numerical' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer (numerical)</label>
                      <input className="input w-48" type="number" step="any" placeholder="0.00" value={q.correctAnswer} onChange={e => updateQuestion(qi, 'correctAnswer', e.target.value)} />
                    </div>
                  )}

                  {/* Descriptive marks */}
                  {q.type === 'descriptive' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marks Type</label>
                      <select className="input w-48" value={q.descriptiveMarks} onChange={e => updateQuestion(qi, 'descriptiveMarks', Number(e.target.value))}>
                        <option value={2}>2 Marks</option>
                        <option value={6}>6 Marks</option>
                        <option value={12}>12 Marks</option>
                      </select>
                    </div>
                  )}

                  {/* Marks row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marks</label>
                      <input className="input" type="number" min="0" value={q.marks} onChange={e => updateQuestion(qi, 'marks', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Negative Marks</label>
                      <input className="input" type="number" min="0" step="0.25" value={q.negativeMarks} onChange={e => updateQuestion(qi, 'negativeMarks', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Chapter</label>
                      <input className="input" placeholder="e.g., Integration" value={q.chapter} onChange={e => updateQuestion(qi, 'chapter', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                      <select className="input" value={q.difficulty} onChange={e => updateQuestion(qi, 'difficulty', e.target.value)}>
                        <option>Easy</option><option>Medium</option><option>Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
                    <textarea className="input h-16 resize-none" placeholder="Explain the solution..." value={q.explanation} onChange={e => updateQuestion(qi, 'explanation', e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={addQuestion} className="w-full border-2 border-dashed border-blue-300 rounded-xl py-4 text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
          <Plus size={18} /> Add Question
        </button>
      </div>
    
  );
}
