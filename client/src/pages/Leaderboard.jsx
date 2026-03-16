import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';

const DEPTS = ['All Departments', 'Finance', 'Sales', 'Marketing', 'Engineering', 'HR', 'Legal'];

const ARCHETYPE_STYLES = {
  rushed_responder:   { bg: 'rgba(255,122,89,0.15)',  color: '#ff7a59' },
  trusting_delegator: { bg: 'rgba(168,85,247,0.15)',  color: '#a855f7' },
  distracted_clicker: { bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
  skeptical_verifier: { bg: 'rgba(61,214,198,0.15)',  color: '#3dd6c6' },
};

const BADGE_COLORS = ['#3dd6c6', '#eab308', '#ff7a59', '#a855f7', '#3dd6c6'];

const scoreColor = s => s < 40 ? '#ff4444' : s < 70 ? '#ff7a59' : '#3dd6c6';
const rankColor  = r => r === 1 ? '#eab308' : r === 2 ? '#9dc0c3' : r === 3 ? '#cd7f32' : r <= 10 ? '#ff7a59' : '#9dc0c3';

const MOCK_BOARD = [
  { rank: 1,  id: 'e6',  name: 'Frank Ross',   role: 'Staff Engineer',    dept: 'Engineering', archetype: 'skeptical_verifier', score: 96, modules: 6, total: 6, badges: 5, up: true  },
  { rank: 2,  id: 'e3',  name: 'Carol Kim',    role: 'Campaign Manager',  dept: 'Marketing',   archetype: 'skeptical_verifier', score: 88, modules: 5, total: 6, badges: 4, up: true  },
  { rank: 3,  id: 'e8',  name: 'Henry Brown',  role: 'Legal Counsel',     dept: 'Legal',       archetype: 'skeptical_verifier', score: 82, modules: 5, total: 6, badges: 3, up: false },
  { rank: 4,  id: 'e7',  name: 'Grace Liu',    role: 'Sales Director',    dept: 'Sales',       archetype: 'trusting_delegator', score: 71, modules: 4, total: 6, badges: 3, up: true  },
  { rank: 5,  id: 'e2',  name: 'Bob Lee',      role: 'Account Executive', dept: 'Sales',       archetype: 'rushed_responder',   score: 58, modules: 3, total: 6, badges: 2, up: true  },
  { rank: 6,  id: 'e9',  name: 'Sam Patel',    role: 'Data Analyst',      dept: 'Finance',     archetype: 'skeptical_verifier', score: 55, modules: 3, total: 6, badges: 2, up: false },
  { rank: 7,  id: 'e4',  name: 'Dave Wu',      role: 'CFO',               dept: 'Finance',     archetype: 'trusting_delegator', score: 48, modules: 2, total: 6, badges: 1, up: false },
  { rank: 8,  id: 'e5',  name: 'Eve Park',     role: 'Recruiter',         dept: 'HR',          archetype: 'rushed_responder',   score: 36, modules: 2, total: 6, badges: 1, up: true  },
  { rank: 9,  id: 'e10', name: 'Lily Chen',    role: 'Marketing Mgr',     dept: 'Marketing',   archetype: 'distracted_clicker', score: 32, modules: 1, total: 6, badges: 0, up: false },
  { rank: 10, id: 'e1',  name: 'Alice Zhang',  role: 'Sr. Accountant',    dept: 'Finance',     archetype: 'distracted_clicker', score: 29, modules: 1, total: 6, badges: 0, up: false },
];

function PodiumCard({ entry, size, height }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), size === 'lg' ? 100 : size === 'md' ? 250 : 400); return () => clearTimeout(t); }, []);
  const initials = entry.name.split(' ').map(n => n[0]).join('');
  const isFirst  = entry.rank === 1;
  const colors   = { 1: { medal: '#eab308', plat: 'rgba(234,179,8,0.15)', pBorder: 'rgba(234,179,8,0.35)' }, 2: { medal: '#9dc0c3', plat: 'rgba(157,192,195,0.15)', pBorder: 'rgba(157,192,195,0.35)' }, 3: { medal: '#cd7f32', plat: 'rgba(205,127,50,0.1)', pBorder: 'rgba(205,127,50,0.3)' } };
  const c = colors[entry.rank];
  const avatarSize = isFirst ? 'w-20 h-20 text-[24px]' : entry.rank === 2 ? 'w-16 h-16 text-[18px]' : 'w-14 h-14 text-[16px]';
  return (
    <div className="flex flex-col items-center" style={{ transform: visible ? 'translateY(0)' : 'translateY(40px)', opacity: visible ? 1 : 0, transition: 'all 0.4s ease' }}>
      {isFirst && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#eab308" className="mb-1 animate-pulse">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
        </svg>
      )}
      <div className="relative mb-2">
        <div className={`${avatarSize} rounded-full flex items-center justify-center font-bold font-['Chakra_Petch']`}
          style={{ background: `${c.medal}33`, color: c.medal, border: `2px solid ${c.medal}` }}>{initials}</div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-['Chakra_Petch']"
          style={{ background: c.medal, color: '#07141f' }}>{entry.rank}</div>
      </div>
      {isFirst && (
        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mb-1" style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308' }}>CHAMPION</span>
      )}
      <div className={`font-bold text-[var(--as-text)] text-center ${isFirst ? 'text-[14px]' : 'text-[12px]'}`}>{entry.name}</div>
      <div className="text-[10px] text-[var(--as-muted)] text-center mb-1">{entry.dept}</div>
      <div className={`font-bold font-['Chakra_Petch']`} style={{ color: c.medal, fontSize: isFirst ? '22px' : '16px' }}>{entry.score}</div>
      <div className="w-full mt-2 rounded-t-[4px] border" style={{ height: `${height}px`, background: c.plat, borderColor: c.pBorder }} />
    </div>
  );
}

const PAGE_SIZE = 20;

export default function Leaderboard() {
  const user = useAuthStore(s => s.user);
  const [dept, setDept] = useState('All Departments');
  const [page, setPage] = useState(1);

  const filtered = dept === 'All Departments' ? MOCK_BOARD : MOCK_BOARD.filter(e => e.dept === dept);
  const top3 = MOCK_BOARD.slice(0, 3);
  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 flex flex-col gap-8">

      {/* HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4 animate-slideInLeft">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="url(#trophyGrad)">
              <defs><linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff7a59"/><stop offset="100%" stopColor="#3dd6c6"/></linearGradient></defs>
              <path d="M8 21h8m-4-4v4M5 3h14l-1 7a6 6 0 01-12 0L5 3z"/><path d="M5 3H2l1 4a4 4 0 003 3.9M19 3h3l-1 4a4 4 0 01-3 3.9"/>
            </svg>
            <h1 className="text-[26px] font-bold text-[var(--as-text)] uppercase tracking-wider">Security Culture Leaderboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.12em]">Acme Corporation — March 2026 Rankings</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-accent2)] animate-pulse" />
              <span className="text-[10px] text-[var(--as-accent2)] uppercase">Updated Live</span>
            </div>
          </div>
        </div>
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1); }}
          className="bg-[rgba(7,20,31,0.8)] border border-[rgba(61,214,198,0.24)] text-[var(--as-text)] px-4 py-2.5 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none text-[13px] font-['Chakra_Petch']">
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* PODIUM */}
      <div className="flex items-end justify-center gap-6 pb-0">
        <div className="flex-1 max-w-[180px]"><PodiumCard entry={top3[1]} size="md" height={80} /></div>
        <div className="flex-1 max-w-[220px]"><PodiumCard entry={top3[0]} size="lg" height={120} /></div>
        <div className="flex-1 max-w-[160px]"><PodiumCard entry={top3[2]} size="sm" height={52} /></div>
      </div>

      {/* TABLE */}
      <div className="card overflow-x-auto animate-fadeUp" style={{ animationDelay: '0.4s' }}>
        <div className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-5">Full Rankings</div>
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[rgba(61,214,198,0.2)]">
              {['Rank', 'Employee', 'Department', 'Archetype', 'Score', 'Modules', 'Badges', 'Trend'].map(h => (
                <th key={h} className="pb-3 px-3 text-left text-[10px] text-[var(--as-muted)] uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((emp, i) => {
              const isMe = user?.id === emp.id || (user?.role === 'employee' && emp.rank === 5);
              const at   = ARCHETYPE_STYLES[emp.archetype] || {};
              const initials = emp.name.split(' ').map(n => n[0]).join('');
              const rowBg = emp.rank === 1 ? 'rgba(234,179,8,0.04)' : emp.rank === 2 ? 'rgba(157,192,195,0.03)' : emp.rank === 3 ? 'rgba(205,127,50,0.03)' : isMe ? 'rgba(255,122,89,0.06)' : 'transparent';
              const rowBorderL = isMe ? '3px solid #ff7a59' : emp.rank <= 3 ? 'none' : 'none';
              return (
                <tr key={emp.id} className="border-b border-[rgba(61,214,198,0.08)] transition-colors animate-fadeUp"
                  style={{ background: rowBg, borderLeft: rowBorderL, animationDelay: `${i * 30}ms` }}>
                  <td className="py-3 px-3">
                    <span className="text-[18px] font-bold font-['Chakra_Petch']" style={{ color: rankColor(emp.rank) }}>#{emp.rank}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                        style={{ background: at.bg || 'rgba(61,214,198,0.1)', color: at.color || '#3dd6c6' }}>{initials}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-[var(--as-text)]">{emp.name}</span>
                          {isMe && <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-[rgba(255,122,89,0.2)] text-[var(--as-accent)]">YOU</span>}
                        </div>
                        <div className="text-[10px] text-[var(--as-muted)]">{emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--as-text)]">{emp.dept}</td>
                  <td className="py-3 px-3">
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full" style={{ background: at.bg, color: at.color }}>
                      {emp.archetype.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[16px] font-bold font-['Chakra_Petch'] mb-1" style={{ color: scoreColor(emp.score) }}>{emp.score}</div>
                    <div className="w-[60px] h-[4px] rounded-full overflow-hidden bg-[rgba(61,214,198,0.1)]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${emp.score}%`, background: scoreColor(emp.score) }} />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[12px] text-[var(--as-muted)]">
                    <span className="text-[var(--as-accent2)]">{emp.modules}</span>/{emp.total}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(emp.badges, 3) }, (_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ background: BADGE_COLORS[i] }} />
                      ))}
                      {emp.badges > 3 && <span className="text-[9px] text-[var(--as-muted)] ml-1">+{emp.badges - 3}</span>}
                      {emp.badges === 0 && <span className="text-[10px] text-[var(--as-muted)] opacity-40">—</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    {emp.up
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold rounded border transition-colors ${p === page ? 'bg-[var(--as-accent)] text-[#08131b] border-[var(--as-accent)]' : 'text-[var(--as-muted)] border-[var(--as-line)] hover:border-[var(--as-accent2)]'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
