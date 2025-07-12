import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { usecontext } from "../App";
import axios from "axios";
import "./ProductDisplay.css";

const ProductDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, products: contextProducts } = useContext(usecontext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [flavors, setFlavors] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const getProductData = async () => {
      let selectedProduct = location.state?.productData || null;

      if (!selectedProduct && contextProducts.length > 0) {
        selectedProduct = contextProducts.find(
          (p) => String(p.id) === String(id)
        );
      }

      if (!selectedProduct) {
        try {
          const res = await axios.get(
            `https://e-commerce-web-application-k9ho.onrender.com/api/products/${id}`
          );
          selectedProduct = res.data;
        } catch (err) {
          console.error("Product fetch failed:", err);
        }
      }

      if (selectedProduct) {
        setProduct(selectedProduct);

        try {
          const parsed = selectedProduct.flavors_data
            ? JSON.parse(selectedProduct.flavors_data)
            : null;
          const parsedFlavors = parsed?.flavours || [];
          setFlavors(parsedFlavors);
          
          // Set main image to product image initially
          if (selectedProduct.image_base64) {
            setMainImage(`data:image/jpeg;base64,${selectedProduct.image_base64}`);
          }
          
          if (parsedFlavors.length > 0) {
            setSelectedFlavor(parsedFlavors[0]);
            // Only update main image if flavor has an image
            if (parsedFlavors[0].imagestring) {
              setMainImage(`data:image/jpeg;base64,${parsedFlavors[0].imagestring}`);
            }
          }
        } catch {
          if (selectedProduct.image_base64) {
            setMainImage(`data:image/jpeg;base64,${selectedProduct.image_base64}`);
          }
        }
      }

      setLoading(false);
    };

    getProductData();
  }, [id, contextProducts, location.state]);

  const changeQuantity = (val) => {
    const max = selectedFlavor?.stock ?? product?.stock ?? 1;
    const newQty = Math.min(Math.max(val, 1), max);
    setQuantity(newQty);
  };

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");

    try {
      const res = await axios.post(
        "https://e-commerce-web-application-k9ho.onrender.com/api/cart",
        {
          productid: product.id,
          userid: user.id,
          email: user.email,
          quantity,
          flavour: selectedFlavor?.flr || null,
        }
      );

      if (res.status === 201) {
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
      } else {
        setCartError("Failed to add to cart");
      }
    } catch (err) {
      setCartError(err.response?.data?.error || "Error adding to cart");
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (!product) return <div className="error">Product not found</div>;

  return (
    <div className="product-page">
      {showSuccessPopup && <div className="success-popup">Product added!</div>}

      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Back
      </button>

      <div className="product-container">
        <div className="product-images">
          <div className="main-image-container">
            <img
              src={mainImage || "https://via.placeholder.com/500x500?text=No+Image"}
              alt={selectedFlavor?.flr || product.name}
              className="main-image"
            />
          </div>
        </div>

        <div className="product-details">
          <h1 className="product-name">{product.name}</h1>
          {product.brand && <div className="product-brand">Brand: {product.brand}</div>}

          {flavors.length > 0 && (
            <div className="flavor-selection">
              <h3>Choose Your Flavor</h3>
              <div className="flavor-options">
                {flavors.map((flavor, idx) => (
                  <div
                    key={idx}
                    className={`flavor-card ${
                      selectedFlavor?.flr === flavor.flr ? "active" : ""
                    }`}
                    onClick={() => {
                      setSelectedFlavor(flavor);
                      // Only update main image if flavor has an image, otherwise keep product image
                      if (flavor.imagestring) {
                        setMainImage(`data:image/jpeg;base64,${flavor.imagestring}`);
                      } else if (product.image_base64) {
                        setMainImage(`data:image/jpeg;base64,${product.image_base64}`);
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
                      </>
                    ) : (
                      <div className="flavor-text-only">{flavor.flr}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="stock-info">
            {selectedFlavor?.stock !== undefined ? (
              <span className="stock-count">
                {selectedFlavor.stock} in stock
              </span>
            ) : (
              <span className="stock-count">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            )}
          </div>

          <div className="price-section">
            <div className="product-price">
              £{Number(product.price).toFixed(2)}
            </div>
            <div className="quantity-selector">
              <button onClick={() => changeQuantity(quantity - 1)} disabled={quantity <= 1}>
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => changeQuantity(Number(e.target.value))}
                min="1"
                max={selectedFlavor?.stock ?? product.stock}
              />
              <button
                onClick={() => changeQuantity(quantity + 1)}
                disabled={quantity >= (selectedFlavor?.stock ?? product.stock)}
              >
                +
              </button>
            </div>
            <div className="total-price">
              Total: £{(product.price * quantity).toFixed(2)}
            </div>
          </div>

          <div className="product-actions">
            <button
              className="wishlist-button"
              onClick={() => console.log("Wishlist clicked")}
            >
              <i className="fa fa-heart"></i> Wishlist
            </button>
            <button
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={(selectedFlavor?.stock ?? product.stock) <= 0}
            >
              <i className="fa fa-shopping-cart"></i> Add to Cart
            </button>
          </div>

          {cartError && <div className="cart-error-message">{cartError}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;