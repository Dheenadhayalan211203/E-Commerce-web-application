import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
{
  ("import HomePage from './pages/HomePage'; // Create this later");
}
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import authService from "./api/auth";
import Navigation from "./components/Navigationbar";
import ProductDisplay from "./components/productdisplay";
import HomePage from "./pages/HomePage";
 
import NotFoundPage from "./pages/NotFoundPage";
import Product from "./pages/Productdescription";
import Adminproductadd from "./pages/Adminproductadd";

export const usecontext=createContext();

function App() {

  
  const [user, setUser] = useState(null);
   

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
      
      <usecontext.Provider value={ {user,handleLogout}}> 
         
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
         <Route path="/product/:id" element={<Product />} />
         <Route path="/admin/product" element={<Adminproductadd />} />

        {/* Add more routes for your e-commerce site */}
      </Routes>
    </Router>
    </usecontext.Provider>

    </>

     
  );
}

export default App;
