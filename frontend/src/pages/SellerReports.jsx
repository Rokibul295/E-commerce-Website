import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import './SellerReports.css';

const SellerReports = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [stockReport, setStockReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStockReport();
    } else {
      fetchSalesReport();
    }
  }, [activeTab, dateRange]);

  const fetchStockReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products/reports/stock');
      setStockReport(res.data);
    } catch (error) {
      console.error('Error fetching stock report:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const res = await api.get('/orders/reports/sales', { params });
      setSalesReport(res.data);
    } catch (error) {
      console.error('Error fetching sales report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="seller-reports">
      <h2>Sales & Stock Reports</h2>
      
      <div className="report-tabs">
        <button 
          className={activeTab === 'stock' ? 'active' : ''}
          onClick={() => setActiveTab('stock')}
        >
          Stock Report
        </button>
        <button 
          className={activeTab === 'sales' ? 'active' : ''}
          onClick={() => setActiveTab('sales')}
        >
          Sales Report
        </button>
      </div>

      {activeTab === 'stock' && stockReport && (
        <div className="stock-report">
          <div className="report-summary">
            <div className="summary-card">
              <h3>Total Products</h3>
              <p className="big-number">{stockReport.totalProducts}</p>
            </div>
            <div className="summary-card warning">
              <h3>Low Stock</h3>
              <p className="big-number">{stockReport.lowStockCount}</p>
              <small>&lt; 10 units</small>
            </div>
            <div className="summary-card danger">
              <h3>Out of Stock</h3>
              <p className="big-number">{stockReport.outOfStockCount}</p>
            </div>
            <div className="summary-card success">
              <h3>Total Stock Value</h3>
              <p className="big-number">{stockReport.totalStockValue}৳</p>
            </div>
          </div>

          {stockReport.lowStockProducts.length > 0 && (
            <div className="alert-section">
              <h3>⚠️ Low Stock Products</h3>
              <div className="product-list">
                {stockReport.lowStockProducts.map(product => (
                  <div key={product._id} className="product-item warning">
                    <div>
                      <strong>{product.name}</strong>
                      <span className="category">{product.category}</span>
                    </div>
                    <div className="product-stats">
                      <span>Stock: <strong>{product.stock}</strong></span>
                      <span>Price: {product.price}৳</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stockReport.outOfStockProducts.length > 0 && (
            <div className="alert-section">
              <h3>❌ Out of Stock Products</h3>
              <div className="product-list">
                {stockReport.outOfStockProducts.map(product => (
                  <div key={product._id} className="product-item danger">
                    <div>
                      <strong>{product.name}</strong>
                      <span className="category">{product.category}</span>
                    </div>
                    <div className="product-stats">
                      <span>Stock: <strong>0</strong></span>
                      <span>Price: {product.price}৳</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="all-products-section">
            <h3>All Products Stock</h3>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {stockReport.allProducts.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <span className={`stock-badge ${
                          product.stock === 0 ? 'stock-out' : 
                          product.stock < 10 ? 'stock-low' : 'stock-ok'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>{product.price}৳</td>
                      <td>{product.totalValue}৳</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="sales-report">
          <div className="date-filter">
            <label>Start Date:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <label>End Date:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>

          {salesReport && (
            <>
              <div className="report-summary">
                <div className="summary-card">
                  <h3>Total Orders</h3>
                  <p className="big-number">{salesReport.summary.totalOrders}</p>
                </div>
                <div className="summary-card success">
                  <h3>Total Revenue</h3>
                  <p className="big-number">{salesReport.summary.totalRevenue}৳</p>
                </div>
                <div className="summary-card">
                  <h3>Delivered</h3>
                  <p className="big-number">{salesReport.summary.deliveredOrders}</p>
                </div>
                <div className="summary-card warning">
                  <h3>Pending</h3>
                  <p className="big-number">{salesReport.summary.pendingOrders}</p>
                </div>
              </div>

              <div className="sales-by-product">
                <h3>Sales by Product</h3>
                <div className="products-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Quantity Sold</th>
                        <th>Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.salesByProduct.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', padding: '40px' }}>
                            No sales data available
                          </td>
                        </tr>
                      ) : (
                        salesReport.salesByProduct.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productName}</td>
                            <td>{item.quantitySold}</td>
                            <td>{item.totalRevenue.toFixed(2)}৳</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerReports;
