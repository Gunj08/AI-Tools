import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

// Public Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ToolDetail from './pages/ToolDetail';
import SubmitTool from './pages/SubmitTool';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/Dashboard';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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


function App() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <>
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



        {/* Redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
