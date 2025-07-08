import React, { useState, useEffect, useContext } from "react";
import { usecontext } from "../App";
import axios from "axios";
import { FiCheckCircle, FiArrowLeft, FiMapPin } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import OrderStatus from "./OrderStatus";
import "./PaymentPage.css";

const api = axios.create({
  baseURL: "https://e-commerce-web-application-k9ho.onrender.com",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const PaymentPage = () => {
  const { user } = useContext(usecontext);
  const navigate = useNavigate();
  const location = useLocation();

  const passedCartItems = location.state?.cartItems ?? [];
  
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  // Address form state
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    county: "",
    postcode: "",
    phone: "",
    deliveryInstructions: ""
  });

  useEffect(() => {
    if (!user?.id) {
      navigate("/login");
      return;
    }

    if (passedCartItems.length === 0) {
      navigate("/cart");
      return;
    }

    setCartItems(passedCartItems);
    calculateTotals(passedCartItems);

    // Try to pre-fill address if available in user profile
    if (user?.shippingAddress) {
      setAddress({
        firstName: user.shippingAddress.firstName || "",
        lastName: user.shippingAddress.lastName || "",
        streetAddress: user.shippingAddress.streetAddress || "",
        city: user.shippingAddress.city || "",
        county: user.shippingAddress.county || "",
        postcode: user.shippingAddress.postcode || "",
        phone: user.phone || "",
        deliveryInstructions: user.shippingAddress.deliveryInstructions || ""
      });
    } else if (user?.firstName) {
      setAddress(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName || "",
        phone: user.phone || ""
      }));
    }
  }, [user, passedCartItems, navigate]);

  const calculateTotals = (items) => {
    const sub = items.reduce(
      (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 0),
      0
    );
    const taxAmt = sub * 0.2;
    setSubtotal(+sub.toFixed(2));
    setTax(+taxAmt.toFixed(2));
    setTotal(+(sub + taxAmt).toFixed(2));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAddress = () => {
    const requiredFields = [
      'firstName', 'lastName', 'streetAddress', 
      'city', 'county', 'postcode', 'phone'
    ];
    
    for (const field of requiredFields) {
      if (!address[field] || address[field].trim() === '') {
        setError(`Please fill in all required fields, including ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Basic UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(address.postcode)) {
      setError("Please enter a valid UK postcode");
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^(\+44|0)[1-9][0-9]{8,9}$/;
    if (!phoneRegex.test(address.phone)) {
      setError("Please enter a valid UK phone number");
      return false;
    }

    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initiateRazorpayPayment = async () => {
    try {
      // First create the order on your backend
      const orderResponse = await api.post('/api/razorpay/order', {
        amount: total * 100, // Convert to paise/pence
        currency: 'GBP'
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount.toString(),
        currency: 'GBP',
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: orderResponse.data.id,
        handler: async (response) => {
          // Verify payment on your backend
          await api.post('/api/razorpay/verify', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          });
          
          // If verification succeeds, complete the order
          await completeOrder(response.razorpay_payment_id);
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: user.email,
          contact: address.phone
        },
        theme: {
          color: '#6c5ce7'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay error:', err);
      setError('Payment failed. Please try again or use Cash on Delivery.');
      setPaymentProcessing(false);
    }
  };

  const completeOrder = async (paymentId = null) => {
    try {
      const orderData = {
        userId: user.id,
        items: cartItems.map((i) => ({
          productId: i?.product?.id,
          quantity: i?.quantity || 0,
          price: i?.product?.price || 0,
          tax: (i?.product?.price || 0) * 0.2,
          flavour: i?.flavour ?? null,
        })),
        subtotal,
        tax,
        totalAmount: total,
        paymentMethod,
        paymentId,
        shippingAddress: address,
        status: paymentMethod === "cod" ? "pending" : "paid"
      };

       
      setOrderId(() => Math.floor(1000000 + Math.random() * 9000000));

      
      // Only clear cart if payment was successful (not for COD)
      if (paymentMethod !== "cod") {
        await api.delete(`/api/cart/clear/${user.id}`);
      }

      setPaymentSuccess(true);
    } catch (err) {
      console.error("Order processing error:", err);
      setError(
        err.response?.data?.error ||
          "Order processing failed. Please contact support."
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!user?.id || cartItems.length === 0) return;
    
    if (!validateAddress()) {
      return;
    }

    setPaymentProcessing(true);
    setError(null);

    if (paymentMethod === "razorpay") {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError("Failed to load payment processor. Please try again or use Cash on Delivery.");
        setPaymentProcessing(false);
        return;
      }
      await initiateRazorpayPayment();
    } else {
      // Cash on Delivery - no payment processing needed
      try {
        await completeOrder();
      } catch (err) {
        setError("Failed to place COD order. Please try again.");
        setPaymentProcessing(false);
      }
    }
  };

  const loading = cartItems.length === 0 && !paymentSuccess && !error;

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
      <OrderStatus
        orderDetails={{
          cartItems,
          subtotal,
          tax,
          total,
          paymentMethod,
          address,
          orderId
        }}
      />
    );
  }

  return (
    <div className="payment-container">
      <button className="back-to-cart-btn" onClick={() => navigate("/cart")}>
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
            {cartItems.map((item) => (
              <div key={item.id} className="order-item">
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
                  <p className="item-price">
                    £ {(Number(item?.product?.price || 0)).toFixed(2)} ×{" "}
                    {item?.quantity || 0}
                  </p>
                  <p className="item-tax">
                    Tax: £{" "}
                    {(
                      (item?.product?.price || 0) *
                      0.2 *
                      (item?.quantity || 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div className="item-total">
                  £{" "}
                  {(
                    (item?.product?.price || 0) *
                    1.2 *
                    (item?.quantity || 0)
                  ).toFixed(2)}
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
          <h2>Delivery & Payment</h2>

          <div className="address-form">
            <h3>Shipping Address (UK Only)</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={address.firstName}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                name="streetAddress"
                value={address.streetAddress}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>County *</label>
                <input
                  type="text"
                  name="county"
                  value={address.county}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Postcode *</label>
                <input
                  type="text"
                  name="postcode"
                  value={address.postcode}
                  onChange={handleAddressChange}
                  required
                  placeholder="e.g. SW1A 1AA"
                />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleAddressChange}
                  required
                  placeholder="e.g. 07123456789"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Instructions (Optional)</label>
              <textarea
                name="deliveryInstructions"
                value={address.deliveryInstructions}
                onChange={handleAddressChange}
                rows="3"
              />
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="method-options">
              <label
                className={`method-option ${
                  paymentMethod === "razorpay" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                <img
                  src="/razorpay-logo.svg"
                  alt="Razorpay"
                  className="razorpay-logo"
                />
                <span>Online Payment</span>
              </label>

              <label
                className={`method-option ${
                  paymentMethod === "cod" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <FiMapPin className="cod-icon" />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          <button
            className="proceed-payment-btn"
            onClick={handlePayment}
            disabled={cartItems.length === 0 || paymentProcessing}
          >
            {paymentProcessing
              ? "Processing..."
              : paymentMethod === "cod"
              ? `Place Order (Pay £${total.toFixed(2)} on Delivery)`
              : `Pay £${total.toFixed(2)} Securely`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;