import React from 'react';
import { useNavigate } from 'react-router-dom';

const MODULES = [
  { id: 'm1', title: 'Phishing Fundamentals',     attackType: 'email_phishing',        difficulty: 'Beginner',    time: 8,  status: 'COMPLETED',   score: 90 },
  { id: 'm2', title: 'Credential Harvesting 101', attackType: 'credential_harvesting', difficulty: 'Beginner',    time: 6,  status: 'COMPLETED',   score: 80 },
  { id: 'm3', title: 'Business Email Compromise', attackType: 'bec',                   difficulty: 'Intermediate',time: 12, status: 'IN_PROGRESS', score: null },
  { id: 'm4', title: 'SIM Swap & Voice Attacks',  attackType: 'sim_swap',              difficulty: 'Intermediate',time: 10, status: 'ASSIGNED',   score: null },
  { id: 'm5', title: 'AI Deepfake Awareness',     attackType: 'ai_deepfake',           difficulty: 'Advanced',   time: 15, status: 'ASSIGNED',   score: null },
  { id: 'm6', title: 'Ransomware Defense',        attackType: 'ransomware',            difficulty: 'Advanced',   time: 14, status: 'ASSIGNED',   score: null },
];

const ATTACK_COLORS  = { email_phishing: '#ff7a59', credential_harvesting: '#ff4444', bec: '#a855f7', sim_swap: '#eab308', ai_deepfake: '#3dd6c6', ransomware: '#ff4444' };
const STATUS_DOTS    = { ASSIGNED: '#9dc0c3', IN_PROGRESS: '#ff7a59', COMPLETED: '#3dd6c6' };
const STATUS_ORDER   = { IN_PROGRESS: 0, ASSIGNED: 1, COMPLETED: 2 };

export default function ModuleList() {
  const navigate = useNavigate();
  const completed = MODULES.filter(m => m.status === 'COMPLETED').length;
  const sorted = [...MODULES].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 animate-slideInLeft">
        <h1 className="text-[26px] font-bold text-[var(--as-text)] uppercase tracking-wider">My Awareness Modules</h1>
        <span className="text-[13px] font-bold" style={{ background: 'rgba(61,214,198,0.15)', color: '#3dd6c6', padding: '4px 14px', borderRadius: 99 }}>
          {completed}/{MODULES.length} completed
        </span>
      </div>

      <div className="h-1.5 bg-[rgba(61,214,198,0.1)] rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-[var(--as-accent2)] rounded-full transition-all duration-1000" style={{ width: `${(completed / MODULES.length) * 100}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((mod, i) => (
          <div key={mod.id} className={`card flex flex-col gap-4 animate-fadeUp transition-opacity ${mod.status === 'COMPLETED' ? 'opacity-70 hover:opacity-100' : ''}`}
            style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex justify-between items-start">
              <span className="text-[9px] uppercase px-2 py-0.5 rounded"
                style={{ background: `${ATTACK_COLORS[mod.attackType] || '#ff7a59'}20`, color: ATTACK_COLORS[mod.attackType] || '#ff7a59' }}>
                {mod.attackType.replace(/_/g, ' ')}
              </span>
              <span className="text-[9px] uppercase text-[var(--as-muted)] border border-[var(--as-line)] px-1.5 py-0.5 rounded">{mod.difficulty}</span>
            </div>

            <div className="text-[15px] font-bold text-[var(--as-text)]">{mod.title}</div>

            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${mod.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} style={{ background: STATUS_DOTS[mod.status] }} />
              <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider">{mod.status.replace('_', ' ')}</span>
              {mod.status === 'IN_PROGRESS' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full animate-pulse" style={{ background: 'rgba(255,122,89,0.2)', color: '#ff7a59' }}>IN PROGRESS</span>
              )}
              <span className="text-[11px] text-[var(--as-muted)] ml-auto">~{mod.time} min</span>
            </div>

            {mod.status === 'COMPLETED' && mod.score !== null && (
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[var(--as-accent2)] font-bold">Score: {mod.score}%</span>
                <div className="flex-1 h-1.5 bg-[rgba(61,214,198,0.1)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--as-accent2)]" style={{ width: `${mod.score}%` }} />
                </div>
              </div>
            )}

            <button onClick={() => navigate(`/me/modules/${mod.id}`)}
              className={`w-full py-2.5 rounded-[4px] text-[11px] font-bold uppercase tracking-wider font-['Chakra_Petch'] transition-all mt-auto ${mod.status === 'COMPLETED' ? 'btn-ghost' : 'btn-primary'}`}>
              {mod.status === 'COMPLETED' ? 'REVIEW →' : mod.status === 'IN_PROGRESS' ? 'CONTINUE →' : 'START MODULE →'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
