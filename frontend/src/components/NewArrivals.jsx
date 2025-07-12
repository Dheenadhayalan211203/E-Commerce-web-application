import React, { useState, useEffect ,useContext} from "react";
 import { usecontext } from "../App";
import NewArrivalCard from "./NewArrivalCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./NewArrivals.css";

const NewArrivals = () => {
  const { products } = useContext(usecontext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  if (!products || products.length === 0) {
    return (
      <div className="new-arrivals-section">
        <h2 className="section-title">New Arrivals</h2>
        <div className="no-products-message">Loading products...</div>
      </div>
    );
  }

  // Get 10 newest products
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === newArrivals.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [newArrivals.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === newArrivals.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? newArrivals.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) nextSlide();
    if (touchStart - touchEnd < -50) prevSlide();
  };

  return (
    <div className="new-arrivals-section">
      <div className="section-header">
        <h2 className="section-title">New Arrivals</h2>
        <div className="slider-controls">
          <button onClick={prevSlide} className="slider-arrow">
            <FiChevronLeft />
          </button>
          <button onClick={nextSlide} className="slider-arrow">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div 
        className="slider-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="slider-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {newArrivals.map((product) => (
            <div key={product.id} className="slide">
              <NewArrivalCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className="slider-dots">
        {newArrivals.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;