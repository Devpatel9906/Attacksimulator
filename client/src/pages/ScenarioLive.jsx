import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, useNodesState, useEdgesState, addEdge, Controls, Background, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import useAuthStore from '../stores/authStore';

const nodeStateColors = {
  safe: '#1e3a4f', targeted: '#3d3400', clicked: '#3d1e00', compromised: '#3d0000', reported: '#003d1e', ghost: '#2d0052'
};
const nodeBorderColors = {
  safe: '#9dc0c3', targeted: '#eab308', clicked: '#ff7a59', compromised: '#ff4444', reported: '#3dd6c6', ghost: '#a855f7'
};

const EmployeeNode = ({ data }) => {
  const initials = data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isPulsing = ['compromised', 'ghost'].includes(data.state);
  return (
    <div className={`w-[120px] rounded-[6px] border-2 p-2 flex flex-col items-center gap-1 cursor-pointer transition-all font-['Chakra_Petch'] ${isPulsing ? 'animate-pulse' : ''}`}
      style={{ background: nodeStateColors[data.state] || nodeStateColors.safe, borderColor: nodeBorderColors[data.state] || nodeBorderColors.safe,
        boxShadow: isPulsing ? `0 0 12px ${nodeBorderColors[data.state]}` : 'none' }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: `${nodeBorderColors[data.state] || nodeBorderColors.safe}33`, color: nodeBorderColors[data.state] || nodeBorderColors.safe }}>
        {data.flagged ? '🚩' : initials}
      </div>
      <div className="text-[9px] font-bold text-[#edf7f7] text-center leading-tight truncate w-full">{data.name}</div>
      <div className="text-[8px] text-[#9dc0c3] text-center">{data.dept}</div>
    </div>
  );
};

const nodeTypes = { employee: EmployeeNode };

const LEGEND = [
  { state: 'safe', label: 'Safe' }, { state: 'targeted', label: 'Targeted' }, { state: 'clicked', label: 'Clicked' },
  { state: 'compromised', label: 'Compromised' }, { state: 'reported', label: 'Reported' }, { state: 'ghost', label: 'Ghost Hop' }
];

const initialEmployees = [
  { id: 'e1', name: 'Alice Zhang', dept: 'Finance', state: 'compromised' },
  { id: 'e2', name: 'Bob Martinez', dept: 'Sales', state: 'clicked' },
  { id: 'e3', name: 'Carol Kim', dept: 'Marketing', state: 'reported' },
  { id: 'e4', name: 'Dave Lee', dept: 'Engineering', state: 'safe' },
  { id: 'e5', name: 'Eve Park', dept: 'HR', state: 'targeted' },
  { id: 'e6', name: 'Frank Wu', dept: 'Finance', state: 'safe' },
  { id: 'e7', name: 'Grace Liu', dept: 'Sales', state: 'compromised' },
  { id: 'e8', name: 'Henry Brown', dept: 'Legal', state: 'safe' },
];

export default function ScenarioLive() {
  const { id: routeId } = useParams();
  const id = routeId || 'sc-1';
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ghostState, setGhostState] = useState('SPREADING');
  const [compromisedCount, setCompromisedCount] = useState(14);
  const [liveEvents, setLiveEvents] = useState([
    { time: '00:42', name: 'Alice Zhang', attack: 'credential_harvesting', result: 'SUBMITTED' },
    { time: '00:28', name: 'Bob Martinez', attack: 'email_phishing', result: 'CLICKED' },
  ]);
  const [outcome, setOutcome] = useState(null); // null | 'BREACHED' | 'DEFENDER_WON'
  const [flagPopup, setFlagPopup] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialEmployees.map((e, i) => ({
      id: e.id, type: 'employee',
      position: { x: 160 * (i % 4), y: 160 * Math.floor(i / 4) },
      data: { ...e, flagged: false }
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-e2', source: 'e1', target: 'e2', animated: true, style: { stroke: '#ff7a59', strokeDasharray: '4' }, label: 'SMTP Spoof', labelStyle: { fill: '#9dc0c3', fontSize: 8 } },
  ]);

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const handleNodeClick = (_, node) => {
    if (!['admin','defender'].includes(user?.role)) return;
    if (['compromised','clicked'].includes(node.data.state)) setFlagPopup(node.id);
  };

  const flagEmployee = (nodeId) => {
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, state: 'reported', flagged: true } } : n));
    setFlagPopup(null);
    // 30% chance of winning immediately as demo
    if (Math.random() < 0.3) setOutcome('DEFENDER_WON');
  };

  const ghostStateColor = { SPREADING: '#ff7a59', ESCALATING: '#ff4444', TERMINATED: '#3dd6c6', DORMANT: '#9dc0c3' };

  return (
    <div className="fixed inset-0 bg-[#020b12] font-['Chakra_Petch'] flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <div className="h-12 border-b border-[rgba(61,214,198,0.14)] flex items-center px-4 gap-4 shrink-0 z-20">
        <button onClick={() => navigate(`/scenarios/${id}`)} className="text-[var(--as-muted)] hover:text-[var(--as-text)] text-[11px] uppercase tracking-wider mr-2">← BACK</button>
        <span className="text-[13px] font-bold text-[#edf7f7] uppercase tracking-wider">Q3 Invoice Phish — Live Map</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[11px]">
          <span className={`font-bold uppercase tracking-widest ${['ESCALATING','SPREADING'].includes(ghostState) ? 'animate-pulse' : ''}`}
            style={{ color: ghostStateColor[ghostState] || '#9dc0c3' }}>{ghostState}</span>
        </div>
        <div className="text-[#ff4444] text-[12px] font-bold uppercase tracking-wider">COMPROMISED: {compromisedCount}</div>
        <div className="text-[var(--as-muted)] text-[11px] font-mono">{formatTime(elapsedSeconds)}</div>
        {['admin','defender'].includes(user?.role) && (
          <button className="px-3 py-1 bg-transparent border border-[#ff4444] text-[#ff4444] text-[10px] uppercase tracking-widest font-bold rounded hover:bg-[rgba(255,68,68,0.1)] transition-colors">
            TERMINATE
          </button>
        )}
      </div>

      {/* MAIN ROW */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[280px] border-r border-[rgba(61,214,198,0.14)] flex flex-col overflow-hidden shrink-0">
          {/* Ghost Persona */}
          <div className="p-4 border-b border-[rgba(61,214,198,0.14)]">
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">Ghost Entity</div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[18px] animate-pulse">☠</span>
              <span className="text-[14px] font-bold uppercase tracking-widest" style={{ color: ghostStateColor[ghostState] }}>{ghostState}</span>
            </div>
            <div className="text-[10px] text-[var(--as-muted)] mb-1">Compromised</div>
            <div className="text-[28px] font-bold text-[#ff4444] mb-2">{compromisedCount}</div>
            <div className="text-[10px] text-[var(--as-muted)] mb-1">Current Technique</div>
            <div className="text-[11px] text-[var(--as-accent)] font-bold">SMTP Header Spoofing</div>
          </div>

          {/* Live Events */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Live Events</div>
            <div className="flex flex-col gap-2">
              {liveEvents.map((ev, i) => (
                <div key={i} className="border-b border-[rgba(61,214,198,0.08)] pb-2 animate-fadeUp">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[11px] font-bold text-[#edf7f7]">{ev.name}</span>
                    <span className="text-[9px] text-[var(--as-muted)]">{ev.time}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-[rgba(255,122,89,0.2)] text-[var(--as-accent)]">{ev.attack.replace(/_/g,' ')}</span>
                    <span className="text-[8px] uppercase px-1 py-0.5 rounded" style={{
                      background: ev.result==='SUBMITTED' ? 'rgba(255,68,68,0.2)' : ev.result==='CLICKED' ? 'rgba(255,122,89,0.2)' : 'rgba(61,214,198,0.2)',
                      color: ev.result==='SUBMITTED' ? '#ff4444' : ev.result==='CLICKED' ? '#ff7a59' : '#3dd6c6'
                    }}>{ev.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: ReactFlow */}
        <div className="flex-1 relative">
          {flagPopup && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 card p-4 flex flex-col gap-3 w-[220px] animate-fadeUp shadow-[0_0_20px_rgba(255,68,68,0.3)]">
              <div className="text-[12px] font-bold text-[var(--as-text)] uppercase">Flag {nodes.find(n=>n.id===flagPopup)?.data.name}?</div>
              <div className="flex gap-2">
                <button onClick={() => setFlagPopup(null)} className="btn-ghost text-[10px] flex-1 py-1.5">CANCEL</button>
                <button onClick={() => flagEmployee(flagPopup)} className="flex-1 bg-[var(--as-accent)] text-[#08131b] text-[10px] font-bold uppercase rounded py-1.5 hover:brightness-110">CONFIRM</button>
              </div>
            </div>
          )}
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
            <Background color="#3dd6c610" gap={24} />
            <Controls className="!bg-[#0d2230] !border-[var(--as-line)] !rounded-[4px]" />
          </ReactFlow>
        </div>
      </div>

      {/* BOTTOM LEGEND */}
      <div className="h-8 border-t border-[rgba(61,214,198,0.14)] flex items-center px-4 gap-6 text-[9px] uppercase tracking-wider shrink-0">
        {LEGEND.map(l => (
          <div key={l.state} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: nodeBorderColors[l.state], opacity: 0.8 }} />
            <span className="text-[var(--as-muted)]">{l.label}</span>
          </div>
        ))}
      </div>

      {/* OUTCOME OVERLAY */}
      {outcome && (
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center animate-fadeUp"
          style={{ background: outcome === 'BREACHED' ? 'rgba(255,68,68,0.95)' : 'rgba(61,214,198,0.95)' }}>
          <div className="text-center">
            {outcome === 'BREACHED' ? (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="white" className="mx-auto mb-4 animate-pulse">
                <path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/>
                <circle cx="9" cy="11" r="1.5" fill="rgba(255,68,68,0.8)"/>
                <circle cx="15" cy="11" r="1.5" fill="rgba(255,68,68,0.8)"/>
              </svg>
            ) : (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="mx-auto mb-4">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            )}
            <div className="text-white text-[40px] font-bold uppercase tracking-widest mb-2">
              {outcome === 'BREACHED' ? 'BREACH DETECTED' : 'THREAT NEUTRALIZED'}
            </div>
            <div className="text-white opacity-80 text-[14px] mb-8 uppercase tracking-wider">
              Compromised: {compromisedCount} · Duration: {formatTime(elapsedSeconds)}
            </div>
            <button onClick={() => navigate(`/scenarios/${id}/analytics`)} className="px-8 py-3 bg-white text-[#07141f] font-bold uppercase tracking-wider rounded-[4px] text-[13px] hover:opacity-90 transition-opacity">
              VIEW FULL REPORT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
