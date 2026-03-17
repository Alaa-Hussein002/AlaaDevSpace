import { create } from 'zustand';
import { authAPI } from '../api/services';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      const user = data.data.user;
      const token = data.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في تسجيل الدخول',
      };
    }
  },

  register: async (name, email, password, password_confirmation) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register({ name, email, password, password_confirmation });
      const user = data.data.user;
      const token = data.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في إنشاء الحساب',
        errors: error.response?.data?.errors,
      };
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await authAPI.me();
      const user = data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

export default useAuthStore;