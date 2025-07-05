import axios from "axios";
import { useEffect, useState, useRef } from "react";
import './Catnav.css';
import { Link } from "react-router-dom";

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
          setActiveCategory(firstActive ? firstActive.name.toLowerCase() : null);
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    fetchCategories();
  }, []);

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/-+/g, '-');     // Replace multiple - with single -
  };

  const handleCategoryClick = (name, e) => {
    e.preventDefault();
    setActiveCategory(name.toLowerCase());
    if (navRef.current) {
      const button = e.target.closest('.category-link');
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
        {categories.map((cat) =>
          cat.is_active ? (
            <Link 
              to={`/category/${createSlug(cat.name)}`}
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