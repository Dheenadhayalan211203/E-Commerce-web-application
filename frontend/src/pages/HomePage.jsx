import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigationbar";
import ProductDisplay from "../components/productdisplay";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import ProductCard from "../components/Productcard";
import "./Homepage.css";
import AdminProductForm from "../components/Adminprad";
import AdminProductList from "../components/AdminProductList";
import Catnav from "../components/Catnav";
import CartComponent from "../components/CartComponent";


/*const HomePage = ({ user, onLogout }) => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1 style={{ color: '#333' }}>Welcome to E-commerce App!</h1>
            <Navigation user={user} onLogout={onLogout} />
            {user ? (
                <>
                    <p style={{ fontSize: '1.2em', color: '#555' }}>Hello vanakam , {user.username}!</p>
                    <ProductDisplay user={user} />
                </>
            ) : (
                <p style={{ fontSize: '1.2em', color: '#777' }}> Abcd Please login or sign up to continue.</p>
            )}
        </div>
    );
}; 

export default HomePage; 

*/

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      console.log(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate("/login");
    window.location.reload(); // Force reload to clear state
  };

  return (
    <>
      <div className="hompg">
        <div className="navi">
          <Navigation />
        </div>
        <Catnav />
        <div className="pr">
          <ProductCard />
        </div>
         <CartComponent/>
      </div>
    </>
  );
};

export default HomePage;
