import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  ExternalLink,
  PlusCircle,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTools: 0,
    pendingSubmissions: 0,
    totalCategories: 0,
    featuredTools: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tools/stats/dashboard');
      if (response.success) {
        setStats(response.stats);
        setRecentSubmissions(response.recentSubmissions || []);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err.message);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const response = await api.put(`/tools/${id}/approve`, { action });
      if (response.success) {
        // Reload dashboard stats and submissions
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Approval action failed:', err.message);
    }
  };

  const statCards = [
    {
      label: 'Approved Directory Tools',
      value: stats.totalTools,
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      label: 'Pending Submissions',
      value: stats.pendingSubmissions,
      icon: AlertCircle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Active Categories',
      value: stats.totalCategories,
      icon: Layers,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Featured Products',
      value: stats.featuredTools,
      icon: Sparkles,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-28 border border-white/5"></div>
          ))}
        </div>
        <div className="glass rounded-3xl h-96 border border-white/5"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400 text-xs sm:text-sm">Manage submissions, review stats, and manage directory categories.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{card.label}</span>
                <p className="font-display font-black text-3xl text-slate-100 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Pending reviews & Quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Pending Reviews Table */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <h3 className="font-display font-bold text-slate-200 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Submissions Pending Review
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/10 border border-amber-500/15 text-amber-400 rounded-lg">
              {recentSubmissions.length} Pending
            </span>
          </div>

          {recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((tool) => {
                const category = tool.category || { name: 'AI Tool', color: '#8b5cf6', icon: '🤖' };
                return (
                  <div 
                    key={tool.id} 
                    className="bg-slate-900/40 hover:bg-slate-900/60 p-4 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200"
                  >
                    
                    {/* Tool Info */}
                    <div className="flex items-center gap-3">
                      {tool.logoUrl ? (
                        <img 
                          src={tool.logoUrl} 
                          alt="Logo" 
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/10 flex items-center justify-center font-display font-bold text-sm text-purple-300">
                          {tool.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                          {tool.name}
                          <a 
                            href={tool.websiteUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-slate-500 hover:text-purple-400 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1 max-w-[280px] mt-0.5">{tool.shortDesc}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
                            style={{ 
                              borderColor: `${category.color}20`, 
                              backgroundColor: `${category.color}08`, 
                              color: category.color 
                            }}
                          >
                            {category.icon} {category.name}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-slate-800 border border-white/5 px-2 py-0.5 rounded-md font-semibold">
                            {tool.pricing}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleAction(tool.id, 'reject')}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 hover:border-red-500/35 text-red-400 transition-all duration-200"
                        title="Reject & Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction(tool.id, 'approve')}
                        className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/35 text-emerald-400 transition-all duration-200"
                        title="Approve & Publish"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Sparkles className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              No pending submissions to review. Excellent job!
            </div>
          )}
        </div>

        {/* Quick Links Column */}
        <div className="glass rounded-3xl p-6 border border-white/5 h-fit">
          <h3 className="font-display font-bold text-slate-200 text-sm pb-4 border-b border-white/5 mb-6">
            Quick System Commands
          </h3>
          <div className="space-y-3">
            <Link 
              to="/admin/tools"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-purple-600/10 border border-white/5 hover:border-purple-500/20 transition-all duration-200 group text-sm font-semibold text-slate-300 hover:text-purple-300"
            >
              <span className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" /> Add New AI Tool
              </span>
              <Eye className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/admin/categories"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-purple-600/10 border border-white/5 hover:border-purple-500/20 transition-all duration-200 group text-sm font-semibold text-slate-300 hover:text-purple-300"
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" /> Edit Categories
              </span>
              <Eye className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
