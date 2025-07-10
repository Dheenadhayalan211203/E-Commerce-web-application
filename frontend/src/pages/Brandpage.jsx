import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usecontext } from '../App';
import ProductCard from '../components/Productcard';
import Navigation from '../components/Navigationbar';
import './Brandpage.css'; // Create this CSS file similar to CategoryPage.css
import Catnav from '../components/Catnav';

const BrandPage = () => {
  const { name } = useParams();
  const { products } = useContext(usecontext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    // Set a 60-second timeout to show "not found" message
    const notFoundTimer = setTimeout(() => {
      if (isLoading) {
        setShowNotFound(true);
        setIsLoading(false);
      }
    }, 60000); // 60 seconds

    return () => clearTimeout(notFoundTimer);
  }, [isLoading]);

  useEffect(() => {
    if (products) {
      const matched = products.filter(p => p.brand === name); // Changed from category to brand
      setFilteredProducts(matched);
      
      if (products.length === 0) {
        // If context returns empty array, keep loading for 60 seconds
        return;
      }
      
      setIsLoading(false);
      setShowNotFound(matched.length === 0);
    }
  }, [name, products]);

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading products from {name}...</p>
      <p className="loading-subtext">Please wait while we fetch the items</p>
    </div>
  );

  // No products found component
  const NotFoundMessage = () => (
    <div className="not-found-container">
      <div className="not-found-icon">😕</div>
      <h3>No Products Found</h3>
      <p>We couldn't find any products from the {name} brand.</p>
      <p className="subtext">Please check back later or try another brand</p>
    </div>
  );

  return (
    <div className="brand-page">
      <section className="navi">
        <Navigation />
      </section>

      <Catnav/>
      
      <div className="brand-content">
        <h2 className="brand-title">{name}</h2>
        
        {isLoading ? (
          <LoadingAnimation />
        ) : showNotFound || filteredProducts.length === 0 ? (
          <NotFoundMessage />
        ) : (
          <ProductCard customProducts={filteredProducts} />
        )}
      </div>
    </div>
  );
};

export default BrandPage;