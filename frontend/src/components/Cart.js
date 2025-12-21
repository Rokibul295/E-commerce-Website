import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      console.log('Cart fetched:', res.data);
      setCart(res.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        alert('Please login to view your cart');
        navigate('/login');
      } else {
        alert('Failed to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      console.log('Cart updated:', res.data);
      setCart(res.data);
    } catch (error) {
      console.error('Error updating cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart';
      alert(errorMessage);
      // Refresh cart on error
      fetchCart();
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) {
      return;
    }

    try {
      console.log(`Attempting to remove item ${itemId}`);
      setRemovingId(itemId);
      const res = await api.delete(`/cart/${itemId}`);
      console.log('Remove response:', res.status, res.data);
      setCart(res.data);
    } catch (error) {
      console.error('Error removing item:', error);
      // Distinguish error types for clearer feedback
      if (error.response) {
        // Server responded with a status code outside 2xx
        const message = error.response.data?.message || `Server error: ${error.response.status}`;
        alert(message);
        // Refresh cart on error
        fetchCart();
      } else if (error.request) {
        // Request made but no response
        alert('No response from server. Is the backend running and reachable?');
        console.error('No response:', error.request);
      } else {
        // Something else happened
        alert('Failed to remove item: ' + error.message);
      }
    } finally {
      setRemovingId(null);
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const address = prompt('Enter shipping address (optional):');
    
    try {
      setCheckoutLoading(true);
      await api.post('/orders', {
        shippingAddress: address ? { street: address } : {}
      });
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container container">
        <h2 className="cart-title">Your Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      </div>
    );
  }

  // Filter out items with null products (products that may have been deleted)
  const validItems = cart.items.filter(item => item.product && item.product._id);
  
  // If all items are invalid, show empty cart
  if (validItems.length === 0) {
    return (
      <div className="cart-container container">
        <h2 className="cart-title">Your Cart</h2>
        <div className="empty-cart">
          <p>Your cart is empty</p>
        </div>
      </div>
    );
  }

  const totalAmount = validItems.reduce((sum, item) => {
    if (item.product && item.product.price) {
      return sum + (item.product.price * item.quantity);
    }
    return sum;
  }, 0);

  return (
    <div className="cart-container container">
      <h2 className="cart-title">Your Cart</h2>
      {validItems.length < cart.items.length && (
        <div style={{ padding: '10px', marginBottom: '20px', background: '#fee', color: '#c33', borderRadius: '6px' }}>
          Some items were removed because the products are no longer available.
        </div>
      )}
      <div className="cart-items">
        {validItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img
              src={item.product?.img || '/images/placeholder.svg'}
              alt={item.product?.name || 'Product'}
              onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
            />
            <div className="cart-item-info">
              <h3>{item.product?.name || 'Unknown Product'}</h3>
              <p>{item.product?.price || 0}৳ each</p>
            </div>
            <div className="cart-item-controls">
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                +
              </button>
              <button
                className="remove-btn"
                onClick={() => removeItem(item._id)}
                disabled={removingId === item._id}
              >
                {removingId === item._id ? 'Removing...' : 'Remove'}
              </button>
            </div>
            <div className="cart-item-total">
              {((item.product?.price || 0) * item.quantity)}৳
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total: {totalAmount}৳</h3>
        <button
          className="checkout-btn"
          onClick={handleCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;

