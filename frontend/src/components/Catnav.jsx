import { useState, useRef } from "react";
import './Catnav.css';
import { Link, useNavigate } from "react-router-dom";

const Catnav = () => {
  const staticCategories = [
    { id: 1, name: "Home", is_active: true },
    { id: 2, name: "Compliant Vapes", is_active: true },
    { id: 3, name: "Nicotine Salts", is_active: true },
    { id: 4, name: "Nicotine Pouches", is_active: true },
    { id: 5, name: "Vape Kits", is_active: true },
    { id: 6, name: "Pods", is_active: true },
    { id: 7, name: "Ambient", is_active: true },
    { id: 8, name: "Smoking", is_active: true },
    { id: 9, name: "SmokingDubai Chocolate", is_active: true }
  ];

  const [activeCategory, setActiveCategory] = useState("");
  const navRef = useRef(null);
  const navigate = useNavigate();

  const handleCategoryClick = (name, e) => {
    e.preventDefault();
    const encodedName = encodeURIComponent(name);
    setActiveCategory(name.toLowerCase());
    navigate(`/category/${encodedName}`);
  };

  return (
    <div className="category-nav-container">
      <div className="category-navbar" ref={navRef}>
        {staticCategories.map((cat) =>
          cat.is_active ? (
            <Link 
              to={`/category/${encodeURIComponent(cat.name)}`}
              key={cat.id}
              className={`category-link ${activeCategory === cat.name.toLowerCase() ? 'active' : ''}`}
              onClick={(e) => handleCategoryClick(cat.name, e)}
            >
              <span className="category-text">{cat.name}</span>
              <span className="hover-effect"></span>
            </Link>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Catnav;
