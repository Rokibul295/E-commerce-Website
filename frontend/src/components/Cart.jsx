import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { ensureProductImage } from '../utils/imageHelper';
import Recommendations from './Recommendations';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [orderConfirmation, setOrderConfirmation] = useState(null);
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

  // Validate payment details
  const validatePayment = () => {
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardholderName) {
        alert('Please fill in all payment details');
        return false;
      }
      
      // Validate card number format
      const cardNumber = paymentDetails.cardNumber.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
        alert('Invalid card number. Please enter a valid card number.');
        return false;
      }
      
      // Validate expiry date format (MM/YY)
      if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) {
        alert('Invalid expiry date format. Please use MM/YY format.');
        return false;
      }
      
      // Validate CVV
      if (paymentDetails.cvv.length < 3 || paymentDetails.cvv.length > 4 || !/^\d+$/.test(paymentDetails.cvv)) {
        alert('Invalid CVV. Please enter a valid 3 or 4 digit CVV.');
        return false;
      }
    }
    return true;
  };

  const handleOrderClick = () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Filter out items with null products before checkout
    const validItems = cart.items.filter(item => item.product && item.product._id);
    if (validItems.length === 0) {
      alert('Your cart contains invalid items. Please refresh and try again.');
      fetchCart(); // Refresh cart
      return;
    }

    // Start order process - show customer info form first
    setShowOrderForm(true);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Filter out items with null products before checkout
    const validItems = cart.items.filter(item => item.product && item.product._id);
    if (validItems.length === 0) {
      alert('Your cart contains invalid items. Please refresh and try again.');
      fetchCart(); // Refresh cart
      return;
    }

    // Step 1: Validate customer info
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please fill in your name and phone number');
      return;
    }

    // Step 2: Show address form if not already shown
    if (!showAddressForm) {
      setShowAddressForm(true);
      return;
    }

    // Step 3: Show payment form if not already shown
    if (!showPaymentForm) {
      setShowPaymentForm(true);
      return;
    }

    // Step 4: Validate payment details
    if (!validatePayment()) {
      return;
    }

    // Step 4: Proceed with order placement
    try {
      setCheckoutLoading(true);
      console.log('Placing order with cart:', cart);
      
      const addressData = shippingAddress.street || shippingAddress.city 
        ? shippingAddress 
        : {};
      
      // Prepare payment data
      const paymentData = paymentMethod === 'credit_card' || paymentMethod === 'debit_card'
        ? {
            cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
            expiryDate: paymentDetails.expiryDate,
            cvv: paymentDetails.cvv,
            cardholderName: paymentDetails.cardholderName
          }
        : {};
      
      const response = await api.post('/orders', {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        shippingAddress: addressData,
        paymentMethod: paymentMethod,
        paymentDetails: paymentData
      });
      
      console.log('Order placed successfully:', response.data);
      
      // Show success message
      alert(`✅ Order placed successfully!\n\nOrder ID: #${response.data._id.slice(-6)}\nTotal: ${response.data.totalAmount}৳`);
      
      // Reset forms
      setShowOrderForm(false);
      setShowAddressForm(false);
      setShowPaymentForm(false);
      setCustomerInfo({
        name: '',
        phone: ''
      });
      setShippingAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      });
      setPaymentDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });
      setPaymentMethod('credit_card');
      
      // Refresh cart (should be empty now)
      await fetchCart();
      
      // Navigate to orders page after a short delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to place order';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid order data. Please check your payment details.';
        } else if (error.response.status === 401) {
          errorMessage = 'Please login to place an order';
          navigate('/login');
          return;
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      }
      
      alert(errorMessage);
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
              src={item.product ? ensureProductImage(item.product) : '/images/placeholder.svg'}
              alt={item.product?.name || 'Product'}
              onError={(e) => { e.currentTarget.src = ensureProductImage(item.product || {}); }}
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

      {/* Customer Information Form */}
      {showOrderForm && !showAddressForm && !showPaymentForm && (
        <div className="order-form-container">
          <h3>📝 Order Information</h3>
          <p className="order-form-note">Please provide your contact information to proceed with the order.</p>
          <div className="order-form">
            <input
              type="text"
              placeholder="Your Full Name *"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number * (e.g., +8801234567890)"
              value={customerInfo.phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length <= 15) {
                  setCustomerInfo({...customerInfo, phone: value});
                }
              }}
              required
            />
            <div className="order-form-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowOrderForm(false);
                  setCustomerInfo({
                    name: '',
                    phone: ''
                  });
                }}
                disabled={checkoutLoading}
              >
                Cancel
              </button>
              <button
                className="continue-btn"
                onClick={handleCheckout}
                disabled={checkoutLoading || !customerInfo.name || !customerInfo.phone}
              >
                Continue to Address →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address Form */}
      {showAddressForm && !showPaymentForm && (
        <div className="address-form-container">
          <h3>Shipping Address (Optional)</h3>
          <p className="address-form-note">You can skip this and add it later, or fill it now.</p>
          <div className="address-form">
            <input
              type="text"
              placeholder="Street Address"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
            />
            <div className="address-form-row">
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
              />
              <input
                type="text"
                placeholder="State"
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
              />
            </div>
            <div className="address-form-row">
              <input
                type="text"
                placeholder="Zip Code"
                value={shippingAddress.zipCode}
                onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
              />
              <input
                type="text"
                placeholder="Country"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
              />
            </div>
            <div className="address-form-buttons">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowAddressForm(false);
                  setShippingAddress({
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: ''
                  });
                }}
                disabled={checkoutLoading}
              >
                Back
              </button>
              <button
                className="continue-btn"
                onClick={() => setShowPaymentForm(true)}
                disabled={checkoutLoading}
              >
                Continue to Payment →
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentForm && (
        <div className="payment-form-container">
          <h3>🔒 Secure Payment</h3>
          <p className="payment-form-note">Your payment information is encrypted and secure.</p>
          
          <div className="payment-method-selection">
            <label>Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPaymentDetails({
                  cardNumber: '',
                  expiryDate: '',
                  cvv: '',
                  cardholderName: ''
                });
              }}
              className="payment-method-select"
            >
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
            <div className="payment-form">
              <input
                type="text"
                placeholder="Cardholder Name"
                value={paymentDetails.cardholderName}
                onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                maxLength={50}
              />
              <input
                type="text"
                placeholder="Card Number (e.g., 1234 5678 9012 3456)"
                value={paymentDetails.cardNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\s/g, '');
                  if (value.length <= 19 && /^\d*$/.test(value)) {
                    // Format with spaces every 4 digits
                    value = value.match(/.{1,4}/g)?.join(' ') || value;
                    setPaymentDetails({...paymentDetails, cardNumber: value});
                  }
                }}
                maxLength={19}
              />
              <div className="payment-form-row">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentDetails.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2);
                      }
                      setPaymentDetails({...paymentDetails, expiryDate: value});
                    }
                  }}
                  maxLength={5}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentDetails.cvv}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setPaymentDetails({...paymentDetails, cvv: value});
                    }
                  }}
                  maxLength={4}
                />
              </div>
              <div className="payment-security-note">
                🔐 Your card details are encrypted and never stored on our servers.
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="payment-info-box">
              <p>You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}

          {paymentMethod === 'cash_on_delivery' && (
            <div className="payment-info-box">
              <p>💰 You will pay in cash when your order is delivered.</p>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="payment-info-box">
              <p>🏦 You will receive bank transfer instructions after order confirmation.</p>
            </div>
          )}

          <div className="payment-form-buttons">
            <button
              className="btn-cancel"
              onClick={() => {
                setShowPaymentForm(false);
                setPaymentDetails({
                  cardNumber: '',
                  expiryDate: '',
                  cvv: '',
                  cardholderName: ''
                });
              }}
              disabled={checkoutLoading}
            >
              Back
            </button>
            <button
              className="confirm-order-btn"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                <>
                  ✅ Confirm Order
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {!showOrderForm && !showAddressForm && !showPaymentForm && (
        <div className="cart-summary">
          <div>
            <h3>Total: {totalAmount}৳</h3>
            <p className="cart-summary-note">{validItems.length} item(s) in your cart</p>
          </div>
          <button
            className="place-order-btn"
            onClick={handleOrderClick}
            disabled={checkoutLoading || validItems.length === 0}
          >
            {checkoutLoading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              <>
                🛒 Place Order
              </>
            )}
          </button>
        </div>
      )}

      <Recommendations />
    </div>
  );
};

export default Cart;

