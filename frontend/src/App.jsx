import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import authService from "./api/auth";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import Product from "./pages/Productdescription";
import Adminproductadd from "./pages/Adminproductadd";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import CRUD from "./pages/AdminCRUD";
import AdminProductForm from "./components/Adminprad";

export const usecontext = createContext();

// Admin Route Protection Component
const AdminRoute = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  
  if (!storedUser || storedUser.IsAdmin !=1) {
    // Redirect to login or home page if not admin
    return <Navigate to="/unauthoraised" replace />;
  }

  return children;
};

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
    window.location.href = "/login"; // Using href instead of navigate
  };

  return (
    <usecontext.Provider value={{ user, handleLogout }}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/product/:id" element={<Product />} />
            <Route path="/notfound" element={<NotFoundPage />} />
            <Route path="/unauthoraised" element={<UnauthorizedAccess />} />
          
          <Route
            path="/admin/product"
            element={
              <AdminRoute>
                <CRUD />
              </AdminRoute>
            }
          />

          <Route path="/admin/product/new"
          element={
            <AdminRoute>
              <AdminProductForm/>
            </AdminRoute>
          }>


          </Route>
          {/* Add more routes for your e-commerce site */}
        </Routes>
      </Router>
    </usecontext.Provider>
    
  );
}

export default App;