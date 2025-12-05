import api from './api';

// layanan untuk operasi terkait user
const userService = {
  // mendapatkan semua user dengan parameter opsional untuk filter, pagination, dll.
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /// mendapatkan user berdasarkan ID
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // memperbarui user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  // menghapus user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export default userService;
