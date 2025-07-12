import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from './Productcard'; // Import your ProductCard component
import { usecontext } from '../App'; // Adjust the import path as needed

const SearchResult = () => {
  const { products } = useContext(usecontext);
  const { productName } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productName) {
      const decodedName = decodeURIComponent(productName);
      const results = products.filter(product =>
        product.name.toLowerCase().includes(decodedName.toLowerCase())
      );
      setSearchResults(results);
      setLoading(false);
    }
  }, [productName, products]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="search-results-container">
      <h2 className="search-results-title">
        Search Results for: "{decodeURIComponent(productName)}"
      </h2>
      
      {searchResults.length > 0 ? (
        <div className="products-grid">
          {searchResults.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No products found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResult;