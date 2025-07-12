import React from "react";
import { useNavigate } from "react-router-dom";
import "./MiniProductCard.css"; // Optional

const MiniProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`, {
      state: { productData: product, fromProductList: true }
    });
  };

  return (
    <div className="mini-product-card" onClick={handleClick}>
      <div className="mini-product-img">
        <img
          src={
            product.image_base64
              ? `data:image/jpeg;base64,${product.image_base64}`
              : "https://via.placeholder.com/300x300"
          }
          alt={product.name}
          loading="lazy"
        />
      </div>
      <div className="mini-product-info">
        <h4 className="mini-product-name">{product.name}</h4>
        <p className="mini-product-brand">{product.brand}</p>
        <div className="mini-product-price">£{Number(product.price).toFixed(2)}</div>
      </div>
    </div>
  );
};

export default MiniProductCard;
