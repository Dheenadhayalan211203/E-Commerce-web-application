import React, { useState, useEffect, useContext } from 'react';
import { usecontext } from '../App';
import axios from 'axios';
import { FiCreditCard, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const PaymentPage = () => {
  const { user } = useContext(usecontext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await api.get(`/api/cart/${user.id}`);
        
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error('Invalid cart data format');
        }

        // Filter out items with null product
        const validItems = res.data.filter(item => item?.product);
        setCartItems(validItems);
        calculateTotals(validItems);
        setError(null);
      } catch (err) {
        console.error('Checkout fetch error:', err);
        setError(err.response?.data?.error || 
                'Failed to load checkout information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  const calculateTotals = (items) => {
    const subtotalAmount = items.reduce((total, item) => {
      return total + ((item?.product?.price || 0) * (item?.quantity || 0));
    }, 0);
    
    const taxAmount = subtotalAmount * 0.20; // 20% tax
    const totalAmount = subtotalAmount + taxAmount;
    
    setSubtotal(parseFloat(subtotalAmount.toFixed(2)));
    setTax(parseFloat(taxAmount.toFixed(2)));
    setTotal(parseFloat(totalAmount.toFixed(2)));
  };

  const handlePayment = async () => {
    if (!user?.id || cartItems.length === 0) return;

    setPaymentProcessing(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item?.product?.id,
          quantity: item?.quantity || 0,
          price: item?.product?.price || 0,
          tax: (item?.product?.price || 0) * 0.20,
          flavour: item?.flavour || null
        })),
        subtotal: subtotal,
        tax: tax,
        totalAmount: total,
        paymentMethod
      };

      const orderResponse = await api.post('/api/orders', orderData);
      await api.delete(`/api/cart/clear/${user.id}`);
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.response?.data?.error || 
              'Payment failed. Please try again or use a different payment method.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="payment-container">
        <div className="payment-login-required">
          <h2>Checkout</h2>
          <p>Please log in to proceed with your payment.</p>
          <button 
            className="payment-login-btn"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <div className="loading-spinner"></div>
          <p>Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <FiCheckCircle className="success-icon" />
          <h2>Payment Successful!</h2>
          <p>Thank you for your purchase. Your order has been placed successfully.</p>
          <div className="order-summary">
            <h3>Order Summary</h3>
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <span>{item?.product?.name || 'Unnamed Product'} × {item?.quantity || 0}</span>
                <span>£ {((item?.product?.price || 0) * (item?.quantity || 0)).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total-row">
              <span>Subtotal</span>
              <span>£ {subtotal.toFixed(2)}</span>
            </div>
            <div className="order-total-row">
              <span>Tax (20%)</span>
              <span>£ {tax.toFixed(2)}</span>
            </div>
            <div className="order-total">
              <span>Total Paid</span>
              <span>£ {total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <button 
        className="back-to-cart-btn"
        onClick={() => navigate('/cart')}
      >
        <FiArrowLeft /> Back to Cart
      </button>

      <h1 className="payment-title">Checkout</h1>

      {error && (
        <div className="payment-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      <div className="payment-layout">
        <div className="payment-order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-image">
                  <img
                    src={item?.product?.image_base64 
                      ? `data:image/jpeg;base64,${item.product.image_base64}`
                      : '/placeholder-product.jpg'}
                    alt={item?.product?.name || 'Product'}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item?.product?.name || 'Unnamed Product'}</h3>
                  {item?.flavour && (
                    <p className="item-flavor">Flavor: {item.flavour}</p>
                  )}
                  <p className="item-price">
                    £ {(Number(item?.product?.price || 0)).toFixed(2)} × {item?.quantity || 0}
                  </p>
                  <p className="item-tax">
                    Tax: £ {((item?.product?.price || 0) * 0.20 * (item?.quantity || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="item-total">
                  £ {((item?.product?.price || 0) * 1.20 * (item?.quantity || 0)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>£ {subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax (20%)</span>
              <span>£ {tax.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="total-row grand-total">
              <span>Total</span>
              <span>£ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="payment-details">
          <h2>Payment Information</h2>
          
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="method-options">
              <label className={`method-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                />
                <FiCreditCard />
                <span>Credit Card</span>
              </label>
              
              <label className={`method-option ${paymentMethod === 'paypal' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                />
                <img src="/paypal-icon-logo-svgrepo-com.svg" alt="PayPal" className="paypal-logo" />
                <span>PayPal</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'credit_card' && (
            <div className="credit-card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  pattern="[0-9\s]{13,19}"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    pattern="\d{2}/\d{2}"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    pattern="\d{3,4}"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  required
                />
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="paypal-info">
              <p>You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}

          <button
            className="proceed-payment-btn"
            onClick={handlePayment}
            disabled={cartItems.length === 0 || paymentProcessing}
          >
            {paymentProcessing ? 'Processing...' : `Pay £ ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;