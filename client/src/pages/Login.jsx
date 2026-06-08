import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to appropriate panel
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response.success) {
        // Handled by useEffect redirect
      } else {
        setError(response.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-16 pb-20">
      
      {/* Login Container */}
      <div className="glass rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Glow ball */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Branding Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-4 animate-float">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-display font-black text-2xl text-white">Admin Portal</h2>
          <p className="text-slate-400 text-xs mt-1">Authenticate to manage tools and categories</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl mb-6 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aitools.com"
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
                <LogIn className="w-4 h-4" />
                Sign In to Console
              </>
            )}
          </button>

        </form>

        {/* Switch to signup */}
        <div className="mt-8 text-center border-t border-white/5 pt-6 text-xs text-slate-400">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Sign Up Here
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Login;
