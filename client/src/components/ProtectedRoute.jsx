import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isLoading } = useAuthStore();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#07141f] z-[9999] flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9dc0c3" strokeWidth="1.5" className="animate-bounce">
            <path d="M12 2a10 10 0 0 0-10 10c0 4.42 3.58 8 8 8v1h4v-1c4.42 0 8-3.58 8-8a10 10 0 0 0-10-10z"/>
            <path d="M9 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
            <path d="M12 16c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z"/>
          </svg>
           <div className="absolute inset-0 bg-[var(--as-accent2)] blur-2xl opacity-10 rounded-full animate-pulse" />
        </div>
        <div className="text-[12px] font-bold text-[var(--as-muted)] uppercase tracking-[0.3em] font-['Chakra_Petch']">
          Loading Access Console...
        </div>
      </div>
    );
  }

  // 2. Auth Check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role Check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have the role, redirect to their home
    if (user.role === 'employee') {
      return <Navigate to="/me" replace />;
    }
    // Admin/Analyst/Defender default
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
