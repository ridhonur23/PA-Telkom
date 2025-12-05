import api from './api';

// layanan untuk operasi terkait dashboard
const dashboardService = {
  // fungsi untuk mendapatkan statistik dashboard
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  // fungsi untuk mendapatkan data chart
  getChartData: async () => {
    const response = await api.get('/dashboard/chart/loans');
    return response.data;
  }
};

export default dashboardService;
