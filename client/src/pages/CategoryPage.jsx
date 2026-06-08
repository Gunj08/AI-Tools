import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/ToolCard';
import { ArrowLeft, Sparkles, Filter, AlertCircle, Grid } from 'lucide-react';

const CategoryPage = () => {
  const { slug } = useParams();
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [pricing, setPricing] = useState({
    Free: false,
    Freemium: false,
    Paid: false,
    'Open Source': false
  });
  const [sort, setSort] = useState('featured');

  // Load all categories for slug lookup or sidebar links
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.success) {
          setCategories(response.data);
          const found = response.data.find(c => c.slug === slug);
          setCurrentCategory(found || null);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error.message);
      }
    };
    fetchCategories();
  }, [slug]);

  // Fetch tools matching category slug & criteria
  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        const selectedPricing = Object.keys(pricing)
          .filter(k => pricing[k])
          .join(',');

        const params = {
          category: slug,
          search: search || undefined,
          pricing: selectedPricing || undefined,
          sort,
          limit: 20
        };

        const response = await api.get('/tools', { params });
        if (response.success) {
          setTools(response.data);
        }
      } catch (error) {
        console.error('Failed to load tools:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [slug, search, pricing, sort]);

  const handlePricingChange = (type) => {
    setPricing(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleUpvoteSuccess = (toolId, updatedVotes) => {
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, votes: updatedVotes } : t));
  };

  const categoryColor = currentCategory?.color || '#8b5cf6';
  const categoryIcon = currentCategory?.icon || '🤖';
  const categoryName = currentCategory?.name || 'AI Category';
  const categoryDesc = currentCategory?.description || 'Browse curated AI software tools.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      
      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Directories
      </Link>

      {/* Category Banner Hero */}
      <div className="relative rounded-3xl overflow-hidden glass p-8 sm:p-12 border border-white/5 mb-12">
        {/* Glow corner background */}
        <div 
          className="absolute -top-12 -right-12 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ backgroundColor: categoryColor }}
        ></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          {/* Category Icon Circle */}
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl"
            style={{ 
              backgroundColor: `${categoryColor}15`, 
              border: `1px solid ${categoryColor}25`
            }}
          >
            {categoryIcon}
          </div>

          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white mb-3">
              {categoryName} Tools
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              {categoryDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Direct Category Links */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h3 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-4">
              Other Categories
            </h3>
            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    cat.slug === slug
                      ? 'bg-purple-600/15 text-purple-400 border border-purple-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Pricing Sub-filters */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h3 className="font-display font-bold text-slate-200 text-sm flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Filter className="w-4 h-4 text-purple-400" />
              Refine Results
            </h3>

            {/* Pricing Model checkbox */}
            <div className="mb-5">
              <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">
                Pricing model
              </h4>
              <div className="space-y-2.5">
                {Object.keys(pricing).map((type) => (
                  <label key={type} className="flex items-center gap-3 text-sm text-slate-300 hover:text-white cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={pricing[type]}
                      onChange={() => handlePricingChange(type)}
                      className="w-4.5 h-4.5 rounded bg-slate-900 border-white/10 text-purple-600 focus:ring-purple-500/30 focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort order select */}
            <div>
              <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">
                Sort Order
              </h4>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-[#080b11] border border-white/10 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              >
                <option value="featured">🔥 Featured First</option>
                <option value="votes">⭐ Most Upvoted</option>
                <option value="rating">✨ Highest Rated</option>
                <option value="newest">📅 Newly Added</option>
              </select>
            </div>

          </div>

        </div>

        {/* Right Directory List */}
        <div className="lg:col-span-3">
          
          {/* Inner Search bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search inside ${categoryName} (e.g. tools, tags)...`}
                className="w-full px-4 py-3.5 bg-[#111827]/85 border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-2xl placeholder-slate-500 text-sm font-medium focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Grid render */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-5 border border-white/5 h-56 animate-pulse"></div>
              ))}
            </div>
          ) : tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <ToolCard 
                  key={tool.id} 
                  tool={tool} 
                  onUpvoteSuccess={handleUpvoteSuccess} 
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center border border-white/5 max-w-lg mx-auto">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
              <h3 className="font-display font-bold text-slate-200 text-lg mb-2">No AI Tools found</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                There are no approved tools under this category matching your active search/pricing filters.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setPricing({ Free: false, Freemium: false, Paid: false, 'Open Source': false });
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default CategoryPage;
