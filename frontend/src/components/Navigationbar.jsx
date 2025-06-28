import React, { useContext, useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navi.css';
import { usecontext } from '../App';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navigation = () => {
  const { user, handleLogout } = useContext(usecontext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [admin, setAdmin] = useState(false);

    useEffect(() => {
           // Check if IsAdmin equals 1 (number)
           if (user?.IsAdmin == true) {
               setAdmin(true);
           } else {
               setAdmin(false); // Explicitly set false if not admin
           }

           console.log(admin)
       }, [user]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Exprez Vapes (UK)</Link>
      </div>
      
      {/* Mobile menu button */}
      <button className="mobile-menu-button" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      
      {/* Navigation links - both desktop and mobile */}
      <div className={`navbar-links-container ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="navbar-links">
          <li>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          </li>
          <li>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>Compliant Vapes</Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>Nicotine Salts</Link>
          </li>
          <li>
            <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Nicotine Pouches</Link>
          </li>
        </ul>
        
        {/* User section */}
        <div className="user-section">
          {user ? (
            <>
              <section>Welcome {user.username}</section>
               
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <button onClick={() => { handleLoginRedirect(); setIsMobileMenuOpen(false); }}>Login</button>
          )}

          {admin ? <> <button onClick={()=>{navigate('/admin/product')}}>Manage products</button></>:<>Not admin</>}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;