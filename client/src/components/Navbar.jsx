import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sparkles, Plus, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import Avatar from './Avatar';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AIFinder
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `font-medium text-sm transition-colors duration-200 ${isActive ? 'text-purple-400' : 'text-slate-300 hover:text-white'}`
              }
            >
              Explore Tools
            </NavLink>
            <NavLink 
              to="/submit" 
              className={({ isActive }) => 
                `font-medium text-sm transition-colors duration-200 ${isActive ? 'text-purple-400' : 'text-slate-300 hover:text-white'}`
              }
            >
              Submit a Tool
            </NavLink>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center p-0.5 rounded-full bg-slate-900 border border-white/10 hover:border-purple-500/30 transition-all focus:outline-none cursor-pointer"
                >
                  <Avatar user={user} className="w-8 h-8" />
                </button>
                
                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 glass rounded-2xl border border-white/5 shadow-2xl p-2 animate-fadeIn z-50">
                    <div className="px-3.5 py-3 border-b border-white/5 mb-1.5">
                      <p className="text-xs font-semibold text-slate-200 truncate">{user?.username}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'admin' ? (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:bg-purple-600/10 transition-colors w-full"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Console
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors w-full"
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors w-full mt-1 border-t border-white/5 pt-2 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 font-medium text-sm text-slate-300 hover:text-white transition-colors duration-200"
              >
                <LogIn className="w-4 h-4 text-purple-400" />
                Login / Sign Up
              </Link>
            )}

            {/* Submit CTA */}
            <Link 
              to="/submit"
              className="glow-btn bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Submit Tool
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-b border-white/5 animate-fadeIn">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
            >
              Explore Tools
            </Link>
            <Link
              to="/submit"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
            >
              Submit a Tool
            </Link>

            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-b border-white/5 mb-2 flex items-center gap-3">
                  <Avatar user={user} className="w-10 h-10" />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
                    <p className="text-[10px] text-slate-500">{user?.email}</p>
                  </div>
                </div>
                {user?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-purple-300 hover:bg-white/5 transition-colors duration-200"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    <LayoutDashboard className="w-5 h-5" /> My Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 transition-colors duration-200 text-left"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200"
              >
                <LogIn className="w-5 h-5 text-purple-400" /> Login / Sign Up
              </Link>
            )}

            <div className="pt-2 px-3">
              <Link
                to="/submit"
                onClick={() => setIsOpen(false)}
                className="w-full text-center bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Submit Tool
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
