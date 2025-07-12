import React from "react";
import { useNavigate } from "react-router-dom";
import "./NewArrivalCard.css";

const NewArrivalCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`, {
      state: { productData: product, fromNewArrivals: true }
    });
  };

  return (
    <div className="new-arrival-card" onClick={handleClick}>
      <div className="new-arrival-image">
        <img
          src={
            product.image_base64
              ? `data:image/jpeg;base64,${product.image_base64}`
              : "https://via.placeholder.com/300"
          }
          alt={product.name}
          loading="lazy"
        />
      </div>
      <div className="new-arrival-details">
        <h3 className="new-arrival-name">{product.name}</h3>
        <p className="new-arrival-brand">{product.brand}</p>
        <div className="new-arrival-price">£{Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default NewArrivalCard;