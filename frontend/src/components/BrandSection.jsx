import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandSection.css';

const BrandsSection = () => {
  const navigate = useNavigate();
  
  // Sample brand data - replace with your actual brands
  const brands = [
    { id: 1, name: 'Hayati', logo: 'Hayati.jpg' },
    { id: 2, name: 'IVG', logo: 'IVG.jpg' },
    { id: 3, name: 'Elux', logo: 'Elux.jpg' },
    { id: 4, name: 'Eluv Bar', logo: 'eluxbar.jpg' },
    { id: 5, name: 'Lost Mary', logo: 'Lost-Mary.jpg' },
    { id: 6, name: 'SKE', logo: 'SKE.jpg' } 
  ];

  const handleBrandClick = (brandName) => {
    navigate(`/brand/${brandName}`);
  };

  return (
    <section className="brands-section">
      <div className="section-header">
        <h2>Our Trusted Brands</h2>
      </div>
      
      <div className="brands-grid">
        {brands.map((brand) => (
          <div 
            key={brand.id} 
            className="brand-card"
            onClick={() => handleBrandClick(brand.name)}
          >
            <div className="brand-image-container">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="brand-image"
                onError={(e) => {
                  e.target.src = '/brands/default-brand.png'; // Fallback image
                }}
              />
            </div>
            <h3 className="brand-name">{brand.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandsSection;