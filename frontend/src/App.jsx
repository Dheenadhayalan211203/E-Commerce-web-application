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

const usecontext=createContext();

// Basic Home Page component for demonstration
const HomePageContent = () => {
  const navigate = useNavigate();
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
    <div>
      {user ? <div><Navigation /></div> : <div>User is not logged in</div>}
    </div>
  </>
);
};

function App() {
  return (
    <Router>
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
