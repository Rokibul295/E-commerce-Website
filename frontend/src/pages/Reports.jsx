import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI, reportAPI, exportAPI } from '../services/api'

const Reports = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState({ text: '', type: '' })
  const [sellers, setSellers] = useState([])
  const [salesReport, setSalesReport] = useState(null)
  const [activityReport, setActivityReport] = useState(null)
  const [comprehensiveReport, setComprehensiveReport] = useState(null)

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      const response = await userAPI.getAllSellers()
      setSellers(response.data.data)
    } catch (error) {
      console.error('Failed to load sellers', error)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 5000)
  }

  const generateSalesReport = async () => {
    const startDate = document.getElementById('sales-start-date')?.value
    const endDate = document.getElementById('sales-end-date')?.value
    const sellerId = document.getElementById('sales-seller')?.value

    if (!startDate || !endDate) {
      showMessage('Please select start and end dates', 'error')
      return
    }

    try {
      const params = { startDate, endDate, ...(sellerId && { sellerId }) }
      const response = await reportAPI.generateSalesReport(params)
      setSalesReport(response.data.data)
      showMessage('Sales report generated successfully!', 'success')
    } catch (error) {
      showMessage('Failed to generate sales report', 'error')
    }
  }

  const generateActivityReport = async () => {
    const startDate = document.getElementById('activity-start-date')?.value
    const endDate = document.getElementById('activity-end-date')?.value
    const action = document.getElementById('activity-action')?.value

    if (!startDate || !endDate) {
      showMessage('Please select start and end dates', 'error')
      return
    }

    try {
      const params = { startDate, endDate, ...(action && { action }) }
      const response = await reportAPI.generateUserActivityReport(params)
      setActivityReport(response.data.data)
      showMessage('Activity report generated successfully!', 'success')
    } catch (error) {
      showMessage('Failed to generate activity report', 'error')
    }
  }

  const generateComprehensiveReport = async () => {
    const startDate = document.getElementById('comp-start-date')?.value
    const endDate = document.getElementById('comp-end-date')?.value

    try {
      const params = { ...(startDate && endDate && { startDate, endDate }) }
      const response = await reportAPI.generateComprehensiveReport(params)
      setComprehensiveReport(response.data.data)
      showMessage('Comprehensive report generated successfully!', 'success')
    } catch (error) {
      showMessage('Failed to generate comprehensive report', 'error')
    }
  }

  const exportData = async (type, format = 'json') => {
    try {
      if (format === 'csv') {
        const url = `http://localhost:5000/api/export/${type === 'users' ? 'users' : type === 'transactions' ? 'transactions' : 'logs'}?format=csv`
        window.open(url, '_blank')
        showMessage(`${type} exported as CSV successfully!`, 'success')
      } else {
        let response
        if (type === 'users') {
          response = await exportAPI.exportUsers('json')
        } else if (type === 'transactions') {
          response = await exportAPI.exportTransactions('json')
        } else {
          response = await exportAPI.exportActivityLogs('json')
        }

        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `${type}_export.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)

        showMessage(`${type} exported successfully!`, 'success')
      }
    } catch (error) {
      showMessage(`Failed to export ${type}`, 'error')
    }
  }

  const backupAllData = async () => {
    try {
      const response = await exportAPI.backupAllData()
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showMessage('System backup created successfully!', 'success')
    } catch (error) {
      showMessage('Failed to create backup', 'error')
    }
  }

  return (
    <div>
      <header>
        <div className="container">
          <h1>Reports & Data Export</h1>
          <p>Generate comprehensive reports and export data</p>
        </div>
      </header>

      <div className="container">
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          marginBottom: '30px', 
          justifyContent: 'center' 
        }}>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{
              marginBottom: '0'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {message.text && (
          <div className={message.type === 'error' ? 'error' : 'success'}>
            {message.text}
          </div>
        )}

        {/* Sales Report Section */}
        <div className="card">
          <h2>Sales Report</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="filter-group">
              <label>Start Date</label>
              <input type="date" id="sales-start-date" />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input type="date" id="sales-end-date" />
            </div>
            <div className="filter-group">
              <label>Seller (Optional)</label>
              <select id="sales-seller">
                <option value="">All Sellers</option>
                {sellers.map(seller => (
                  <option key={seller._id} value={seller._id}>{seller.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={generateSalesReport}>
            Generate Sales Report
          </button>

          {salesReport && (
            <div className="report-result active" style={{ marginTop: '20px' }}>
              <h3>Sales Report Summary</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Sales</h3>
                  <div className="value">{salesReport.summary.totalSales}</div>
                </div>
                <div className="stat-card">
                  <h3>Completed Sales</h3>
                  <div className="value">{salesReport.summary.completedSales}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <div className="value">${salesReport.summary.totalRevenue}</div>
                </div>
                <div className="stat-card">
                  <h3>Net Revenue</h3>
                  <div className="value">${salesReport.summary.netRevenue}</div>
                </div>
                <div className="stat-card">
                  <h3>Average Order Value</h3>
                  <div className="value">${salesReport.summary.averageOrderValue}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Refunds</h3>
                  <div className="value">{salesReport.summary.totalRefunds}</div>
                </div>
              </div>

              {salesReport.salesBySeller && salesReport.salesBySeller.length > 0 && (
                <>
                  <h3 style={{ marginTop: '20px' }}>Sales by Seller</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Seller Name</th>
                        <th>Total Sales</th>
                        <th>Transactions</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.salesBySeller.map((seller, idx) => (
                        <tr key={idx}>
                          <td>{seller.sellerName}</td>
                          <td>{seller.totalSales}</td>
                          <td>{seller.transactions}</td>
                          <td>${seller.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {salesReport.salesByProduct && salesReport.salesByProduct.length > 0 && (
                <>
                  <h3 style={{ marginTop: '20px' }}>Sales by Product</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Quantity Sold</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.salesByProduct.map((product, idx) => (
                        <tr key={idx}>
                          <td>{product.productName}</td>
                          <td>{product.quantitySold}</td>
                          <td>${product.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                Report generated at: {new Date(salesReport.reportGeneratedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* User Activity Report Section */}
        <div className="card">
          <h2>User Activity Report</h2>
          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <div className="filter-group">
              <label>Start Date</label>
              <input type="date" id="activity-start-date" />
            </div>
            <div className="filter-group">
              <label>End Date</label>
              <input type="date" id="activity-end-date" />
            </div>
            <div className="filter-group">
              <label>Action Type (Optional)</label>
              <select id="activity-action">
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="approved_seller">Approved Seller</option>
                <option value="deactivated_seller">Deactivated Seller</option>
                <option value="created_product">Created Product</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={generateActivityReport}>
            Generate Activity Report
          </button>

          {activityReport && (
            <div className="report-result active" style={{ marginTop: '20px' }}>
              <h3>Activity Report Summary</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Activities</h3>
                  <div className="value">{activityReport.summary.totalActivities}</div>
                </div>
                <div className="stat-card">
                  <h3>Unique Users</h3>
                  <div className="value">{activityReport.summary.uniqueUsers}</div>
                </div>
              </div>

              {activityReport.activitiesByAction && activityReport.activitiesByAction.length > 0 && (
                <>
                  <h3 style={{ marginTop: '20px' }}>Activities by Action Type</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Action Type</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityReport.activitiesByAction.map((action, idx) => (
                        <tr key={idx}>
                          <td>{action.action.replace(/_/g, ' ').toUpperCase()}</td>
                          <td>{action.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {activityReport.mostActiveUsers && activityReport.mostActiveUsers.length > 0 && (
                <>
                  <h3 style={{ marginTop: '20px' }}>Most Active Users</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Total Activities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityReport.mostActiveUsers.map((user, idx) => (
                        <tr key={idx}>
                          <td>{user.userName}</td>
                          <td>{user.totalActivities}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                Report generated at: {new Date(activityReport.reportGeneratedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Comprehensive Report Section */}
        <div className="card">
          <h2>Comprehensive System Report</h2>
          <div className="form-grid" style={{ marginBottom: '20px' }}>
            <div className="filter-group">
              <label>Start Date (Optional)</label>
              <input type="date" id="comp-start-date" />
            </div>
            <div className="filter-group">
              <label>End Date (Optional)</label>
              <input type="date" id="comp-end-date" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={generateComprehensiveReport}>
            Generate Comprehensive Report
          </button>

          {comprehensiveReport && (
            <div className="report-result active" style={{ marginTop: '20px' }}>
              <h3>System Overview</h3>

              <h4 style={{ marginTop: '20px', color: '#667eea' }}>User Metrics</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Sellers</h3>
                  <div className="value">{comprehensiveReport.userMetrics.totalSellers}</div>
                </div>
                <div className="stat-card">
                  <h3>Active Sellers</h3>
                  <div className="value">{comprehensiveReport.userMetrics.activeSellers}</div>
                </div>
                <div className="stat-card">
                  <h3>Pending Sellers</h3>
                  <div className="value">{comprehensiveReport.userMetrics.pendingSellers}</div>
                </div>
                <div className="stat-card">
                  <h3>Deactivated Sellers</h3>
                  <div className="value">{comprehensiveReport.userMetrics.deactivatedSellers}</div>
                </div>
              </div>

              <h4 style={{ marginTop: '20px', color: '#667eea' }}>Transaction Metrics</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Transactions</h3>
                  <div className="value">{comprehensiveReport.transactionMetrics.totalTransactions}</div>
                </div>
                <div className="stat-card">
                  <h3>Completed</h3>
                  <div className="value">{comprehensiveReport.transactionMetrics.completedTransactions}</div>
                </div>
                <div className="stat-card">
                  <h3>Pending</h3>
                  <div className="value">{comprehensiveReport.transactionMetrics.pendingTransactions}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <div className="value">${comprehensiveReport.transactionMetrics.totalRevenue}</div>
                </div>
              </div>

              <h4 style={{ marginTop: '20px', color: '#667eea' }}>Activity Metrics</h4>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Activities</h3>
                  <div className="value">{comprehensiveReport.activityMetrics.totalActivities}</div>
                </div>
                <div className="stat-card">
                  <h3>Unique Users</h3>
                  <div className="value">{comprehensiveReport.activityMetrics.uniqueUsers}</div>
                </div>
              </div>

              <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                Report generated at: {new Date(comprehensiveReport.reportGeneratedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Data Export Section */}
        <div className="card">
          <h2>Data Export & Backup</h2>
          <div className="export-section">
            <div className="export-card" onClick={() => exportData('users', 'json')}>
              <h3>Export Users</h3>
              <p>Download all user data</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); exportData('users', 'json') }}>
                  Export JSON
                </button>
                <button className="btn btn-warning" onClick={(e) => { e.stopPropagation(); exportData('users', 'csv') }}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="export-card" onClick={() => exportData('transactions', 'json')}>
              <h3>Export Transactions</h3>
              <p>Download transaction history</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); exportData('transactions', 'json') }}>
                  Export JSON
                </button>
                <button className="btn btn-warning" onClick={(e) => { e.stopPropagation(); exportData('transactions', 'csv') }}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="export-card" onClick={() => exportData('logs', 'json')}>
              <h3>Export Activity Logs</h3>
              <p>Download activity log data</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); exportData('logs', 'json') }}>
                  Export JSON
                </button>
                <button className="btn btn-warning" onClick={(e) => { e.stopPropagation(); exportData('logs', 'csv') }}>
                  Export CSV
                </button>
              </div>
            </div>

            <div className="export-card" onClick={backupAllData}>
              <h3>Full System Backup</h3>
              <p>Backup entire database</p>
              <button className="btn btn-success" onClick={(e) => { e.stopPropagation(); backupAllData() }}>
                Create Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports

