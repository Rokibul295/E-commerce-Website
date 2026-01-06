import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { reviewAPI } from '../services/api';
import { ensureProductImage } from '../utils/imageHelper';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [returningId, setReturningId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [reviewingProduct, setReviewingProduct] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReviewMap, setCanReviewMap] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  // Check which products can be reviewed when orders are loaded
  useEffect(() => {
    if (orders.length > 0) {
      checkReviewableProducts();
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      console.log('Orders fetched:', res.data);
      setOrders(res.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        alert('Please login to view your orders');
      } else {
        alert('Failed to load orders. Please try again.');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingId(orderId);
      await api.put(`/orders/${orderId}/cancel`);
      await fetchOrders(); // Refresh orders
      alert('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRequestReturn = async (orderId) => {
    if (!returnReason.trim()) {
      alert('Please provide a reason for return');
      return;
    }

    try {
      setReturningId(orderId);
      await api.put(`/orders/${orderId}/return`, { reason: returnReason });
      await fetchOrders();
      alert('Return request submitted successfully!');
      setShowReturnForm(null);
      setReturnReason('');
    } catch (error) {
      console.error('Error requesting return:', error);
      alert(error.response?.data?.message || 'Failed to request return');
    } finally {
      setReturningId(null);
    }
  };

  const handleViewReceipt = async (orderId) => {
    try {
      console.log('Fetching receipt for order:', orderId);
      const res = await api.get(`/orders/${orderId}/receipt`);
      console.log('Receipt data received:', res.data);
      if (res.data) {
        setSelectedReceipt(res.data);
      } else {
        alert('Receipt data is empty');
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to load receipt';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check if the backend server is running.';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5001';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please login to view receipt';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to view this receipt';
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  const closeReceipt = () => {
    setSelectedReceipt(null);
  };

  const checkReviewableProducts = async () => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const productIds = new Set();
    
    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product._id) {
          productIds.add(item.product._id);
        }
      });
    });

    const canReview = {};
    for (const productId of productIds) {
      try {
        const res = await reviewAPI.canReviewProduct(productId);
        canReview[productId] = res.data;
      } catch (error) {
        console.error(`Error checking review status for product ${productId}:`, error);
        canReview[productId] = { canReview: false, hasPurchased: false, alreadyReviewed: false };
      }
    }
    setCanReviewMap(canReview);
  };

  const handleReviewClick = (productId) => {
    setReviewingProduct(productId);
    setReviewData({ rating: 5, comment: '' });
  };

  const handleSubmitReview = async (productId) => {
    if (!reviewData.rating) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewAPI.addReview(productId, reviewData.rating, reviewData.comment);
      alert('Review submitted successfully!');
      setReviewingProduct(null);
      setReviewData({ rating: 5, comment: '' });
      // Refresh can review status
      const res = await reviewAPI.canReviewProduct(productId);
      setCanReviewMap(prev => ({ ...prev, [productId]: res.data }));
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
      
      {/* Receipt Modal */}
      {selectedReceipt && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeReceipt}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '10px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📄 Order Receipt</h2>
              <button 
                onClick={closeReceipt}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  padding: '8px 15px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕ Close
              </button>
            </div>
            
            <div style={{ borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
              <p><strong>Order #:</strong> {selectedReceipt.orderNumber}</p>
              <p><strong>Date:</strong> {new Date(selectedReceipt.date).toLocaleString()}</p>
              <p><strong>Status:</strong> {selectedReceipt.status}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Customer Info</h3>
              <p><strong>Name:</strong> {selectedReceipt.customer.name}</p>
              <p><strong>Phone:</strong> {selectedReceipt.customer.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedReceipt.customer.email}</p>
            </div>
            
            {selectedReceipt.shippingAddress && (selectedReceipt.shippingAddress.street || selectedReceipt.shippingAddress.city) && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Shipping Address</h3>
                <p>
                  {selectedReceipt.shippingAddress.street || ''}<br/>
                  {selectedReceipt.shippingAddress.city || ''}, {selectedReceipt.shippingAddress.state || ''} {selectedReceipt.shippingAddress.zipCode || ''}<br/>
                  {selectedReceipt.shippingAddress.country || ''}
                </p>
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '10px' }}>Items</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Product</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Qty</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Price</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{item.productName}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{item.quantity}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{item.price}৳</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{item.subtotal}৳</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ borderTop: '2px solid #333', paddingTop: '15px', marginTop: '20px' }}>
              <p><strong>Subtotal:</strong> {selectedReceipt.subtotal}৳</p>
              <p><strong>Tax:</strong> {selectedReceipt.tax || 0}৳</p>
              <p><strong>Shipping:</strong> {selectedReceipt.shipping || 0}৳</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4CAF50', marginTop: '10px' }}>
                <strong>Total: {selectedReceipt.total}৳</strong>
              </p>
              <p><strong>Payment:</strong> {selectedReceipt.paymentMethod} - {selectedReceipt.paymentStatus}</p>
            </div>
            
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee', textAlign: 'center', color: '#666' }}>
              <p>✅ Thank you for your purchase!</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="orders-list">
        {orders.map((order) => {
          // Filter out items with null products (products that were deleted)
          const validItems = order.items.filter(item => item.product && item.product._id);
          
          return (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.toString().slice(-6).toUpperCase()}</h3>
                  <p className="order-date">
                    📅 {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  {order.customerName && (
                    <p className="customer-name" style={{ marginTop: '5px', color: '#666', fontSize: '14px' }}>
                      👤 Customer: {order.customerName}
                      {order.customerPhone && ` | 📞 ${order.customerPhone}`}
                    </p>
                  )}
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
                    {validItems.map((item, index) => {
                      const productId = item.product?._id;
                      const canReviewInfo = productId ? canReviewMap[productId] : null;
                      const isReviewing = reviewingProduct === productId;
                      const showReviewButton = order.status === 'delivered' && canReviewInfo?.canReview;
                      const alreadyReviewed = canReviewInfo?.alreadyReviewed;

                      return (
                        <div key={index} className="order-item">
                          <img
                            src={item.product ? ensureProductImage(item.product) : '/images/placeholder.svg'}
                            alt={item.product?.name || 'Product'}
                            onError={(e) => { e.currentTarget.src = ensureProductImage(item.product || {}); }}
                          />
                          <div className="order-item-info">
                            <h4>{item.product?.name || 'Unknown Product'}</h4>
                            <p>Quantity: {item.quantity} × {item.price}৳</p>
                            {order.status === 'delivered' && (
                              <div style={{ marginTop: '10px' }}>
                                {showReviewButton && !isReviewing && (
                                  <button
                                    onClick={() => handleReviewClick(productId)}
                                    style={{
                                      padding: '6px 12px',
                                      background: '#4CAF50',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ⭐ Rate & Review
                                  </button>
                                )}
                                {alreadyReviewed && (
                                  <span style={{
                                    padding: '6px 12px',
                                    background: '#e8f5e9',
                                    color: '#2e7d32',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}>
                                    ✓ Reviewed
                                  </span>
                                )}
                                {isReviewing && (
                                  <div style={{
                                    marginTop: '10px',
                                    padding: '15px',
                                    background: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6'
                                  }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                      Your Rating:
                                    </label>
                                    <div style={{ marginBottom: '12px' }}>
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            color: star <= reviewData.rating ? '#ffc107' : '#ddd',
                                            padding: '0 4px'
                                          }}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                                      Your Review:
                                    </label>
                                    <textarea
                                      value={reviewData.comment}
                                      onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                      placeholder="Share your experience with this product..."
                                      rows="3"
                                      maxLength="500"
                                      style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        marginBottom: '10px',
                                        fontFamily: 'inherit',
                                        fontSize: '14px'
                                      }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                      <button
                                        onClick={() => handleSubmitReview(productId)}
                                        disabled={submittingReview}
                                        style={{
                                          padding: '8px 16px',
                                          background: '#4CAF50',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          fontSize: '13px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setReviewingProduct(null);
                                          setReviewData({ rating: 5, comment: '' });
                                        }}
                                        disabled={submittingReview}
                                        style={{
                                          padding: '8px 16px',
                                          background: '#6c757d',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          fontSize: '13px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="order-item-total">
                            {item.quantity * item.price}৳
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <div className="order-footer">
                <div style={{ marginBottom: '10px' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>Total: {order.totalAmount}৳</h3>
                  {order.paymentMethod && (
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                      💳 Payment: {order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                      {order.paymentStatus && ` | Status: ${order.paymentStatus}`}
                    </p>
                  )}
                </div>
                <div className="order-actions">
                  <button
                    className="receipt-btn"
                    onClick={() => handleViewReceipt(order._id)}
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(90deg, #007bff, #0056b3)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginRight: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    📄 View Receipt
                  </button>
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingId === order._id}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  {order.status === 'delivered' && !order.returnRequested && (
                    <button
                      className="return-btn"
                      onClick={() => setShowReturnForm(order._id)}
                      disabled={returningId === order._id}
                      style={{
                        padding: '8px 16px',
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Request Return
                    </button>
                  )}
                  {order.returnRequested && (
                    <span style={{ 
                      padding: '8px 16px',
                      background: '#fff3cd',
                      color: '#856404',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      Return Requested
                    </span>
                  )}
                </div>
                {showReturnForm === order._id && (
                  <div className="return-form" style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                      Reason for Return:
                    </label>
                    <textarea
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="Please provide a reason for return..."
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        minHeight: '80px',
                        marginBottom: '10px',
                        fontFamily: 'inherit'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleRequestReturn(order._id)}
                        disabled={returningId === order._id || !returnReason.trim()}
                        style={{
                          padding: '8px 16px',
                          background: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {returningId === order._id ? 'Submitting...' : 'Submit Return Request'}
                      </button>
                      <button
                        onClick={() => {
                          setShowReturnForm(null);
                          setReturnReason('');
                        }}
                        style={{
                          padding: '8px 16px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;

