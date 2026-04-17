import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // 1. Nếu đang load hoặc chưa có user thì đá về login
  if (!user) {
    return <Navigate to="/dang-nhap" replace />;
  }

  // 2. Nếu role không nằm trong danh sách cho phép thì đá về trang chủ
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;