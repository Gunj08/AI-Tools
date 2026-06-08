import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch current user if token exists
  const checkAuth = async () => {
    const token = localStorage.getItem('aitools_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('aitools_token');
      }
    } catch (error) {
      console.error('Check auth error:', error.message);
      localStorage.removeItem('aitools_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.token) {
        localStorage.setItem('aitools_token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Google Login action
  const loginWithGoogle = async (email, username, avatar) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', { email, username, avatar });
      if (response.success && response.token) {
        localStorage.setItem('aitools_token', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message || 'Google login failed' };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('aitools_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, checkAuth, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
