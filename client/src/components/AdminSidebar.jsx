import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Wrench, 
  Tags, 
  ArrowLeft, 
  LogOut, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import Avatar from './Avatar';

const AdminSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    {
      to: '/admin',
      end: true,
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      to: '/admin/tools',
      label: 'Manage Tools',
      icon: Wrench
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: Tags
    }
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between p-6 bg-[#080b11] border-r border-white/5">
      <div>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">
            Admin Console
          </span>
        </Link>

        {/* Links Group */}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600/15 border border-purple-500/20 text-purple-400 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Separator */}
        <div className="my-6 border-t border-white/5"></div>

        {/* Back to Site */}
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Public Directory
        </Link>
      </div>

      {/* Admin User Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <Avatar user={user} className="w-9 h-9" />
          <div className="truncate">
            <h5 className="text-xs font-semibold text-slate-300 truncate">{user?.username || 'Admin'}</h5>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@aitools.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-500/10 border border-red-500/10 hover:border-red-500/20 hover:bg-red-500/15 text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl glass border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar (Left-positioned, fixed) */}
      <div className="hidden md:block fixed top-0 left-0 w-64 h-screen z-20">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Slider */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          ></div>
          
          {/* Menu Slider container */}
          <div className="relative w-64 max-w-xs h-full bg-[#080b11] animate-slideIn">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
