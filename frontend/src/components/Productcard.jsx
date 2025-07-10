import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';
import axios from 'axios';
import lzstring from 'lz-string';
import { usecontext } from '../App';

const CACHE_KEY = 'products_cache_v2';
const CACHE_EXPIRY_HOURS = 6;
const API_TIMEOUT = 50000;
const MAX_RETRIES = 2;

const ProductCard = ({ customProducts }) => {
  const { products, setProducts } = useContext(usecontext);
  const [localProducts, setLocalProducts] = useState(customProducts || products || []);
  const [loading, setLoading] = useState(!customProducts);
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

      const { data, timestamp } = JSON.parse(decompressed);
      const isExpired = (Date.now() - timestamp) > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      return !isExpired && Array.isArray(data) ? data : null;
    } catch (e) {
      console.error("Cache read error:", e);
      return null;
    }
  };

  const saveToCache = (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: 2,
      };
      const compressed = lzstring.compressToUTF16(JSON.stringify(cacheData));
      localStorage.setItem(CACHE_KEY, compressed);
    } catch (e) {
      console.warn("Cache write failed:", e);
      localStorage.removeItem(CACHE_KEY);
    }
  };

  const fetchProducts = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      const cached = getCachedProducts();
      if (!isRetry && cached) {
        setLocalProducts(cached);
        setUsingCache(true);
      }

      const res = await axios.get(
        "https://e-commerce-web-application-k9ho.onrender.com/api/products",
        { timeout: API_TIMEOUT }
      );

      if (!Array.isArray(res.data)) throw new Error("Invalid product data");

      const freshData = res.data.map(p => ({ ...p, _timestamp: Date.now() }));
      setLocalProducts(freshData);
      setProducts(freshData);
       
      setUsingCache(false);
      setRetryCount(0);
      saveToCache(freshData);
    } catch (err) {
      console.error("Fetch failed:", err);

      if (retryCount < MAX_RETRIES) {
        const delay = 1000 * (retryCount + 1);
        setRetryCount(r => r + 1);
        setTimeout(() => fetchProducts(true), delay);
        return;
      }

      setError(err.message || "Fetch failed");

      const fallback = getCachedProducts();
      if (fallback && !localProducts.length) {
        setLocalProducts(fallback);
        setUsingCache(true);
        setError(null);
      }
    } finally {
      if (!isRetry) setLoading(false);
    }
  };

  useEffect(() => {
    if (customProducts) {
      setLocalProducts(customProducts);
      setLoading(false);
    } else if (products && products.length > 0) {
      setLocalProducts(products);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [customProducts]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`, {
      state: { productData: product, fromProductList: true }
    });
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchProducts();
  };

  if (loading && !localProducts.length) {
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
          Error: {error}<br />
          {usingCache ? 'Showing cached data' : 'Failed to load products'}
        </div>
        {!usingCache && (
          <button className="retry-button" onClick={handleRetry}>Retry</button>
        )}
      </div>
    );
  }

  if (!localProducts.length) {
    return (
      <div className="no-products">
        No products available
        <button className="retry-button" onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div className="products-container">
      {localProducts.map(product => (
        <div
          className="product-card"
          key={product.id}
          onClick={() => handleProductClick(product)}
          style={{ cursor: 'pointer' }}
        >
          {product.price < 20 && <div className="product-badge">Sale</div>}
          <div className="product-tumb">
            <img
              src={product.image_base64
                ? `data:image/jpeg;base64,${product.image_base64}`
                : "https://via.placeholder.com/300x300"}
              alt={product.name}
              loading="lazy"
            />
          </div>
          <div className="product-details">
            <span className="product-category">{product.category || 'Uncategorized'}</span>
            <h4>{product.name}</h4>
            <div className="product-bottom-details">
              <div className="product-price">£{Number(product.price).toFixed(2)}</div>
              <div className="product-stock">
                {product.stock > 0
                  ? `${product.stock < 999 ? product.stock : "999+"} in stock`
                  : "Out of stock"}
              </div>
              <div className="product-links">
                <button className="wishlist-btn" onClick={e => e.stopPropagation()}>
                  <i className="fa fa-heart"></i>
                </button>
                <button className="cart-btn" disabled={product.stock <= 0}>
                  <i className="fa fa-shopping-cart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {usingCache && (
        <div className="cache-notice">
          Showing cached products
          {getCachedProducts()?.timestamp &&
            ` (last updated ${new Date(getCachedProducts().timestamp).toLocaleTimeString()})`}
          <button className="refresh-button" onClick={handleRetry}>Refresh</button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;