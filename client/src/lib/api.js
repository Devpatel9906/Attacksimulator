import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',  // Use relative path for Vite proxy to catch
  withCredentials: true // CRITICAL on every request, auth is in httpOnly cookie
});

// 401 interceptor: only redirect to login when the session check (/api/auth/me) fails.
// Other 401s (e.g. /api/employees when using demo login without a cookie) are rejected
// so the page can show an error instead of redirecting.
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || err.config?.baseURL || '';
      const isSessionCheck = String(url).includes('/api/auth/me');
      if (isSessionCheck && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
