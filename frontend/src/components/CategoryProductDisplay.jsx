import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usecontext } from "../App";
import MiniProductCard from "./MiniProductCard";
import "./CategoryProductDisplay.css";

const CategoryProductDisplay = () => {
  const { products } = useContext(usecontext);
  const navigate = useNavigate();

  const categories = [
  { id: 1, name: "Compliant Vapes" },
    { id: 4, name: "Nicotine Pouches" },
    { id: 5, name: "Vape Kits" },
    { id: 6, name: "Pods" },
    { id: 7, name: "Ambient" },
    { id: 8, name: "Vape" },
    { id: 9, name: "SmokingDubai Chocolate" }
  ];

  const getProductsByCategory = (categoryName) => {
    return products.filter(
      (product) =>
        product.category &&
        product.category.toLowerCase() === categoryName.toLowerCase()
    );
  };

  const handleMoreProducts = (categoryName) => {
    navigate(`/category/${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="category-container">
      {categories.map(({ id, name }) => {
        const filteredProducts = getProductsByCategory(name);
        if (filteredProducts.length === 0) return null;

        return (
          <div className="category-section" key={id}>
            <h2 className="category-title">{name}</h2>
            <div className="product-card-row">
              {filteredProducts.slice(0, 3).map((product) => (
                <MiniProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length > 3 && (
              <div className="more-products-container">
                <button
                  className="more-products-button"
                  onClick={() => handleMoreProducts(name)}
                >
                  More Products
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryProductDisplay;
