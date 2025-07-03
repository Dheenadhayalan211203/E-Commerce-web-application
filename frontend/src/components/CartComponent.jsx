import React, { useContext, useEffect, useState } from 'react';
import { usecontext } from '../App';
import axios from 'axios';
import { FiShoppingCart, FiTrash2, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './CartComponent.css';

// Configure axios instance with proper CORS settings
const api = axios.create({
  baseURL: 'http://localhost:5000', // Base URL without /api
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

const CartComponent = () => {
  const { user } = useContext(usecontext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/api/cart/${user.id}`);
      
      // Verify response structure matches your backend
      if (!Array.isArray(res.data)) {
        throw new Error('Invalid cart data format');
      }

      setCartItems(res.data);
      calculateTotal(res.data);
      setError(null);
    } catch (err) {
      console.error('Cart fetch error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      setError(err.response?.data?.error || 
               'Failed to load cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
    setTotal(parseFloat(sum ));
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/api/cart/${cartItemId}`, {
        quantity: newQuantity,
        userid: user.id
      });
      
      // Optimistic update
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      calculateTotal(cartItems.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      console.error('Update quantity error:', err);
      setError('Failed to update quantity. Please try again.');
      fetchCart(); // Revert to server data
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/api/cart/${cartItemId}`, {
        data: { userid: user.id }
      });
      
      // Optimistic update
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      calculateTotal(cartItems.filter(item => item.id !== cartItemId));
    } catch (err) {
      console.error('Remove item error:', err);
      setError('Failed to remove item. Please try again.');
      fetchCart(); // Revert to server data
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      await api.delete(`/api/cart/clear/${user.id}`);
      setCartItems([]);
      setTotal(0);
    } catch (err) {
      console.error('Clear cart error:', err);
      setError('Failed to clear cart. Please try again.');
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  if (!user) {
    return (
      <div className="cart-empty-state">
        <FiShoppingCart size={48} />
        <h3>Your Shopping Cart</h3>
        <p>Please log in to view your cart.</p>
        <button 
          className="login-btn"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2><FiShoppingCart /> Your Shopping Cart</h2>
        {cartItems.length > 0 && (
          <button onClick={clearCart} className="clear-cart-btn">
            <FiTrash2 /> Clear Cart
          </button>
        )}
      </div>

      {error && (
        <div className="cart-error">
          <p>{error}</p>
          <button onClick={fetchCart} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="cart-empty-state">
          <FiShoppingCart size={48} />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={`${item.id}-${item.quantity}`} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product.image_base64 
                      ? `data:image/jpeg;base64,${item.product.image_base64}`
                      : '/placeholder-product.jpg'}
                    alt={item.product.name}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  {item.flavour && (
                    <p className="item-flavor">Flavor: {item.flavour}</p>
                  )}
                  <p className="item-price">${item.product.price }</p>
                  <div className="item-quantity">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <FiPlus />
                    </button>
                  </div>
                </div>
                <div className="item-total">
                  <p>${(item.product.price * item.quantity) }</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-item-btn"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total }</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total }</span>
            </div>
            <button 
              className="checkout-btn"
              onClick={() => navigate('/checkout')}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartComponent;