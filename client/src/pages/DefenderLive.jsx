import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, useNodesState, useEdgesState, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useAuthStore from '../stores/authStore';

const nodeStateColors  = { safe: '#1e3a4f', targeted: '#3d3400', clicked: '#3d1e00', compromised: '#3d0000', reported: '#003d1e', ghost: '#2d0052' };
const nodeBorderColors = { safe: '#9dc0c3', targeted: '#eab308', clicked: '#ff7a59', compromised: '#ff4444', reported: '#3dd6c6', ghost: '#a855f7' };

const LEGEND = [
  { state: 'safe', label: 'Safe' }, { state: 'targeted', label: 'Targeted' },
  { state: 'clicked', label: 'Clicked' }, { state: 'compromised', label: 'Compromised' },
  { state: 'reported', label: 'Reported' }, { state: 'ghost', label: 'Ghost Hop' },
];

const GHOST_STATE_CONFIG = {
  DORMANT:    { color: '#9dc0c3', icon: '●', label: 'Dormant',    pulse: false },
  SPAWNED:    { color: '#eab308', icon: '⚡', label: 'Spawned',    pulse: true  },
  PROFILING:  { color: '#3b82f6', icon: '👁', label: 'Profiling',  pulse: false },
  SPREADING:  { color: '#ff7a59', icon: '☠', label: 'Spreading',  pulse: true  },
  ESCALATING: { color: '#ff4444', icon: '☠', label: 'Escalating', pulse: true  },
  TERMINATED: { color: '#3dd6c6', icon: '✓', label: 'Terminated', pulse: false },
  BREACHED:   { color: '#ff4444', icon: '🚨', label: 'Breached',   pulse: true  },
};

const EmpNode = ({ data }) => {
  const initials = data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isCrit = ['compromised', 'ghost'].includes(data.state);
  return (
    <div className={`w-[120px] rounded-[6px] border-2 p-2 flex flex-col items-center gap-1 font-['Chakra_Petch'] transition-all ${isCrit ? 'animate-pulse' : ''}`}
      style={{ background: nodeStateColors[data.state] || nodeStateColors.safe, borderColor: nodeBorderColors[data.state] || nodeBorderColors.safe,
               boxShadow: isCrit ? `0 0 12px ${nodeBorderColors[data.state]}` : 'none', cursor: data.clickable ? 'pointer' : 'default' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: `${nodeBorderColors[data.state] || nodeBorderColors.safe}33`, color: nodeBorderColors[data.state] || nodeBorderColors.safe }}>
        {data.flagged ? '🚩' : initials}
      </div>
      <div className="text-[9px] font-bold text-[#edf7f7] text-center truncate w-full">{data.name}</div>
      <div className="text-[8px] text-[#9dc0c3] text-center">{data.dept}</div>
    </div>
  );
};
const nodeTypes = { empNode: EmpNode };

const MOCK_EMPLOYEES = [
  { id: 'e1', name: 'Alice Zhang',  dept: 'Finance',     state: 'compromised' },
  { id: 'e2', name: 'Bob Lee',      dept: 'Sales',       state: 'clicked'     },
  { id: 'e3', name: 'Carol Kim',    dept: 'Marketing',   state: 'reported'    },
  { id: 'e4', name: 'Dave Wu',      dept: 'Finance',     state: 'compromised' },
  { id: 'e5', name: 'Eve Park',     dept: 'HR',          state: 'targeted'    },
  { id: 'e6', name: 'Frank Ross',   dept: 'Engineering', state: 'safe'        },
  { id: 'e7', name: 'Grace Liu',    dept: 'Sales',       state: 'ghost'       },
  { id: 'e8', name: 'Henry Brown',  dept: 'Legal',       state: 'safe'        },
];

const MOCK_EVENTS = [
  { time: '10:42', name: 'Grace Liu',  attack: 'SMTP Spoof',      result: 'SUBMITTED' },
  { time: '10:38', name: 'Dave Wu',    attack: 'BEC',             result: 'CLICKED'   },
  { time: '10:30', name: 'Carol Kim',  attack: 'Email Phishing',  result: 'REPORTED'  },
  { time: '10:22', name: 'Bob Lee',    attack: 'Cred Relay',      result: 'CLICKED'   },
  { time: '10:10', name: 'Alice Zhang',attack: 'Spear Phish',     result: 'SUBMITTED' },
];
const RESULT_COLORS = { CLICKED: '#ff7a59', SUBMITTED: '#ff4444', REPORTED: '#3dd6c6' };

function ElapsedTimer({ start }) {
  const [sec, setSec] = useState(Math.floor((Date.now() - start) / 1000));
  useEffect(() => { const t = setInterval(() => setSec(s => s + 1), 1000); return () => clearInterval(t); }, []);
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export default function DefenderLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [ghostState, setGhostState] = useState('ESCALATING');
  const [compromised, setCompromised] = useState(14);
  const [flagPopup, setFlagPopup] = useState(null);
  const [flagResult, setFlagResult] = useState(null); // null | 'caught' | 'miss'
  const [outcome, setOutcome] = useState(null);
  const [showTermConfirm, setShowTermConfirm] = useState(false);

  const gs = GHOST_STATE_CONFIG[ghostState] || GHOST_STATE_CONFIG.DORMANT;
  const startTime = Date.now() - 720000; // 12 min ago for demo

  const buildNodes = () => MOCK_EMPLOYEES.map((e, i) => ({
    id: e.id, type: 'empNode',
    position: { x: 180 * (i % 4), y: 180 * Math.floor(i / 4) },
    data: { ...e, clickable: ['compromised', 'clicked', 'ghost'].includes(e.state) && ['admin','defender'].includes(user?.role), flagged: false }
  }));
  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1e7', source: 'e1', target: 'e7', animated: true, style: { stroke: '#ff7a59', strokeDasharray: '4' }, label: 'SMTP Spoof', labelStyle: { fill: '#9dc0c3', fontSize: 8 } },
  ]);

  const handleNodeClick = (_, node) => {
    if (!node.data.clickable) return;
    setFlagPopup(node);
    setFlagResult(null);
  };

  const confirmFlag = async () => {
    await new Promise(r => setTimeout(r, 600));
    const caught = flagPopup?.id === 'e7'; // Grace (ghost hop) = success
    setFlagResult(caught ? 'caught' : 'miss');
    if (caught) {
      setTimeout(() => { setFlagPopup(null); setFlagResult(null); setOutcome('DEFENDER_WON'); }, 1000);
    } else {
      setTimeout(() => { setFlagPopup(null); setFlagResult(null); }, 2000);
    }
  };

  const startTime2 = Date.now() - 720000;

  return (
    <div className="fixed inset-0 bg-[#020b12] font-['Chakra_Petch'] flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <div className="h-14 border-b border-[rgba(61,214,198,0.14)] flex items-center px-5 gap-4 shrink-0 z-20 bg-[rgba(2,11,18,0.9)]">
        <button onClick={() => navigate('/defender')} className="text-[var(--as-muted)] hover:text-[var(--as-text)] text-[11px] uppercase tracking-wider mr-1">← BACK</button>
        <span className="text-[15px] font-bold text-[#edf7f7] uppercase tracking-wider">Q3 Invoice Phish</span>
        <div className="flex-1 flex justify-center">
          <div className={`flex items-center gap-2 ${gs.pulse ? 'animate-pulse' : ''}`}>
            <span style={{ color: gs.color, fontSize: 18 }}>{gs.icon}</span>
            <span className="text-[13px] font-bold uppercase tracking-widest" style={{ color: gs.color }}>{gs.label}</span>
          </div>
        </div>
        <div className="text-[#ff4444] text-[18px] font-bold">COMPROMISED: {compromised}</div>
        <div className="text-[var(--as-muted)] text-[12px] font-mono"><ElapsedTimer start={startTime2} /></div>
        <button onClick={() => setShowTermConfirm(true)} className="px-3 py-1.5 border border-[#ff4444] text-[#ff4444] text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[rgba(255,68,68,0.1)] transition-colors">
          TERMINATE GHOST
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[320px] border-r border-[rgba(61,214,198,0.14)] flex flex-col overflow-hidden shrink-0">

          {/* Ghost Persona */}
          <div className="p-4 border-b border-[rgba(61,214,198,0.14)]">
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-2">Ghost Entity</div>
            <div className={`flex items-center gap-3 mb-4 ${gs.pulse ? 'animate-pulse' : ''}`}>
              <div className="w-12 h-12 flex items-center justify-center text-[28px]" style={{ filter: `drop-shadow(0 0 8px ${gs.color})` }}>{gs.icon}</div>
              <div>
                <div className="text-[14px] font-bold uppercase tracking-widest" style={{ color: gs.color }}>{gs.label}</div>
                <div className="text-[10px] text-[var(--as-muted)] mt-0.5">Ghost active</div>
              </div>
            </div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-1">Aggression Level</div>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(i => <div key={i} className="flex-1 h-2 rounded-sm" style={{ background: i <= 4 ? '#ff4444' : 'rgba(255,68,68,0.2)' }} />)}
            </div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-0.5">Current Target</div>
            <div className="text-[13px] text-[var(--as-accent)] font-bold mb-3">Grace Liu</div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-0.5">Technique</div>
            <div className="text-[12px] text-[var(--as-text)] mb-3">SMTP Header Spoofing</div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-1">Technique History</div>
            <div className="max-h-[110px] overflow-y-auto flex flex-col gap-0.5">
              {['Initial Recon', 'Domain Enum', 'Spear Phishing', 'Cred Relay', 'SMTP Spoof'].map((t, i) => (
                <div key={i} className="text-[10px] text-[var(--as-muted)] flex gap-2">
                  <span className="text-[rgba(61,214,198,0.4)] font-mono">{i+1}.</span>{t}
                </div>
              ))}
            </div>
          </div>

          {/* Live Events */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-3">Live Events</div>
            {MOCK_EVENTS.map((ev, i) => (
              <div key={i} className="border-b border-[rgba(61,214,198,0.08)] pb-2 mb-2 animate-fadeUp" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex justify-between mb-0.5">
                  <span className="text-[11px] font-bold text-[#edf7f7]">{ev.name}</span>
                  <span className="text-[9px] text-[var(--as-muted)]">{ev.time}</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-[rgba(255,122,89,0.2)] text-[var(--as-accent)]">{ev.attack}</span>
                  <span className="text-[8px] uppercase px-1 py-0.5 rounded font-bold" style={{ color: RESULT_COLORS[ev.result], background: `${RESULT_COLORS[ev.result]}20` }}>{ev.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: ReactFlow */}
        <div className="flex-1 relative">
          {flagPopup && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 card p-4 flex flex-col gap-3 w-[240px] shadow-[0_0_20px_rgba(255,68,68,0.3)] animate-fadeUp">
              {flagResult === 'miss' ? (
                <div className="text-[12px] text-[#ff4444] text-center">Wrong target. The ghost is still out there.</div>
              ) : flagResult === 'caught' ? (
                <div className="text-[12px] text-[var(--as-accent2)] text-center animate-pulse">Ghost terminated! ✓</div>
              ) : (
                <>
                  <div className="text-[12px] font-bold text-[var(--as-text)] uppercase">Flag {flagPopup.data?.name}?</div>
                  <div className="text-[10px] text-[var(--as-muted)]">Mark this employee as the active ghost target.</div>
                  <div className="flex gap-2">
                    <button onClick={() => { setFlagPopup(null); setFlagResult(null); }} className="btn-ghost py-1.5 text-[10px] flex-1">CANCEL</button>
                    <button onClick={confirmFlag} className="flex-1 bg-[var(--as-accent)] text-[#08131b] text-[10px] font-bold uppercase rounded py-1.5 hover:brightness-110">CONFIRM</button>
                  </div>
                </>
              )}
            </div>
          )}
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
            <Background color="#3dd6c610" gap={28} />
            <Controls className="!bg-[#0d2230] !border-[var(--as-line)] !rounded" />
          </ReactFlow>
        </div>
      </div>

      {/* BOTTOM LEGEND */}
      <div className="h-8 border-t border-[rgba(61,214,198,0.14)] flex items-center px-5 gap-6 text-[9px] uppercase tracking-wider shrink-0">
        {LEGEND.map(l => (
          <div key={l.state} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: nodeBorderColors[l.state] }} />
            <span className="text-[var(--as-muted)]">{l.label}</span>
          </div>
        ))}
        <span className="ml-auto text-[var(--as-muted)] text-[9px]">Click red/orange node to FLAG</span>
      </div>

      {/* TERMINATE CONFIRM */}
      {showTermConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] z-50 flex items-center justify-center">
          <div className="card max-w-[380px] w-full animate-fadeUp">
            <h3 className="text-[16px] font-bold text-[#ff4444] uppercase tracking-widest mb-2">Terminate Ghost?</h3>
            <p className="text-[var(--as-muted)] text-[13px] mb-5">This will force-end the simulation. The outcome will be marked as TERMINATED — not a clean defender win.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowTermConfirm(false)} className="btn-ghost flex-1">CANCEL</button>
              <button onClick={() => { setShowTermConfirm(false); setOutcome('DEFENDER_WON'); }} className="flex-1 bg-[#ff4444] text-white font-bold uppercase tracking-wider py-3 rounded-[4px] hover:brightness-110 transition-all">TERMINATE</button>
            </div>
          </div>
        </div>
      )}

      {/* OUTCOME OVERLAY */}
      {outcome && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center animate-fadeUp"
          style={{ background: outcome === 'BREACHED' ? 'rgba(255,68,68,0.95)' : 'rgba(61,214,198,0.95)' }}>
          <div className="text-center">
            {outcome === 'BREACHED' ? (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="white" className="mx-auto mb-4 animate-pulse">
                <path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/>
              </svg>
            ) : (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="mx-auto mb-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            )}
            <div className="text-white text-[40px] font-bold uppercase tracking-widest mb-2">
              {outcome === 'BREACHED' ? 'BREACH DETECTED' : 'THREAT NEUTRALIZED'}
            </div>
            <div className="text-white opacity-80 text-[14px] mb-8 uppercase tracking-wider">Compromised: {compromised}</div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/defender')} className="px-8 py-3 bg-white text-[#07141f] font-bold uppercase tracking-wider rounded-[4px] text-[13px] hover:opacity-90">
                BACK TO DEFENDER HQ
              </button>
              <button onClick={() => navigate(`/scenarios/${id}/analytics`)} className="px-8 py-3 border-2 border-white text-white font-bold uppercase tracking-wider rounded-[4px] text-[13px] hover:bg-white hover:text-[#07141f] transition-colors">
                VIEW FULL REPORT →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
