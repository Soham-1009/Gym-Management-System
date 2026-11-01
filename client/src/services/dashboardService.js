import api from './api';

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

export default dashboardService;
