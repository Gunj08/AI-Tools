import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
const Register = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password
      });

      if (response.success && response.token) {
        localStorage.setItem('aitools_token', response.token);
        // We force authentication state refresh
        window.location.href = '/dashboard';
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-20">
      
      {/* Container */}
      <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Glow ball */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-float">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-display font-black text-2xl text-white">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1">Sign up to bookmark tools, write reviews, and more</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-6 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. gunjan_dev"
              className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#080b11] border border-white/10 focus:border-purple-500/25 focus:ring-1 focus:ring-purple-500/20 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="glow-btn w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-4 hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Free Account
              </>
            )}
          </button>

        </form>

        {/* Switch to login */}
        <div className="mt-8 text-center border-t border-white/5 pt-6 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            Login Here
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Register;
