import api from './api';

export const attendanceService = {
  checkIn: async (data) => {
    const res = await api.post('/attendance/check-in', data);
    return res.data;
  },
  checkOut: async (data) => {
    const res = await api.post('/attendance/check-out', data);
    return res.data;
  },
  getDaily: async (params) => {
    const res = await api.get('/attendance', { params });
    return res.data;
  },
  getMy: async () => {
    const res = await api.get('/attendance/my');
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/attendance/${id}`);
    return res.data;
  },
};
