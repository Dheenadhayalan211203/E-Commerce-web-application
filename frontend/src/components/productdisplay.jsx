import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usecontext } from "../App";
import axios from "axios";
import "./ProductDisplay.css";

const ProductDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(usecontext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [flavors, setFlavors] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`https://e-commerce-web-application-k9ho.onrender.com/api/products/${id}`);
        const data = res.data;
        setProduct(data);

        let parsedFlavors = [];
        if (data.flavors_data) {
          const parsed = JSON.parse(data.flavors_data);
          parsedFlavors = parsed.flavours || [];
          setFlavors(parsedFlavors);

          if (parsedFlavors.length > 0) {
            setSelectedFlavor(parsedFlavors[0]);
            setMainImage(`data:image/jpeg;base64,${parsedFlavors[0].imagestring}`);
          }
        } else if (data.image_base64) {
          setMainImage(`data:image/jpeg;base64,${data.image_base64}`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const increaseQuantity = () => {
    const maxStock = selectedFlavor?.stock ?? product.stock;
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const maxStock = selectedFlavor?.stock ?? product.stock;
    if (!isNaN(value) && value > 0 && value <= maxStock) {
      setQuantity(value);
    }
  };

  const calculateTotalPrice = () => {
    return (product.price * quantity).toFixed(2);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post("https://e-commerce-web-application-k9ho.onrender.com/api/cart", {
        productid: product.id,
        userid: user.id,
        email: user.email,
        quantity: quantity,
        flavour: selectedFlavor ? selectedFlavor.flr : null,
      });

      if (response.status === 201) {
        setShowSuccessPopup(true);
        setCartError(null);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        setCartError("Failed to add item to cart");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setCartError(err.response?.data?.error || "Failed to add item to cart");
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  return (
    <div className="product-page">
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="popup-content">
            <span className="popup-icon">✓</span>
            <p>Product added to cart successfully!</p>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>

      <div className="product-container">
        <div className="product-images">
          <div className="main-image-container">
            <img
              src={mainImage}
              alt={selectedFlavor ? selectedFlavor.flr : product.name}
              className="main-image"
              key={mainImage}
            />
          </div>
        </div>

        <div className="product-details">
          <h1 className="product-name">{product.name}</h1>
          {product.brand && (
            <div className="product-brand">Brand: {product.brand}</div>
          )}

          {flavors.length > 0 && (
            <div className="flavor-selection">
              <h3>Choose Your Flavor</h3>
              <div className="flavor-options">
                {flavors.map((flavor, idx) => (
                  <div 
                    key={idx}
                    className={`flavor-card ${selectedFlavor?.flr === flavor.flr ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedFlavor(flavor);
                      if (flavor?.imagestring) {
                        setMainImage(`data:image/jpeg;base64,${flavor.imagestring}`);
                      }
                    }}
                  >
                    {flavor.imagestring ? (
                      <>
                        <img 
                          src={`data:image/jpeg;base64,${flavor.imagestring}`} 
                          alt={flavor.flr}
                          className="flavor-image"
                        />
                        <div className="flavor-overlay">{flavor.flr}</div>
                        <div className="flavor-checkmark"></div>
                      </>
                    ) : (
                      <div className="flavor-text-only">{flavor.flr}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flavor stock */}
          {selectedFlavor && (
            <div className="flavor-stock">
              {selectedFlavor.stock === null || selectedFlavor.stock === undefined ? (
                <span className="to-be-arrived"> </span>
              ) : (
                <span className="stock-count">{selectedFlavor.stock} in stock</span>
              )}
            </div>
          )}

          {/* Fallback stock display if no flavors */}
          {(!flavors.length || !selectedFlavor) && (
            <div className={`product-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
              {product.stock > 0 ? (
                <>
                  <span className="stock-icon">✓</span> {product.stock} in stock
                </>
              ) : (
                <>
                  <span className="stock-icon">✗</span> Out of stock
                </>
              )}
            </div>
          )}

          {product.nicotine_level && (
            <div className="nicotine-level">
              <span className="nicotine-icon">⚠</span> Nicotine Level: {product.nicotine_level}
            </div>
          )}

          {product.description && (
            <div className="product-description">
              <h3>Description:</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div className="price-section">
            <div className="product-price">£ {(Number(product.price)).toFixed(2)}</div>
            <div className="quantity-selector">
              <button
                className="quantity-btn decrement"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                className="quantity-input"
                type="number"
                min="1"
                max={selectedFlavor?.stock ?? product.stock}
                value={quantity}
                onChange={handleQuantityChange}
              />
              <button
                className="quantity-btn increment"
                onClick={increaseQuantity}
                disabled={quantity >= (selectedFlavor?.stock ?? product.stock)}
              >
                +
              </button>
            </div>
            <div className="total-price">Total: <span>£ {calculateTotalPrice()}</span></div>
          </div>

          <div className="product-actions">
            <button
              className="wishlist-button"
              onClick={() => console.log("Added to wishlist")}
            >
              <i className="fa fa-heart"></i> Add to Wishlist
            </button>
            <button
              className="add-to-cart-button"
              disabled={(selectedFlavor?.stock ?? product.stock) <= 0}
              onClick={handleAddToCart}
            >
              <i className="fa fa-shopping-cart"></i> Add to Cart
            </button>
          </div>

          {cartError && <div className="cart-error-message">{cartError}</div>}

          <div className="product-meta">
            <div className="product-category">
              <span className="meta-icon">🗂</span> Category: {product.category || "Uncategorized"}
            </div>
            <div className="product-status">
              <span className="meta-icon">⦿</span> Status: {product.is_active ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
