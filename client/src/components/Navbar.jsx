import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { LogOut } from 'lucide-react';

const GhostSkullIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z" 
      fill="currentColor"
    />
    <circle cx="9" cy="11" r="1.5" fill="#07141F" />
    <circle cx="15" cy="11" r="1.5" fill="#07141F" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-[56px] sticky top-0 z-[100] bg-[rgba(13,34,48,0.9)] backdrop-blur-[16px] border-b border-[#3dd6c624] flex justify-between items-center px-[24px]">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        <GhostSkullIcon className="w-[20px] h-[20px] text-[#ff7a59]" />
        <span className="font-bold text-[13px] text-[#ff7a59] font-['Chakra_Petch']" style={{ letterSpacing: '0.05em' }}>
          ATTACK SIMULATOR
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[#edf7f7] font-['Chakra_Petch']">
            {user?.name || 'Unknown User'}
          </span>
          <span className="bg-[rgba(255,122,89,0.15)] text-[#ff7a59] text-[10px] uppercase px-2 py-0.5 rounded-full">
            {user?.role || 'Guest'}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-[#9dc0c3] hover:text-[#ff7a59] transition-colors p-1"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
      
    </div>
  );
};

export default Navbar;
