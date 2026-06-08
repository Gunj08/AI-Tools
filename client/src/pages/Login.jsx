import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';
import GoogleMockModal from '../components/GoogleMockModal';

const Login = () => {
  const { login, isAuthenticated, user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

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

  const handleGoogleSelect = async (email, username, avatar) => {
    setGoogleModalOpen(false);
    setError('');
    setLoading(true);
    try {
      const response = await loginWithGoogle(email, username, avatar);
      if (response.success) {
        // Handled by useEffect redirect
      } else {
        setError(response.message || 'Google sign in failed');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during Google sign in.');
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
          <h2 className="font-display font-black text-2xl text-white">Login</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to access your dashboard</p>
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="glow-btn w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-4 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Login
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="px-3 text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#0d1322] border border-white/10 hover:border-purple-500/20 text-slate-300 font-semibold rounded-xl text-sm hover:bg-purple-600/5 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

        </form>

        <GoogleMockModal 
          isOpen={googleModalOpen} 
          onClose={() => setGoogleModalOpen(false)} 
          onSelectAccount={handleGoogleSelect} 
        />

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
