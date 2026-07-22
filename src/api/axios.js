// src/api/axios.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Instance رئيسي
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// ==========================================
// 🔐 CSRF Handler (تحسين)
// ==========================================
let csrfPromise = null;

const getCsrfCookie = async () => {
  // إذا كان هناك طلب جاري، انتظره
  if (csrfPromise) return csrfPromise;

  csrfPromise = axios.get(`${API_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      'Accept': 'application/json',
    }
  }).then(() => {
    console.log('✅ CSRF Cookie obtained');
    // امنح Laravel وقت لحفظ الـ cookie
    return new Promise(resolve => setTimeout(resolve, 100));
  }).catch(error => {
    console.warn('⚠️ CSRF failed:', error.message);
    csrfPromise = null; // إعادة المحاولة في الطلب التالي
    throw error;
  });

  return csrfPromise;
};

// ==========================================
// 📤 Request Interceptor
// ==========================================
api.interceptors.request.use(
  async (config) => {
    // جلب CSRF للـ state-changing methods
    if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
      try {
        await getCsrfCookie();
      } catch (error) {
        console.error('CSRF preparation failed');
      }
    }

    // Bearer Token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ==========================================
// 📥 Response Interceptor
// ==========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const originalRequest = error.config;

    switch (status) {
      case 419: // CSRF Token Mismatch
        console.warn('🔐 CSRF mismatch - retrying...');
        
        // إعادة تعيين CSRF ومحاولة مرة واحدة فقط
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          csrfPromise = null; // إجبار جلب جديد
          
          try {
            await getCsrfCookie();
            return api(originalRequest); // إعادة المحاولة
          } catch (retryError) {
            console.error('CSRF retry failed');
          }
        }
        break;

      case 401:
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        break;

      case 403:
        console.error('🚫 Access Denied:', message);
        break;

      case 404:
        console.error('🔍 Not Found:', message);
        break;

      case 422:
        console.error('⚠️ Validation Error:', error.response?.data?.errors);
        break;

      case 429:
        console.error('⏱️ Rate Limit:', message);
        break;

      case 500:
        console.error('💥 Server Error:', message);
        break;

      default:
        console.error('❌ Error:', message);
    }

    return Promise.reject(error);
  }
);

export default api;