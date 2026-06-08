import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ToolCard from '../components/ToolCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { Grid, SlidersHorizontal, Sparkles, AlertCircle } from 'lucide-react';

const Home = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  
  // Advanced filters
  const [pricingFilter, setPricingFilter] = useState({
    Free: false,
    Freemium: false,
    Paid: false,
    'Open Source': false
  });
  const [sortBy, setSortBy] = useState('featured');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTools, setTotalTools] = useState(0);

  // Debounced search to prevent excessive API requests
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on search
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tools from API
  const fetchTools = async () => {
    setLoading(true);
    try {
      // Build selected pricing filters query
      const selectedPricing = Object.keys(pricingFilter)
        .filter(key => pricingFilter[key])
        .join(',');

      const params = {
        page,
        limit: 9,
        sort: sortBy,
        search: debouncedSearch,
        category: activeCategory,
        pricing: selectedPricing || undefined
      };

      const response = await api.get('/tools', { params });
      if (response.success) {
        setTools(response.data);
        setTotalPages(response.pages);
        setTotalTools(response.total);
      }
    } catch (error) {
      console.error('Error fetching tools:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [activeCategory, debouncedSearch, sortBy, page, pricingFilter]);

  const handlePricingChange = (type) => {
    setPricingFilter(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setPage(1); // Reset page on filter edit
  };

  const handleUpvoteSuccess = (toolId, updatedVotes) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId ? { ...tool, votes: updatedVotes } : tool
      )
    );
  };

  const activePricingCount = Object.values(pricingFilter).filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden bg-gradient-radial">
        
        {/* Floating background glowing balls */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-float">
            <Sparkles className="w-3.5 h-3.5" />
            Find Your Ideal Tool
          </div>

          {/* Heading */}
          <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight text-white mb-6 leading-[1.1]">
            Discover the World's Best <br className="hidden sm:inline" />
            <span className="text-gradient">Artificial Intelligence</span> Tools
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse, search, and upvote 100+ hand-picked AI software solutions across writing, copywriting, design, developer assistants, chatbots, and more.
          </p>

          {/* Search Component */}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          {/* Stats Summary */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mt-8 text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="text-purple-400">⚡</span> 10+ Categories
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-pink-400">🔥</span> Upvote-Backed Ratings
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✨</span> Daily Curated Submissions
            </div>
          </div>

        </div>
      </section>

      {/* Directory Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative">
        
        {/* Category horizontal filters */}
        <div className="mb-10">
          <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
        </div>

        {/* Filters and Card Area Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar Filters (Desktop only, collapsible on mobile) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/5 sticky top-24">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <h3 className="font-display font-bold text-slate-200 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                  Filter Options
                </h3>
                { (activePricingCount > 0 || activeCategory) && (
                  <button 
                    onClick={() => {
                      setPricingFilter({ Free: false, Freemium: false, Paid: false, 'Open Source': false });
                      setActiveCategory('');
                    }}
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Pricing Filter Groups */}
              <div className="mb-6">
                <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">
                  Pricing Models
                </h4>
                <div className="space-y-2.5">
                  {Object.keys(pricingFilter).map((type) => (
                    <label key={type} className="flex items-center gap-3 text-sm text-slate-300 hover:text-white cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={pricingFilter[type]}
                        onChange={() => handlePricingChange(type)}
                        className="w-4.5 h-4.5 rounded bg-slate-900 border-white/10 text-purple-600 focus:ring-purple-500/30 focus:ring-offset-0 focus:outline-none"
                      />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sorting Filter */}
              <div>
                <h4 className="font-display font-semibold text-xs text-slate-400 uppercase tracking-wider mb-3">
                  Sort Results By
                </h4>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full bg-[#080b11] border border-white/10 hover:border-purple-500/20 text-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
                >
                  <option value="featured">🔥 Featured First</option>
                  <option value="votes">⭐ Most Upvoted</option>
                  <option value="rating">✨ Highest Rated</option>
                  <option value="newest">📅 Newly Added</option>
                  <option value="alphabetical">🔤 Alphabetical (A-Z)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Right Cards Grid */}
          <div className="lg:col-span-3">
            
            {/* Search Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-extrabold text-slate-200 text-lg sm:text-xl flex items-center gap-2">
                <Grid className="w-4 h-4 text-purple-400" />
                {loading ? 'Searching Directory...' : `${totalTools} AI Tool${totalTools === 1 ? '' : 's'} Available`}
              </h3>
            </div>

            {/* Grid Area */}
            {loading ? (
              // Glassmorphic loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-white/5 flex flex-col justify-between h-56 animate-pulse">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                          <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-3 bg-slate-800 rounded w-full"></div>
                        <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/5">
                      <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                      <div className="h-6 bg-slate-800 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tools.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      onUpvoteSuccess={handleUpvoteSuccess} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-12">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:border-purple-500/20 bg-white/5 hover:bg-purple-600/10 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 text-sm font-semibold"
                    >
                      Prev
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border transition-all duration-200 ${
                          page === i + 1
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:border-purple-500/20 bg-white/5 hover:bg-purple-600/10 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 text-sm font-semibold"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Empty state
              <div className="glass rounded-3xl p-12 text-center border border-white/5 max-w-xl mx-auto mt-8">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-float" />
                <h3 className="font-display font-bold text-lg text-slate-200 mb-2">No tools match your criteria</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Try clearing your active filters, adjusting the pricing models selected, or trying a different search term.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('');
                    setPricingFilter({ Free: false, Freemium: false, Paid: false, 'Open Source': false });
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Submission Callout CTA Banner */}
        <div className="mt-20 relative rounded-3xl overflow-hidden glass p-8 sm:p-12 border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mb-4">
              Have a cutting-edge AI Tool to submit?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
              Grow your audience and drive traffic to your tool. Submit it to our directory for free! Our team reviews submissions within 24-48 hours.
            </p>
            <Link
              to="/submit"
              className="glow-btn bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-purple-500/20 text-sm"
            >
              Submit Your Tool Now
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Home;
