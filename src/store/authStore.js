import { create } from 'zustand';
import { authAPI } from '../api/services';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  sessionChecked: false,

  // ===== Login =====
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      const user = data.data.user;
      const token = data.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false,
        sessionChecked: true 
      });
      
      return { success: true, user };
    } catch (error) {
      set({ isLoading: false });
      
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في تسجيل الدخول',
      };
    }
  },

  // ===== Register (Disabled) =====
  register: async (name, email, password, password_confirmation) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register({ 
        name, 
        email, 
        password, 
        password_confirmation 
      });
      
      set({ isLoading: false });
      return { 
        success: false, 
        message: 'التسجيل غير متاح حالياً' 
      };
      
      // CUSTOMER_FEATURE: Disabled temporarily
      /*
      const user = data.data.user;
      const token = data.data.token;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
      */
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'التسجيل غير متاح حالياً',
        errors: error.response?.data?.errors,
      };
    }
  },

  // ===== Logout =====
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false,
      sessionChecked: false 
    });
  },

  // ===== Logout All Devices =====
  logoutAll: async () => {
    try {
      await authAPI.logoutAll();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        sessionChecked: false 
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في تسجيل الخروج',
      };
    }
  },

  // ===== Fetch User =====
  fetchUser: async () => {
    try {
      const { data } = await authAPI.me();
      const user = data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ 
        user, 
        isAuthenticated: true,
        sessionChecked: true 
      });
      return { success: true, user };
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        sessionChecked: true 
      });
      return { success: false };
    }
  },

  // ===== Check Auth =====
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      set({ 
        user: null, 
        isAuthenticated: false,
        sessionChecked: true 
      });
      return false;
    }

    try {
      const { data } = await authAPI.checkAuth();
      set({ sessionChecked: true });
      return data.data.authenticated;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        sessionChecked: true 
      });
      return false;
    }
  },

  // ===== Password Reset: Step 1 - Send OTP =====
  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.forgotPassword({ email });
      set({ isLoading: false });
      return { 
        success: true, 
        message: data.message,
        data: data.data 
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في إرسال رمز التحقق',
        errors: error.response?.data?.errors,
      };
    }
  },

  // ===== Password Reset: Step 2 - Verify OTP =====
  verifyOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.verifyOtp({ email, otp });
      set({ isLoading: false });
      return { 
        success: true, 
        message: data.message 
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'رمز التحقق غير صحيح',
      };
    }
  },

  // ===== Password Reset: Step 3 - Reset Password =====
  resetPassword: async (email, otp, password, password_confirmation) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.resetPassword({ 
        email, 
        otp, 
        password, 
        password_confirmation 
      });
      set({ isLoading: false });
      return { 
        success: true, 
        message: data.message 
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في إعادة تعيين كلمة المرور',
        errors: error.response?.data?.errors,
      };
    }
  },

  // ===== Resend OTP =====
  resendOtp: async (email) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.resendOtp({ email });
      set({ isLoading: false });
      return { 
        success: true, 
        message: data.message 
      };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error.response?.data?.message || 'خطأ في إعادة الإرسال',
      };
    }
  },
}));

export default useAuthStore;