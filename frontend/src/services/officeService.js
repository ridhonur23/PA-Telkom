import api from './api';

// layanan untuk operasi terkait kantor
const officeService = {
  // mendapatkan semua kantor dengan parameter opsional untuk filter, pagination, dll.
  getOffices: async (params = {}) => {
    const response = await api.get('/offices', { params });
    return response.data;
  },

  // mendapatkan kantor berdasarkan ID
  getOffice: async (id) => {
    const response = await api.get(`/offices/${id}`);
    return response.data;
  },

  // membuat kantor baru
  createOffice: async (officeData) => {
    const response = await api.post('/offices', officeData);
    return response.data;
  },

  // memperbarui kantor
  updateOffice: async (id, officeData) => {
    const response = await api.put(`/offices/${id}`, officeData);
    return response.data;
  },

  // menghapus kantor
  deleteOffice: async (id) => {
    const response = await api.delete(`/offices/${id}`);
    return response.data;
  }
};

export default officeService;
