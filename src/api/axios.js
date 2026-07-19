// src/api/axios.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // مهم جداً!
});

// Request Interceptor
api.interceptors.request.use(
  async (config) => {
    // للـ POST/PUT/DELETE requests، احصل على CSRF token أولاً
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      try {
        // استدعاء CSRF endpoint أولاً
        await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
          withCredentials: true
        });
      } catch (error) {
        console.warn('Failed to fetch CSRF cookie:', error);
      }
    }

    // إضافة Token من localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;