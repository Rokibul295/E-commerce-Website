import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container container">
        <h2 className="orders-title">Your Orders</h2>
        <div className="empty-orders">
          <p>You have no orders yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container container">
      <h2 className="orders-title">Your Orders</h2>
      <div className="orders-list">
        {orders.map((order) => {
          // Filter out items with null products (products that were deleted)
          const validItems = order.items.filter(item => item.product && item.product._id);
          
          return (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              {validItems.length === 0 ? (
                <div className="order-items">
                  <p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>
                    Some products in this order are no longer available.
                  </p>
                </div>
              ) : (
                <>
                  {validItems.length < order.items.length && (
                    <div style={{ padding: '10px', marginBottom: '10px', background: '#fee', color: '#c33', borderRadius: '6px', fontSize: '14px' }}>
                      Some products were removed from this order.
                    </div>
                  )}
                  <div className="order-items">
                    {validItems.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={item.product?.img || '/images/placeholder.svg'}
                          alt={item.product?.name || 'Product'}
                          onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                        />
                        <div className="order-item-info">
                          <h4>{item.product?.name || 'Unknown Product'}</h4>
                          <p>Quantity: {item.quantity} × {item.price}৳</p>
                        </div>
                        <div className="order-item-total">
                          {item.quantity * item.price}৳
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div className="order-footer">
                <h3>Total: {order.totalAmount}৳</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;

