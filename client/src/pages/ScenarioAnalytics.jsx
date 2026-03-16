import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart, Cell
} from 'recharts';

const ATTACK_COLORS = {
  email_phishing: '#ff7a59', credential_harvesting: '#ff4444', social_engineering: '#a855f7',
  bec: '#ec4899', sim_swap: '#f97316', ai_deepfake: '#3dd6c6'
};

const resultColors = { CLICKED: '#ff7a59', SUBMITTED: '#ff4444', REPORTED: '#3dd6c6' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(7,20,31,0.95)] border border-[rgba(61,214,198,0.3)] rounded-[4px] p-3 text-[11px] font-['Chakra_Petch']">
      <p className="text-[var(--as-accent2)] font-bold mb-1 uppercase">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[var(--as-text)] font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const MOCK_KPIS = { compromised: 14, clicked: 38, reported: 112, clickRate: 12.5, reportRate: 68, financialExposure: 15400 };

const MOCK_ATTACK_DATA = [
  { type: 'Email Phish', targeted: 120, clicked: 18, reported: 60 },
  { type: 'Credential', targeted: 60, clicked: 12, reported: 28 },
  { type: 'BEC', targeted: 30, clicked: 6, reported: 20 },
  { type: 'SIM Swap', targeted: 20, clicked: 2, reported: 8 },
];

const MOCK_DEPT_DATA = [
  { dept: 'Sales', rate: 58 }, { dept: 'Finance', rate: 44 }, { dept: 'Marketing', rate: 32 },
  { dept: 'HR', rate: 15 }, { dept: 'Engineering', rate: 8 }
];

const MOCK_TIMELINE = [
  { min: 0, compromised: 0, reported: 0 }, { min: 2, compromised: 2, reported: 1 },
  { min: 5, compromised: 5, reported: 8 }, { min: 10, compromised: 9, reported: 30 },
  { min: 15, compromised: 12, reported: 55 }, { min: 20, compromised: 14, reported: 112 }
];

const MOCK_EVENTS = Array.from({ length: 35 }, (_, i) => ({
  id: `ev${i}`, employee: ['Alice Zhang','Bob Lee','Carol Kim','Dave Wu','Eve Park'][i%5],
  department: ['Finance','Sales','Marketing','Engineering','HR'][i%5],
  attackType: ['email_phishing','credential_harvesting','bec','sim_swap','social_engineering'][i%5],
  channel: ['email','sms','whatsapp','phone'][i%4],
  result: ['CLICKED','SUBMITTED','REPORTED','CLICKED','REPORTED'][i%5],
  isGhostHop: i % 7 === 0, time: `T+${String(Math.floor(i/2)).padStart(2,'0')}:${String((i*7)%60).padStart(2,'0')}`
}));

const channelLabel = { email: '✉ Email', sms: '📱 SMS', whatsapp: '💬 WhatsApp', phone: '📞 Voice' };
const PAGE_SIZE = 10;

export default function ScenarioAnalytics() {
  const { id: routeId } = useParams();
  const id = routeId || 'sc-1';
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deptWidths, setDeptWidths] = useState(MOCK_DEPT_DATA.map(() => 0));

  useEffect(() => {
    const t = setTimeout(() => setDeptWidths(MOCK_DEPT_DATA.map(d => d.rate)), 300);
    return () => clearTimeout(t);
  }, []);

  const totalPages = Math.ceil(MOCK_EVENTS.length / PAGE_SIZE);
  const pagedEvents = MOCK_EVENTS.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const deptColor = (rate) => rate > 50 ? '#ff4444' : rate > 20 ? '#ff7a59' : '#3dd6c6';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 flex flex-col gap-8">

      {/* HEADER */}
      <div className="animate-slideInLeft">
        <h1 className="h1 text-[var(--as-accent2)] mb-1">SCENARIO ANALYTICS</h1>
        <p className="text-[var(--as-muted)] text-[12px] uppercase tracking-widest">Q3 Invoice Phish — Post-scenario report</p>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Compromised', value: MOCK_KPIS.compromised, color: '#ff4444' },
          { label: 'Clicked', value: MOCK_KPIS.clicked, color: '#ff7a59' },
          { label: 'Reported', value: MOCK_KPIS.reported, color: '#3dd6c6' },
          { label: 'Click Rate', value: `${MOCK_KPIS.clickRate}%`, color: '#ff7a59' },
          { label: 'Report Rate', value: `${MOCK_KPIS.reportRate}%`, color: '#3dd6c6' },
          { label: 'Exposure', value: `$${MOCK_KPIS.financialExposure.toLocaleString()}`, color: '#ff4444', small: true },
        ].map((k, i) => (
          <div key={i} className="card p-5 animate-fadeUp" style={{ animationDelay: `${i*0.05}s` }}>
            <div className={`font-bold mb-1 ${k.small ? 'text-[20px]' : 'text-[28px]'}`} style={{ color: k.color }}>{k.value}</div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-[0.1em]">{k.label}</div>
          </div>
        ))}
      </div>

      {/* ROW 2: BY ATTACK TYPE */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-5">Click & Report Rate by Attack Type</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={MOCK_ATTACK_DATA} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,198,0.15)" />
            <XAxis dataKey="type" tick={{ fill: '#9dc0c3', fontSize: 10, fontFamily: 'Chakra Petch' }} />
            <YAxis tick={{ fill: '#9dc0c3', fontSize: 10, fontFamily: 'Chakra Petch' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontFamily: 'Chakra Petch', fontSize: 10, textTransform: 'uppercase', color: '#9dc0c3' }} />
            <Bar dataKey="targeted" name="Targeted" fill="rgba(61,214,198,0.3)" radius={[2,2,0,0]} />
            <Bar dataKey="clicked" name="Clicked" fill="#ff7a59" radius={[2,2,0,0]} />
            <Bar dataKey="reported" name="Reported" fill="#3dd6c6" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROW 3: BY DEPARTMENT */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-5">Compromise Rate by Department</h3>
        <div className="flex flex-col gap-4">
          {MOCK_DEPT_DATA.map((d, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-[12px] text-[var(--as-text)] w-[100px] shrink-0">{d.dept}</span>
              <div className="flex-1 h-[6px] bg-[rgba(61,214,198,0.1)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${deptWidths[i]}%`, background: deptColor(d.rate), boxShadow: `0 0 8px ${deptColor(d.rate)}88` }} />
              </div>
              <span className="text-[12px] font-bold w-[36px] text-right" style={{ color: deptColor(d.rate) }}>{d.rate}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ROW 4: TIMELINE */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-5">Cumulative Events Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MOCK_TIMELINE} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4444" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#ff4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3dd6c6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3dd6c6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,214,198,0.15)" />
            <XAxis dataKey="min" tickFormatter={v => `T+${v}m`} tick={{ fill: '#9dc0c3', fontSize: 10, fontFamily: 'Chakra Petch' }} />
            <YAxis tick={{ fill: '#9dc0c3', fontSize: 10, fontFamily: 'Chakra Petch' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontFamily: 'Chakra Petch', fontSize: 10, textTransform: 'uppercase', color: '#9dc0c3' }} />
            <Area type="monotone" dataKey="compromised" name="Compromised" stroke="#ff4444" strokeWidth={2} fill="url(#compGrad)" dot={false} />
            <Area type="monotone" dataKey="reported" name="Reported" stroke="#3dd6c6" strokeWidth={2} fill="url(#repGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ROW 5: EVENTS TABLE */}
      <div className="card animate-fadeUp overflow-x-auto" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-4">Simulation Events</h3>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider border-b border-[rgba(61,214,198,0.15)]">
              {['Employee','Dept','Attack Type','Channel','Result','Ghost Hop','Time'].map(h => (
                <th key={h} className="pb-3 px-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedEvents.map((ev, i) => (
              <tr key={ev.id} className="text-[12px] border-b border-[rgba(61,214,198,0.06)] hover:bg-[rgba(61,214,198,0.03)] transition-colors">
                <td className="py-2.5 px-2 font-medium text-[var(--as-text)]">{ev.employee}</td>
                <td className="py-2.5 px-2 text-[var(--as-muted)]">{ev.department}</td>
                <td className="py-2.5 px-2">
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-[2px]"
                    style={{ color: ATTACK_COLORS[ev.attackType] || '#9dc0c3', background: `${ATTACK_COLORS[ev.attackType] || '#9dc0c3'}22` }}>
                    {ev.attackType.replace(/_/g,' ')}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-[var(--as-muted)] text-[12px]">{channelLabel[ev.channel]}</td>
                <td className="py-2.5 px-2">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{ color: resultColors[ev.result], background: `${resultColors[ev.result]}15` }}>
                    {ev.result}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center">
                  {ev.isGhostHop && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#a855f7" className="mx-auto"><path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/><circle cx="9" cy="11" r="1.5" fill="#07141F"/><circle cx="15" cy="11" r="1.5" fill="#07141F"/></svg>
                  )}
                </td>
                <td className="py-2.5 px-2 text-[var(--as-muted)] font-mono text-[10px]">{ev.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold rounded border transition-colors ${p === page ? 'bg-[var(--as-accent)] text-[#08131b] border-[var(--as-accent)]' : 'text-[var(--as-muted)] border-[var(--as-line)] hover:border-[var(--as-accent2)]'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* EXPORT */}
      <div className="flex justify-end">
        <button onClick={() => navigate(`/scenarios/${id}/report`)} className="btn-primary">
          DOWNLOAD BOARD REPORT →
        </button>
      </div>

    </div>
  );
}
