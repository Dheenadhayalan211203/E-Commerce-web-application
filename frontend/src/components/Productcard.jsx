import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';
import axios from 'axios';

const ProductCard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) return <div className="loading-message">Loading products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!products.length) return <div className="no-products">No products available</div>;

  return (
    <div className="products-container">
      {products.map(product => (
        <div 
          className="product-card" 
          key={product.id}
          onClick={() => handleProductClick(product.id)}
          style={{ cursor: 'pointer' }} // Optional: changes cursor to pointer to indicate clickable
        >
          {product.price < 20 && <div className="product-badge">Sale</div>}
          <div className="product-tumb">
            {product.image_base64 ? (
              <img src={`data:image/jpeg;base64,${product.image_base64}`} alt={product.name} />
            ) : (
              <img src="https://via.placeholder.com/300x300" alt="Product placeholder" />
            )}
          </div>
          <div className="product-details">
            <span className="product-category">{product.category || 'Uncategorized'}</span>
            <h4>{product.name}</h4>
            <p>{product.description || 'No description available'}</p>
            <div className="product-bottom-details">
              <div className="product-price">
                ${product.price}
              </div>
              <div className="product-stock">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
              <div className="product-links">
                <button 
                  className="wishlist-btn" 
                  onClick={(e) => e.stopPropagation()} // Prevents card click when clicking button
                >
                  <i className="fa fa-heart"></i>
                </button>
                <button 
                  className="cart-btn" 
                  disabled={product.stock <= 0}
                  onClick={(e) => e.stopPropagation()} // Prevents card click when clicking button
                >
                  <i className="fa fa-shopping-cart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;