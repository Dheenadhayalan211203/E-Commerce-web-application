import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
{"import HomePage from './pages/HomePage'; // Create this later"}
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import authService from './api/auth';
import Navigation from './components/Navigationbar';
import ProductDisplay from './components/productdisplay';

// Basic Home Page component for demonstration
const HomePageContent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
       
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
    window.location.reload(); // Force reload to clear state
  };

  return (
     
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#333' }}>Welcome to E-commerce App!</h1>
      <Navigation/>
      {user ? (
        <>
          <p style={{ fontSize: '1.2em', color: '#555' }}>Hello, {user.username}!</p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
          <p>You are logged in.</p>
          {/* Add more protected content or navigation here */}
           <ProductDisplay/>
        </>
      ) : (
        <>
          <p style={{ fontSize: '1.2em', color: '#777' }}>Please login or sign up to continue.</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/login" style={{ marginRight: '10px', padding: '10px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Login</Link>
            <Link to="/signup" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>Sign Up</Link>
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <nav style={{ backgroundColor: '#f8f9fa', padding: '10px 20px', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold', fontSize: '1.2em' }}>E-commerce </Link>
        <div>
          {/* We'll handle logged in/out state in HomePageContent or a NavBar component */}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        {/* Add more routes for your e-commerce site */}
      </Routes>
    </Router>
  );
}

export default App;