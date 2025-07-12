import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usecontext } from '../App';
import ProductCard from '../components/Productcard';
import Navigation from '../components/Navigationbar';
import './CatogeryPage.css';
import Catnav from '../components/Catnav';

const CategoryPage = () => {
  const { name } = useParams(); // can be "Main/Sub" or just "Main"
  const { products } = useContext(usecontext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotFound, setShowNotFound] = useState(false);

  useEffect(() => {
    if (!products || products.length === 0) return;

    let mainCategory = name;
    let subCategory = null;

    if (name.includes('/')) {
      const parts = name.split('/');
      mainCategory = decodeURIComponent(parts[0]);
      subCategory = decodeURIComponent(parts[1]);
    } else {
      mainCategory = decodeURIComponent(name);
    }

    const matched = products.filter(p =>
      p.category === mainCategory &&
      (subCategory ? p.product_group === subCategory : true)
    );

    setFilteredProducts(matched);
    setIsLoading(false);
    setShowNotFound(matched.length === 0);
  }, [name, products]);

  const LoadingAnimation = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading products for {name}...</p>
      <p className="loading-subtext">Please wait while we fetch the items</p>
    </div>
  );

  const NotFoundMessage = () => (
    <div className="not-found-container">
      <div className="not-found-icon">😕</div>
      <h3>No Products Found</h3>
      <p>We couldn't find any products in the {name} category.</p>
      <p className="subtext">Please check back later or try another category</p>
    </div>
  );

  return (
    <div className="category-page">
      <section className="navi">
        <Navigation />
      </section>

      <Catnav />

      <div className="category-content">
        <h2 className="category-title">{decodeURIComponent(name)}</h2>

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

export default CategoryPage;
