import React, { useState } from 'react';
import { FiPlus, FiMinus, FiShoppingCart } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "./productdisplay.css"

const ProductDisplay = ({ user }) => {
  const [selectedFlavor, setSelectedFlavor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFlavorDropdownOpen, setIsFlavorDropdownOpen] = useState(false);

  // Sample product data
  const product = {
    name: "Premium Esp Vape 500 ",
    description: "Experience the rich aroma with limited Nicotin level.",
    price: 24.99,
    flavors: [ "Dark Roast", "Vanilla", "Hazelnut", "Caramel"],
    rating: 4.8,
    reviews: 124,
  };

  const toggleFlavorDropdown = () => {
    setIsFlavorDropdownOpen(!isFlavorDropdownOpen);
  };

  const selectFlavor = (flavor) => {
    setSelectedFlavor(flavor);
    setIsFlavorDropdownOpen(false);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = () => {
    if (!user) {
      alert('Please login to add items to your cart');
      return;
    }
    alert(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} of ${product.name}${selectedFlavor ? ` (${selectedFlavor})` : ''} to cart!`);
  };

  return (
    <div className="product-display">
      <div className="product-image-container">
        <div className="product-image-placeholder">
          <span> <img src="https://th.bing.com/th/id/OIP.TUGXsWW3BWeBPX9_a550ZQHaHa?w=161&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" alt="" /></span>
        </div>
      </div>

      <div className="product-details">
        <h1 className="product-name">{product.name}</h1>
        
        {user && <div className="member-badge">Member Exclusive</div>}
        
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}${i === Math.floor(product.rating) && product.rating % 1 > 0 ? ' half-filled' : ''}`}
            >
              ★
            </span>
          ))}
          <span className="review-count">({product.reviews} reviews)</span>
        </div>

        <p className="product-description">{product.description}</p>

        <div className="flavor-selector">
          <label>Flavor:</label>
          <div className="flavor-dropdown">
            <button 
              className="dropdown-toggle" 
              onClick={toggleFlavorDropdown}
            >
              {selectedFlavor || "Select a flavor"} <FaChevronDown className="dropdown-icon" />
            </button>
            {isFlavorDropdownOpen && (
              <div className="dropdown-menu">
                {product.flavors.map((flavor, index) => (
                  <div 
                    key={index} 
                    className="dropdown-item"
                    onClick={() => selectFlavor(flavor)}
                  >
                    {flavor}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="price-container">
          <span className="price">${user ? (product.price * 0.9).toFixed(2) : product.price.toFixed(2)}</span>
          {user && <span className="discount-badge">10% OFF</span>}
          <span className="price-label">/ 12oz bag</span>
         
        </div>

        <div className="quantity-selector">
          <button 
            className="quantity-btn" 
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
          >
            <FiMinus />
          </button>
          <span className="quantity">{quantity}</span>
          <button 
            className="quantity-btn" 
            onClick={increaseQuantity}
          >
            <FiPlus />
          </button>
        </div>

        <button 
          className="add-to-cart-btn" 
          onClick={addToCart}
          disabled={!selectedFlavor}
        >
          <FiShoppingCart className="cart-icon" /> 
          Add to Cart - ${((user ? product.price * 0.9 : product.price) * quantity).toFixed(2)}
        </button>

        <div className="product-meta">
          <div className="meta-item">
            <span className="meta-label">Availability:</span>
            <span className="meta-value in-stock">In Stock (25+ items)</span>
          </div>
          <div className="meta-item">
           
          </div>
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">vape</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;