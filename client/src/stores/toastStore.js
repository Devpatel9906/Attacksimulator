import { create } from 'zustand';

const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    const newToast = { id, type: 'info', ...toast };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  success: (message) => useToastStore.getState().addToast({ message, type: 'success' }),
  error:   (message) => useToastStore.getState().addToast({ message, type: 'error' }),
  info:    (message) => useToastStore.getState().addToast({ message, type: 'info' }),
}));

export default useToastStore;
