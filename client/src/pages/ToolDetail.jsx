import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ToolCard from '../components/ToolCard';
import Avatar from '../components/Avatar';
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  ArrowUp, 
  Tag, 
  Info,
  Calendar,
  Sparkles,
  ChevronRight,
  Bookmark
} from 'lucide-react';

const ToolDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [tool, setTool] = useState(null);
  const [relatedTools, setRelatedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  
  // Bookmarks & Reviews State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch all details
  const fetchToolDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tools/${slug}`);
      if (response.success) {
        setTool(response.data);
        setVotes(response.data.votes || 0);
        setRelatedTools(response.related || []);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error('Failed to load tool details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToolDetails();
  }, [slug]);

  // Load reviews list
  const fetchReviews = async () => {
    if (!tool) return;
    try {
      const res = await api.get(`/reviews/tool/${tool.id}`);
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchReviews();
  }, [tool]);

  // Check if tool is bookmarked
  useEffect(() => {
    const checkBookmark = async () => {
      if (!isAuthenticated || !tool) return;
      try {
        const res = await api.get('/bookmarks');
        if (res.success) {
          const found = res.data.some(b => b.id === tool.id);
          setIsBookmarked(found);
        }
      } catch (err) {}
    };
    checkBookmark();
  }, [tool, isAuthenticated]);

  // Push to local search history
  useEffect(() => {
    if (tool) {
      const history = localStorage.getItem('recent_tools');
      let parsed = history ? JSON.parse(history) : [];
      parsed = parsed.filter(t => t.id !== tool.id);
      parsed.unshift(tool);
      localStorage.setItem('recent_tools', JSON.stringify(parsed.slice(0, 12)));
    }
  }, [tool]);

  const handleUpvote = async () => {
    if (hasUpvoted || upvoting || !tool) return;
    setUpvoting(true);
    try {
      const response = await api.post(`/tools/${tool.id}/upvote`);
      if (response.success) {
        setVotes(response.votes);
        setHasUpvoted(true);
      }
    } catch (error) {
      console.error('Failed to upvote:', error.message);
    } finally {
      setUpvoting(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      return navigate('/login');
    }
    try {
      const res = await api.post('/bookmarks', { toolId: tool.id });
      if (res.success) {
        setIsBookmarked(res.isBookmarked);
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    if (!comment.trim()) return setReviewError('Please write a review comment');

    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await api.post('/reviews', { toolId: tool.id, rating, comment });
      if (res.success) {
        setComment('');
        fetchReviews(); // Reload list
        
        // Reload tool rating average
        const response = await api.get(`/tools/${slug}`);
        if (response.success) {
          setTool(response.data);
        }
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const pricingBadgeStyles = {
    'Free': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Freemium': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Paid': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Open Source': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 glass rounded-3xl p-6 h-96 border border-white/5"></div>
          <div className="lg:col-span-2 glass rounded-3xl p-8 h-96 border border-white/5"></div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 text-center">
        <h2 className="font-display font-bold text-2xl text-slate-200">AI Tool Not Found</h2>
        <p className="text-slate-400 text-sm mt-2">The tool you are looking for might have been removed or renamed.</p>
        <Link to="/" className="inline-flex items-center gap-2 mt-6 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const category = tool.category || { name: 'AI Tool', color: '#8b5cf6', icon: '🤖' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Breadcrumbs & Back Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 font-medium">
          <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link to={`/category/${category.slug}`} className="hover:text-white transition-colors duration-200">{category.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-purple-400 font-semibold">{tool.name}</span>
        </div>

        {/* Back Link */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white font-medium transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Directory Index
        </Link>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        
        {/* Left Side Quick Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 text-center relative overflow-hidden">
            {/* Ambient category shine */}
            <div 
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
              style={{ backgroundColor: category.color }}
            ></div>

            {/* Logo */}
            {tool.logoUrl ? (
              <img 
                src={tool.logoUrl} 
                alt={`${tool.name} Logo`} 
                className="w-24 h-24 rounded-2xl mx-auto object-cover border border-white/10 mb-6 relative z-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${tool.name}&backgroundColor=6366f1`;
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-purple-900/20 border border-purple-500/10 mx-auto flex items-center justify-center font-display font-bold text-3xl text-purple-300 mb-6">
                {tool.name.substring(0,2).toUpperCase()}
              </div>
            )}

            {/* Title & Short Description */}
            <h1 className="font-display font-black text-2xl text-slate-100 mb-2 leading-tight">
              {tool.name}
            </h1>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mb-6">
              {tool.shortDesc}
            </p>

            {/* Visit Website CTA */}
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-btn w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 transition-all text-sm"
            >
              Visit {tool.name}
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Bookmark Toggle Button */}
            <button
              onClick={handleBookmarkToggle}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-xs border flex items-center justify-center gap-2 transition-all duration-200 mb-6 cursor-pointer ${
                isBookmarked 
                  ? 'bg-purple-600/10 border-purple-500/25 text-purple-400' 
                  : 'bg-white/5 border-white/10 hover:border-purple-500/20 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Saved to Bookmarks' : 'Bookmark this Tool'}
            </button>

            {/* Pricing Model Detail Card */}
            <div className="flex items-center justify-between border-t border-white/5 py-4 text-sm">
              <span className="text-slate-400 font-medium">Pricing Model</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${pricingBadgeStyles[tool.pricing] || pricingBadgeStyles['Freemium']}`}>
                {tool.pricing}
              </span>
            </div>

            {/* Category Pill Link */}
            <div className="flex items-center justify-between border-t border-white/5 py-4 text-sm">
              <span className="text-slate-400 font-medium">Primary Domain</span>
              <Link 
                to={`/category/${category.slug}`}
                className="text-xs font-semibold px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all hover:scale-105"
                style={{ 
                  borderColor: `${category.color}25`, 
                  backgroundColor: `${category.color}08`, 
                  color: category.color 
                }}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </Link>
            </div>

            {/* Date Seeded */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Added On</span>
              <span>{new Date(tool.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>

          </div>

          {/* Interactive Rating & Upvote Stats Card */}
          <div className="glass rounded-3xl p-6 border border-white/5">
            <h3 className="font-display font-semibold text-sm text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Community Response
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              
              {/* Rating */}
              <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Expert Rating</span>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-display font-bold text-lg text-slate-200">
                    {tool.rating ? tool.rating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>

              {/* Upvotes */}
              <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Upvotes</span>
                <p className="font-display font-bold text-lg text-slate-200 mt-2">
                  {votes}
                </p>
              </div>

            </div>

            {/* Upvote Interaction Button */}
            <button
              onClick={handleUpvote}
              disabled={hasUpvoted || upvoting}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                hasUpvoted 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                  : 'bg-white/5 border-white/10 hover:border-purple-500/20 text-slate-300 hover:text-white'
              }`}
            >
              <ArrowUp className={`w-4 h-4 ${hasUpvoted ? 'animate-bounce' : ''}`} />
              {hasUpvoted ? 'Upvoted Successfully!' : 'Upvote this Tool'}
            </button>
          </div>
        </div>

        {/* Right Side In-Depth Description & Reviews Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Description */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5">
            <h2 className="font-display font-bold text-lg text-slate-200 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Tool Overview & Features
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {tool.description}
            </p>
          </div>

          {/* User Reviews & Ratings Section */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
            <h2 className="font-display font-bold text-lg text-slate-200 flex items-center gap-2">
              <Star className="w-4.5 h-4.5 text-purple-400 fill-purple-400/20" />
              User Reviews ({reviews.length})
            </h2>

            {/* Review Form */}
            <form onSubmit={handleReviewSubmit} className="space-y-4 border-b border-white/5 pb-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Write a Review</h3>
              
              {reviewError && (
                <div className="text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  {reviewError}
                </div>
              )}

              {/* Star selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium mr-2">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-0.5 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star className={`w-5 h-5 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>

              {/* Text comment */}
              <div className="flex flex-col gap-1.5">
                <textarea
                  required
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={isAuthenticated ? "Share your experience with this tool..." : "Please log in/sign up to submit a review."}
                  disabled={!isAuthenticated}
                  className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-xs focus:outline-none transition-all disabled:opacity-40"
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading || !isAuthenticated}
                className="glow-btn bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                {reviewLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-900/30 border border-white/5 p-4 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar user={rev.user} className="w-6 h-6 text-[9px]" />
                        <span className="text-xs font-semibold text-slate-300">{rev.user?.username || 'Anonymous'}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600 text-xs italic">
                No reviews yet. Be the first to rate this product!
              </div>
            )}
          </div>

          {/* Tags list */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="glass rounded-3xl p-6 border border-white/5">
              <h3 className="font-display font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                Associated Capabilities
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {tool.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200 cursor-default hover:border-slate-800 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Related Tools Container */}
      {relatedTools.length > 0 && (
        <div className="mb-20">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white mb-8 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            More in {category.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedTools.map((relatedTool) => (
              <ToolCard 
                key={relatedTool.id} 
                tool={relatedTool} 
                onUpvoteSuccess={(id, vt) => {
                  setRelatedTools(prev => prev.map(t => t.id === id ? { ...t, votes: vt } : t));
                }}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ToolDetail;
