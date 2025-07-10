import React from "react";
import { FiCheckCircle, FiMapPin, FiPackage, FiClock, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./OrderStatus.css";

const OrderStatus = ({ orderDetails }) => {
  const navigate = useNavigate();
  
  // Destructure with defaults that match backend response structure
  const {
    orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    items = [],
    subtotal = 0,
    tax = 0,
    totalAmount = 0,
    paymentMethod = "cod",
    paymentStatus = false,
    status = "pending",
    shippingAddress = {},
    createdAt = new Date().toISOString()
  } = orderDetails;

  // Format date for display
  const orderDate = new Date(createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="order-status-container">
      <div className="order-status-card">
        <div className="status-header">
          <FiCheckCircle className="success-icon" />
          <h2>Order Successful!</h2>
          <p className="order-id">Order ID: {orderId}</p>
          <p className="status-message">
            {paymentMethod === "cod" ? (
              <>
                <FiClock className="status-icon" /> 
                Your order is {status}. Please have £{totalAmount.toFixed(2)} ready for delivery.
              </>
            ) : paymentStatus ? (
              "Thank you for your purchase. Your payment was successful."
            ) : (
              "Your order is being processed. Please complete your payment."
            )}
          </p>
        </div>

        <div className="order-meta">
          <div className="meta-item">
            <FiCalendar className="meta-icon" />
            <span>Order Date: {orderDate}</span>
          </div>
          <div className="meta-item">
            <div className={`status-badge ${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>
        </div>

        <div className="order-details-section">
          <div className="shipping-details">
            <h3>
              <FiMapPin className="section-icon" /> Shipping Details
            </h3>
            <div className="details-grid">
              <div>
                <strong>Name:</strong> {shippingAddress.firstName} {shippingAddress.lastName}
              </div>
              <div>
                <strong>Address:</strong> {shippingAddress.streetAddress}, {shippingAddress.city}, {shippingAddress.county}, {shippingAddress.postcode}
              </div>
              <div>
                <strong>Phone:</strong> {shippingAddress.phone}
              </div>
              {shippingAddress.deliveryInstructions && (
                <div>
                  <strong>Delivery Instructions:</strong> {shippingAddress.deliveryInstructions}
                </div>
              )}
            </div>
          </div>

          <div className="payment-details">
            <h3>
              <FiPackage className="section-icon" /> Order Summary
            </h3>
            <div className="order-items-list">
              {items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">
                      {item?.productName ?? "Unnamed Product"} × {item?.quantity ?? 0}
                      {item?.flavour && <span className="item-flavor"> ({item.flavour})</span>}
                    </span>
                    <span className="item-price">
                      £ {((item?.price || 0) * (item?.quantity || 0)).toFixed(2)}
                    </span>
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
              <div className="total-row grand-total">
                <span>Total {paymentMethod === "cod" ? "Payable" : "Paid"}</span>
                <span>£ {totalAmount.toFixed(2)}</span>
              </div>
              <div className="payment-method">
                <strong>Payment Method:</strong> {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
                {!paymentStatus && paymentMethod !== "cod" && (
                  <span className="payment-pending"> (Pending)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="status-actions">
          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
          <button
            className="view-orders-btn"
            onClick={() => navigate("/orders")}
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;