import axios from 'axios'

const API_URL = 'http://localhost:5001/api' // Changed from 5000 to avoid macOS Control Center conflict

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getAllSellers: () => api.get('/users/sellers'),
  getPendingSellers: () => api.get('/users/sellers/pending'),
  getUserStats: () => api.get('/users/stats'),
  approveSeller: (id) => api.put(`/users/sellers/${id}/approve`),
  deactivateSeller: (id, reason) => api.put(`/users/sellers/${id}/deactivate`, { reason })
}

// Transaction API
export const transactionAPI = {
  getAllTransactions: (params) => api.get('/transactions', { params }),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  getTransactionStats: () => api.get('/transactions/stats'),
  getActivityLogs: (params) => api.get('/transactions/logs', { params })
}

// Report API
export const reportAPI = {
  generateSalesReport: (params) => api.get('/reports/sales', { params }),
  generateUserActivityReport: (params) => api.get('/reports/user-activity', { params }),
  generateComprehensiveReport: (params) => api.get('/reports/comprehensive', { params })
}

// Export API
export const exportAPI = {
  exportUsers: (format) => api.get('/export/users', { params: { format } }),
  exportTransactions: (format, params) => api.get('/export/transactions', { params: { format, ...params } }),
  exportActivityLogs: (format, params) => api.get('/export/logs', { params: { format, ...params } }),
  backupAllData: () => api.get('/export/backup')
}

// Review API
export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/reviews/product/${productId}`),
  canReviewProduct: (productId) => api.get(`/reviews/can-review/${productId}`),
  addReview: (productId, rating, comment) => api.post('/reviews', { productId, rating, comment }),
  updateReview: (reviewId, rating, comment) => api.put(`/reviews/${reviewId}`, { rating, comment }),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`)
}

// Notification API
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
}

// Order API
export const orderAPI = {
  getOrders: () => api.get('/orders'),
  createOrder: (shippingAddress, paymentMethod) => api.post('/orders', { shippingAddress, paymentMethod }),
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  requestReturn: (orderId, reason) => api.put(`/orders/${orderId}/return`, { reason }),
  getReceipt: (orderId) => api.get(`/orders/${orderId}/receipt`)
}

// Recommendation API
export const recommendationAPI = {
  getRecommendations: () => api.get('/recommendations'),
  trackView: (productId) => api.post('/recommendations/view', { productId }),
  dismissRecommendation: (productId) => api.post('/recommendations/dismiss', { productId })
}

export default api

