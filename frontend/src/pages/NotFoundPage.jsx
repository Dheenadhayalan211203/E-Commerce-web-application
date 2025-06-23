import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="stars">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="star" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`
          }} />
        ))}
      </div>
      
      <div className="not-found-content">
        <div className="glitch-container">
          <h1 className="glitch" data-text="404">404</h1>
          <h2 className="subtitle">Page Not Found</h2>
        </div>
        
        <p className="description">
          Oops! The page you're looking for has vanished into the digital void.
        </p>
        
        <div className="astronaut">
          <div className="helmet"></div>
          <div className="face">
            <div className="eyes">
              <div className="eye left"></div>
              <div className="eye right"></div>
            </div>
            <div className="mouth"></div>
          </div>
        </div>
        
        <Link to="/" className="home-button">
          <span className="button-text">Beam Me Home</span>
          <span className="button-icon">→</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;