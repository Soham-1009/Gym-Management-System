import api from './api';

export const trainerService = {
  getAll: async (params) => {
    const res = await api.get('/trainers', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/trainers/${id}`);
    return res.data;
  },
  create: async (trainerData) => {
    const res = await api.post('/trainers', trainerData);
    return res.data;
  },
  update: async (id, trainerData) => {
    const res = await api.put(`/trainers/${id}`, trainerData);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/trainers/${id}`);
    return res.data;
  },
  getAssignedMembers: async (id) => {
    const res = await api.get(`/trainers/${id}/members`);
    return res.data;
  },
};
