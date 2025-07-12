import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usecontext } from '../App';
import './SearchBar.css'; // <-- make sure this CSS file is imported

const SearchBar = () => {
  const { products } = useContext(usecontext);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    setSuggestions(filtered);
  }, [searchTerm, products]);

  const handleSearch = (productName = searchTerm) => {
    if (productName.trim()) {
      navigate(`/search/${encodeURIComponent(productName)}`);
      setShowSuggestions(false);
      setSearchTerm('');
    }
  };

  const handleSuggestionClick = (product) => {
    handleSearch(product.name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-root relative" ref={searchRef}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search products..."
          className="search-input"
        />
        <button 
          onClick={() => handleSearch()} 
          className="search-button"
        >
          <i className="fas fa-search"></i>
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container">
          <div className="suggestions-dropdown">
            {suggestions.map((product) => (
              <div
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className="suggestion-item"
              >
                <span className="suggestion-name">{product.name}</span>
                <span className="suggestion-brand">{product.brand}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
