import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

// kustom hook untuk menggunakan konteks autentikasi
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// penyedia konteks autentikasi
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memeriksa autentikasi
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getProfile();
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      // Hapus token jika validasi gagal (backend error, network error, dll)
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setLoading(false);
    };

    initAuth();

    // Validasi ulang token saat tab/window kembali aktif
    const handleVisibilityChange = () => {
      if (!document.hidden && localStorage.getItem('token')) {
        checkAuth();
      }
    };

    // Validasi ulang token saat window kembali fokus
    const handleFocus = () => {
      if (localStorage.getItem('token')) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isSecurityGuard: user?.role === 'SECURITY_GUARD'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
