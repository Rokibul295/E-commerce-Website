import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { products as frontendProducts } from '../data/products';
import { recommendationAPI } from '../services/api';
import { ensureProductsImages } from '../utils/imageHelper';
import Recommendations from './Recommendations';
import ProductReviews from './ProductReviews';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // compute category list whenever products update
  useEffect(() => {
    const cats = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    setCategoriesList(cats);
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // compute filtered products whenever products or filters change
  useEffect(() => {
    const filtered = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || p.category === category;
      const matchesPrice = p.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });
    setFilteredProducts(filtered);
  }, [products, search, category, maxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch products from API (database)
      const res = await api.get('/products');
      console.log('Products fetched from API:', res.data);
      
      if (res.data && Array.isArray(res.data)) {
        // If API returns empty array, use fallback products
        if (res.data.length === 0) {
          console.log('No products in database, using fallback products');
          const fallbackProducts = ensureProductsImages(frontendProducts);
          setProducts(fallbackProducts);
          setFilteredProducts(fallbackProducts);
        } else {
          // Ensure all products have valid images
          const productsWithImages = ensureProductsImages(res.data);
          setProducts(productsWithImages);
          setFilteredProducts(productsWithImages);
        }
      } else {
        throw new Error('Invalid products data');
      }
    } catch (error) {
      console.error('Error loading products from API:', error);
      setError('Failed to load products from server. Using fallback data.');
      // Fallback to frontend products if API fails (they already have images)
      const fallbackProducts = ensureProductsImages(frontendProducts);
      setProducts(fallbackProducts);
      setFilteredProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };


  const addToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    if (!productId) {
      alert('Invalid product ID');
      return;
    }

    try {
      console.log('Adding product to cart:', productId);
      const res = await api.post('/cart', { productId, quantity: 1 });
      console.log('Product added to cart:', res.data);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to add product to cart';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        if (error.response.status === 401) {
          errorMessage = 'Please login to add items to cart';
        } else if (error.response.status === 404) {
          errorMessage = 'Product not found. Please refresh the page.';
        }
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else {
        errorMessage = error.message || 'Failed to add product to cart';
      }
      
      alert(errorMessage);
    }
  };

  const orderNow = async (productId) => {
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!productId) {
      alert('Invalid product ID');
      return;
    }

    try {
      console.log('Ordering product:', productId);
      // Add product to cart first
      await api.post('/cart', { productId, quantity: 1 });
      console.log('Product added to cart, navigating to cart...');
      
      // Navigate to cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error ordering product:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to place order';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        if (error.response.status === 401) {
          errorMessage = 'Please login to place an order';
          navigate('/login');
          return;
        } else if (error.response.status === 404) {
          errorMessage = 'Product not found. Please refresh the page.';
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
      } else {
        errorMessage = error.message || 'Failed to place order';
      }
      
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }


  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="product-list-container container">
      {error && (
        <div className="offline-banner card">
          <div>
            <strong>Error</strong> — {error}
          </div>
          <div>
            <button className="btn-ghost" onClick={fetchProducts}>Retry</button>
          </div>
        </div>
      )}


      <div className="category-bar">
        {categoriesList.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {c}
            {c !== 'All' && (
              <span className="count">{` (${categoryCounts[c] || 0})`}</span>
            )}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="text"
          id="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoriesList.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div className="price-box">
          <input
            type="range"
            id="priceRange"
            min="0"
            max="200000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <span id="priceDisplay">Max Price: {maxPrice.toLocaleString()}৳</span>
        </div>
      </div>

      <Recommendations />

      <div className="grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products found</p>
        ) : (
          filteredProducts.map((product) => (
            <div 
              key={product._id} 
              className="product-card card"
              onClick={() => trackProductView(product._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="image-wrap">
                <div className="ribbon">{product.category}</div>
                <img
                  src={product.img || '/images/placeholder.svg'}
                  alt={product.name}
                  className="img-cover"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                />
                <div className="price-badge">{product.price}৳</div>
                {product.averageRating > 0 && (
                  <div className="rating-badge">
                    <span>★</span>
                    <span>{product.averageRating}</span>
                    <span>({product.reviewCount || 0})</span>
                  </div>
                )}
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="muted small">{product.description}</p>
                <div className="product-buttons">
                  <button 
                    className="btn-primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product._id);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="btn-order" 
                    onClick={(e) => {
                      e.stopPropagation();
                      orderNow(product._id);
                    }}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;

