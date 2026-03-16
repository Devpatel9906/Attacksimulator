import React, { useState } from 'react';

const ATTACK_TYPES = {
  phishing:     { label: 'Phishing',      color: '#ff7a59', r: 8 },
  bec:          { label: 'BEC',           color: '#a855f7', r: 9 },
  ransomware:   { label: 'Ransomware',    color: '#ff4444', r: 10 },
  ai_deepfake:  { label: 'AI Deepfake',   color: '#3dd6c6', r: 7 },
  supply_chain: { label: 'Supply Chain',  color: '#6366f1', r: 8 },
};

const HOTSPOTS = [
  { id: 1,  x: 100, y: 60,  type: 'phishing',     country: 'US East Coast', incidents: '2.4M', severity: 'HIGH' },
  { id: 2,  x: 185, y: 50,  type: 'phishing',     country: 'United Kingdom', incidents: '840K', severity: 'HIGH' },
  { id: 3,  x: 235, y: 75,  type: 'phishing',     country: 'India',          incidents: '1.2M', severity: 'HIGH' },
  { id: 4,  x: 185, y: 110, type: 'bec',          country: 'Nigeria',        incidents: '150K', severity: 'CRITICAL' },
  { id: 5,  x: 140, y: 130, type: 'phishing',     country: 'Brazil',         incidents: '410K', severity: 'HIGH' },
  { id: 6,  x: 205, y: 45,  type: 'ransomware',   country: 'Eastern Europe', incidents: '92K',  severity: 'CRITICAL' },
  { id: 7,  x: 270, y: 65,  type: 'ai_deepfake',  country: 'China',          incidents: '620K', severity: 'HIGH' },
  { id: 8,  x: 285, y: 45,  type: 'ransomware',   country: 'North Korea',    incidents: '12K',  severity: 'CRITICAL' },
  { id: 9,  x: 220, y: 70,  type: 'ai_deepfake',  country: 'Iran',           incidents: '85K',  severity: 'HIGH' },
  { id: 10, x: 260, y: 60,  type: 'supply_chain', country: 'East Asia',      incidents: '45K',  severity: 'CRITICAL' },
];

const THREATS = [
  { id: 1, name: 'Email Phishing',        stat: '2.4M attacks/day',  trend: '↑ 17% YoY', trendColor: '#ff4444', severity: 'HIGH' },
  { id: 2, name: 'Business Email Comp.',  stat: '$2.9B losses/yr',   trend: '↑ 31% YoY', trendColor: '#ff4444', severity: 'CRITICAL' },
  { id: 3, name: 'Ransomware',            stat: 'Attack every 11s',   trend: '↑ 12% YoY', trendColor: '#ff4444', severity: 'CRITICAL' },
  { id: 4, name: 'AI Voice Deepfake',     stat: 'Rapidly emerging',   trend: '↑ 400% YoY', trendColor: '#ff4444', severity: 'HIGH' },
  { id: 5, name: 'Supply Chain Attack',   stat: '62% rise',           trend: '↑ 62% YoY', trendColor: '#ff4444', severity: 'HIGH' },
];

function SeverityBadge({ type }) {
  const styles = {
    CRITICAL: { bg: 'rgba(255,68,68,0.15)', color: '#ff4444' },
    HIGH:     { bg: 'rgba(255,122,89,0.15)', color: '#ff7a59' },
  };
  const s = styles[type] || styles.HIGH;
  return (
    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>
      {type}
    </span>
  );
}

export default function ThreatMap() {
  const [hovered, setHovered] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-16 flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between animate-slideInLeft">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
          </svg>
          <div>
            <h1 className="text-[28px] font-bold text-[var(--as-accent2)] uppercase tracking-wider">Global Threat Intelligence Map</h1>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--as-muted)]">Live attack data — updated continuously</span>
              <div className="status-dot animate-pulseDot" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* MAP AREA */}
        <div className="card flex-1 p-0 overflow-hidden relative" onMouseMove={handleMouseMove}>
          <div className="p-6 h-full flex flex-col">
            <svg viewBox="0 0 400 200" className="w-full h-auto flex-1 bg-[#07141f]">
              {/* Simplified World Continents */}
              <g fill="#1a3040" stroke="#2a4050" strokeWidth="0.5">
                {/* North America */}
                <path d="M30 30 L80 30 L110 50 L100 80 L60 80 L50 95 L30 70 Z" />
                {/* South America */}
                <path d="M110 90 L130 90 L145 120 L135 160 L120 160 L110 130 Z" />
                {/* Europe */}
                <path d="M170 30 L210 30 L215 50 L195 65 L175 60 Z" />
                {/* Africa */}
                <path d="M175 70 L215 70 L230 90 L220 130 L195 140 L170 120 L165 90 Z" />
                {/* Asia */}
                <path d="M215 30 L320 30 L340 50 L350 80 L320 100 L260 100 L235 80 L220 60 Z" />
                {/* Australia */}
                <path d="M300 120 L330 120 L340 140 L320 155 L295 145 Z" />
              </g>

              {/* Hotspots */}
              {HOTSPOTS.map((h) => {
                const type = ATTACK_TYPES[h.type];
                return (
                  <g key={h.id} 
                    onMouseEnter={() => setHovered(h)} 
                    onMouseLeave={() => setHovered(null)} 
                    className="cursor-pointer"
                  >
                    {/* Pulsing ring */}
                    <circle cx={h.x} cy={h.y} r={type.r * 1.5} fill="none" stroke={type.color} strokeWidth="1" opacity="0.6">
                      <animate attributeName="r" from={type.r} to={type.r * 2.5} dur={`${2 + (h.id % 3) * 0.5}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur={`${2 + (h.id % 3) * 0.5}s`} repeatCount="indefinite" />
                    </circle>
                    {/* Fixed dot */}
                    <circle cx={h.x} cy={h.y} r={type.r / 2} fill={type.color} />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hovered && (
              <div 
                className="absolute z-50 pointer-events-none fadeUp"
                style={{ 
                  left: mousePos.x + 15, 
                  top: mousePos.y + 15,
                  background: '#0d2230',
                  border: '1px solid rgba(61,214,198,0.3)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  minWidth: '140px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-widest mb-1">{hovered.country}</div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-[12px] font-bold text-[var(--as-text)]">{ATTACK_TYPES[hovered.type].label}</span>
                  <SeverityBadge type={hovered.severity} />
                </div>
                <div className="text-[11px] text-[var(--as-muted)]">~{hovered.incidents} incidents/month</div>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 mt-6 px-4">
              {Object.entries(ATTACK_TYPES).map(([key, h]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                  <span className="text-[11px] font-bold text-[var(--as-text)] font-['Chakra_Petch'] uppercase tracking-widest">{h.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom Bar Sources */}
            <div className="mt-6 pt-4 border-t border-[rgba(61,214,198,0.1)] flex items-center gap-4">
               <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">Data Sources:</span>
               <div className="flex gap-2">
                 {["FBI IC3 2023", "Verizon DBIR 2023", "IBM X-Force 2023"].map(s => (
                   <span key={s} className="px-2 py-0.5 rounded bg-[rgba(157,192,195,0.08)] border border-[rgba(157,192,195,0.2)] text-[9px] text-[var(--as-muted)]">
                     {s}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - MOST ACTIVE THREATS */}
        <div className="card w-full lg:w-[320px] shrink-0">
           <h3 className="text-[12px] font-bold text-[var(--as-accent2)] uppercase tracking-[0.1em] mb-6">Most Active Threats</h3>
           <div className="flex flex-col gap-1">
             {THREATS.map((t, i) => (
                <div key={t.id} className="py-4 border-b border-[rgba(61,214,198,0.08)] last:border-0 animate-slideInRight" style={{ animationDelay: `${i * 80}ms` }}>
                   <div className="flex items-start justify-between mb-1">
                      <div className="flex items-baseline gap-3">
                         <span className="text-[16px] font-['Chakra_Petch'] text-[var(--as-accent)] font-bold">{t.id}</span>
                         <span className="text-[14px] font-bold text-[var(--as-text)]">{t.name}</span>
                      </div>
                      <SeverityBadge type={t.severity} />
                   </div>
                   <div className="flex items-center justify-between ml-7">
                      <span className="text-[11px] text-[var(--as-muted)]">{t.stat}</span>
                      <span className="text-[11px] font-bold" style={{ color: t.trendColor }}>{t.trend}</span>
                   </div>
                </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}
