import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';
import axios from 'axios';
import lzstring from 'lz-string';

const CACHE_KEY = 'products_cache_v2';
const CACHE_EXPIRY_HOURS = 6;
const API_TIMEOUT = 50000; // 15 seconds timeout
const MAX_RETRIES = 2;

const ProductCard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingCache, setUsingCache] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const getCachedProducts = () => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (!cachedData) return null;
      
      const decompressed = lzstring.decompressFromUTF16(cachedData);
      if (!decompressed) return null;
      
      const { data, timestamp, version } = JSON.parse(decompressed);
      
      const isExpired = (Date.now() - timestamp) > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      const isValid = Array.isArray(data) && data.length > 0;
      
      return !isExpired && isValid ? data : null;
    } catch (e) {
      console.error("Cache read error:", e);
      return null;
    }
  };

  const saveToCache = (data) => {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    try {
      const cacheData = {
        data: data.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category,
          image_base64: product.image_base64,
          brand: product.brand,
          description: product.description,
          flavors_data: product.flavors_data,
          _timestamp: Date.now() // Add timestamp for individual products
        })),
        timestamp: Date.now(),
        version: 2
      };

      const compressed = lzstring.compressToUTF16(JSON.stringify(cacheData));
      localStorage.setItem(CACHE_KEY, compressed);
      return true;
    } catch (e) {
      console.warn("Cache write failed:", e);
      if (e.name === 'QuotaExceededError') {
        localStorage.removeItem(CACHE_KEY);
      }
      return false;
    }
  };

  const fetchProducts = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      if (!isRetry) {
        const cachedProducts = getCachedProducts();
        if (cachedProducts) {
          setProducts(cachedProducts);
          setUsingCache(true);
        }
      }

      const response = await axios.get(
        "https://e-commerce-web-application-k9ho.onrender.com/api/products",
        { timeout: API_TIMEOUT }
      );
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid API response format');
      }

      const productsWithTimestamp = response.data.map(product => ({
        ...product,
        _timestamp: Date.now()
      }));

      setProducts(productsWithTimestamp);
      setUsingCache(false);
      setRetryCount(0);
      saveToCache(productsWithTimestamp);
    } catch (err) {
      console.error("Fetch error:", err);
      
      if (retryCount < MAX_RETRIES) {
        const delay = 1000 * (retryCount + 1);
        console.log(`Retrying in ${delay}ms...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchProducts(true), delay);
        return;
      }

      setError(err.message || 'Failed to load products');
      
      const cachedProducts = getCachedProducts();
      if (cachedProducts && !products.length) {
        setProducts(cachedProducts);
        setUsingCache(true);
        setError(null);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, {
      state: { 
        productData: product,
        fromProductList: true 
      }
    });
  };

  

  const handleRetry = () => {
    setRetryCount(0);
    fetchProducts();
  };

  if (loading && !products.length) {
    return (
      <div className="loading-container">
        <div className="loading-message">Loading products...</div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          Error: {error}
          <br />
          {usingCache ? 'Showing cached data' : 'Failed to load products'}
        </div>
        {!usingCache && (
          <button className="retry-button" onClick={handleRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="no-products">
        No products available
        <button className="retry-button" onClick={handleRetry}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="products-container">
      {products.map(product => (
        <div 
          className="product-card" 
          key={product.id}
          onClick={() => handleProductClick(product)}
          style={{ cursor: 'pointer' }}
        >
          {product.price < 20 && <div className="product-badge">Sale</div>}
          <div className="product-tumb">
            {product.image_base64 ? (
              <img 
                src={`data:image/jpeg;base64,${product.image_base64}`} 
                alt={product.name}
                loading="lazy"
              />
            ) : (
              <img 
                src="https://via.placeholder.com/300x300" 
                alt="Product placeholder"
                loading="lazy"
              />
            )}
          </div>
          <div className="product-details">
            <span className="product-category">{product.category || 'Uncategorized'}</span>
            <h4>{product.name}</h4>
            <div className="product-bottom-details">
              <div className="product-price">
                £{Number(product.price).toFixed(2)}
              </div>
              <div className="product-stock">
                {product.stock > 0 ? `${product.stock < 999 ? product.stock : "999+"} in stock` : 'Out of stock'}
              </div>
              <div className="product-links">
                <button 
                  className="wishlist-btn" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <i className="fa fa-heart"></i>
                </button>
                <button 
                  className="cart-btn" 
                  disabled={product.stock <= 0}
                   
                >
                  <i className="fa fa-shopping-cart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {usingCache && (
        <div className="cache-notice">
          Showing cached products (last updated {new Date(getCachedProducts()?.timestamp).toLocaleTimeString()})
          <button className="refresh-button" onClick={handleRetry}>
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;