import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import './ProductList.css';

// Demo fallback products for offline/dev mode
const demoProducts = [
  { _id: 'demo-1', name: 'Ceramic Coffee Mug', category: 'Home', price: 450, img: '/images/placeholder.svg', description: 'Handmade ceramic coffee mug' },
  { _id: 'demo-2', name: 'Classic T-Shirt', category: 'Clothing', price: 500, img: '/images/placeholder.svg', description: 'Comfortable cotton t-shirt' },
  { _id: 'demo-3', name: 'Wireless Headphones', category: 'Electronics', price: 2500, img: '/images/placeholder.svg', description: 'High-quality wireless headphones' },
  { _id: 'demo-4', name: 'Leather Backpack', category: 'Accessories', price: 3200, img: '/images/placeholder.svg', description: 'Durable leather backpack for everyday carry' },
  { _id: 'demo-5', name: 'Running Shoes', category: 'Footwear', price: 1800, img: '/images/placeholder.svg', description: 'Comfortable running shoes' }
];

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [categoriesList, setCategoriesList] = useState(['All']);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineDemo, setOfflineDemo] = useState(false);
  const { user } = useAuth();

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
      setOfflineDemo(false);
      const res = await api.get('/products');
      console.debug('Products fetched:', res.data);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Error details:', error.response?.data || error.message);
      const message = error.response?.data?.message || error.message || 'Unknown error';
      setError(message);

      // Use demo products as an offline fallback so the UI remains usable
      console.warn('Falling back to demo products');
      setProducts(demoProducts);
      setOfflineDemo(true);
      setFilteredProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  };


  const addToCart = async (productId) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const res = await api.post('/cart', { productId, quantity: 1 });
      console.log('Product added to cart:', res.data);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product to cart';
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  // Render a small offline banner if we are using demo products due to an error
  
  if (!loading && offlineDemo) {
    // continue to render product list but show a banner — user can retry
    // (no early return)
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

      {offlineDemo && (
        <div className="offline-banner card">
          <div>
            <strong>Offline demo</strong> — the backend is unreachable, showing demo products.
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
            max="5000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <span id="priceDisplay">Max Price: {maxPrice}৳</span>
        </div>
      </div>

      <div className="grid">
        {filteredProducts.length === 0 ? (
          <p className="no-products">No products found</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card card">
              <div className="image-wrap">
                <div className="ribbon">{product.category}</div>
                <img
                  src={product.img || '/images/placeholder.svg'}
                  alt={product.name}
                  className="img-cover"
                  onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
                />
                <div className="price-badge">{product.price}৳</div>
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="muted small">{product.description}</p>
                <button className="btn-primary" onClick={() => addToCart(product._id)}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;

