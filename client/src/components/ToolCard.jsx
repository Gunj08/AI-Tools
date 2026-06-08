import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Star, ExternalLink } from 'lucide-react';
import api from '../services/api';

const ToolCard = ({ tool, onUpvoteSuccess }) => {
  const [votes, setVotes] = useState(tool.votes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted || upvoting) return;

    setUpvoting(true);
    try {
      const response = await api.post(`/tools/${tool.id}/upvote`);
      if (response.success) {
        setVotes(response.votes);
        setHasUpvoted(true);
        if (onUpvoteSuccess) onUpvoteSuccess(tool.id, response.votes);
      }
    } catch (error) {
      console.error('Failed to upvote:', error.message);
    } finally {
      setUpvoting(false);
    }
  };

  // Pricing badge style mapping
  const pricingStyles = {
    'Free': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Freemium': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Paid': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Open Source': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const currentCategory = tool.category || { name: 'AI Tool', color: '#8b5cf6', icon: '🤖' };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between h-full group relative overflow-hidden">
      
      {/* Background radial shine */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: currentCategory.color }}
      ></div>

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            {tool.logoUrl ? (
              <img 
                src={tool.logoUrl} 
                alt={`${tool.name} Logo`}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 group-hover:border-purple-500/20 transition-all duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${tool.name}&backgroundColor=6366f1`;
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-purple-900/30 border border-purple-500/10 flex items-center justify-center font-display font-bold text-lg text-purple-300">
                {tool.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            {/* Name and Rating */}
            <div>
              <h3 className="font-display font-bold text-slate-100 group-hover:text-purple-300 transition-colors duration-200 leading-snug">
                <Link to={`/tool/${tool.slug}`} className="hover:underline">
                  {tool.name}
                </Link>
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-slate-300">
                  {tool.rating ? tool.rating.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Upvote Pill */}
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted || upvoting}
            className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border transition-all duration-200 hover:scale-105 ${
              hasUpvoted 
                ? 'bg-purple-600 border-purple-500 text-white' 
                : 'bg-white/5 border-white/10 hover:border-purple-500/30 text-slate-400 hover:text-purple-300'
            }`}
          >
            <ArrowUp className={`w-4 h-4 ${hasUpvoted ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-bold mt-0.5">{votes}</span>
          </button>
        </div>

        {/* Short Description */}
        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4">
          {tool.shortDesc || tool.description}
        </p>
      </div>

      {/* Footer / Meta Row */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        
        {/* Category Pill */}
        <span 
          className="text-xs font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
          style={{ 
            borderColor: `${currentCategory.color}20`, 
            backgroundColor: `${currentCategory.color}08`, 
            color: currentCategory.color 
          }}
        >
          <span>{currentCategory.icon}</span>
          <span>{currentCategory.name}</span>
        </span>

        {/* Pricing Badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${pricingStyles[tool.pricing] || pricingStyles['Freemium']}`}>
          {tool.pricing}
        </span>

      </div>
    </div>
  );
};

export default ToolCard;
