import api from './api';

// layanan untuk operasi terkait autentikasi
const authService = {
  // fungsi untuk login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // fungsi untuk registrasi
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // fungsi untuk mendapatkan profil user saat ini
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // fungsi untuk logout
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default authService;
