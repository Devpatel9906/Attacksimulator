import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const resultColors = { COMPROMISED: '#ff4444', REPORTED: '#3dd6c6', DEFLECTED: '#9dc0c3' };

const ChainNode = ({ data }) => {
  const color = data.isPatientZero ? '#a855f7' : (resultColors[data.result] || '#9dc0c3');
  return (
    <div className="font-['Chakra_Petch'] rounded-[8px] border-2 p-3 w-[160px] h-[80px] flex flex-col justify-between transition-opacity"
      style={{ background: 'rgba(13,34,48,0.95)', borderColor: color, opacity: data.dimmed ? 0.2 : 1,
               boxShadow: data.active ? `0 0 16px ${color}88` : 'none' }}>
      <div className="flex items-center justify-between">
        <span className="text-[18px] font-bold" style={{ color }}>{data.hop}</span>
        {data.isPatientZero && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/><circle cx="9" cy="11" r="1.5" fill="#0d2230"/><circle cx="15" cy="11" r="1.5" fill="#0d2230"/></svg>
        )}
        {data.isFinal && data.outcome === 'BREACHED' && <span className="text-[12px]">🚨</span>}
        {data.isFinal && data.outcome === 'DEFENDER_WON' && <span className="text-[12px]">🛡</span>}
        <span className="text-[8px] uppercase font-bold px-1 py-0.5 rounded" style={{ color, background: `${color}22` }}>{data.result}</span>
      </div>
      <div>
        <div className="text-[11px] font-bold text-[#edf7f7] truncate">{data.employeeName}</div>
        <div className="text-[9px] text-[#9dc0c3]">{data.department}</div>
      </div>
    </div>
  );
};

const nodeTypes = { chainNode: ChainNode };

const MOCK_CHAIN = [
  { hop: 0, isPatientZero: true, employee: { displayName: 'Alice Zhang', department: 'Finance', role: 'Senior Accountant' }, technique: 'Spear Phishing', result: 'COMPROMISED', recordedAt: 'T+0:00' },
  { hop: 1, employee: { displayName: 'Bob Lee', department: 'Sales', role: 'AE' }, technique: 'Credential Replay', result: 'COMPROMISED', recordedAt: 'T+2:14' },
  { hop: 2, employee: { displayName: 'Carol Kim', department: 'Marketing', role: 'Manager' }, technique: 'Lateral SMTP', result: 'REPORTED', recordedAt: 'T+5:01' },
  { hop: 3, employee: { displayName: 'Dave Wu', department: 'Finance', role: 'CFO', }, technique: 'BEC Wire Fraud', result: 'COMPROMISED', recordedAt: 'T+9:48' },
];

export default function KillChain() {
  const { id: routeId } = useParams();
  const id = routeId || 'sc-1';
  const navigate = useNavigate();
  const [currentHop, setCurrentHop] = useState(MOCK_CHAIN.length - 1);
  const [playing, setPlaying] = useState(false);
  const playIntervalRef = useRef(null);

  const buildGraph = (upTo) => {
    const nodes = MOCK_CHAIN.map((hop, i) => ({
      id: `n${i}`,
      type: 'chainNode',
      position: { x: i * 220, y: 60 },
      data: {
        hop: i, isPatientZero: i === 0, isFinal: i === MOCK_CHAIN.length - 1, outcome: 'BREACHED',
        employeeName: hop.employee.displayName, department: hop.employee.department, result: hop.result,
        dimmed: i > upTo, active: i === upTo
      }
    }));
    const edges = MOCK_CHAIN.slice(0, -1).map((hop, i) => ({
      id: `e${i}`, source: `n${i}`, target: `n${i+1}`,
      animated: i < upTo,
      label: MOCK_CHAIN[i+1].technique,
      labelStyle: { fill: '#ff7a59', fontSize: 9, fontFamily: 'Chakra Petch' },
      style: { stroke: i < upTo ? '#ff7a59' : 'rgba(61,214,198,0.2)', strokeDasharray: i < upTo ? '0' : '4' }
    }));
    return { nodes, edges };
  };

  const { nodes, edges } = buildGraph(currentHop);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    const { nodes: n, edges: e } = buildGraph(currentHop);
    setRfNodes(n);
    setRfEdges(e);
  }, [currentHop]);

  useEffect(() => {
    if (playing) {
      playIntervalRef.current = setInterval(() => {
        setCurrentHop(h => {
          if (h >= MOCK_CHAIN.length - 1) { setPlaying(false); clearInterval(playIntervalRef.current); return h; }
          return h + 1;
        });
      }, 1500);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [playing]);

  const current = MOCK_CHAIN[currentHop];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 flex flex-col gap-6">

      {/* HEADER */}
      <div className="card animate-slideInLeft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--as-accent2)] uppercase tracking-wider mb-1">Kill Chain Analysis</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444"><path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/><circle cx="9" cy="11" r="1.5" fill="#07141F"/><circle cx="15" cy="11" r="1.5" fill="#07141F"/></svg>
            <span className="text-[12px] text-[var(--as-muted)]">Patient Zero: <span className="text-[var(--as-text)] font-bold">{MOCK_CHAIN[0].employee.displayName}</span></span>
            <span className="text-[10px] text-[var(--as-muted)]">· {MOCK_CHAIN[0].employee.department} · {MOCK_CHAIN[0].employee.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff4444] animate-pulse" />
            <span className="text-[10px] text-[#ff4444] font-bold uppercase tracking-widest">BREACHED</span>
          </div>
          <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">Total Hops: <span className="text-[var(--as-text)] font-bold">{MOCK_CHAIN.length - 1}</span></span>
        </div>
      </div>

      {/* REACTFLOW CHAIN */}
      <div className="card p-0 overflow-hidden animate-fadeUp" style={{ height: 220 }}>
        <ReactFlow nodes={rfNodes} edges={rfEdges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }} panOnScroll={false}
          nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}>
          <Background color="#3dd6c610" gap={24} />
        </ReactFlow>
      </div>

      {/* SCRUBBER */}
      <div className="card flex flex-col gap-5 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
        {/* Slider */}
        <div>
          <input type="range" min={0} max={MOCK_CHAIN.length - 1} value={currentHop}
            onChange={e => { setPlaying(false); setCurrentHop(Number(e.target.value)); }}
            className="w-full accent-[var(--as-accent)]"
            style={{ height: 4, borderRadius: 2, background: `linear-gradient(to right, var(--as-accent) ${(currentHop/(MOCK_CHAIN.length-1))*100}%, rgba(61,214,198,0.2) 0%)` }}
          />
          <div className="flex justify-between text-[10px] text-[var(--as-muted)] mt-1">
            <span>HOP 0 — Patient Zero: {MOCK_CHAIN[0].employee.displayName}</span>
            <span>HOP {MOCK_CHAIN.length-1} — {MOCK_CHAIN[MOCK_CHAIN.length-1].employee.displayName} via {MOCK_CHAIN[MOCK_CHAIN.length-1].technique}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => { setPlaying(false); setCurrentHop(h => Math.max(0, h-1)); }}
            className="w-9 h-9 border border-[rgba(61,214,198,0.3)] text-[var(--as-muted)] rounded flex items-center justify-center hover:text-[var(--as-text)] hover:border-[var(--as-accent2)] transition-colors">◀</button>
          <button onClick={() => { if (currentHop >= MOCK_CHAIN.length-1) setCurrentHop(0); setPlaying(p => !p); }}
            className="w-9 h-9 border border-[rgba(61,214,198,0.3)] text-[var(--as-accent)] rounded flex items-center justify-center hover:border-[var(--as-accent)] transition-colors">
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={() => { setPlaying(false); setCurrentHop(h => Math.min(MOCK_CHAIN.length-1, h+1)); }}
            className="w-9 h-9 border border-[rgba(61,214,198,0.3)] text-[var(--as-muted)] rounded flex items-center justify-center hover:text-[var(--as-text)] hover:border-[var(--as-accent2)] transition-colors">▶▶</button>
          <span className="text-[11px] text-[var(--as-muted)] ml-2">Hop {currentHop} of {MOCK_CHAIN.length-1}</span>
        </div>

        {/* Current Hop Detail */}
        <div className="bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] p-4">
          <div className="text-[16px] font-bold text-[var(--as-accent)] mb-1">{current.technique}</div>
          <div className="flex flex-wrap gap-4 text-[12px]">
            <span className="text-[var(--as-muted)]">Target: <span className="text-[var(--as-text)] font-bold">{current.employee.displayName}</span></span>
            <span className="text-[var(--as-muted)]">Dept: <span className="text-[var(--as-text)]">{current.employee.department}</span></span>
            <span className="text-[var(--as-muted)]">Time: <span className="text-[var(--as-text)]">{current.recordedAt}</span></span>
            <span style={{ color: resultColors[current.result] }} className="font-bold uppercase">{current.result}</span>
          </div>
          <div className="text-[11px] text-[var(--as-muted)] mt-2">
            What the attacker gained: {current.result === 'COMPROMISED' ? 'Full credential access and email account control.' : 'Target reported — ghost hop aborted from this vector.'}
          </div>
        </div>
      </div>

    </div>
  );
}
