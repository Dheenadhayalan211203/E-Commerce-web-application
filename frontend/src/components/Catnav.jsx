import axios from "axios";
import { useEffect, useState, useRef } from "react";
import './Catnav.css';

const Catnav = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data);
        if (res.data.length > 0) {
          const firstActive = res.data.find(cat => cat.is_active);
          setActiveCategory(firstActive ? firstActive.id : null);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (id, e) => {
    e.preventDefault();
    setActiveCategory(id);
    // Center the clicked category
    if (navRef.current) {
      const button = e.target.closest('.category-btn');
      if (button) {
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  return (
    <div className="category-nav-container">
      <div className="category-navbar" ref={navRef}>
        {categories.map((cat, index) =>
          cat.is_active ? (
            <button 
              key={cat.id} 
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={(e) => handleCategoryClick(cat.id, e)}
            >
              <span className="category-text">{cat.name}</span>
              <span className="hover-effect"></span>
            </button>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Catnav;