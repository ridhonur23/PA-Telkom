import api from './api';

// layanan untuk operasi terkait pinjaman
const loanService = {
  // mendapatkan semua pinjaman dengan parameter opsional untuk filter, pagination, dll.
  getLoans: async (params = {}) => {
    const response = await api.get('/loans', { params });
    return response.data;
  },

  // mendapatkan pinjaman berdasarkan ID
  getLoan: async (id) => {
    const response = await api.get(`/loans/${id}`);
    return response.data;
  },

  // membuat pinjaman baru
  createLoan: async (loanData) => {
    const response = await api.post('/loans', loanData);
    return response.data;
  },

  // memperbarui pinjaman
  returnAsset: async (id, notes) => {
    const response = await api.patch(`/loans/${id}/return`, { notes });
    return response.data;
  },

  // menandai pinjaman sebagai terlambat
  markOverdue: async (id) => {
    const response = await api.patch(`/loans/${id}/overdue`);
    return response.data;
  },

  // mengekspor data pinjaman ke file Excel
  exportExcel: async (params = {}) => {
    const response = await api.get('/loans/export/xlsx', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default loanService;
