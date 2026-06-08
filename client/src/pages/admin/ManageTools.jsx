import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  Upload,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ManageTools = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search / Filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTools, setTotalTools] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Add AI Tool');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    shortDesc: '',
    description: '',
    websiteUrl: '',
    category: '',
    pricing: 'Freemium',
    tags: '',
    logoUrl: '',
    approved: true,
    featured: false,
    rating: 4.5
  });

  // Local Logo upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  // Fetch directory tools
  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        adminMode: 'true' // Custom query param to allow admin access to all
      };
      const response = await api.get('/tools', { params });
      if (response.success) {
        setTools(response.data);
        setTotalPages(response.pages);
        setTotalTools(response.total);
      }
    } catch (err) {
      console.error('Failed to load tools:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.success) {
        setCategories(response.data);
        if (response.data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: response.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Inline Toggles
  const handleToggleApproved = async (id) => {
    const tool = tools.find(t => t.id === id);
    if (!tool) return;
    try {
      const response = await api.put(`/tools/${id}/approve`, { 
        action: tool.approved ? 'reject' : 'approve' // 'reject' deletes in public dashboard, but let's toggle in manage table
      });
      // In manage table, we actually update the approved flag. So we call edit endpoint under the hood!
      const toggleResponse = await api.put(`/tools/${id}`, {
        approved: !tool.approved
      });
      if (toggleResponse.success) {
        setTools(prev => prev.map(t => t.id === id ? { ...t, approved: !t.approved } : t));
      }
    } catch (err) {
      console.error('Failed to toggle approval:', err.message);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const response = await api.put(`/tools/${id}/featured`);
      if (response.success) {
        setTools(prev => prev.map(t => t.id === id ? { ...t, featured: response.featured } : t));
      }
    } catch (err) {
      console.error('Failed to toggle featured status:', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this AI Tool?')) return;
    try {
      const response = await api.delete(`/tools/${id}`);
      if (response.success) {
        fetchTools();
      }
    } catch (err) {
      console.error('Failed to delete tool:', err.message);
    }
  };

  // Form Management
  const handleOpenAdd = () => {
    setModalTitle('Add AI Tool');
    setEditingId(null);
    setError('');
    setFormData({
      name: '',
      shortDesc: '',
      description: '',
      websiteUrl: '',
      category: categories[0]?.id || '',
      pricing: 'Freemium',
      tags: '',
      logoUrl: '',
      approved: true,
      featured: false,
      rating: 4.5
    });
    setLogoFile(null);
    setLogoPreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tool) => {
    setModalTitle('Edit AI Tool');
    setEditingId(tool.id);
    setError('');
    setFormData({
      name: tool.name,
      shortDesc: tool.shortDesc || '',
      description: tool.description,
      websiteUrl: tool.websiteUrl,
      category: tool.category?.id || categories[0]?.id || '',
      pricing: tool.pricing || 'Freemium',
      tags: tool.tags ? tool.tags.join(', ') : '',
      logoUrl: tool.logoUrl || '',
      approved: tool.approved,
      featured: tool.featured,
      rating: tool.rating || 4.5
    });
    setLogoFile(null);
    setLogoPreview(tool.logoUrl || null);
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      let finalLogoUrl = formData.logoUrl;

      // Handle file upload if present
      if (logoFile) {
        const uploadData = new FormData();
        uploadData.append('image', logoFile);
        const uploadResponse = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadResponse.success) {
          finalLogoUrl = uploadResponse.fileUrl;
        } else {
          throw new Error('Image upload failed.');
        }
      }

      const postData = {
        ...formData,
        logoUrl: finalLogoUrl
      };

      let response;
      if (editingId) {
        // Edit Mode
        response = await api.put(`/tools/${editingId}`, postData);
      } else {
        // Create Mode
        response = await api.post('/tools', postData);
      }

      if (response.success) {
        setModalOpen(false);
        fetchTools();
      } else {
        setError(response.message || 'Operation failed.');
      }
    } catch (err) {
      setError(err.message || 'Validation or network error.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-white">Manage Tools</h1>
          <p className="text-slate-400 text-xs mt-0.5">Total count: {totalTools} tools</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="glow-btn bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4.5 h-4.5" /> Add AI Tool
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="glass rounded-2xl p-4 border border-white/5 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Filter tools by name, description or tags..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#080b11] border border-white/10 hover:border-purple-500/20 text-slate-200 rounded-xl placeholder-slate-500 text-xs focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-[#080b11]/50 text-slate-400 font-display font-bold">
                <th className="p-4 sm:p-5">Tool Info</th>
                <th className="p-4 sm:p-5">Category</th>
                <th className="p-4 sm:p-5">Pricing</th>
                <th className="p-4 sm:p-5 text-center">Approved</th>
                <th className="p-4 sm:p-5 text-center">Featured</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800"></div>
                      <div className="h-4 bg-slate-800 rounded w-28"></div>
                    </td>
                    <td className="p-5"><div className="h-4 bg-slate-800 rounded w-20"></div></td>
                    <td className="p-5"><div className="h-4 bg-slate-800 rounded w-16"></div></td>
                    <td className="p-5"><div className="w-8 h-4 bg-slate-800 rounded mx-auto"></div></td>
                    <td className="p-5"><div className="w-8 h-4 bg-slate-800 rounded mx-auto"></div></td>
                    <td className="p-5"><div className="h-4 bg-slate-800 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : tools.length > 0 ? (
                tools.map((tool) => {
                  const category = tool.category || { name: 'AI Tool', color: '#8b5cf6', icon: '🤖' };
                  return (
                    <tr key={tool.id} className="hover:bg-white/[0.01] transition-colors">
                      {/* Name / Logo */}
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          {tool.logoUrl ? (
                            <img 
                              src={tool.logoUrl} 
                              alt="Logo" 
                              className="w-9 h-9 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/10 flex items-center justify-center font-display font-bold text-xs text-purple-300">
                              {tool.name.substring(0,2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 leading-snug">
                              {tool.name}
                              <a href={tool.websiteUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-purple-400">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 max-w-[200px]">{tool.shortDesc}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 sm:p-5">
                        <span 
                          className="px-2.5 py-0.5 rounded-lg border text-[10px] font-bold"
                          style={{ 
                            borderColor: `${category.color}25`, 
                            backgroundColor: `${category.color}05`, 
                            color: category.color 
                          }}
                        >
                          {category.icon} {category.name}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="p-4 sm:p-5">
                        <span className="text-xs font-semibold bg-slate-800 border border-white/5 px-2.5 py-0.5 rounded-lg">
                          {tool.pricing}
                        </span>
                      </td>

                      {/* Approved Toggle */}
                      <td className="p-4 sm:p-5 text-center">
                        <button
                          onClick={() => handleToggleApproved(tool.id)}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                            tool.approved ? 'bg-emerald-600' : 'bg-slate-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            tool.approved ? 'translate-x-4' : 'translate-x-0'
                          }`}></div>
                        </button>
                      </td>

                      {/* Featured Toggle */}
                      <td className="p-4 sm:p-5 text-center">
                        <button
                          onClick={() => handleToggleFeatured(tool.id)}
                          className={`w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                            tool.featured ? 'bg-pink-600' : 'bg-slate-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            tool.featured ? 'translate-x-4' : 'translate-x-0'
                          }`}></div>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(tool)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tool.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500 text-xs">
                    No tools match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 sm:p-5 bg-[#080b11]/30 border-t border-white/5 text-xs">
            <span className="text-slate-500 font-semibold">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-white/5 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-white/5 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Editor Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop blur overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative bg-[#0b0f19] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col">
            
            {/* Modal Title header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-white flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-purple-400" />
                {modalTitle}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form content body (scrollable) */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Grid 1: Name & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tool Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="ChatGPT"
                    className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website URL</label>
                  <input
                    type="url"
                    name="websiteUrl"
                    required
                    value={formData.websiteUrl}
                    onChange={handleFormChange}
                    placeholder="https://openai.com"
                    className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Tagline</label>
                <input
                  type="text"
                  name="shortDesc"
                  required
                  maxLength="150"
                  value={formData.shortDesc}
                  onChange={handleFormChange}
                  placeholder="Summarize capability in a tagline..."
                  className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
                />
              </div>

              {/* Details Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Explain details..."
                  className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
                />
              </div>

              {/* Grid 2: Category, Pricing, Rating */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                
                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleFormChange}
                    className="bg-[#080b11] border border-white/10 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pricing */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing model</label>
                  <select
                    name="pricing"
                    required
                    value={formData.pricing}
                    onChange={handleFormChange}
                    className="bg-[#080b11] border border-white/10 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  >
                    <option value="Free">Free</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Paid">Paid</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>

                {/* Initial Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating (0 - 5)</label>
                  <input
                    type="number"
                    name="rating"
                    step="0.1"
                    min="0"
                    max="5"
                    required
                    value={formData.rating}
                    onChange={handleFormChange}
                    className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capabilities Tags (Comma Separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                  placeholder="chat, writing, seo, openai"
                  className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all"
                />
              </div>

              {/* Toggles check: Approved, Featured */}
              <div className="flex gap-8 border-t border-white/5 pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="approved"
                    checked={formData.approved}
                    onChange={handleFormChange}
                    className="w-4 h-4 bg-slate-900 border-white/10 text-purple-600 focus:ring-purple-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-300">Approve & Publish Immediately</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleFormChange}
                    className="w-4 h-4 bg-slate-900 border-white/10 text-purple-600 focus:ring-purple-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-300">Flag as Featured Tool</span>
                </label>
              </div>

              {/* Logo File upload */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logo Image</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-purple-500/20 bg-slate-900 text-slate-300 cursor-pointer text-xs font-bold transition-all">
                    <Upload className="w-4 h-4 text-slate-400" />
                    Upload Logo File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-xs text-slate-500">OR</span>
                  <input
                    type="text"
                    name="logoUrl"
                    value={formData.logoUrl}
                    disabled={logoFile !== null}
                    onChange={handleFormChange}
                    placeholder="https://example.com/logo.png"
                    className="flex-grow bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all disabled:opacity-40"
                  />
                </div>

                {logoPreview && (
                  <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5 mt-2">
                    <img src={logoPreview} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400">Selected</p>
                      <button 
                        type="button" 
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }} 
                        className="text-[10px] text-red-400 hover:underline font-bold mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions Footer */}
              <div className="border-t border-white/5 pt-5 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="glow-btn bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {modalLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  ) : (
                    'Save AI Tool'
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};

export default ManageTools;
