import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI, transactionAPI } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [stats, setStats] = useState(null)
  const [pendingSellers, setPendingSellers] = useState([])
  const [sellers, setSellers] = useState([])
  const [transactionStats, setTransactionStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionPagination, setTransactionPagination] = useState({})
  const [logs, setLogs] = useState([])
  const [logsPagination, setLogsPagination] = useState({})
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [currentLogsPage, setCurrentLogsPage] = useState(1)
  const [sellerStatusFilter, setSellerStatusFilter] = useState('')
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('')
  const [logActionFilter, setLogActionFilter] = useState('')

  useEffect(() => {
    if (activeTab === 'overview') {
      loadStats()
      loadPendingSellers()
    }
    if (activeTab === 'sellers') {
      loadSellers()
    }
    if (activeTab === 'transactions') {
      loadTransactionStats()
      loadTransactions()
    }
    if (activeTab === 'logs') {
      loadActivityLogs()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions()
    }
  }, [currentTransactionPage, transactionStatusFilter])

  useEffect(() => {
    if (activeTab === 'logs') {
      loadActivityLogs()
    }
  }, [currentLogsPage, logActionFilter])

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const loadStats = async () => {
    try {
      const response = await userAPI.getUserStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to load statistics', error)
    }
  }

  const loadPendingSellers = async () => {
    try {
      const response = await userAPI.getPendingSellers()
      setPendingSellers(response.data.data)
    } catch (error) {
      console.error('Failed to load pending sellers', error)
    }
  }

  const loadSellers = async () => {
    try {
      const response = await userAPI.getAllSellers()
      let filtered = response.data.data
      if (sellerStatusFilter) {
        filtered = filtered.filter(s => s.status === sellerStatusFilter)
      }
      setSellers(filtered)
    } catch (error) {
      console.error('Failed to load sellers', error)
    }
  }

  const loadTransactionStats = async () => {
    try {
      const response = await transactionAPI.getTransactionStats()
      setTransactionStats(response.data.data)
    } catch (error) {
      console.error('Failed to load transaction statistics', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const params = {
        page: currentTransactionPage,
        limit: 10,
        ...(transactionStatusFilter && { status: transactionStatusFilter })
      }
      const response = await transactionAPI.getAllTransactions(params)
      setTransactions(response.data.data)
      setTransactionPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to load transactions', error)
    }
  }

  const loadActivityLogs = async () => {
    try {
      const params = {
        page: currentLogsPage,
        limit: 20,
        ...(logActionFilter && { action: logActionFilter })
      }
      const response = await transactionAPI.getActivityLogs(params)
      setLogs(response.data.data)
      setLogsPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to load activity logs', error)
    }
  }

  const approveSeller = async (id) => {
    if (!window.confirm('Are you sure you want to approve this seller?')) return
    
    try {
      await userAPI.approveSeller(id)
      showMessage('Seller approved successfully!', 'success')
      loadStats()
      loadPendingSellers()
      loadSellers()
    } catch (error) {
      showMessage('Failed to approve seller', 'error')
    }
  }

  const deactivateSeller = async (id) => {
    const reason = window.prompt('Enter reason for deactivation:')
    if (!reason) return
    
    try {
      await userAPI.deactivateSeller(id, reason)
      showMessage('Seller deactivated successfully!', 'success')
      loadStats()
      loadPendingSellers()
      loadSellers()
    } catch (error) {
      showMessage('Failed to deactivate seller', 'error')
    }
  }

  return (
    <div>
      <header>
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>User & Transaction Management System</p>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sellers' ? 'active' : ''}`}
            onClick={() => setActiveTab('sellers')}
          >
            Manage Sellers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Activity Logs
          </button>
          <button 
            className="tab-btn"
            onClick={() => navigate('/reports')}
          >
            Reports & Export
          </button>
        </div>

        {message.text && (
          <div className={message.type === 'error' ? 'error' : 'success'}>
            {message.text}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content active">
            <div className="stats-grid">
              {stats ? (
                <>
                  <div className="stat-card">
                    <h3>Total Sellers</h3>
                    <div className="value">{stats.totalSellers}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Active Sellers</h3>
                    <div className="value">{stats.activeSellers}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Pending Approvals</h3>
                    <div className="value">{stats.pendingSellers}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Deactivated</h3>
                    <div className="value">{stats.deactivatedSellers}</div>
                  </div>
                </>
              ) : (
                <div className="loading">Loading statistics...</div>
              )}
            </div>

            <div className="card">
              <h2>Pending Approvals</h2>
              {pendingSellers.length === 0 ? (
                <div className="empty-state">No pending sellers</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSellers.map(seller => (
                      <tr key={seller._id}>
                        <td>{seller.name}</td>
                        <td>{seller.email}</td>
                        <td>{seller.phone}</td>
                        <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${seller.status}`}>
                            {seller.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-approve"
                            onClick={() => approveSeller(seller._id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-deactivate"
                            onClick={() => deactivateSeller(seller._id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div className="tab-content active">
            <div className="card">
              <h2>All Sellers</h2>
              <div className="filters">
                <div className="filter-group">
                  <label>Status</label>
                  <select 
                    value={sellerStatusFilter}
                    onChange={(e) => {
                      setSellerStatusFilter(e.target.value)
                      setTimeout(loadSellers, 0)
                    }}
                  >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>
              {sellers.length === 0 ? (
                <div className="empty-state">No sellers found</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Registration Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.map(seller => (
                      <tr key={seller._id}>
                        <td>{seller.name}</td>
                        <td>{seller.email}</td>
                        <td>{seller.phone}</td>
                        <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${seller.status}`}>
                            {seller.status}
                          </span>
                        </td>
                        <td>
                          {seller.status === 'pending' && (
                            <button 
                              className="btn btn-approve"
                              onClick={() => approveSeller(seller._id)}
                            >
                              Approve
                            </button>
                          )}
                          {seller.status === 'active' && (
                            <button 
                              className="btn btn-deactivate"
                              onClick={() => deactivateSeller(seller._id)}
                            >
                              Deactivate
                            </button>
                          )}
                          {seller.status === 'deactivated' && (
                            <button 
                              className="btn btn-approve"
                              onClick={() => approveSeller(seller._id)}
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="tab-content active">
            <div className="stats-grid">
              {transactionStats ? (
                <>
                  <div className="stat-card">
                    <h3>Total Transactions</h3>
                    <div className="value">{transactionStats.totalTransactions}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Completed</h3>
                    <div className="value">{transactionStats.completedTransactions}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <div className="value">${transactionStats.totalRevenue}</div>
                  </div>
                  <div className="stat-card">
                    <h3>Net Revenue</h3>
                    <div className="value">${transactionStats.netRevenue}</div>
                  </div>
                </>
              ) : (
                <div className="loading">Loading transaction statistics...</div>
              )}
            </div>

            <div className="card">
              <h2>Transaction History</h2>
              <div className="filters">
                <div className="filter-group">
                  <label>Status</label>
                  <select 
                    value={transactionStatusFilter}
                    onChange={(e) => {
                      setTransactionStatusFilter(e.target.value)
                      setCurrentTransactionPage(1)
                    }}
                  >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              {transactions.length === 0 ? (
                <div className="empty-state">No transactions found</div>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Seller</th>
                        <th>Buyer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(txn => (
                        <tr key={txn._id}>
                          <td>{txn._id.slice(-8)}</td>
                          <td>{txn.sellerName}</td>
                          <td>{txn.buyerName}</td>
                          <td>{txn.productName}</td>
                          <td>${txn.amount.toFixed(2)}</td>
                          <td>{txn.type}</td>
                          <td>
                            <span className={`status-badge status-${txn.status}`}>
                              {txn.status}
                            </span>
                          </td>
                          <td>{new Date(txn.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentTransactionPage(p => p - 1)}
                      disabled={transactionPagination.currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {transactionPagination.currentPage} of {transactionPagination.totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentTransactionPage(p => p + 1)}
                      disabled={transactionPagination.currentPage === transactionPagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <div className="tab-content active">
            <div className="card">
              <h2>Activity Logs</h2>
              <div className="filters">
                <div className="filter-group">
                  <label>Action Type</label>
                  <select 
                    value={logActionFilter}
                    onChange={(e) => {
                      setLogActionFilter(e.target.value)
                      setCurrentLogsPage(1)
                    }}
                  >
                    <option value="">All</option>
                    <option value="login">Login</option>
                    <option value="approved_seller">Approved Seller</option>
                    <option value="deactivated_seller">Deactivated Seller</option>
                    <option value="created_product">Created Product</option>
                  </select>
                </div>
              </div>
              {logs.length === 0 ? (
                <div className="empty-state">No activity logs found</div>
              ) : (
                <>
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log._id}>
                          <td>{log.userName}</td>
                          <td>{log.action.replace(/_/g, ' ').toUpperCase()}</td>
                          <td>{log.details || '-'}</td>
                          <td>{log.ipAddress || '-'}</td>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentLogsPage(p => p - 1)}
                      disabled={logsPagination.currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>
                      Page {logsPagination.currentPage} of {logsPagination.totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentLogsPage(p => p + 1)}
                      disabled={logsPagination.currentPage === logsPagination.totalPages}
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

