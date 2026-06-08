import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Bookmark, 
  FileText, 
  Star, 
  History, 
  Bell, 
  Settings, 
  User, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Save,
  Check,
  Eye,
  LogOut,
  Camera,
  Upload
} from 'lucide-react';
import ToolCard from '../components/ToolCard';
import Avatar from '../components/Avatar';

const Dashboard = () => {
  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');

  // State
  const [savedTools, setSavedTools] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Photo Uploader Ref & State
  const fileInputRef = useRef(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size exceeds 5MB limit');
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const uploadRes = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (uploadRes.success && uploadRes.fileUrl) {
        const avatarUrl = uploadRes.fileUrl;
        setProfileData(prev => ({ ...prev, avatar: avatarUrl }));
        
        // Save immediately to backend profile
        const updateRes = await api.put('/auth/profile', {
          username: profileData.username || user?.username,
          email: profileData.email || user?.email,
          avatar: avatarUrl
        });

        if (updateRes.success) {
          showMessage('success', 'Profile photo updated successfully!');
          await checkAuth();
        }
      } else {
        showMessage('error', 'Failed to upload photo');
      }
    } catch (err) {
      showMessage('error', err.message || 'Error uploading profile photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const updateRes = await api.put('/auth/profile', {
        username: profileData.username || user?.username,
        email: profileData.email || user?.email,
        avatar: ''
      });

      if (updateRes.success) {
        setProfileData(prev => ({ ...prev, avatar: '' }));
        showMessage('success', 'Profile photo removed');
        await checkAuth();
      }
    } catch (err) {
      showMessage('error', err.message || 'Error removing profile photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Initialize Profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        avatar: user.avatar || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Saved Tools
      const bookmarksRes = await api.get('/bookmarks');
      if (bookmarksRes.success) setSavedTools(bookmarksRes.data);

      // 2. Submissions
      const submissionsRes = await api.get('/tools/my-submissions');
      if (submissionsRes.success) setSubmissions(submissionsRes.data);

      // 3. Reviews
      const reviewsRes = await api.get('/reviews');
      if (reviewsRes.success) setReviews(reviewsRes.data);

      // 4. Notifications
      const notifsRes = await api.get('/notifications');
      if (notifsRes.success) {
        setNotifications(notifsRes.data);
        setUnreadNotifications(notifsRes.unreadCount || 0);
      }

      // 5. Recently Viewed (From localStorage)
      const localHistory = localStorage.getItem('recent_tools');
      if (localHistory) {
        setRecentlyViewed(JSON.parse(localHistory).slice(0, 6)); // Show last 6
      }
    } catch (err) {
      console.error('Error loading dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Profile update handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      return showMessage('error', 'Passwords do not match');
    }

    setActionLoading(true);
    try {
      const payload = {
        username: profileData.username,
        email: profileData.email,
        avatar: profileData.avatar
      };
      if (profileData.password) {
        payload.password = profileData.password;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.success) {
        showMessage('success', 'Profile updated successfully!');
        await checkAuth(); // Refresh user state
        setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      showMessage('error', err.message || 'Failed to update profile');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove bookmark handler
  const handleRemoveBookmark = async (toolId) => {
    try {
      const res = await api.post('/bookmarks', { toolId });
      if (res.success) {
        setSavedTools(prev => prev.filter(t => t.id !== toolId));
        showMessage('success', 'Bookmark removed');
      }
    } catch (err) {
      showMessage('error', 'Failed to remove bookmark');
    }
  };

  // Delete review handler
  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await api.delete(`/reviews/${reviewId}`);
      if (res.success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        showMessage('success', 'Review deleted');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete review');
    }
  };

  // Notifications handlers
  const handleMarkRead = async (notifId) => {
    try {
      const res = await api.put(`/notifications/${notifId}/read`);
      if (res.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notifId ? { ...n, read: true } : n)
        );
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      }
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.put('/notifications/read-all');
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadNotifications(0);
        showMessage('success', 'All alerts marked as read');
      }
    } catch (err) {}
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      const res = await api.delete(`/notifications/${notifId}`);
      if (res.success) {
        const target = notifications.find(n => n.id === notifId);
        if (target && !target.read) {
          setUnreadNotifications(prev => Math.max(0, prev - 1));
        }
        setNotifications(prev => prev.filter(n => n.id !== notifId));
      }
    } catch (err) {}
  };

  const clearRecentlyViewed = () => {
    localStorage.removeItem('recent_tools');
    setRecentlyViewed([]);
    showMessage('success', 'Recently viewed history cleared');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-current' : 'text-slate-600'}`} />
        ))}
      </div>
    );
  };

  // Tabs structure
  const tabs = [
    { id: 'saved', label: 'Saved Tools', icon: Bookmark, count: savedTools.length },
    { id: 'submissions', label: 'My Submissions', icon: FileText, count: submissions.length },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, count: reviews.length },
    { id: 'recent', label: 'Recently Viewed', icon: History, count: recentlyViewed.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifications, isAlert: true },
    { id: 'settings', label: 'Profile Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 glass rounded-3xl h-96 border border-white/5"></div>
          <div className="lg:col-span-3 glass rounded-3xl h-[600px] border border-white/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">
      
      {/* Alert Messaging */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold shadow-2xl animate-slideIn ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Profile card & Tab Navigation */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Quick Stats */}
          <div className="glass rounded-3xl p-6 border border-white/5 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Avatar */}
            <div className="relative w-20 h-20 mx-auto mb-4 group">
              <Avatar user={user} className="w-20 h-20 text-xl" />
              <span className="absolute bottom-0 right-0 w-5.5 h-5.5 rounded-full bg-emerald-500 border-4 border-[#0b0f19]"></span>
            </div>

            <h3 className="font-display font-black text-lg text-slate-100">{user?.username}</h3>
            <p className="text-slate-500 text-xs truncate max-w-xs mb-4">{user?.email}</p>
            <div className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border border-purple-500/10 bg-purple-500/5 text-purple-400">
              {user?.role === 'admin' ? 'Owner / Admin' : 'Directory Member'}
            </div>

            {/* Logout button */}
            <button 
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 rounded-xl border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout Session
            </button>
          </div>

          {/* Navigation Sidebar Tabs */}
          <div className="glass rounded-3xl p-4 border border-white/5 shadow-xl space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 border ${
                    isActive 
                      ? 'bg-purple-600/10 border-purple-500/25 text-purple-400' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    {tab.label}
                  </span>
                  
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                      tab.isAlert && !isActive
                        ? 'bg-red-500/15 border-red-500/25 text-red-400 animate-pulse'
                        : 'bg-slate-800/80 border-white/5 text-slate-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Dashboard Container Panel */}
        <div className="lg:col-span-3 glass rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl min-h-[500px] flex flex-col justify-between">
          <div>
            
            {/* TAB: Saved Tools */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-purple-400" />
                    Saved Tools
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">AI tools you bookmarked for quick access.</p>
                </div>

                {savedTools.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedTools.map(tool => (
                      <div key={tool.id} className="relative group">
                        <ToolCard 
                          tool={tool} 
                          onUpvoteSuccess={(id, votes) => {
                            setSavedTools(prev => prev.map(t => t.id === id ? { ...t, votes } : t));
                          }}
                        />
                        <button 
                          onClick={() => handleRemoveBookmark(tool.id)}
                          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                          title="Remove Bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <Bookmark className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    No saved tools. Browse directory to add bookmarks!
                  </div>
                )}
              </div>
            )}

            {/* TAB: Submissions */}
            {activeTab === 'submissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-400" />
                      My Submissions
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">History of AI tools you submitted to the directory.</p>
                  </div>
                  <Link 
                    to="/submit" 
                    className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
                  >
                    Suggest New Tool
                  </Link>
                </div>

                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map(tool => (
                      <div 
                        key={tool.id} 
                        className="bg-slate-900/40 p-4 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt="" className="w-10 h-10 object-cover rounded-xl border border-white/5" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-purple-900/30 border border-purple-500/10 flex items-center justify-center font-display font-bold text-sm text-purple-300">
                              {tool.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                              {tool.name}
                              <a href={tool.websiteUrl} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-purple-400">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{tool.shortDesc}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {tool.approved ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                              <Check className="w-3 h-3" /> Approved & Live
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-400">
                              <Clock className="w-3 h-3 animate-pulse" /> Pending Review
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    You have not submitted any tools yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-400" />
                    Reviews & Ratings
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Review feedback you submitted for various software.</p>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map(review => (
                      <div 
                        key={review.id} 
                        className="bg-slate-900/40 p-5 border border-white/5 rounded-2xl flex flex-col justify-between gap-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-2.5">
                            {review.tool?.logoUrl ? (
                              <img src={review.tool.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/5" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                AI
                              </div>
                            )}
                            <div>
                              <Link to={`/tool/${review.tool?.slug}`} className="font-semibold text-slate-200 text-sm hover:underline">
                                {review.tool?.name}
                              </Link>
                              <div className="mt-0.5">{renderStars(review.rating)}</div>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleDeleteReview(review.id)}
                            className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Delete Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-300 bg-[#080b11]/50 p-3 rounded-xl border border-white/5 italic">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <Star className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    You have not submitted any reviews yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Recently Viewed */}
            {activeTab === 'recent' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-purple-400" />
                      Recently Viewed
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Your local AI search history.</p>
                  </div>
                  {recentlyViewed.length > 0 && (
                    <button 
                      onClick={clearRecentlyViewed}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {recentlyViewed.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentlyViewed.map(tool => (
                      <ToolCard 
                        key={tool.id} 
                        tool={tool} 
                        onUpvoteSuccess={(id, votes) => {
                          setRecentlyViewed(prev => prev.map(t => t.id === id ? { ...t, votes } : t));
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <History className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    History is empty. Browse software to build catalog history.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-purple-400" />
                      Notifications
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Alerts, updates, and approval responses.</p>
                  </div>
                  {unreadNotifications > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.read && handleMarkRead(notif.id)}
                        className={`bg-slate-900/40 p-4 border rounded-2xl flex items-start justify-between gap-4 transition-all duration-200 cursor-pointer ${
                          notif.read ? 'border-white/5 opacity-75' : 'border-purple-500/25 bg-purple-500/5'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-xl mt-0.5 ${
                            notif.read ? 'bg-slate-800 text-slate-500' : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                              {notif.title}
                              {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-600 block mt-2">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif.id); }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs">
                    <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    No notifications available.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Profile Settings
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">Customize your account username, avatar, and password.</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-xl">
                  
                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Username</label>
                    <input 
                      type="text" 
                      required
                      value={profileData.username}
                      onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                      className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={profileData.email}
                      onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                      className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                    />
                  </div>

                  {/* WhatsApp-Style Photo Uploader */}
                  <div className="flex flex-col items-center sm:items-start gap-4 mb-6 pt-2 pb-4 border-b border-white/5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider self-start">Profile Photo</label>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      {/* Interactive circular picture */}
                      <div 
                        onClick={handlePhotoClick}
                        className="relative w-24 h-24 rounded-full group cursor-pointer overflow-hidden border-2 border-purple-500/30 bg-[#080b11] flex items-center justify-center transition-all duration-300 hover:border-purple-500"
                        title="Upload profile photo"
                      >
                        {/* The Avatar Component */}
                        <Avatar 
                          user={{ username: profileData.username || user?.username, avatar: profileData.avatar }} 
                          className="w-full h-full text-2xl" 
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-300">
                          <Camera className="w-5 h-5 mb-1" />
                          <span className="text-[9px] font-bold tracking-wider">CHANGE PHOTO</span>
                        </div>

                        {/* Uploading Spinner Overlay */}
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                          </div>
                        )}
                      </div>

                      {/* Hidden Input file */}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      {/* Description & Action buttons */}
                      <div className="text-center sm:text-left space-y-1.5">
                        <p className="text-slate-300 text-xs font-semibold">Change your profile picture</p>
                        <p className="text-slate-500 text-[10px] max-w-xs leading-normal">
                          Upload a webp, png, or jpeg image from your local device. Max size is 5MB.
                        </p>
                        
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={handlePhotoClick}
                            disabled={uploadingPhoto}
                            className="px-3 py-1.5 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 text-purple-300 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Upload Photo
                          </button>
                          
                          {profileData.avatar && !profileData.avatar.includes('dicebear.com') && (
                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              disabled={uploadingPhoto}
                              className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Modification Header */}
                  <div className="pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Change Password (Optional)</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Password */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={profileData.password}
                          onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                          className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                        />
                      </div>
                      
                      {/* Confirm Password */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          value={profileData.confirmPassword}
                          onChange={e => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                          className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="glow-btn bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-all mt-4 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save Profile Details
                      </>
                    )}
                  </button>

                </form>
              </div>
            )}

          </div>
          
          {/* Footer Notice */}
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-2">
            <span>Logged in as: <strong className="text-slate-400">{user?.role}</strong></span>
            <span>Member since: {new Date(user?.createdAt).toLocaleDateString()}</span>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
