 import React from "react";
import { FiCheckCircle, FiMapPin, FiPackage, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./OrderStatus.css";

const OrderStatus = ({ orderDetails }) => {
  const navigate = useNavigate();
  const {
    cartItems = [],
    subtotal = 0,
    tax = 0,
    total = 0,
    paymentMethod = "",
    address = {},
  } = orderDetails;

  return (
    <div className="order-status-container">
      <div className="order-status-card">
        <div className="status-header">
          <FiCheckCircle className="success-icon" />
          <h2>Order Successful!</h2>
          <p className="status-message">
            {paymentMethod === "cod" ? (
              <>
                <FiClock className="status-icon" /> Your order has been placed successfully. 
                Please have £{total.toFixed(2)} ready for delivery.
              </>
            ) : (
              "Thank you for your purchase. Your order has been placed successfully."
            )}
          </p>
        </div>

        <div className="order-details-section">
          <div className="shipping-details">
            <h3>
              <FiMapPin className="section-icon" /> Shipping Details
            </h3>
            <div className="details-grid">
              <div>
                <strong>Name:</strong> {address.firstName} {address.lastName}
              </div>
              <div>
                <strong>Address:</strong> {address.streetAddress}, {address.city}, {address.county}, {address.postcode}
              </div>
              <div>
                <strong>Phone:</strong> {address.phone}
              </div>
              {address.deliveryInstructions && (
                <div>
                  <strong>Delivery Instructions:</strong> {address.deliveryInstructions}
                </div>
              )}
            </div>
          </div>

          <div className="payment-details">
            <h3>
              <FiPackage className="section-icon" /> Order Summary
            </h3>
            <div className="order-items-list">
              {cartItems.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">
                      {item?.product?.name ?? "Unnamed Product"} × {item?.quantity ?? 0}
                      {item?.flavour && <span className="item-flavor"> ({item.flavour})</span>}
                    </span>
                    <span className="item-price">
                      £ {((item?.product?.price || 0) * (item?.quantity || 0)).toFixed(2)}
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
                <span>£ {total.toFixed(2)}</span>
              </div>
              <div className="payment-method">
                <strong>Payment Method:</strong> {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
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
            onClick={() => navigate("/cart")}
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;

 