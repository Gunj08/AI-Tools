import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ToolDetail from './pages/ToolDetail';
import SubmitTool from './pages/SubmitTool';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageTools from './pages/admin/ManageTools';
import ManageCategories from './pages/admin/ManageCategories';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

// Loading Spinner Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center flex-col">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-purple-500/20"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-pink-500 animate-spin"></div>
    </div>
    <p className="mt-4 text-slate-400 font-display text-sm animate-pulse">Initializing Directory...</p>
  </div>
);

// Protected User Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
};

// Public Layout (with Header and Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] bg-gradient-radial text-slate-100">
      <Navbar />
      <main className="flex-grow pt-20 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Admin Layout (with Sidebar)
const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#080b11] text-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden md:pl-64">
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 z-10">
          <h2 className="font-display font-semibold text-lg text-slate-200">Admin Control Panel</h2>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Live Console</span>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/tool/:slug" element={<ToolDetail />} />
        <Route path="/submit" element={<SubmitTool />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="tools" element={<ManageTools />} />
        <Route path="categories" element={<ManageCategories />} />
      </Route>

      {/* Redirects */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
