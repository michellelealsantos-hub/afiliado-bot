import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout')
};

// Config API
export const configAPI = {
  saveAffiliate: (platform, config) =>
    api.post('/config/affiliate', { platform, config }),
  getAffiliate: () => api.get('/config/affiliate'),
  getPlatformConfig: (platform) =>
    api.get(`/config/affiliate/${platform}`),
  deleteAffiliate: (platform) =>
    api.delete(`/config/affiliate/${platform}`)
};

// Groups API
export const groupsAPI = {
  updateMonitor: (groups) =>
    api.post('/groups/monitor', { groups }),
  updatePostTarget: (groups) =>
    api.post('/groups/post-target', { groups }),
  getMonitored: () => api.get('/groups'),
  getList: () => api.get('/groups/list')
};

// WhatsApp API
export const whatsappAPI = {
  getQrCode: () => api.get('/whatsapp/qr'),
  getStatus: () => api.get('/whatsapp/status'),
  disconnect: () => api.post('/whatsapp/disconnect'),
  getGroups: () => api.get('/whatsapp/groups')
};

export default api;
