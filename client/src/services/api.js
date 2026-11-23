import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Interceptor to attach Authorization Bearer token to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eproducts_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure FormData payloads let the browser or axios set multipart/form-data with correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for centralized response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!error.config?.url?.includes('/users/me')) {
        console.warn('Session expired or unauthorized request.');
      }
    }
    return Promise.reject(error);
  }
);

// Helper to resolve static upload URLs across dev and production
export const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) {
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    return baseUrl ? `${baseUrl}${url}` : url;
  }
  return url;
};

// API Service Functions
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getSellerProducts: () => api.get('/products/seller/my-products'),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/products', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/products/${id}`, data);
  },
  delete: (id) => api.delete(`/products/${id}`)
};

export const cartService = {
  get: () => api.get('/cart'),
  add: (productId, quantity = 1, selectedVariant = {}) => api.post('/cart', { productId, quantity, ...selectedVariant }),
  updateQuantity: (productId, quantity) => api.put(`/cart/${productId}`, { quantity }),
  remove: (productId) => api.delete(`/cart/${productId}`),
  clear: () => api.delete('/cart')
};

export const orderService = {
  checkout: (data) => api.post('/orders/checkout', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getMyPurchases: () => api.get('/orders/my-purchases'),
  getById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`)
};

export const downloadService = {
  download: (productId) => api.get(`/downloads/${productId}`)
};

export const userService = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data)
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUserStatus: (id, status, role) => api.put(`/admin/users/${id}/status`, { status, role }),
  getProducts: () => api.get('/admin/products'),
  updateProductStatus: (id, status) => api.put(`/admin/products/${id}/status`, { status }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, orderStatus) => api.put(`/admin/orders/${id}/status`, { orderStatus }),
  getAnalytics: () => api.get('/admin/analytics')
};

export default api;
