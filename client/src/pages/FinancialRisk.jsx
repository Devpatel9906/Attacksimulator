import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useAuthStore from '../stores/authStore';

// Animated counter hook
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const fmtUSD = (n) => '$' + n.toLocaleString();

const BREAKDOWN = [
  { name: 'Direct Costs',   value: 162000, color: '#ff4444' },
  { name: 'Lost Business',  value: 98000,  color: '#ff7a59' },
  { name: 'Regulatory',     value: 55000,  color: '#a855f7' },
  { name: 'Reputational',   value: 35000,  color: '#eab308' },
];
const TOTAL_EXPOSURE = BREAKDOWN.reduce((s, d) => s + d.value, 0);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[rgba(7,20,31,0.95)] border border-[rgba(61,214,198,0.3)] rounded p-2 text-[11px] font-['Chakra_Petch']">
      <p style={{ color: payload[0].payload.color }} className="font-bold">{payload[0].name}</p>
      <p className="text-[var(--as-text)]">{fmtUSD(payload[0].value)}</p>
      <p className="text-[var(--as-muted)]">{(payload[0].value / TOTAL_EXPOSURE * 100).toFixed(1)}%</p>
    </div>
  );
};

export default function FinancialRisk() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [insuranceLimit, setInsuranceLimit] = useState(2000000);
  const [inputLimit, setInputLimit] = useState('2000000');
  const coverageGap = Math.max(0, TOTAL_EXPOSURE - insuranceLimit);
  const isCovered = coverageGap === 0;

  const animExposure = useCountUp(TOTAL_EXPOSURE, 2000);
  const animCoverage = useCountUp(insuranceLimit, 1500);
  const animGap      = useCountUp(coverageGap, 1500);

  const handleLimitChange = () => {
    const parsed = parseInt(inputLimit.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed)) setInsuranceLimit(parsed);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 flex flex-col gap-8">

      {/* HEADER */}
      <div className="animate-slideInLeft">
        <h1 className="text-[28px] font-bold text-[#ff4444] uppercase tracking-wider mb-1">Financial Exposure Analysis</h1>
        <p className="text-[var(--as-muted)] text-[13px] mb-3">Acme Corporation — Financial Services</p>
        <div className="flex flex-wrap gap-2">
          {['IBM CODB 2023', 'Verizon DBIR 2023', 'FBI IC3 2023'].map(src => (
            <span key={src} className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border"
              style={{ background: 'rgba(61,214,198,0.08)', borderColor: 'rgba(61,214,198,0.24)', color: '#3dd6c6' }}>
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* HERO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Card 1: Total Exposure */}
        <div className="card relative overflow-hidden animate-fadeUp" style={{ borderColor: 'rgba(255,68,68,0.4)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,68,68,0.12) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-2">Total Financial Exposure</div>
          <div className="text-[52px] font-bold text-[#ff4444] leading-none mb-2">{fmtUSD(animExposure)}</div>
          <div className="text-[12px] text-[var(--as-muted)]">Based on 14 compromised employees</div>
        </div>

        {/* Card 2: Insurance Coverage */}
        <div className="card animate-fadeUp" style={{ animationDelay: '0.1s' }}>
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-2">Insurance Coverage</div>
          <div className="text-[42px] font-bold text-[var(--as-accent2)] leading-none mb-4">{fmtUSD(animCoverage)}</div>
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1">Adjust Limit:</div>
          <div className="flex gap-2">
            <input
              type="text" value={inputLimit}
              onChange={e => setInputLimit(e.target.value)}
              onBlur={handleLimitChange}
              onKeyDown={e => e.key === 'Enter' && handleLimitChange()}
              className="w-[160px] bg-[rgba(7,20,31,0.8)] border border-[rgba(61,214,198,0.24)] text-[var(--as-text)] px-3 py-1.5 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none text-[13px] font-['Chakra_Petch']"
              placeholder="$2,000,000"
            />
            <button onClick={handleLimitChange} className="btn-ghost text-[11px] px-3 py-1.5">APPLY</button>
          </div>
        </div>

        {/* Card 3: Coverage Gap */}
        <div className="card animate-fadeUp" style={{ animationDelay: '0.2s', borderColor: isCovered ? 'rgba(61,214,198,0.4)' : 'rgba(255,68,68,0.4)' }}>
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-2">Coverage Gap</div>
          <div className="text-[42px] font-bold leading-none mb-3" style={{ color: isCovered ? '#3dd6c6' : '#ff4444' }}>
            {isCovered ? 'NONE' : fmtUSD(animGap)}
          </div>
          {isCovered ? (
            <div className="flex items-center gap-2 text-[var(--as-accent2)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[11px] font-bold uppercase tracking-widest">Fully Covered</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#ff4444]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span className="text-[11px] font-bold uppercase tracking-widest">Uninsured Exposure</span>
            </div>
          )}
        </div>
      </div>

      {/* ROW 2: COST ANALYSIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Incident Response', value: '$45,000' },
          { label: 'Data Recovery', value: '$38,000' },
          { label: 'Regulatory Fines', value: '$55,000' },
          { label: 'Reputational Damage', value: '$35,000' },
        ].map((item, i) => (
          <div key={i} className="card animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="text-[20px] font-bold text-[var(--as-accent)] mb-1">{item.value}</div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>

      {/* ROW 3: ROI */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.35s' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1">Cost to Remediate</div>
            <div className="text-[32px] font-bold text-[var(--as-text)] mb-1">$12,000</div>
            <div className="text-[12px] text-[var(--as-muted)]">Estimated annual security awareness training cost</div>
            <div className="mt-6">
              <div className="text-[10px] text-[var(--as-muted)] uppercase mb-2">Scale Comparison</div>
              <div className="flex h-4 rounded-full overflow-hidden w-full">
                <div className="h-full" style={{ width: '3%', background: '#3dd6c6' }} title="Training: $12k" />
                <div className="h-full flex-1" style={{ background: '#ff444488' }} title="Exposure: $350k" />
              </div>
              <div className="flex justify-between text-[9px] text-[var(--as-muted)] mt-1 uppercase">
                <span className="text-[var(--as-accent2)]">Training $12k</span>
                <span className="text-[#ff4444]">Potential Exposure $350k+</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-1">Return on Investment</div>
            <div className="text-[72px] font-bold text-[var(--as-accent2)] leading-none">391×</div>
            <div className="text-[12px] text-[var(--as-muted)] text-right mt-2 max-w-[240px]">Every $1 spent on awareness training prevents $391 in breach costs</div>
          </div>
        </div>
      </div>

      {/* ROW 4: DONUT CHART */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-5">Exposure Breakdown by Category</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={260} className="max-w-[320px]">
            <PieChart>
              <Pie data={BREAKDOWN} cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={3} dataKey="value">
                {BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-3 flex-1">
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-1">Total: <span className="text-[#ff4444] font-bold text-[14px]">{fmtUSD(TOTAL_EXPOSURE)}</span></div>
            {BREAKDOWN.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
                  <span className="text-[12px] text-[var(--as-text)]">{item.name}</span>
                </div>
                <div className="flex gap-4 text-right">
                  <span className="text-[12px] font-bold" style={{ color: item.color }}>{fmtUSD(item.value)}</span>
                  <span className="text-[11px] text-[var(--as-muted)] w-10">{(item.value / TOTAL_EXPOSURE * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-center">
        <button onClick={() => navigate('/scenarios/sc-1/report')} className="btn-primary flex items-center gap-2 text-[13px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          GENERATE BOARD REPORT
        </button>
      </div>

    </div>
  );
}
