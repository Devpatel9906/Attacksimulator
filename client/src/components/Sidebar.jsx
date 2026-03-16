import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { 
  Grid2X2, 
  Terminal, 
  Activity, 
  BarChart, 
  DollarSign, 
  GitBranch, 
  Users, 
  Trophy, 
  Shield, 
  BookOpen, 
  Library, 
  Globe,
  LogOut,
  Send
} from 'lucide-react';

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

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      label: 'OPERATIONS',
      links: [
        { name: 'Dashboard', icon: <Grid2X2 size={16} />, path: '/dashboard' },
        { name: 'Send Phishing', icon: <Send size={16} />, path: '/send-phishing' },
        { name: 'Scenarios', icon: <Terminal size={16} />, path: '/scenarios' },
        { name: 'Live Map', icon: <Activity size={16} />, path: '/livemap' },
      ]
    },
    {
      label: 'INTELLIGENCE',
      links: [
        { name: 'Analytics', icon: <BarChart size={16} />, path: '/analytics' },
        { name: 'Financial Risk', icon: <DollarSign size={16} />, path: '/financial' },
        { name: 'Kill Chain', icon: <GitBranch size={16} />, path: '/killchain' },
      ]
    },
    {
      label: 'PEOPLE',
      links: [
        { name: 'Employees', icon: <Users size={16} />, path: '/org/employees' },
        { name: 'Leaderboard', icon: <Trophy size={16} />, path: '/leaderboard' },
        { name: 'Defender', icon: <Shield size={16} />, path: '/defender' },
      ]
    },
    {
      label: 'AWARENESS',
      links: [
        { name: 'Modules', icon: <BookOpen size={16} />, path: user?.role === 'admin' ? '/leaderboard' : '/me/modules' },
        { name: 'Knowledge Base', icon: <Library size={16} />, path: '/knowledge/normal' },
        { name: 'Threat Map', icon: <Globe size={16} />, path: '/knowledge/threatmap' },
      ]
    }
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[240px] flex flex-col z-50 bg-[rgba(7,20,31,0.95)] border-r border-[#3dd6c624]">
      
      {/* Logo Area */}
      <div className="flex flex-row items-center px-[20px] h-[64px] shrink-0 border-b border-[#3dd6c624] gap-3">
        <img src="/cybersec.webp" alt="AttackSimulator" className="h-8 w-8 object-contain rounded" onError={e => e.target.style.display='none'} />
        <span className="font-bold text-[13px] text-[#ff7a59] font-['Chakra_Petch']" style={{ letterSpacing: '0.05em' }}>
          ATTACK SIMULATOR
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 styled-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-4">
            <div 
              className="text-[10px] text-[#9dc0c3] uppercase opacity-50 px-[20px] py-[4px] font-['Chakra_Petch']"
              style={{ letterSpacing: '0.15em', padding: '16px 20px 4px' }}
            >
              {group.label}
            </div>
            {group.links.map((link, jIdx) => (
              <NavLink
                key={jIdx}
                to={link.path}
                className={({ isActive }) => `
                  flex items-center gap-[10px] py-[10px] px-[20px] 
                  font-['Chakra_Petch'] text-[12px] uppercase tracking-[0.1em]
                  transition-colors duration-200
                  ${isActive 
                    ? 'border-l-[3px] border-[#ff7a59] bg-[rgba(255,122,89,0.08)] text-[#ff7a59]' 
                    : 'text-[#9dc0c3] hover:text-[#edf7f7] hover:bg-[rgba(255,255,255,0.04)] border-l-[3px] border-transparent'}
                `}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User Chip */}
      <div className="border-t border-[#3dd6c624] p-[16px_20px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-[32px] h-[32px] rounded-full bg-[rgba(61,214,198,0.2)] text-[#3dd6c6] font-['Chakra_Petch'] text-[12px] flex items-center justify-center shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[13px] text-[#edf7f7] font-['Chakra_Petch'] truncate">
              {user?.name || 'Unknown User'}
            </span>
            <span className="bg-[rgba(255,122,89,0.15)] text-[#ff7a59] text-[10px] uppercase px-2 py-0.5 rounded-full w-fit mt-1">
              {user?.role || 'Guest'}
            </span>
          </div>
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

export default Sidebar;
