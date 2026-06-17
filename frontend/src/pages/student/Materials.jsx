import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const iconMap = { pdf: '📄', video: '🎥', ppt: '📊', image: '🖼', other: '📁' };
const colorMap = { pdf: 'bg-red-50 border-red-200', video: 'bg-purple-50 border-purple-200', ppt: 'bg-orange-50 border-orange-200', image: 'bg-blue-50 border-blue-200', other: 'bg-gray-50 border-gray-200' };

export default function StudentMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      const data = Array.isArray(res.data) ? res.data : (res.data?.materials || res.data?.data || []);
      setMaterials(data);
    } catch { toast.error('Failed to load materials'); }
    finally { setLoading(false); }
  };

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.chapter?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || m.fileType === filterType;
    return matchSearch && matchType;
  });

  const grouped = filtered.reduce((acc, m) => {
    const ch = m.chapter || 'General';
    if (!acc[ch]) acc[ch] = [];
    acc[ch].push(m);
    return acc;
  }, {});

  if (loading) return <div className="flex items-center justify-center h-64"><div className="spinner"></div></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Study Materials</h1>

      <div className="flex gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search materials..." className="input flex-1" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-40">
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="ppt">PPT</option>
          <option value="image">Image</option>
        </select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📚</div>
          <p>No materials found</p>
        </div>
      ) : (
        Object.entries(grouped).map(([chapter, items]) => (
          <div key={chapter} className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-500 rounded-full inline-block"></span>
              {chapter}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(mat => (
                <div key={mat._id} className={`border rounded-xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow ${colorMap[mat.fileType] || colorMap.other}`}>
                  <div className="text-3xl">{iconMap[mat.fileType] || iconMap.other}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{mat.title}</h3>
                    {mat.description && <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{mat.description}</p>}
                    <div className="flex gap-2 mt-2 text-xs text-gray-400">
                      <span>{mat.topic || mat.chapter}</span>
                      <span>•</span>
                      <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a href={mat.fileUrl} target="_blank" rel="noreferrer"
                    className="shrink-0 bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                    {mat.fileType === 'video' ? '▶ Watch' : '⬇ Download'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
