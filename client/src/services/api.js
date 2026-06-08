const API_URL = '/api';

import axios from 'axios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aitools_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for standard error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong, please try again.';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export default api;
