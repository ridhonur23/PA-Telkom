import api from './api';

// layanan untuk operasi terkait kategori
const categoryService = {
  // mendapatkan semua kategori dengan parameter opsional untuk filter, pagination, dll.
  getCategories: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  // mendapatkan kategori berdasarkan ID
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // membuat kategori baru
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // memperbarui kategori
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // menghapus kategori
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
