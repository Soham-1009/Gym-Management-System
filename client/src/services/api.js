import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gym_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthenticated & 429 rate limiting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 Unauthorized / Token Expired.
      // Credential-check endpoints return 401/400 for wrong passwords; those must not log the user out.
      const url = error.config?.url || '';
      const isCredentialCheck = url.includes('/auth/login') || url.includes('/auth/updatepassword');
      if (error.response.status === 401 && !isCredentialCheck) {
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // 429 Rate Limited
      if (error.response.status === 429) {
        console.warn('API Rate Limit Exceeded:', error.response.data?.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
