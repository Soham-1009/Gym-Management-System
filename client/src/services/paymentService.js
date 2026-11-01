import api from './api';

export const paymentService = {
  getAll: async (params) => {
    const res = await api.get('/payments', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  },
  record: async (paymentData) => {
    const res = await api.post('/payments', paymentData);
    return res.data;
  },
  getMy: async () => {
    const res = await api.get('/payments/my');
    return res.data;
  },
};
