import { create } from 'zustand';
import { customerAPI } from '../api/services';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await customerAPI.getCart();
      set({ cart: data.data, loading: false });
    } catch (e) {
      set({ loading: false });
    }
  },

  addToCart: async (productId) => {
    try {
      const { data } = await customerAPI.addToCart({ product_id: productId });
      set({ cart: data.data });
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'خطأ' };
    }
  },

  updateQuantity: async (productId, quantity) => {
    try {
      const { data } = await customerAPI.updateCart({ product_id: productId, quantity });
      set({ cart: data.data });
    } catch (e) {}
  },

  removeItem: async (productId) => {
    try {
      const { data } = await customerAPI.removeFromCart(productId);
      set({ cart: data.data });
    } catch (e) {}
  },

  applyCoupon: async (code) => {
    try {
      const { data } = await customerAPI.applyCoupon({ coupon_code: code });
      set({ cart: data.data });
      return { success: true };
    } catch (e) {
      return { success: false, message: e.response?.data?.message || 'كوبون غير صالح' };
    }
  },

  removeCoupon: async () => {
    try {
      const { data } = await customerAPI.removeCoupon();
      set({ cart: data.data });
    } catch (e) {}
  },

  clearCart: async () => {
    try {
      const { data } = await customerAPI.clearCart();
      set({ cart: data.data });
    } catch (e) {}
  },
}));

export default useCartStore;