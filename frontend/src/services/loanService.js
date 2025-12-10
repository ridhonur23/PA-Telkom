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

  // membuat pinjaman baru dengan foto
  createLoan: async (loanData) => {
    const formData = new FormData();
    
    // Tambahkan semua field ke FormData
    Object.keys(loanData).forEach(key => {
      if (loanData[key] !== null && loanData[key] !== undefined) {
        formData.append(key, loanData[key]);
      }
    });
    
    const response = await api.post('/loans', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // pengembalian aset dengan foto
  returnAsset: async (id, returnData) => {
    const formData = new FormData();
    
    // Tambahkan notes jika ada
    if (returnData.notes) {
      formData.append('notes', returnData.notes);
    }
    
    // Tambahkan foto jika ada
    if (returnData.returnPhoto) {
      formData.append('returnPhoto', returnData.returnPhoto);
    }
    
    const response = await api.patch(`/loans/${id}/return`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
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
