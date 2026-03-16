import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const attackColors = {
  email_phishing: '#ff7a59',
  credential_harvesting: '#ff4444',
  social_engineering: '#a855f7',
  malware_simulation: '#eab308',
  sim_swap: '#f97316',
  fileless_malware: '#ef4444',
  watering_hole: '#10b981',
  bec: '#ec4899',
  ai_deepfake: '#3dd6c6',
  supply_chain: '#6366f1'
};

const attackNames = {
  email_phishing: 'Email Phishing',
  credential_harvesting: 'Credential Harvesting',
  social_engineering: 'Social Engineering',
  malware_simulation: 'Malware Simulation',
  sim_swap: 'SIM Swap',
  fileless_malware: 'Fileless Malware',
  watering_hole: 'Watering Hole',
  bec: 'BEC',
  ai_deepfake: 'AI Deepfake',
  supply_chain: 'Supply Chain'
};

const ghostColors = {
  DORMANT: '#9dc0c3',
  SPAWNED: '#eab308',
  SPREADING: '#ff7a59',
  ESCALATING: '#ff4444',
  TERMINATED: '#3dd6c6',
  BREACHED: '#ff4444'
};
// for pulsating use class
const GhostIcon = ({ color, isPulsing }) => (
  // inline SVG ghost 16px
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color} className={isPulsing ? 'animate-pulse' : ''}>
    <path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z" />
    <circle cx="9" cy="11" r="1.5" fill="#07141F" />
    <circle cx="15" cy="11" r="1.5" fill="#07141F" />
  </svg>
);

const ScenarioList = () => {
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchScenarios = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 600)); // fake delay
      
      const mockData = [
        { id: 'sc-1', name: 'Q3 Invoice Phish', status: 'ACTIVE', attackTypes: ['email_phishing', 'credential_harvesting'], ghostState: 'SPREADING', compromisedCount: 14, reportedCount: 45, financialExposure: 15400, startedAt: 'Oct 12, 2026', completedAt: null },
        { id: 'sc-2', name: 'CEO Urgent Wire', status: 'COMPLETED', attackTypes: ['bec', 'social_engineering'], ghostState: 'TERMINATED', compromisedCount: 2, reportedCount: 112, financialExposure: 250000, startedAt: 'Sep 28, 2026', completedAt: 'Sep 30, 2026' },
        { id: 'sc-3', name: 'IT Helpdesk Reset', status: 'DRAFT', attackTypes: ['sim_swap', 'social_engineering'], ghostState: 'DORMANT', compromisedCount: 0, reportedCount: 0, financialExposure: 0, startedAt: null, completedAt: null },
        { id: 'sc-4', name: 'Zero-day Escalation', status: 'ACTIVE', attackTypes: ['ai_deepfake', 'fileless_malware'], ghostState: 'ESCALATING', compromisedCount: 42, reportedCount: 5, financialExposure: 84000, startedAt: 'Oct 14, 2026', completedAt: null }
      ];
      
      const filtered = filter === 'ALL' ? mockData : mockData.filter(s => s.status === filter);
      setScenarios(filtered);
      setLoading(false);
    };
    fetchScenarios();
  }, [filter]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 animate-slideInLeft">
        <h1 className="h1 text-[var(--as-accent2)] tracking-wider">SCENARIO COMMAND CENTER</h1>
        {user?.role === 'admin' && (
          <button onClick={() => navigate('/scenarios/new')} className="btn-primary shrink-0">
            LAUNCH NEW SCENARIO
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-2 border-b border-[var(--as-line)] pb-4 overflow-x-auto hide-scrollbar animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
        {['ALL', 'ACTIVE', 'COMPLETED', 'DRAFT'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 text-[11px] uppercase tracking-widest font-['Chakra_Petch'] border transition-colors whitespace-nowrap ${
              filter === tab 
                ? 'bg-[var(--as-accent)] border-[var(--as-accent)] text-[#08131b] font-bold' 
                : 'bg-transparent border-[var(--as-line)] text-[var(--as-muted)] hover:border-[var(--as-muted)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card h-[220px] animate-pulse bg-[rgba(61,214,198,0.06)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
          {scenarios.map((scen, i) => (
            <div key={scen.id} className="card flex flex-col gap-4 animate-fadeUp" style={{ animationDelay: `${i * 0.08}s` }}>
              {/* Top row */}
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-[15px] text-[var(--as-text)] uppercase">{scen.name}</h3>
                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest shrink-0 ${
                  scen.status === 'ACTIVE' ? 'text-[#ff4444]' : scen.status === 'COMPLETED' ? 'text-[var(--as-accent2)]' : 'text-[var(--as-muted)]'
                }`}>
                  {scen.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-[#ff4444] animate-pulse shadow-[0_0_4px_#ff4444]" />}
                  {scen.status}
                </div>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap gap-2 min-h-[22px]">
                {scen.attackTypes.map(type => (
                  <div key={type} className="text-[10px] uppercase font-['Chakra_Petch'] px-2 py-0.5 rounded-[3px]"
                       style={{ color: attackColors[type], backgroundColor: `${attackColors[type]}26`, border: `1px solid ${attackColors[type]}4d` }}>
                    {attackNames[type] || type}
                  </div>
                ))}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">Compromised</span>
                  <span className="text-[14px] font-bold text-[#ff4444]">{scen.compromisedCount}</span>
                </div>
                <div className="flex flex-col border-l border-[var(--as-line)] pl-3">
                  <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">Reported</span>
                  <span className="text-[14px] font-bold text-[#3dd6c6]">{scen.reportedCount}</span>
                </div>
                <div className="flex flex-col border-l border-[var(--as-line)] pl-3">
                  <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">Exposure</span>
                  <span className="text-[14px] font-bold text-[var(--as-accent)]">${scen.financialExposure.toLocaleString()}</span>
                </div>
              </div>

              {/* Timestamps & Ghost State */}
              <div className="flex flex-wrap justify-between items-center mt-2 border-t border-[var(--as-line)] pt-3 gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <GhostIcon color={ghostColors[scen.ghostState]} isPulsing={['ESCALATING', 'BREACHED'].includes(scen.ghostState)} />
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ghostColors[scen.ghostState] }}>{scen.ghostState}</span>
                </div>
                <div className="text-[10px] text-[var(--as-muted)] text-right">
                  {scen.startedAt ? `Started ${scen.startedAt}` : 'Not started'} {scen.completedAt && <><br/>Completed {scen.completedAt}</>}
                </div>
              </div>

              {/* Bottom links */}
              <div className="flex justify-between items-center mt-1 border-t border-[rgba(61,214,198,0.08)] pt-3">
                 <button onClick={() => navigate(`/scenarios/${scen.id}`)} className="text-[11px] text-[var(--as-accent2)] uppercase tracking-[0.15em] font-bold hover:brightness-125 transition-all border-b border-transparent hover:border-[var(--as-accent2)] pb-0.5">VIEW DETAILS →</button>
                 <button onClick={() => navigate(`/scenarios/${scen.id}/analytics`)} className="text-[11px] text-[var(--as-accent2)] uppercase tracking-[0.15em] font-bold hover:brightness-125 transition-all border-b border-transparent hover:border-[var(--as-accent2)] pb-0.5">ANALYTICS →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && scenarios.length > 0 && (
        <div className="flex justify-center gap-2 mt-4 animate-fadeUp">
          {[1, 2, 3].map(page => (
            <button key={page} className={`w-8 h-8 flex items-center justify-center font-['Chakra_Petch'] text-[12px] font-bold rounded transition-colors ${
              page === 1 ? 'bg-[var(--as-accent)] text-[#08131b] border border-[var(--as-line)]' : 'text-[var(--as-muted)] border border-[var(--as-line)] hover:border-[var(--as-accent2)]'
            }`}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScenarioList;
