import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const ARCHETYPE_STYLES = {
  distracted_clicker: { color: '#eab308', icon: '🖱', label: 'Distracted Clicker',
    desc: 'You tend to click before fully reading content, especially during busy periods.',
    bullets: ['High click-through on time-sensitive emails', 'Vulnerable during peak work hours', 'Benefits from deliberate pause practice'] },
  rushed_responder:   { color: '#ff7a59', icon: '⚡', label: 'Rushed Responder',
    desc: 'You act under urgency without verifying sender identity or link destinations.',
    bullets: ['Fast responder to URGENT subject lines', 'Most vulnerable in morning hours', 'Improves with verification habit training'] },
  trusting_delegator: { color: '#a855f7', icon: '🤝', label: 'Trusting Delegator',
    desc: 'Authority cues heavily influence your actions — susceptible to executive impersonation.',
    bullets: ['Responds to authority without questioning', 'BEC and CEO fraud are primary risks', 'Benefits from chain-of-trust verification'] },
  skeptical_verifier: { color: '#3dd6c6', icon: '🔍', label: 'Skeptical Verifier',
    desc: 'You question suspicious requests and report effectively — a strong security culture contributor.',
    bullets: ['Excellent reporting habits', 'Low click rates across all attack types', 'Keep reinforcing verification workflows'] },
};

const BADGES = [
  { id: 'chain_breaker', label: 'Chain Breaker', earned: true,  desc: 'Reported a phishing email before anyone was compromised', earnHow: 'Report a phishing email as Patient Zero target' },
  { id: 'first_responder', label: 'First Responder', earned: true, desc: 'First employee to report in a scenario', earnHow: 'Be the first to report a suspicious email' },
  { id: 'skeptic', label: 'Skeptic', earned: false, desc: 'Verified a sender before clicking over 10 times', earnHow: 'Hover-verify 10 suspicious links' },
  { id: 'defender', label: 'Perfect Defense', earned: false, desc: 'Completed a scenario with 0 clicks', earnHow: 'Finish a scenario without clicking any link' },
  { id: 'comeback', label: 'Comeback', earned: true,  desc: 'Improved score by 20+ points after being compromised', earnHow: 'Improve score 20+ pts after compromise' },
  { id: 'educator', label: 'Educator', earned: false, desc: 'Completed all 6 modules with perfect quiz scores', earnHow: 'Score 100% on all 6 awareness modules' },
];

const MODULES = [
  { id: 'm1', title: 'Phishing Fundamentals',      attackType: 'email_phishing',          difficulty: 'Beginner', time: 8,  status: 'COMPLETED',    score: 90 },
  { id: 'm2', title: 'Credential Harvesting 101',  attackType: 'credential_harvesting',   difficulty: 'Beginner', time: 6,  status: 'COMPLETED',    score: 80 },
  { id: 'm3', title: 'Business Email Compromise',  attackType: 'bec',                     difficulty: 'Intermediate', time: 12, status: 'IN_PROGRESS', score: null },
  { id: 'm4', title: 'SIM Swap & Voice Attacks',   attackType: 'sim_swap',                difficulty: 'Intermediate', time: 10, status: 'ASSIGNED',  score: null },
  { id: 'm5', title: 'AI Deepfake Awareness',      attackType: 'ai_deepfake',             difficulty: 'Advanced', time: 15, status: 'ASSIGNED',    score: null },
  { id: 'm6', title: 'Ransomware Defense',         attackType: 'ransomware',              difficulty: 'Advanced', time: 14, status: 'ASSIGNED',    score: null },
];

const ATTACK_COLORS = { email_phishing: '#ff7a59', credential_harvesting: '#ff4444', bec: '#a855f7', sim_swap: '#eab308', ai_deepfake: '#3dd6c6', ransomware: '#ff4444', social_engineering: '#ec4899' };
const STATUS_DOTS = { ASSIGNED: '#9dc0c3', IN_PROGRESS: '#ff7a59', COMPLETED: '#3dd6c6' };
const scoreColor = s => s < 40 ? '#ff4444' : s < 70 ? '#ff7a59' : '#3dd6c6';

function ScoreGauge({ score }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(score), 300); return () => clearTimeout(t); }, [score]);
  const r = 86, cx = 100, cy = 100, sw = 14;
  const circ = 2 * Math.PI * r;
  const arc  = (3 / 4) * circ;
  const fill = (anim / 100) * arc;
  const col  = scoreColor(score);
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(61,214,198,0.1)" strokeWidth={sw} strokeDasharray={`${arc} ${circ}`} strokeDashoffset={-circ * 0.125} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={sw}
        strokeDasharray={`${fill} ${circ - fill}`} strokeDashoffset={-circ * 0.125} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.5s ease', filter: `drop-shadow(0 0 8px ${col}88)` }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill={col} fontSize="56" fontWeight="bold" fontFamily="Chakra Petch">{score}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#9dc0c3" fontSize="10" fontFamily="Chakra Petch" letterSpacing="2">YOUR SECURITY SCORE</text>
    </svg>
  );
}

export default function PersonalDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const firstName = user?.name?.split(' ')[0] || 'Analyst';
  const score = 34; const archetype = 'distracted_clicker';
  const at = ARCHETYPE_STYLES[archetype];
  const [tooltip, setTooltip] = useState(null);
  const completedMods = MODULES.filter(m => m.status === 'COMPLETED').length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-20 flex flex-col gap-8">

      {/* HEADER */}
      <div className="animate-slideInLeft">
        <h1 className="text-[30px] font-bold"
          style={{ background: 'linear-gradient(90deg,#3dd6c6,#edf7f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          WELCOME BACK, {firstName.toUpperCase()}
        </h1>
        <p className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mt-0.5">Your Security Mission Briefing</p>
      </div>

      {/* HERO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card flex flex-col items-center animate-fadeUp">
          <ScoreGauge score={score} />
          <span className="text-[13px] text-[var(--as-accent2)] mt-1">+3 this week</span>
        </div>
        <div className="card animate-fadeUp" style={{ animationDelay: '0.1s' }}>
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-2">Your Behavioral Archetype</div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[32px]">{at.icon}</span>
            <div className="text-[18px] font-bold" style={{ color: at.color }}>{at.label}</div>
          </div>
          <p className="text-[13px] text-[var(--as-muted)] leading-relaxed mb-3">{at.desc}</p>
          <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">Vulnerability Profile</div>
          <div className="flex flex-col gap-2">
            {at.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-accent)] mt-1.5 shrink-0" />
                <span className="text-[13px] text-[var(--as-text)]">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BADGES */}
      <div className="animate-fadeUp" style={{ animationDelay: '0.2s' }}>
        <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Your Badges</div>
        <div className="flex gap-3 flex-wrap">
          {BADGES.map(b => (
            <div key={b.id} className="relative group">
              <div className={`card w-[120px] flex flex-col items-center gap-2 p-4 text-center transition-all ${!b.earned && 'opacity-40 grayscale'}`}
                style={{ borderColor: b.earned ? 'rgba(61,214,198,0.4)' : 'var(--as-line)' }}
                onMouseEnter={() => setTooltip(b.id)} onMouseLeave={() => setTooltip(null)}>
                <span className="text-[28px]">{['🔗','⚡','🔍','🛡','↑','📚'][BADGES.indexOf(b)]}</span>
                <span className="text-[10px] font-['Chakra_Petch'] uppercase leading-tight" style={{ color: b.earned ? '#edf7f7' : '#9dc0c3' }}>{b.label}</span>
                {!b.earned && <span className="text-[9px] text-[var(--as-muted)]">Locked</span>}
              </div>
              {tooltip === b.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[180px] z-30 animate-fadeUp"
                  style={{ background: '#0d2230', border: '1px solid rgba(61,214,198,0.3)', borderRadius: 4, padding: '8px 10px' }}>
                  <p className="text-[11px] text-[var(--as-text)] mb-1">{b.desc}</p>
                  {!b.earned && <p className="text-[10px] text-[var(--as-accent2)]">How: {b.earnHow}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODULES */}
      <div className="animate-fadeUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] text-[var(--as-muted)] uppercase tracking-wider">My Awareness Modules</div>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(61,214,198,0.15)', color: '#3dd6c6' }}>
            {completedMods}/{MODULES.length} completed
          </span>
        </div>
        <div className="h-1 bg-[rgba(61,214,198,0.1)] rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-[var(--as-accent2)] rounded-full transition-all duration-1000" style={{ width: `${(completedMods / MODULES.length) * 100}%` }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, i) => (
            <div key={mod.id} className="card flex flex-col gap-3 animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded" style={{ background: `${ATTACK_COLORS[mod.attackType] || '#ff7a59'}20`, color: ATTACK_COLORS[mod.attackType] || '#ff7a59' }}>
                  {mod.attackType.replace(/_/g, ' ')}
                </span>
                <span className="text-[9px] uppercase text-[var(--as-muted)] border border-[var(--as-line)] px-1.5 py-0.5 rounded">{mod.difficulty}</span>
              </div>
              <div className="text-[13px] font-bold text-[var(--as-text)]">{mod.title}</div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${mod.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`} style={{ background: STATUS_DOTS[mod.status] }} />
                <span className="text-[10px] text-[var(--as-muted)] uppercase">{mod.status.replace('_', ' ')}</span>
                <span className="text-[10px] text-[var(--as-muted)] ml-auto">~{mod.time} min</span>
              </div>
              {mod.status === 'COMPLETED' && mod.score && (
                <div className="text-[11px] text-[var(--as-accent2)]">Score: {mod.score}%</div>
              )}
              <button onClick={() => navigate(`/me/modules/${mod.id}`)}
                className={`w-full py-2 rounded-[4px] text-[11px] font-bold uppercase tracking-wider font-['Chakra_Petch'] transition-all ${mod.status === 'COMPLETED' ? 'btn-ghost' : 'btn-primary'}`}>
                {mod.status === 'COMPLETED' ? 'REVIEW →' : 'START MODULE →'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LAST SIM RESULT */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.4s', borderLeft: '3px solid #ff4444' }}>
        <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Last Simulation Result</div>
        <p className="text-[14px] text-[var(--as-text)] mb-3">
          You were <span className="text-[#ff4444] font-bold">compromised</span> via <span className="text-[var(--as-accent)]">Email Phishing</span> on <span className="text-[var(--as-muted)]">Feb 14, 2026</span>.
        </p>
        <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-2">Red flags missed:</div>
        <ul className="flex flex-col gap-1.5 mb-4">
          {['Sender domain: acmecorp-invoices.com (not acmecorp.com)', 'Generic greeting: "Dear Employee"', 'Urgent payment request with no prior email chain'].map((f, i) => (
            <li key={i} className="flex gap-2 text-[12px] text-[var(--as-text)]">
              <span className="text-[#ff4444] shrink-0">⚠</span>{f}
            </li>
          ))}
        </ul>
        <button onClick={() => navigate('/me/debrief/sc-1')} className="text-[11px] text-[var(--as-accent2)] uppercase tracking-wider hover:underline">
          VIEW FULL DEBRIEF →
        </button>
      </div>

    </div>
  );
}
