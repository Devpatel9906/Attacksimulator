import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',  // Use relative path for Vite proxy to catch
  withCredentials: true // CRITICAL on every request, auth is in httpOnly cookie
});

// 401 interceptor: clear user from auth store, redirect to /login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const cyberguardApi = {
  generateTemplates: (data) => api.post('/api/cyberguard/templates', data),
  explainRedFlags: (data) => api.post('/api/cyberguard/explain', data),
  analyzeRisk: (data) => api.post('/api/cyberguard/analyze', data),
};

export default api;
