import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [org, setOrg] = useState(null);
  
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();

  // Mock API Call data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API latency
      await new Promise(r => setTimeout(r, 800));
      
      const mockOrg = {
        name: 'Acme Corp',
        industry: 'FinTech',
        securityCultureBreakdown: {
          reportRate: 68,
          moduleCompletion: 92,
          scoreImprovement: 14
        }
      };

      const mockData = {
        overview: {
          totalEmployees: 1250,
          compromisedEmployees: 14,
          totalScenarios: 45,
          activeScenarios: 3,
          clickRate: 12.5,
          reportRate: 68,
          securityCultureScore: 78
        },
        departments: [
          { id: 1, name: 'Engineering', employees: 420, riskScore: 'LOW', securityScore: 88, status: 'SECURE' },
          { id: 2, name: 'Sales', employees: 215, riskScore: 'HIGH', securityScore: 42, status: 'VULNERABLE' },
          { id: 3, name: 'Marketing', employees: 85, riskScore: 'MEDIUM', securityScore: 65, status: 'ATTENTION' },
          { id: 4, name: 'HR', employees: 40, riskScore: 'LOW', securityScore: 91, status: 'SECURE' },
          { id: 5, name: 'Finance', employees: 110, riskScore: 'MEDIUM', securityScore: 58, status: 'ATTENTION' }
        ],
        recentScenarios: [
          { id: 'sc-1', name: 'Q3 Invoice Phish', status: 'ACTIVE', tags: ['EMAIL', 'FINANCE'], date: 'Oct 12, 2026' },
          { id: 'sc-2', name: 'CEO Urgent Wire', status: 'COMPLETED', tags: ['WHALING', 'SMS'], date: 'Sep 28, 2026' },
          { id: 'sc-3', name: 'IT Helpdesk Reset', status: 'DRAFT', tags: ['CREDENTIALS'], date: 'Nov 01, 2026' }
        ]
      };

      setOrg(mockOrg);
      setData(mockData);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-12 w-64 bg-[rgba(61,214,198,0.06)] rounded-md"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-[rgba(61,214,198,0.06)] rounded-lg"></div>
            ))}
        </div>
        <div className="h-64 bg-[rgba(61,214,198,0.06)] rounded-lg"></div>
        <div className="h-80 bg-[rgba(61,214,198,0.06)] rounded-lg"></div>
      </div>
    );
  }

  // Helper component for animated counting
  const AnimatedCounter = ({ value, isPercent, isFloat }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      let start = 0;
      const duration = 1500;
      const fps = 60;
      const totalFrames = Math.round((duration / 1000) * fps);
      let frame = 0;

      const increment = value / totalFrames;

      const timer = setInterval(() => {
        frame++;
        start += increment;
        
        if (frame === totalFrames) {
          clearInterval(timer);
          setCount(value);
        } else {
          setCount(start);
        }
      }, 1000 / fps);

      return () => clearInterval(timer);
    }, [value]);

    const displayVal = isFloat ? count.toFixed(1) : Math.round(count);
    return <span>{displayVal}{isPercent ? '%' : ''}</span>;
  };

  const getScoreColor = (score) => {
    if (score < 40) return '#ff4444';
    if (score <= 70) return '#ff7a59';
    return '#3dd6c6';
  };

  const overview = data.overview;
  
  // SVG Arc Calculations
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  // Arc sweeps 270 degrees (75% of a full circle)
  const arcStrokeDasharray = `${circumference * 0.75} ${circumference}`;
  const scorePercent = overview.securityCultureScore / 100;
  // Offset to animate the fill of the 270 degree arc
  const arcOffset = circumference * 0.75 * (1 - scorePercent);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-20">
      
      {/* 1. PAGE HEADER */}
      <div className="animate-slideInLeft flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[var(--as-line)] pb-4">
        <div>
          <h1 className="h1 text-[var(--as-accent2)] mb-2">THREAT INTELLIGENCE CENTER</h1>
          <div className="flex items-center gap-3">
            <span className="text-[var(--as-text)] text-lg tracking-wider">{org?.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(255,122,89,0.15)] text-[var(--as-accent)] text-[11px] uppercase tracking-widest font-bold border border-[rgba(255,122,89,0.3)]">
              {org?.industry}
            </span>
          </div>
        </div>
        <div className="text-[12px] text-[var(--as-muted)] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--as-accent2)] animate-pulse"></div>
          UPDATED JUST NOW
        </div>
      </div>

      {/* 2. KPI STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'TOTAL EMPLOYEES', val: overview.totalEmployees, color: 'text-[var(--as-accent2)]' },
          { label: 'COMPROMISED', val: overview.compromisedEmployees, color: 'text-[#ff4444]', alert: overview.compromisedEmployees > 0 },
          { label: 'ACTIVE SCENARIOS', val: overview.activeScenarios, color: 'text-[var(--as-accent)]', alert: overview.activeScenarios > 0 },
          { label: 'CLICK RATE', val: overview.clickRate, color: overview.clickRate > 25 ? 'text-[#ff7a59]' : overview.clickRate <= 15 ? 'text-[var(--as-accent2)]' : 'text-[var(--as-text)]', isPercent: true, isFloat: true },
          { label: 'REPORT RATE', val: overview.reportRate, color: overview.reportRate > 60 ? 'text-[var(--as-accent2)]' : 'text-[#ff7a59]', isPercent: true },
          { label: 'CULTURE SCORE', val: overview.securityCultureScore, color: `text-[${getScoreColor(overview.securityCultureScore)}]` }
        ].map((kpi, i) => (
          <div key={i} className="card p-5 flex flex-col justify-between animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-2 mb-2">
               {kpi.alert && <div className="status-dot"></div>}
               <div className={`text-3xl lg:text-4xl font-bold ${kpi.color} drop-shadow-md`}>
                 <AnimatedCounter value={kpi.val} isPercent={kpi.isPercent} isFloat={kpi.isFloat} />
               </div>
            </div>
            <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.1em] font-medium leading-tight">
              {kpi.label}
            </div>
          </div>
        ))}
      </div>

      {/* 3. SECURITY CULTURE SCORE CARD */}
      <div className="card grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fadeUp" style={{ animationDelay: '0.3s' }}>
        
        {/* SVG Arc Gauge */}
        <div className="flex flex-col items-center justify-center relative py-4">
           {/* SVG container manually sized, slightly rotated so the opening of the 270 degree arc is at the bottom */}
           <svg width="200" height="200" viewBox="0 0 200 200" className="transform rotate-135">
              {/* Background Arc */}
              <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(61,214,198,0.1)" strokeWidth="12" 
                      strokeDasharray={arcStrokeDasharray} strokeLinecap="round" />
              {/* Foreground Animated Arc */}
              <circle cx="100" cy="100" r={radius} fill="none" stroke={getScoreColor(overview.securityCultureScore)} strokeWidth="12" 
                      strokeDasharray={arcStrokeDasharray} strokeDashoffset={arcOffset} strokeLinecap="round" 
                      className="transition-all duration-1500 ease-out" 
                      style={{ transitionDuration: '1.5s', filter: `drop-shadow(0 0 8px ${getScoreColor(overview.securityCultureScore)}88)` }} />
           </svg>
           {/* Gauge Label Overlay */}
           <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
             <div className="text-5xl font-bold" style={{ color: getScoreColor(overview.securityCultureScore) }}>
               <AnimatedCounter value={overview.securityCultureScore} />
             </div>
             <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-widest mt-1 text-center w-24 leading-tight">
               Security<br/>Culture
             </div>
           </div>
        </div>

        {/* Culture Breakdown Bars */}
        <div className="flex flex-col gap-6 pe-4">
          {[
            { label: 'REPORT RATE', val: org?.securityCultureBreakdown.reportRate },
            { label: 'MODULE COMPLETION', val: org?.securityCultureBreakdown.moduleCompletion },
            { label: 'SCORE IMPROVEMENT', val: org?.securityCultureBreakdown.scoreImprovement }
          ].map((bar, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex justify-between text-[12px] uppercase tracking-widest">
                <span className="text-[var(--as-muted)]">{bar.label}</span>
                <span className="text-[var(--as-text)] font-bold">{bar.val}%</span>
              </div>
              <div className="h-[6px] w-full bg-[rgba(61,214,198,0.15)] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${bar.val}%`, 
                    background: 'linear-gradient(90deg, var(--as-accent2), var(--as-accent))',
                    boxShadow: '0 0 10px rgba(61,214,198,0.5)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DEPARTMENT RISK TABLE */}
      <div className="card animate-fadeUp overflow-x-auto" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-[14px] text-[var(--as-accent2)] uppercase tracking-[0.1em] mb-4 font-semibold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
          Department Risk Overview
        </h3>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider border-b border-[rgba(61,214,198,0.15)]">
              <th className="pb-3 px-2 font-medium">Department</th>
              <th className="pb-3 px-2 font-medium">Employees</th>
              <th className="pb-3 px-2 font-medium">Risk Status</th>
              <th className="pb-3 px-2 font-medium">Sec. Score</th>
              <th className="pb-3 px-2 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.departments.map((dep, i) => (
              <tr key={dep.id} className="text-[14px] text-[var(--as-text)] border-b border-[rgba(61,214,198,0.08)] hover:bg-[rgba(61,214,198,0.04)] transition-colors animate-fadeUp" style={{ animationDelay: `${0.5 + (i * 0.06)}s` }}>
                <td className="py-3 px-2 font-medium">{dep.name}</td>
                <td className="py-3 px-2 text-[var(--as-muted)]">{dep.employees}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] uppercase tracking-widest font-bold border ${
                    dep.riskScore === 'HIGH' ? 'bg-[#ff4444]/20 text-[#ff4444] border-[#ff4444]/40' :
                    dep.riskScore === 'MEDIUM' ? 'bg-[var(--as-accent)]/20 text-[var(--as-accent)] border-[var(--as-accent)]/40' :
                    'bg-[var(--as-accent2)]/20 text-[var(--as-accent2)] border-[var(--as-accent2)]/40'
                  }`}>
                    {dep.riskScore}
                  </span>
                </td>
                <td className="py-3 px-2 font-mono">{dep.securityScore}</td>
                <td className="py-3 px-2 text-[10px] text-[var(--as-muted)]">{dep.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. RECENT SCENARIOS (Horizontal Scroll) */}
      <div className="animate-fadeUp flex flex-col gap-4" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-[14px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Recent Scenarios
        </h3>
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
          {data.recentScenarios.map((scen, i) => (
            <div key={scen.id} onClick={() => navigate(`/scenarios/${scen.id}`)} className="card min-w-[240px] flex-shrink-0 flex flex-col gap-3 cursor-pointer hover:-translate-y-1 transition-transform snap-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--as-accent2)] opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity"></div>
              <div className="flex justify-between items-start">
                <span className="text-[14px] font-bold text-[var(--as-text)] truncate pr-2 leading-tight">{scen.name}</span>
                <span className={`text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                  scen.status === 'ACTIVE' ? 'bg-[var(--as-accent)]/20 text-[var(--as-accent)]' :
                  scen.status === 'COMPLETED' ? 'bg-[var(--as-accent2)]/20 text-[var(--as-accent2)]' :
                  'bg-[var(--as-text)]/10 text-[var(--as-muted)]'
                }`}>
                  {scen.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--as-accent)] animate-pulse shadow-[0_0_4px_var(--as-accent)]"></span>}
                  {scen.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {scen.tags.map(tag => (
                  <span key={tag} className="text-[9px] bg-[rgba(7,20,31,0.5)] border border-[rgba(61,214,198,0.15)] text-[var(--as-muted)] px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>
              <div className="text-[10px] text-[var(--as-muted)] mt-auto pt-2 flex items-center gap-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {scen.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. QUICK ACTIONS */}
      <div className="flex flex-wrap gap-4 animate-fadeUp" style={{ animationDelay: '0.7s' }}>
        {user?.role === 'admin' && (
          <button className="btn-primary text-[12px] flex items-center gap-2 shadow-[0_0_15px_rgba(255,122,89,0.3)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            LAUNCH SCENARIO
          </button>
        )}
        <button className="btn-ghost text-[12px] flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          ORG EMPLOYEES
        </button>
        <button className="btn-ghost text-[12px] flex items-center gap-2 border-[var(--as-muted)] text-[var(--as-muted)] hover:border-[var(--as-text)] hover:text-[var(--as-text)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          BOARD REPORT
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
