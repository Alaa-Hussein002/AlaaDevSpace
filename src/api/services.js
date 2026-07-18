import api from './axios';

// ==========================================
// 🔐 Auth
// ==========================================
export const authAPI = {
  // ===== Basic Auth =====
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  me: () => api.get('/auth/me'),
  checkAuth: () => api.get('/auth/check'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),

  // ===== Password Reset =====
  forgotPassword: (data) => api.post('/auth/password/forgot', data),
  verifyOtp: (data) => api.post('/auth/password/verify-otp', data),
  resetPassword: (data) => api.post('/auth/password/reset', data),
  resendOtp: (data) => api.post('/auth/password/resend-otp', data),
};

// ==========================================
// 🌐 Public
// ==========================================
export const publicAPI = {
  // Profile & Portfolio
  getProfile: () => api.get('/public/profile'),           // ← Changed from /guest
  getProjects: (params) => api.get('/public/projects', { params }),
  getProject: (slug) => api.get(`/public/projects/${slug}`),
  getSkills: () => api.get('/public/skills'),
  getExperiences: () => api.get('/public/experiences'),
  getEducations: () => api.get('/public/educations'),
  getCertificates: () => api.get('/public/certificates'),
  getTestimonials: () => api.get('/public/testimonials'),
  sendContact: (data) => api.post('/public/contact', data),

  // Articles
  getArticles: (params) => api.get('/public/articles', { params }),
  getArticle: (slug) => api.get(`/public/articles/${slug}`), // ✅ slug وليس id
  getArticleCategories: () => api.get('/public/articles/categories'),
  getFeaturedArticles: () => api.get('/public/articles/featured'),
  getRelatedArticles: (slug) => api.get(`/public/articles/${slug}/related`),

  // Store (will be disabled for MVP)
  getCategories: () => api.get('/public/store/categories'),
  getProducts: (params) => api.get('/public/store/products', { params }),
  getProduct: (slug) => api.get(`/public/store/products/${slug}`),
  getPaymentMethods: () => api.get('/public/store/payment-methods'),

  // Games (will be disabled for MVP)
  getGames: () => api.get('/public/games'),
  getGame: (slug) => api.get(`/public/games/${slug}`),
  playGame: (slug) => api.post(`/public/games/${slug}/play`),
  submitScore: (slug, data) => api.post(`/public/games/${slug}/score`, data),
  getLeaderboard: (slug) => api.get(`/public/games/${slug}/leaderboard`),

  // Projects & Articles (for SEO)
  getProjectBySlug: (slug) => api.get(`/api/projects/${slug}`),
  getArticleBySlug: (slug) => api.get(`/api/articles/${slug}`),

  // Health
  health: () => api.get('/health'),
};

// ==========================================
// 🛒 Customer
// ==========================================
export const customerAPI = {
  getCart: () => api.get('/customer/cart'),
  addToCart: (data) => api.post('/customer/cart/add', data),
  updateCart: (data) => api.put('/customer/cart/update', data),
  removeFromCart: (productId) => api.delete(`/customer/cart/remove/${productId}`),
  applyCoupon: (data) => api.post('/customer/cart/coupon', data),
  removeCoupon: () => api.delete('/customer/cart/coupon'),
  clearCart: () => api.delete('/customer/cart/clear'),

  getOrders: () => api.get('/customer/orders'),
  createOrder: (data) => api.post('/customer/orders', data),
  getOrder: (orderNumber) => api.get(`/customer/orders/${orderNumber}`),
  cancelOrder: (orderNumber) => api.post(`/customer/orders/${orderNumber}/cancel`),

  getPayments: () => api.get('/customer/payments'),
  submitPayment: (data) => api.post('/customer/payments', data),
};

// ==========================================
// 🛡️ Admin
// ==========================================
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Profile
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),

  // Projects
  getProjects: (params) => api.get('/admin/projects', { params }),
  getProject: (id) => api.get(`/admin/projects/${id}`),
  createProject: (data) => api.post('/admin/projects', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),

  // Skills
  getSkills: () => api.get('/admin/skills'),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`),

  // Experiences
  getExperiences: () => api.get('/admin/experiences'),
  createExperience: (data) => api.post('/admin/experiences', data),
  updateExperience: (id, data) => api.put(`/admin/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/admin/experiences/${id}`),

  // Education
  getEducations: () => api.get('/admin/educations'),
  createEducation: (data) => api.post('/admin/educations', data),
  updateEducation: (id, data) => api.put(`/admin/educations/${id}`, data),
  deleteEducation: (id) => api.delete(`/admin/educations/${id}`),

  // Certificates
  getCertificates: () => api.get('/admin/certificates'),
  createCertificate: (data) => api.post('/admin/certificates', data),
  updateCertificate: (id, data) => api.put(`/admin/certificates/${id}`, data),
  deleteCertificate: (id) => api.delete(`/admin/certificates/${id}`),

  // Testimonials
  getTestimonials: () => api.get('/admin/testimonials'),
  createTestimonial: (data) => api.post('/admin/testimonials', data),
  updateTestimonial: (id, data) => api.put(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id) => api.delete(`/admin/testimonials/${id}`),

  // Product Categories
  getProductCategories: () => api.get('/admin/product-categories'),
  createProductCategory: (data) => api.post('/admin/product-categories', data),
  updateProductCategory: (id, data) => api.put(`/admin/product-categories/${id}`, data),
  deleteProductCategory: (id) => api.delete(`/admin/product-categories/${id}`),

  // Products
  getProducts: (params) => api.get('/admin/products', { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (orderNumber) => api.get(`/admin/orders/${orderNumber}`),
  updateOrderStatus: (orderNumber, data) => api.put(`/admin/orders/${orderNumber}/status`, data),

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPayment: (paymentNumber) => api.get(`/admin/payments/${paymentNumber}`),
  confirmPayment: (paymentNumber, data) => api.post(`/admin/payments/${paymentNumber}/confirm`, data),
  rejectPayment: (paymentNumber, data) => api.post(`/admin/payments/${paymentNumber}/reject`, data),

  // Payment Methods
  getPaymentMethods: () => api.get('/admin/payment-methods'),
  createPaymentMethod: (data) => api.post('/admin/payment-methods', data),
  updatePaymentMethod: (id, data) => api.put(`/admin/payment-methods/${id}`, data),
  deletePaymentMethod: (id) => api.delete(`/admin/payment-methods/${id}`),

  // Invoices
  getInvoices: (params) => api.get('/admin/invoices', { params }),
  getInvoice: (invoiceNumber) => api.get(`/admin/invoices/${invoiceNumber}`),

  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),

  // Customers
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  sendOffer: (id, data) => api.post(`/admin/customers/${id}/send-offer`, data),

  // Games
  getGames: () => api.get('/admin/games'),
  getGame: (id) => api.get(`/admin/games/${id}`),
  createGame: (data) => api.post('/admin/games', data),
  updateGame: (id, data) => api.put(`/admin/games/${id}`, data),
  deleteGame: (id) => api.delete(`/admin/games/${id}`),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Roles
  getRoles: () => api.get('/admin/roles'),
  createRole: (data) => api.post('/admin/roles', data),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  getPermissions: () => api.get('/admin/permissions'),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  getSetting: (key) => api.get(`/admin/settings/${key}`),
  updateSetting: (data) => api.put('/admin/settings', data),

  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),

  // Messages
  getMessages: (params) => api.get('/admin/messages', { params }),
  getMessage: (id) => api.get(`/admin/messages/${id}`),
  replyMessage: (id, data) => api.post(`/admin/messages/${id}/reply`, data),
  deleteMessage: (id) => api.delete(`/admin/messages/${id}`),
  markAsSpam: (id) => api.post(`/admin/messages/${id}/spam`),

  // Notifications
  getNotifications: () => api.get('/admin/notifications'),
  markAsRead: (id) => api.post(`/admin/notifications/${id}/read`),
  markAllAsRead: () => api.post('/admin/notifications/read-all'),

  // Media
  getMedia: (params) => api.get('/admin/media', { params }),
  uploadMedia: (formData) => api.post('/admin/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),

  // Articles
  getArticles: (params) => api.get('/admin/articles', { params }),
  getArticle: (id) => api.get(`/admin/articles/${id}`),
  createArticle: (data) => api.post('/admin/articles', data),
  updateArticle: (id, data) => api.put(`/admin/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/admin/articles/${id}`),
};