import { create } from 'zustand';
import api from '../lib/api';

// Demo accounts (mock when backend is unavailable)
const DEMO_USERS = {
  'sarah.chen@acmecorp.com':  { id: 'u1', name: 'Sarah Chen',  role: 'admin',    organizationId: 'org-acme', pass: 'Admin@123456' },
  'marcus.webb@acmecorp.com': { id: 'u2', name: 'Marcus Webb', role: 'analyst',  organizationId: 'org-acme', pass: 'Analyst@123456' },
  'james.ford@acmecorp.com':  { id: 'u3', name: 'James Ford',  role: 'defender', organizationId: 'org-acme', pass: 'Defender@123456' },
};

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/api/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const normalized = email.trim().toLowerCase();

    // Real API attempt
    try {
      const { data } = await api.post('/api/auth/login', { email: normalized, password });
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    const { data } = await api.post('/api/auth/register', payload);
    return data;
  },

  logout: async () => {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    set({ user: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
