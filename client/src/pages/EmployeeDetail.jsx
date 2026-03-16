import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ARCHETYPE_STYLES = {
  rushed_responder:   { bg: 'rgba(255,122,89,0.15)',  color: '#ff7a59', avatarBg: 'rgba(255,122,89,0.3)'  },
  trusting_delegator: { bg: 'rgba(168,85,247,0.15)',  color: '#a855f7', avatarBg: 'rgba(168,85,247,0.3)'  },
  distracted_clicker: { bg: 'rgba(234,179,8,0.15)',   color: '#eab308', avatarBg: 'rgba(234,179,8,0.3)'   },
  skeptical_verifier: { bg: 'rgba(61,214,198,0.15)',  color: '#3dd6c6', avatarBg: 'rgba(61,214,198,0.3)'  },
};

const ARCHETYPE_DESC = {
  rushed_responder:   'Acts quickly without verification. High click-through rates under deadline pressure.',
  trusting_delegator: 'Over-relies on authority cues. Susceptible to BEC and impersonation attacks.',
  distracted_clicker: 'High error rate during multi-tasking. Most vulnerable during peak work hours.',
  skeptical_verifier: 'Questions suspicious activity. Strong reporting habits and low click rates.',
};

const RISK_FACTORS = {
  rushed_responder:   ['Acts before reading full content', 'Susceptible to urgency manipulation', 'Peak risk: 9–11 AM (morning rush)'],
  trusting_delegator: ['Accepts sender authority without verification', 'High BEC vulnerability', 'Peak risk: 2–4 PM (post-lunch)'],
  distracted_clicker: ['Error-prone during multitasking', 'Misses visual cues in phishing', 'Peak risk: 3–5 PM (end of day fatigue)'],
  skeptical_verifier: ['May create friction in legitimate workflows', 'Occasionally over-reports benign emails', 'Peak risk: None identified'],
};

const BADGES = [
  { id: 'chain_breaker', label: 'Chain Breaker', icon: '🔗', earned: true },
  { id: 'first_responder', label: 'First Responder', icon: '⚡', earned: true },
  { id: 'skeptic', label: 'Skeptic', icon: '🔍', earned: false },
  { id: 'defender', label: 'Perfect Defense', icon: '🛡', earned: false },
  { id: 'comeback', label: 'Comeback', icon: '↑', earned: true },
  { id: 'educator', label: 'Educator', icon: '📚', earned: false },
];

const SCENARIO_HISTORY = [
  { scenario: 'Q2 Vendor Spoof', attackType: 'email_phishing', result: 'CLICKED',    date: '2026-02-14' },
  { scenario: 'HR Season Phish', attackType: 'credential_harvesting', result: 'SUBMITTED', date: '2026-01-30' },
  { scenario: 'CEO Wire Fraud',  attackType: 'bec', result: 'REPORTED',   date: '2026-01-08' },
];

const RESULT_COLORS = { CLICKED: '#ff7a59', SUBMITTED: '#ff4444', REPORTED: '#3dd6c6' };
const scoreColor = s => s < 40 ? '#ff4444' : s < 70 ? '#ff7a59' : '#3dd6c6';

function ScoreGauge({ score }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  const r = 60, cx = 80, cy = 80, sw = 10;
  const circ = 2 * Math.PI * r;
  const arcLen = (3 / 4) * circ;
  const fill = (animated / 100) * arcLen;
  const color = scoreColor(score);
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(61,214,198,0.1)" strokeWidth={sw} strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={-circ * 0.125} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={`${fill} ${circ - fill}`} strokeDashoffset={-circ * 0.125} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize="32" fontWeight="bold" fontFamily="Chakra Petch">{score}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#9dc0c3" fontSize="10" fontFamily="Chakra Petch">/100</text>
    </svg>
  );
}

const MOCK_EMPLOYEE = {
  id: 'e1', name: 'Alice Zhang', role: 'Senior Accountant', dept: 'Finance',
  archetype: 'distracted_clicker', score: 34, compromised: true, clickRate: 68, reportRate: 12,
  scenariosCompleted: 4, scenariosFailed: 3,
  dna: [
    { axis: 'Speed',       value: 25 },
    { axis: 'Compliance',  value: 55 },
    { axis: 'Skepticism',  value: 30 },
    { axis: 'Reporting',   value: 20 },
    { axis: 'Resilience',  value: 40 },
  ]
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(7,20,31,0.95)] border border-[rgba(61,214,198,0.3)] rounded p-2 text-[11px] font-['Chakra_Petch']">
      <p className="text-[var(--as-accent)]">{payload[0]?.payload?.axis}</p>
      <p className="text-[var(--as-text)] font-bold">{payload[0]?.value}</p>
    </div>
  );
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = MOCK_EMPLOYEE;
  const at = ARCHETYPE_STYLES[emp.archetype] || { bg: 'rgba(61,214,198,0.15)', color: '#3dd6c6', avatarBg: 'rgba(61,214,198,0.3)' };
  const initials = emp.name.split(' ').map(n => n[0]).join('');
  const risks = RISK_FACTORS[emp.archetype] || [];
  const [histPage, setHistPage] = useState(1);
  const HIST_SIZE = 5;
  const histPages = Math.ceil(SCENARIO_HISTORY.length / HIST_SIZE);
  const histPaged = SCENARIO_HISTORY.slice((histPage - 1) * HIST_SIZE, histPage * HIST_SIZE);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20">

      {/* Back */}
      <button onClick={() => navigate('/org/employees')} className="flex items-center gap-1.5 text-[11px] text-[var(--as-muted)] uppercase tracking-widest mb-5 hover:text-[var(--as-text)] transition-colors">
        ← BACK TO EMPLOYEES
      </button>

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT PROFILE */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4">

          {/* Identity card */}
          <div className="card flex flex-col items-center text-center animate-slideInLeft">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-[28px] font-bold font-['Chakra_Petch'] mb-3"
              style={{ background: at.avatarBg, color: at.color }}>{initials}</div>
            <h2 className="text-[22px] font-bold text-[var(--as-text)]">{emp.name}</h2>
            <p className="text-[13px] text-[var(--as-muted)]">{emp.role}</p>
            <p className="text-[11px] text-[var(--as-muted)] mb-3">{emp.dept}</p>

            {emp.compromised && (
              <div className="w-full flex items-center gap-2 px-3 py-2 rounded-[4px] mb-3"
                style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)' }}>
                <div className="w-2 h-2 rounded-full bg-[#ff4444] animate-pulse shrink-0" />
                <span className="text-[11px] text-[#ff4444] font-bold uppercase tracking-wider">Currently Compromised</span>
              </div>
            )}

            <ScoreGauge score={emp.score} />

            <div className="w-full mt-2 px-3 py-2 rounded-[4px] text-center"
              style={{ background: at.bg, border: `1px solid ${at.color}44` }}>
              <div className="text-[13px] font-bold uppercase tracking-wider mb-0.5" style={{ color: at.color }}>
                {emp.archetype.replace(/_/g, ' ')}
              </div>
              <div className="text-[11px] text-[var(--as-muted)]">{ARCHETYPE_DESC[emp.archetype]}</div>
            </div>
          </div>

          {/* Badges */}
          <div className="card animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Earned Badges</div>
            <div className="grid grid-cols-3 gap-3">
              {BADGES.map(b => (
                <div key={b.id} className={`flex flex-col items-center gap-1 p-2 rounded-[6px] border transition-all ${b.earned ? 'border-[rgba(61,214,198,0.3)]' : 'border-transparent opacity-30'}`}
                  style={{ background: b.earned ? 'rgba(61,214,198,0.06)' : 'transparent', filter: b.earned ? 'none' : 'grayscale(1)' }}>
                  <span className="text-[22px]">{b.icon}</span>
                  <span className="text-[9px] text-center font-['Chakra_Petch'] uppercase leading-tight" style={{ color: b.earned ? '#edf7f7' : '#9dc0c3' }}>{b.label}</span>
                  {!b.earned && <span className="text-[8px] text-[var(--as-muted)]">Locked</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT DNA */}
        <div className="flex-1 flex flex-col gap-4">

          <div className="text-[16px] font-bold text-[var(--as-accent2)] uppercase tracking-wider animate-slideInRight">Behavioral DNA Profile</div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeUp">
            {[
              { label: 'Click Rate',           value: `${emp.clickRate}%`,         color: '#ff4444' },
              { label: 'Report Rate',          value: `${emp.reportRate}%`,        color: '#3dd6c6' },
              { label: 'Scenarios Completed',  value: emp.scenariosCompleted,      color: '#ff7a59' },
              { label: 'Scenarios Failed',     value: emp.scenariosFailed,         color: '#ff4444' },
            ].map((s, i) => (
              <div key={i} className="card p-4 animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="text-[22px] font-bold font-['Chakra_Petch']" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Radar */}
          <div className="card animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="text-[12px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Behavioral Radar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={emp.dna} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(61,214,198,0.2)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#9dc0c3', fontSize: 11, fontFamily: 'Chakra Petch' }} />
                <Radar name="DNA" dataKey="value" stroke="#ff7a59" fill="rgba(255,122,89,0.3)" fillOpacity={1} dot={{ r: 4, fill: '#ff7a59' }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-[rgba(7,20,31,0.95)] border border-[rgba(61,214,198,0.3)] rounded p-2 text-[11px] font-['Chakra_Petch']">
                      <p className="text-[var(--as-accent)]">{payload[0]?.payload?.axis}</p>
                      <p className="text-[var(--as-text)] font-bold">{payload[0]?.value}</p>
                    </div>
                  );
                }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Factors */}
          <div className="card animate-fadeUp" style={{ animationDelay: '0.25s' }}>
            <div className="text-[12px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Risk Factors</div>
            <div className="flex flex-col gap-2.5">
              {risks.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--as-accent)] mt-1.5 shrink-0" />
                  <span className={`text-[13px] ${i === risks.length - 1 ? 'text-[#ff7a59]' : 'text-[var(--as-muted)]'}`}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario History */}
          <div className="card overflow-x-auto animate-fadeUp" style={{ animationDelay: '0.3s' }}>
            <div className="text-[12px] text-[var(--as-muted)] uppercase tracking-wider mb-4">Scenario History</div>
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-[rgba(61,214,198,0.2)]">
                  {['Scenario', 'Attack Type', 'Result', 'Date'].map(h => (
                    <th key={h} className="pb-2.5 px-2 text-left text-[10px] text-[var(--as-muted)] uppercase tracking-widest font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {histPaged.map((h, i) => (
                  <tr key={i} className="border-b border-[rgba(61,214,198,0.08)] hover:bg-[rgba(61,214,198,0.03)] transition-colors">
                    <td className="py-3 px-2 text-[13px] text-[var(--as-text)] font-bold">{h.scenario}</td>
                    <td className="py-3 px-2">
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-[2px] bg-[rgba(255,122,89,0.15)] text-[var(--as-accent)]">{h.attackType.replace(/_/g,' ')}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ color: RESULT_COLORS[h.result], background: `${RESULT_COLORS[h.result]}15` }}>{h.result}</span>
                    </td>
                    <td className="py-3 px-2 text-[11px] text-[var(--as-muted)] font-mono">{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {histPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: histPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setHistPage(p)}
                    className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold rounded border transition-colors ${p === histPage ? 'bg-[var(--as-accent)] text-[#08131b] border-[var(--as-accent)]' : 'text-[var(--as-muted)] border-[var(--as-line)] hover:border-[var(--as-accent2)]'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
