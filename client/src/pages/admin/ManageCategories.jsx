import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Tags, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🤖',
    color: '#3b82f6',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSelect = (cat) => {
    setEditingId(cat.id);
    setError('');
    setFormData({
      name: cat.name,
      icon: cat.icon || '🤖',
      color: cat.color || '#3b82f6',
      description: cat.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setError('');
    setFormData({
      name: '',
      icon: '🤖',
      color: '#3b82f6',
      description: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Category? Tools under this category will need manual reassignment.')) return;
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.success) {
        fetchCategories();
        if (editingId === id) handleCancelEdit();
      }
    } catch (err) {
      console.error('Failed to delete category:', err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      let response;
      if (editingId) {
        response = await api.put(`/categories/${editingId}`, formData);
      } else {
        response = await api.post('/categories', formData);
      }

      if (response.success) {
        fetchCategories();
        handleCancelEdit();
      } else {
        setError(response.message || 'Operation failed.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  };

  const defaultIcons = ['🤖', '✍️', '🎨', '🎬', '💻', '🎵', '📈', '🔬', '⚡', '🖌️', '💬', '🧠', '⚙️', '🔍'];

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div>
        <h1 className="font-display font-black text-2xl text-white">Manage Categories</h1>
        <p className="text-slate-400 text-xs mt-0.5">Define classifications and colors for directories.</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Categories List Table (Left, Col span 2) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5 h-fit">
          <h3 className="font-display font-bold text-slate-200 text-sm pb-4 border-b border-white/5 mb-5 flex items-center gap-2">
            <Tags className="w-4 h-4 text-purple-400" />
            Active Category List
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-[#080b11]/50 text-slate-400 font-display font-bold">
                  <th className="p-3">Icon & Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Color Badge</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                      <td className="p-4"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                    </tr>
                  ))
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-white/[0.01]">
                      {/* Name / Icon */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow"
                            style={{ 
                              backgroundColor: `${cat.color}15`,
                              border: `1px solid ${cat.color}25`
                            }}
                          >
                            {cat.icon}
                          </span>
                          <div>
                            <span className="font-bold text-slate-200 block">{cat.name}</span>
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[180px]">{cat.description}</span>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="p-3.5 text-slate-400 font-mono text-xs">
                        {cat.slug}
                      </td>

                      {/* Color Badge */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: cat.color }}></span>
                          <span className="font-mono text-xs text-slate-400 uppercase">{cat.color}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditSelect(cat)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center p-6 text-slate-500 text-xs">
                      No categories created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Form (Right, Col span 1) */}
        <div className="glass rounded-3xl p-6 border border-white/5 h-fit">
          <h3 className="font-display font-bold text-slate-200 text-sm pb-4 border-b border-white/5 mb-5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            {editingId ? 'Edit Category' : 'Create Category'}
          </h3>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl mb-4 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Category Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. Chatbots"
                className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Category Icon */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Emoji Icon</label>
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleFormChange}
                  className="bg-[#080b11] border border-white/10 text-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none"
                >
                  {defaultIcons.map((ico, idx) => (
                    <option key={idx} value={ico}>{ico}</option>
                  ))}
                </select>
              </div>

              {/* Theme Hex Color */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-400 uppercase tracking-wider">Hex Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleFormChange}
                    className="w-10 h-8 rounded border border-white/10 bg-[#080b11] p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleFormChange}
                    placeholder="#3b82f6"
                    className="w-full bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3 py-2 text-[10px] font-mono focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-slate-400 uppercase tracking-wider">Description</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Brief summary of category tools..."
                className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 rounded-xl border border-white/5 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading}
                className="glow-btn bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-purple-500/20 disabled:opacity-50"
              >
                {formLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                ) : editingId ? (
                  'Update Category'
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Save Category
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default ManageCategories;
