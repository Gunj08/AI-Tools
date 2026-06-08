import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, FileText, ArrowLeft, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

const SubmitTool = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    shortDesc: '',
    description: '',
    websiteUrl: '',
    category: '',
    pricing: 'Freemium',
    tags: '',
    logoUrl: ''
  });

  // Logo file upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.success) {
          setCategories(response.data);
          if (response.data.length > 0) {
            setFormData(prev => ({ ...prev, category: response.data[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalLogoUrl = formData.logoUrl;

      // If a file is selected, upload it first
      if (logoFile) {
        setUploadingFile(true);
        const uploadData = new FormData();
        uploadData.append('image', logoFile);

        const uploadResponse = await api.post('/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.success) {
          finalLogoUrl = uploadResponse.fileUrl;
        } else {
          throw new Error('Image upload failed, please try again.');
        }
      }

      // Submit tool details
      const response = await api.post('/tools', {
        ...formData,
        logoUrl: finalLogoUrl
      });

      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong during submission.');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-16">
        <div className="glass rounded-3xl p-8 sm:p-12 border border-white/5 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="font-display font-black text-2xl text-white mb-3">Submission Received!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Thank you for suggesting <strong>{formData.name}</strong> to AIFinder. Our curation team will review the website link and details shortly. If approved, it will be added to the directory catalog.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  shortDesc: '',
                  description: '',
                  websiteUrl: '',
                  category: categories[0]?.id || '',
                  pricing: 'Freemium',
                  tags: '',
                  logoUrl: ''
                });
                setLogoFile(null);
                setLogoPreview(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm font-semibold transition-all"
            >
              Submit Another
            </button>
            <Link 
              to="/" 
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8">
      
      {/* Back to Home */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Title */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-display font-black text-3xl text-white mb-3 flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          Suggest an AI Tool
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Help build the directory by listing your own product or a favorite AI utility. Submissions are queued for admin review before publication.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl mb-8 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-0.5">Submission Error</h4>
            <p className="text-xs text-red-400/90">{error}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-10 border border-white/5 space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Tool Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Tool Name <span className="text-purple-400">*</span></label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. ChatArt"
              className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Website URL */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Website URL <span className="text-purple-400">*</span></label>
            <input
              type="url"
              name="websiteUrl"
              required
              value={formData.websiteUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

        </div>

        {/* Short Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Short Tagline Description <span className="text-purple-400">*</span></label>
          <input
            type="text"
            name="shortDesc"
            required
            maxLength="150"
            value={formData.shortDesc}
            onChange={handleChange}
            placeholder="A single line summary. E.g. AI-driven editor that rewrites paragraphs in 15+ styles."
            className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
          />
          <span className="text-[10px] text-slate-500 text-right font-medium">Max 150 characters ({formData.shortDesc.length}/150)</span>
        </div>

        {/* Deep Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Detailed Description <span className="text-purple-400">*</span></label>
          <textarea
            name="description"
            required
            rows="5"
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain what the tool does, who it is for, its core capabilities, and unique features."
            className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Category Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category <span className="text-purple-400">*</span></label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="bg-[#080b11] border border-white/10 text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/25 focus:border-purple-500/20"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Model Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pricing model <span className="text-purple-400">*</span></label>
            <select
              name="pricing"
              required
              value={formData.pricing}
              onChange={handleChange}
              className="bg-[#080b11] border border-white/10 text-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/25 focus:border-purple-500/20"
            >
              <option value="Free">Free</option>
              <option value="Freemium">Freemium</option>
              <option value="Paid">Paid</option>
              <option value="Open Source">Open Source</option>
            </select>
          </div>

        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Capabilities Tags (Comma Separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="E.g. content-writer, copy, blogging, openai"
            className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
          />
        </div>

        {/* Logo Upload Segment */}
        <div className="flex flex-col gap-2 border-t border-white/5 pt-6">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Logo Upload</label>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* File Drag Box */}
            <div className="relative flex-grow w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-purple-500/35 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-400 font-medium"><span className="font-semibold text-purple-400">Click to upload</span> or drag and drop logo file</p>
                  <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, JPEG or WEBP (Max 5MB)</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </label>
            </div>

            {/* URL Input Alternating */}
            <div className="w-full sm:w-auto text-slate-500 text-xs font-bold font-display">OR</div>

            <div className="w-full flex flex-col gap-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Direct Image URL</label>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                disabled={logoFile !== null}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all disabled:opacity-40"
              />
            </div>
          </div>

          {/* Image Preview Container */}
          {logoPreview && (
            <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 mt-4">
              <img 
                src={logoPreview} 
                alt="Logo Preview" 
                className="w-14 h-14 object-cover rounded-xl border border-white/10"
              />
              <div>
                <p className="text-xs font-semibold text-slate-300">File Selected</p>
                <button
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                  className="text-[10px] text-red-400 hover:underline font-bold mt-1"
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="glow-btn w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              {uploadingFile ? 'Uploading logo...' : 'Submitting details...'}
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Submit AI Tool for Review
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default SubmitTool;
