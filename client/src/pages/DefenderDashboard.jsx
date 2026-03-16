import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const GHOST_STATE_CONFIG = {
  DORMANT:    { color: '#9dc0c3', icon: '●', pulse: false },
  SPAWNED:    { color: '#eab308', icon: '⚡', pulse: true  },
  PROFILING:  { color: '#3b82f6', icon: '👁', pulse: false },
  SPREADING:  { color: '#ff7a59', icon: '☠', pulse: true  },
  ESCALATING: { color: '#ff4444', icon: '☠', pulse: true  },
  TERMINATED: { color: '#3dd6c6', icon: '✓', pulse: false },
  BREACHED:   { color: '#ff4444', icon: '🚨', pulse: true  },
};

const BORDER_COLOR = {
  SPREADING: '#ff4444', ESCALATING: '#ff4444',
  SPAWNED: '#ff7a59',   PROFILING: '#ff7a59',
  default: '#9dc0c3'
};

const MOCK_SCENARIOS = [
  { id: 'sc-1', name: 'Q3 Invoice Phish',     ghostState: 'ESCALATING', compromisedCount: 14, startedAt: Date.now() - 600000, patientZero: 'Alice Zhang'   },
  { id: 'sc-2', name: 'CEO Wire Fraud Drill',  ghostState: 'SPREADING',  compromisedCount: 6,  startedAt: Date.now() - 240000, patientZero: 'Marcus Webb'   },
];

const MOCK_COMPROMISED = [
  { id: 'e1', name: 'Alice Zhang',  dept: 'Finance',     technique: 'SMTP Spoof',       compromisedAt: Date.now() - 480000 },
  { id: 'e2', name: 'Bob Lee',      dept: 'Sales',       technique: 'Credential Relay',  compromisedAt: Date.now() - 310000 },
  { id: 'e3', name: 'Dave Wu',      dept: 'Finance',     technique: 'BEC',               compromisedAt: Date.now() - 90000  },
  { id: 'e4', name: 'Grace Liu',    dept: 'Sales',       technique: 'SIM Swap',          compromisedAt: Date.now() - 50000  },
];

function ElapsedTimer({ startedAt }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startedAt) / 1000));
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');
  return <span className="font-mono text-[var(--as-muted)] text-[12px]">{m}:{s}</span>;
}

function Toast({ msg, isError, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fadeUp max-w-[320px]">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-[6px] border shadow-xl ${isError ? 'bg-[rgba(255,68,68,0.15)] border-[rgba(255,68,68,0.4)] text-[#ff4444]' : 'bg-[rgba(61,214,198,0.15)] border-[rgba(61,214,198,0.4)] text-[var(--as-accent2)]'}`}>
        <span className="text-[14px]">{isError ? '⚠' : '✓'}</span>
        <span className="text-[12px] font-['Chakra_Petch']">{msg}</span>
        <button onClick={onClose} className="ml-auto text-[16px] opacity-60 hover:opacity-100">×</button>
      </div>
    </div>
  );
}

export default function DefenderDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [flagging, setFlagging] = useState(null);
  const hasActive = MOCK_SCENARIOS.length > 0;

  const handleFlag = async (emp) => {
    setFlagging(emp.id);
    await new Promise(r => setTimeout(r, 700));
    const caught = Math.random() > 0.5;
    setFlagging(null);
    setToast({ msg: caught ? 'Ghost terminated! Defender wins.' : 'Not the active ghost target. Keep looking.', isError: !caught });
  };

  const timeSince = (ts) => {
    const m = Math.floor((Date.now() - ts) / 60000);
    return m < 1 ? 'just now' : `${m}m ago`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 flex flex-col gap-8">
      {toast && <Toast msg={toast.msg} isError={toast.isError} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 animate-slideInLeft">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h1 className="text-[28px] font-bold text-[var(--as-accent2)] uppercase tracking-wider">Defender Operations Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em]">Active Threat Monitoring</span>
            {hasActive ? (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ff4444] animate-pulse" />
                <span className="text-[10px] text-[#ff4444] font-bold uppercase tracking-widest">LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--as-muted)]" />
                <span className="text-[10px] text-[var(--as-muted)] font-bold uppercase tracking-widest">ALL CLEAR</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE SCENARIOS */}
      <div className="flex flex-col gap-4">
        <div className="text-[13px] text-[var(--as-muted)] uppercase tracking-wider">Active Scenarios ({MOCK_SCENARIOS.length})</div>
        {MOCK_SCENARIOS.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 py-10 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <p className="text-[var(--as-muted)] text-[13px]">No active scenarios — all threats neutralized</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SCENARIOS.map((sc, i) => {
              const gs = GHOST_STATE_CONFIG[sc.ghostState] || GHOST_STATE_CONFIG.DORMANT;
              const borderColor = BORDER_COLOR[sc.ghostState] || BORDER_COLOR.default;
              return (
                <div key={sc.id} className="card animate-fadeUp" style={{ animationDelay: `${i * 0.1}s`, borderLeft: `3px solid ${borderColor}` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] font-bold text-[var(--as-text)] uppercase tracking-wider">{sc.name}</span>
                    <div className={`flex items-center gap-1.5 ${gs.pulse ? 'animate-pulse' : ''}`}>
                      <span style={{ color: gs.color, fontSize: 16 }}>{gs.icon}</span>
                      <span className="text-[10px] font-bold uppercase" style={{ color: gs.color }}>{sc.ghostState}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-[12px] text-[var(--as-muted)]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#ff4444"><path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/><circle cx="9" cy="11" r="1.5" fill="#07141F"/><circle cx="15" cy="11" r="1.5" fill="#07141F"/></svg>
                    Patient Zero: <span className="text-[var(--as-text)]">{sc.patientZero}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] text-[var(--as-muted)] uppercase mb-0.5">Compromised</div>
                      <div className="text-[24px] font-bold text-[#ff4444] font-['Chakra_Petch']">{sc.compromisedCount}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[var(--as-muted)] uppercase mb-0.5">Elapsed</div>
                      <ElapsedTimer startedAt={sc.startedAt} />
                    </div>
                  </div>
                  <button onClick={() => navigate(`/defender/live/${sc.id}`)} className="btn-primary w-full text-[12px]">
                    ENTER LIVE VIEW →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPROMISED EMPLOYEES */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="card flex-1 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[13px] text-[#ff4444] uppercase tracking-wider font-semibold">Compromised Employees</span>
            <span className="bg-[rgba(255,68,68,0.15)] text-[#ff4444] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[rgba(255,68,68,0.3)]">{MOCK_COMPROMISED.length}</span>
          </div>
          {MOCK_COMPROMISED.length === 0 ? (
            <p className="text-[var(--as-muted)] text-[13px] text-center py-8">No compromised employees</p>
          ) : (
            <div className="flex flex-col divide-y divide-[rgba(61,214,198,0.08)]">
              {MOCK_COMPROMISED.map((emp) => {
                const initials = emp.name.split(' ').map(n => n[0]).join('');
                return (
                  <div key={emp.id} className="py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,68,68,0.2)] text-[#ff4444] flex items-center justify-center text-[11px] font-bold shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[var(--as-text)]">{emp.name}</div>
                      <div className="text-[11px] text-[var(--as-muted)]">{emp.dept}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-[rgba(255,122,89,0.15)] text-[var(--as-accent)]">{emp.technique}</span>
                      <span className="text-[10px] text-[var(--as-muted)]">{timeSince(emp.compromisedAt)}</span>
                    </div>
                    <button
                      onClick={() => handleFlag(emp)}
                      disabled={flagging === emp.id}
                      className="shrink-0 px-3 py-1.5 border text-[10px] font-bold uppercase tracking-wider rounded-[4px] transition-colors font-['Chakra_Petch'] flex items-center gap-1.5"
                      style={{ borderColor: '#ff7a59', color: '#ff7a59', background: 'transparent' }}>
                      {flagging === emp.id ? <div className="w-3 h-3 border border-[#ff7a59] border-t-transparent rounded-full animate-spin" /> : 'FLAG'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
