import api from './api';

export const progressService = {
  record: async (data) => {
    const res = await api.post('/progress', data);
    return res.data;
  },
  getMemberHistory: async (memberId) => {
    const res = await api.get(`/progress/member/${memberId}`);
    return res.data;
  },
  getMy: async () => {
    const res = await api.get('/progress/my');
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/progress/${id}`);
    return res.data;
  },
};
