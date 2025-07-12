 import React, { useState, useEffect, createContext } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

// Contexts
import { AuthProvider } from "./context/AuthContext"; // ✅ Correct import

// Pages & Components
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import authService from "./api/auth";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import Product from "./pages/Productdescription";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import CRUD from "./pages/AdminCRUD";
import AdminProductForm from "./components/Adminprad";
import CategoryCRUD from "./pages/Admincategoryadd";
import PaymentPage from "./components/PaymentPage";
import Mycart from "./pages/Mycart";
import CategoryPage from "./pages/Catogerypage";
import BrandPage from "./pages/Brandpage";
import SearchResult from "./components/SearchResult";

// Global App Context
export const usecontext = createContext();

const AdminRoute = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser || storedUser.IsAdmin != 1) {
    return <Navigate to="/unauthoraised" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          "https://e-commerce-web-application-k9ho.onrender.com/api/products",
          { timeout: 50000 }
        );
        if (Array.isArray(response.data)) {
          const withTimestamp = response.data.map((p) => ({
            ...p,
            _timestamp: Date.now(),
          }));
          setProducts(withTimestamp);
        } else {
          console.error("Invalid product format from API.");
        }
      } catch (error) {
        console.error("Product API fetch failed:", error.message);
      }
    };

    fetchProducts();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    window.location.href = "/#/";
  };

  return (
    <AuthProvider>
      <usecontext.Provider value={{ user, handleLogout, products, setProducts }}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/notfound" element={<NotFoundPage />} />
            <Route path="/unauthoraised" element={<UnauthorizedAccess />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/cart" element={<Mycart />} />
            <Route path="/checkout" element={<PaymentPage />} />
            <Route path="/category/:name" element={<CategoryPage />} />
            <Route path="/brand/:name" element={<BrandPage />} />
            <Route path="/search/:productName" element={<SearchResult />} />
            <Route
              path="/admin/product"
              element={
                <AdminRoute>
                  <CRUD />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/category"
              element={
                <AdminRoute>
                  <CategoryCRUD />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/product/new"
              element={
                <AdminRoute>
                  <AdminProductForm />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
      </usecontext.Provider>
    </AuthProvider>
  );
}

export default App;
