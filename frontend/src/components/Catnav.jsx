import { useState, useRef, useEffect } from "react";
import './Catnav.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Catnav = () => {
  const staticCategories = [
    { id: 1, name: "Home", is_active: true },
    { 
      id: 2, 
      name: "Compliant Vapes", 
      is_active: true,
      subcategories: [
        { id: 21, name: "2025 Legal Big Puffs" },
        { id: 22, name: "Compliant 600 Puffs" }
      ]
    },
    { id: 3, name: "Nicotine Salts", is_active: true,
       
    },
    { id: 4, name: "Nicotine Pouches", is_active: true },
    { id: 5, name: "Vape Kits", is_active: true },
    { id: 6, name: "Pods", is_active: true },
    { id: 7, name: "Ambient", is_active: true },
    { id: 8, name: "Vape", is_active: true },
    { id: 9, name: "SmokingDubai Chocolate", is_active: true }
  ];

  const [activeCategory, setActiveCategory] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const navRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedCategory(null);
  }, [location.pathname]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'category') {
      const fullCategory = decodeURIComponent(pathParts.slice(2).join('/')).toLowerCase();
      setActiveCategory(fullCategory);
    } else if (location.pathname === '/') {
      setActiveCategory('home');
    }
  }, [location.pathname]);

  const handleCategoryClick = (name, e) => {
    e.preventDefault();
    if (name.toLowerCase() === 'home') {
      navigate('/');
    } else {
      const encodedName = encodeURIComponent(name);
      navigate(`/category/${encodedName}`);
    }
    setMobileMenuOpen(false);
  };

  const handleSubcategoryClick = (parentName, subName, e) => {
    e.preventDefault();
    const encodedName = encodeURIComponent(`${parentName}/${subName}`);
    setActiveCategory(`${parentName}/${subName}`.toLowerCase());
    navigate(`/category/${encodedName}`);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="category-nav-container" ref={navRef}>
      <div className="mobile-menu-button" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </div>

      <div className={`category-navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {staticCategories.map((cat) =>
          cat.is_active ? (
            <div key={cat.id} className="category-wrapper">
              <div className="category-link-container">
                <Link 
                  to={cat.name.toLowerCase() === 'home' ? '/' : `/category/${encodeURIComponent(cat.name)}`}
                  className={`category-link ${activeCategory === cat.name.toLowerCase() ? 'active' : ''}`}
                  onClick={(e) => handleCategoryClick(cat.name, e)}
                >
                  <span className="category-text">{cat.name}</span>
                </Link>
                {cat.subcategories && cat.name.toLowerCase() !== 'home' && (
                  <button 
                    className="dropdown-toggle"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleCategoryExpand(cat.id);
                    }}
                    aria-label={`Toggle ${cat.name} subcategories`}
                  >
                    {expandedCategory === cat.id ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                  </button>
                )}
              </div>

              {cat.name.toLowerCase() !== 'home' && 
                ((mobileMenuOpen && expandedCategory === cat.id) || (!mobileMenuOpen && cat.subcategories)) && (
                <div className={`subcategory-dropdown ${expandedCategory === cat.id ? 'expanded' : ''}`}>
                  {cat.subcategories?.map(sub => (
                    <Link
                      key={`${cat.id}-${sub.name}`}
                      to={`/category/${encodeURIComponent(`${cat.name}/${sub.name}`)}`}
                      className={`subcategory-link ${activeCategory === `${cat.name}/${sub.name}`.toLowerCase() ? 'active' : ''}`}
                      onClick={(e) => handleSubcategoryClick(cat.name, sub.name, e)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Catnav;
