import React, { useEffect, useRef } from 'react';
import useAuthStore from '../stores/authStore';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const vantaRef = useRef(null);
  const { user } = useAuthStore();
  
  useEffect(() => {
    let vantaEffect = null;
    
    const loadScripts = async () => {
      // Load three.js first
      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        threeScript.async = false; // ensure synchronous execution in order
        document.body.appendChild(threeScript);
        await new Promise(r => { threeScript.onload = r; });
      }
      
      // Load vanta.net after three.js
      if (!window.VANTA) {
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
        vantaScript.async = false;
        document.body.appendChild(vantaScript);
        await new Promise(r => { vantaScript.onload = r; });
      }
      
      // Initialize effect
      if (window.VANTA && window.VANTA.NET && !vantaEffect) {
        vantaEffect = window.VANTA.NET({
          el: vantaRef.current,
          color: 0x3dd6c6,
          backgroundColor: 0x000000,
          points: 10,
          maxDistance: 22,
          spacing: 18,
          mouseControls: false,
          touchControls: false,
        });
      }
    };
    
    loadScripts().catch(console.error);
    
    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  const allowedRoles = ['admin', 'analyst', 'defender'];
  const hasSidebarAccess = user && allowedRoles.includes(user?.role);

  return (
    <>
      <div 
        ref={vantaRef} 
        id="vanta-bg" 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.38 }}
      />
      
      {hasSidebarAccess && <Sidebar />}
      
      <div 
        className="relative z-10"
        style={{ 
          marginLeft: hasSidebarAccess ? '240px' : '0',
          minHeight: '100vh',
          padding: '32px',
          overflowY: 'auto'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default Layout;
