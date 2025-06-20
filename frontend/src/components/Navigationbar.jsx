import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiHeart, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "./Navi.css"

const Navigation = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const categories = [
    { name: 'Electronics', sub: ['Phones', 'Laptops', 'Accessories'] },
    { name: 'Fashion', sub: ['Men', 'Women', 'Kids'] },
    { name: 'Home & Living', sub: ['Furniture', 'Decor', 'Kitchen'] },
    { name: 'Beauty', sub: ['Skincare', 'Makeup', 'Haircare'] },
  ];

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="top-bar">
        <div className="container">
           
          <div className="top-links">
            <Link to="/help">Help</Link>
             
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>

      <div className="main-nav container">
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <div className="logo">
          <Link to="/">Exp<span>rez</span></Link>
        </div>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-item mega-menu">
            <button 
              className="nav-link" 
              onClick={() => toggleDropdown('shop')}
              onMouseEnter={() => setActiveDropdown('shop')}
            >
              Shop <FaChevronDown className="dropdown-icon" />
            </button>
            {activeDropdown === 'shop' && (
              <div 
                className="mega-menu-content"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <div className="mega-menu-columns">
                  {categories.map((category, index) => (
                    <div key={index} className="mega-menu-column">
                      <h4>{category.name}</h4>
                      <ul>
                        {category.sub.map((item, i) => (
                          <li key={i}><Link to={`/category/${item.toLowerCase()}`}>{item}</Link></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mega-menu-banner">
                  <div className="banner-content">
                    <h3>Summer Sale</h3>
                    <p>Up to 50% off on selected items</p>
                    <button className="banner-btn">Shop Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="nav-item">
            <Link to="/new-arrivals" className="nav-link" onClick={closeMenu}>New Arrivals</Link>
          </div>
          <div className="nav-item">
            <Link to="/deals" className="nav-link" onClick={closeMenu}>Deals</Link>
          </div>
          <div className="nav-item">
            <Link to="/brands" className="nav-link" onClick={closeMenu}>Brands</Link>
          </div>
          <div className="nav-item">
            <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
          </div>
        </div>

        <div className="nav-actions">
          <div className="search-box">
            <input type="text" placeholder="Search products..." />
            <button className="search-btn"><FiSearch /></button>
          </div>
          <div className="action-icons">
            {user ? (
              <>
                <Link to="/account" className="icon-link"><FiUser /></Link>
                <button onClick={onLogout} className="icon-link">Logout</button>
              </>
            ) : (
              <Link to="/login" className="icon-link"><FiUser /></Link>
            )}
            <Link to="/wishlist" className="icon-link"><FiHeart /></Link>
            <Link to="/cart" className="icon-link cart-icon">
              <FiShoppingCart />
              <span className="cart-count">0</span>
            </Link>
            
             
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;