import api from './api';

export const workoutService = {
  getExercises: async (params) => {
    const res = await api.get('/workouts/exercises', { params });
    return res.data;
  },
  createExercise: async (data) => {
    const res = await api.post('/workouts/exercises', data);
    return res.data;
  },
  getAllPlans: async (params) => {
    const res = await api.get('/workouts', { params });
    return res.data;
  },
  getPlanById: async (id) => {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
  },
  createPlan: async (planData) => {
    const res = await api.post('/workouts', planData);
    return res.data;
  },
  updatePlan: async (id, planData) => {
    const res = await api.put(`/workouts/${id}`, planData);
    return res.data;
  },
  deletePlan: async (id) => {
    const res = await api.delete(`/workouts/${id}`);
    return res.data;
  },
  getMyPlan: async () => {
    const res = await api.get('/workouts/my');
    return res.data;
  },
};
