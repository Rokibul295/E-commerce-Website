import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { ensureProductImage } from '../utils/imageHelper';
import './ProductManagement.css';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    img: '',
    description: '',
    stock: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const categories = ['Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ text: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        await api.put(`/products/${editingProduct._id}`, formData);
        setMessage({ text: 'Product updated successfully!', type: 'success' });
      } else {
        // Create product
        await api.post('/products', formData);
        setMessage({ text: 'Product created successfully!', type: 'success' });
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving product:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to save product', 
        type: 'error' 
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      img: product.img,
      description: product.description || '',
      stock: product.stock
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      setMessage({ text: 'Product deleted successfully!', type: 'success' });
      fetchProducts();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({ 
        text: error.response?.data?.message || 'Failed to delete product', 
        type: 'error' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Electronics',
      price: '',
      img: '',
      description: '',
      stock: ''
    });
  };

  const getStockClass = (stock) => {
    if (stock === 0) return 'stock-out';
    if (stock < 10) return 'stock-low';
    return 'stock-ok';
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="product-management">
      <div className="product-management-header">
        <h2>Product Management</h2>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }}>
          + Add New Product
        </button>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="product-form-modal">
          <div className="product-form-content">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  value={formData.img}
                  onChange={(e) => setFormData({...formData, img: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  No products found. Add your first product!
                </td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.img ? ensureProductImage(product) : '/images/placeholder.svg'} 
                      alt={product.name}
                      className="product-thumb"
                      onError={(e) => { e.currentTarget.src = ensureProductImage(product); }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.price}৳</td>
                  <td>
                    <span className={`stock-badge ${getStockClass(product.stock)}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
