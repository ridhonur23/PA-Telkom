import api from './api';

// layanan untuk operasi terkait aset
const assetService = {
  // mendapatkan semua aset dengan parameter opsional untuk filter, pagination, dll.
  getAssets: async (params = {}) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  // mendapatkan aset berdasarkan ID
  getAsset: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // membuat aset baru
  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  // memperbarui aset
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return response.data;
  },

  // menghapus aset
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  }
};

export default assetService;
