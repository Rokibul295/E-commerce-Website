import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Admin = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container container">
      <div className="auth-card">
        <h2>Admin Dashboard</h2>
        <p>Welcome, {user.name}. This is a simple admin panel placeholder.</p>
        <p>Implement admin features (product management, orders overview) here.</p>
      </div>
    </div>
  );
};

export default Admin;
