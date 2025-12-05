import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoanManagement from './pages/LoanManagement';
import AssetManagement from './pages/AssetManagement';
import CategoryManagement from './pages/CategoryManagement';
import UserManagement from './pages/UserManagement';
import OfficeManagement from './pages/OfficeManagement';
import LoanHistory from './pages/LoanHistory';
import LoadingSpinner from './components/LoadingSpinner';

// proteksi rute berdasarkan autentikasi dan peran

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="loans" element={<LoanManagement />} />
          <Route path="assets" element={<AssetManagement />} />
          <Route path="categories" element={
            <ProtectedRoute adminOnly>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="offices" element={
            <ProtectedRoute adminOnly>
              <OfficeManagement />
            </ProtectedRoute>
          } />
          <Route path="history" element={<LoanHistory />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
