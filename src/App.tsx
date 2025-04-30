import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeAdminUser } from './services/userService';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AuthLayout from './components/layout/AuthLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserChat from './pages/user/Chat';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminChat from './pages/admin/Chat';

function AppContent() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.isAdmin) {
      initializeAdminUser(currentUser);
    }
  }, [currentUser]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/chat" element={<UserChat />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/chat/:userId" element={<AdminChat />} />
        </Route>

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;