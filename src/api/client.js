import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise API errors and auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 && !err.config.url.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;