import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="header-logo">
          <h1>Modern <span className="accent">Store</span></h1>
        </Link>
        <nav className="header-nav">
          <Link to="/">Products</Link>
          {user ? (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">Orders</Link>
              {user?.isAdmin && <Link to="/admin">Admin</Link>}
              <span className="user-name">Hello, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

