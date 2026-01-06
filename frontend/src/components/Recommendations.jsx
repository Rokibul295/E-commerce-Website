import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { recommendationAPI } from '../services/api';
import { ensureProductImage } from '../utils/imageHelper';
import './Recommendations.css';

const Recommendations = ({ onDismiss }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState(
    JSON.parse(localStorage.getItem('dismissedRecommendations') || '[]')
  );
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationAPI.getRecommendations();
      // Backend already filters dismissed recommendations, but keep local filter as backup
      const filtered = res.data.recommendations.filter(
        rec => !dismissedIds.includes(rec._id)
      );
      // Ensure all recommendations have valid images
      const recommendationsWithImages = filtered.map(product => ({
        ...product,
        img: ensureProductImage(product)
      }));
      setRecommendations(recommendationsWithImages);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (productId) => {
    try {
      // Store in backend
      await recommendationAPI.dismissRecommendation(productId);
      
      // Also store locally for immediate UI update
      const newDismissed = [...dismissedIds, productId];
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedRecommendations', JSON.stringify(newDismissed));
      setRecommendations(recommendations.filter(r => r._id !== productId));
      
      if (onDismiss) {
        onDismiss(productId);
      }
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      // Still update UI even if backend call fails
      const newDismissed = [...dismissedIds, productId];
      setDismissedIds(newDismissed);
      localStorage.setItem('dismissedRecommendations', JSON.stringify(newDismissed));
      setRecommendations(recommendations.filter(r => r._id !== productId));
    }
  };

  const handleProductClick = async (productId) => {
    // Track view for recommendations
    try {
      await recommendationAPI.trackView(productId);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
    // Navigate to product or scroll to it
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return null; // Don't show recommendations for non-logged-in users
  }

  if (loading) {
    return (
      <div className="recommendations-section">
        <h3>Recommended for You</h3>
        <div className="loading">Loading recommendations...</div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-section">
      <div className="recommendations-header">
        <h3>✨ Recommended for You</h3>
        <p className="recommendations-subtitle">Based on your purchase history</p>
      </div>
      <div className="recommendations-grid">
        {recommendations.map(product => (
          <div key={product._id} className="recommendation-card">
            <button
              className="dismiss-btn"
              onClick={() => handleDismiss(product._id)}
              title="Hide this recommendation"
            >
              ×
            </button>
            <div 
              className="recommendation-content"
              onClick={() => handleProductClick(product._id)}
            >
              <img
                src={ensureProductImage(product)}
                alt={product.name}
                onError={(e) => { e.currentTarget.src = ensureProductImage(product); }}
              />
              <div className="recommendation-info">
                <h4>{product.name}</h4>
                <p className="recommendation-reason">{product.reason}</p>
                <div className="recommendation-rating">
                  {product.averageRating > 0 && (
                    <span className="rating">
                      ★ {product.averageRating} ({product.reviewCount})
                    </span>
                  )}
                </div>
                <p className="recommendation-price">{product.price}৳</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
