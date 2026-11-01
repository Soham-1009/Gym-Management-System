import api from './api';

export const reportService = {
  getAnalytics: async (params) => {
    const res = await api.get('/reports/analytics', { params });
    return res.data;
  },
  getExport: async (params) => {
    const res = await api.get('/reports/export', { params });
    return res.data;
  },
};

export const dashboardService = {
  getAdminStats: async () => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },
  getTrainerStats: async () => {
    const res = await api.get('/dashboard/trainer');
    return res.data;
  },
  getMemberStats: async () => {
    const res = await api.get('/dashboard/member');
    return res.data;
  },
};
