import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import Reports from '../pages/Reports';
import ProductManagement from '../pages/ProductManagement';
import SellerReports from '../pages/SellerReports';
import OrderManagement from '../pages/OrderManagement';

const Admin = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Allow both admin and seller roles
  if (!user.isAdmin && user.role !== 'seller') {
    return <Navigate to="/" />;
  }

  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="reports" element={<Reports />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="seller-reports" element={<SellerReports />} />
      <Route path="orders" element={<OrderManagement />} />
    </Routes>
  );
};

export default Admin;
