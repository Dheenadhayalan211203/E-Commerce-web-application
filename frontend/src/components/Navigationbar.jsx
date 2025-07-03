import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navi.css';
import { usecontext } from '../App';
import { FaBars, FaTimes, FaUser, FaShoppingCart, FaCog } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';

const Navigation = () => {
  const { user, handleLogout } = useContext(usecontext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user?.IsAdmin == true) {
      setAdmin(true);
    } else {
      setAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLoginRedirect = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = 'auto';
  };

  console.log(user)

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-left">
            <div className="navbar-brand">
              <Link to="/" onClick={closeMobileMenu}>
                <span className="logo-text">Exprez Vapes</span>
                <span className="logo-subtext">UK</span>
              </Link>
            </div>
            
            <button 
              className="mobile-menu-button" 
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          <div className="navbar-right">
            {user && (
              <Link to="/cart" className="cart-icon" aria-label="Shopping Cart">
                <FaShoppingCart />
                <span className="cart-count"></span>
              </Link>
            )}
          </div>

          <div className={`navbar-links-container ${isMobileMenuOpen ? 'active' : ''}`}>
            <button 
              className="mobile-close-button" 
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
            
            <div className="user-section">
              {user ? (
                <div className="user-info">
                  <div className="user-greeting">
                    <FaUser className="user-icon" />
                    <span>Hello, {user.username}</span>
                  </div>
                  
                  <div className="user-actions">
                    {admin && (
                      <button 
                        className="admin-btn"
                        onClick={() => {
                          navigate('/admin/product');
                          closeMobileMenu();
                        }}
                      >
                        <MdAdminPanelSettings className="admin-icon" />
                        Admin Panel
                      </button>
                    )}
                    
                    <button 
                      className="logout-btn"
                      onClick={() => {
                        handleLogout();
                        closeMobileMenu();
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-actions">
                  <button 
                    className="login-btn"
                    onClick={handleLoginRedirect}
                  >
                   Login
                  </button>
                  <button 
                    className="register-btn"
                    onClick={() => {
                      navigate('/signup');
                      closeMobileMenu();
                    }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Overlay for mobile menu */}
      <div 
        className={`navbar-overlay ${isMobileMenuOpen ? 'active' : ''}`} 
        onClick={closeMobileMenu}
      />
    </>
  );
};

export default Navigation;  