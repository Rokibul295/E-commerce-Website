import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

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

export default api

