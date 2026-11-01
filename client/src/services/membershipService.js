import api from './api';

export const membershipService = {
  getAll: async (params) => {
    const res = await api.get('/memberships', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/memberships/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/memberships', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/memberships/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/memberships/${id}`);
    return res.data;
  },
};
