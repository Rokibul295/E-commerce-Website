import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { ensureProductImage } from '../utils/imageHelper';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/all');
      let filteredOrders = res.data;
      
      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage({ text: 'Failed to load orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setMessage({ text: 'Order status updated successfully!', type: 'success' });
      fetchOrders();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update order status', 
        type: 'error' 
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="order-management-header">
        <h2>Order Management</h2>
        <div className="status-filter">
          <label>Filter by Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  {order.user && (
                    <p className="customer-info">
                      Customer: {order.user.name} ({order.user.email})
                    </p>
                  )}
                </div>
                <div className="order-status-section">
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                  <div className="status-update">
                    <label>Update Status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingId === order._id && (
                      <span className="updating">Updating...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-items">
                <h4>Items ({order.items.length}):</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    {item.product ? (
                      <>
                        <img
                          src={item.product ? ensureProductImage(item.product) : '/images/placeholder.svg'}
                          alt={item.product?.name || 'Product'}
                          className="item-image"
                          onError={(e) => { e.currentTarget.src = ensureProductImage(item.product || {}); }}
                        />
                        <div className="item-info">
                          <strong>{item.product.name}</strong>
                          <p>Quantity: {item.quantity} × {item.price}৳</p>
                        </div>
                        <div className="item-total">
                          {(item.quantity * item.price).toFixed(2)}৳
                        </div>
                      </>
                    ) : (
                      <div className="item-info">
                        <strong>Product Deleted</strong>
                        <p>Quantity: {item.quantity} × {item.price}৳</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: {order.totalAmount}৳</strong>
                </div>
                {order.shippingAddress && order.shippingAddress.street && (
                  <div className="shipping-address">
                    <strong>Shipping Address:</strong>
                    <p>{order.shippingAddress.street}</p>
                    {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
                    {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
                    {order.shippingAddress.zipCode && <p>{order.shippingAddress.zipCode}</p>}
                    {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
