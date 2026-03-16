import React from 'react';
import useToastStore from '../stores/toastStore';

export default function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`card animate-slideInRight pointer-events-auto min-w-[300px] flex items-center justify-between shadow-2xl transition-all duration-300`}
          style={{ 
            padding: '12px 20px', 
            background: 'rgba(13,34,48,0.95)', 
            borderColor: toast.type === 'success' ? '#3dd6c6' : toast.type === 'error' ? '#ff4444' : '#ff7a59',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '6px'
          }}
        >
          <div className="flex items-center gap-3">
             {toast.type === 'success' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
             {toast.type === 'error' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
             {toast.type === 'info' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
             <span className="text-[13px] font-bold text-[var(--as-text)] font-['Chakra_Petch'] uppercase tracking-wider">{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
