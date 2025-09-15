import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const dashboardApi = {
  getKPIs: async () => {
    const response = await api.get('/dashboard/kpis');
    return response.data;
  },
  getRevenueProgress: async () => {
    const response = await api.get('/dashboard/revenue');
    return response.data;
  },
  getPipelineFunnel: async () => {
    const response = await api.get('/dashboard/pipeline');
    return response.data;
  },
  getTeamPerformance: async () => {
    const response = await api.get('/dashboard/team');
    return response.data;
  },
};