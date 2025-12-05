import axios from 'axios';
import { toast } from 'react-toastify';

// buat atau setting axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
});

// permintaan interceptor untuk menambahkan token ke header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor untuk menangani error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Jika backend tidak merespons (berhenti/network error/timeout)
    if (!error.response) {
      // Cek apakah ada token yang tersimpan
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        toast.error('Backend tidak dapat dijangkau. Silakan login kembali.');
        window.location.href = '/login';
      } else {
        toast.error('Backend tidak dapat dijangkau. Pastikan server berjalan.');
      }
      return Promise.reject(error);
    }
    
    // Jika backend mengembalikan status 401 atau 403
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = '/login';
    }
    
    if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else if (error.message) {
      toast.error(error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
