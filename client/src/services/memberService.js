import api from './api';

export const memberService = {
  getAll: async (params) => {
    const res = await api.get('/members', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },
  create: async (memberData) => {
    const res = await api.post('/members', memberData);
    return res.data;
  },
  update: async (id, memberData) => {
    const res = await api.put(`/members/${id}`, memberData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/members/${id}`);
    return res.data;
  },
  assignMembership: async (id, payload) => {
    const res = await api.post(`/members/${id}/assign-membership`, payload);
    return res.data;
  },
};
