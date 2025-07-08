import React, { useContext, useEffect, useState } from "react";
import { usecontext } from "../App";
import axios from "axios";
import { FiShoppingCart, FiTrash2, FiX, FiPlus, FiMinus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./CartComponent.css";

const api = axios.create({
  baseURL: "https://e-commerce-web-application-k9ho.onrender.com",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const CartComponent = () => {
  const { user } = useContext(usecontext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/api/cart/${user.id}`);

      if (!res.data || !Array.isArray(res.data)) {
        throw new Error("Invalid cart data format");
      }

      // Filter out any items with null product
      const validItems = res.data.filter(item => item?.product);
      setCartItems(validItems);
      calculateTotal(validItems);
      setError(null);
    } catch (err) {
      console.error("Cart fetch error:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });

      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.error ||
          "Failed to load cart. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((total, item) => {
      return total + (item?.product?.price || 0) * (item?.quantity || 0);
    }, 0);
    setTotal(parseFloat(sum.toFixed(2)));
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/api/cart/${cartItemId}`, {
        quantity: newQuantity,
        userid: user.id,
      });

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      calculateTotal(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error("Update quantity error:", err);
      setError("Failed to update quantity. Please try again.");
      fetchCart();
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      await api.delete(`/api/cart/${cartItemId}`, {
        data: { userid: user.id },
      });

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartItemId)
      );
      calculateTotal(cartItems.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error("Remove item error:", err);
      setError("Failed to remove item. Please try again.");
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      await api.delete(`/api/cart/clear/${user.id}`);
      setCartItems([]);
      setTotal(0);
    } catch (err) {
      console.error("Clear cart error:", err);
      setError("Failed to clear cart. Please try again.");
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      navigate("/checkout",{state:{cartItems}});
    }, 800); // Match this duration with the CSS animation duration
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
        <button className="login-btn" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div className={`cart-container ${isCheckingOut ? "cart-slide-out" : ""}`}>
      {loading ? (
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      ) : (
        <>
          <div className="cart-header">
            <h2>
              <FiShoppingCart /> Your Shopping Cart
            </h2>
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

          {!loading && cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <FiShoppingCart size={48} />
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.quantity}`} className="cart-item">
                    <div className="item-image">
                      <img
                        src={
                          item?.product?.image_base64
                            ? `data:image/jpeg;base64,${item.product.image_base64}`
                            : "/placeholder-product.jpg"
                        }
                        alt={item?.product?.name || "Product"}
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3>{item?.product?.name || "Unnamed Product"}</h3>
                      {item?.flavour && (
                        <p className="item-flavor">Flavor: {item.flavour}</p>
                      )}
                      <p className="item-price">£ {item?.product?.price || 0}</p>
                      <div className="item-quantity">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                         -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                         +
                        </button>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 italic transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300">
                        * Taxes will be calculated at checkout
                      </p>
                    </div>
                    <div className="item-total">
                      <p>£ {((item?.product?.price || 0) * item.quantity).toFixed(2)}</p>
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
                  <span>£ {total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>£ {total.toFixed(2)}</span>
                </div>
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isCheckingOut}
                >
                  {isCheckingOut ? (
                    <span className="checkout-loader"></span>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CartComponent;