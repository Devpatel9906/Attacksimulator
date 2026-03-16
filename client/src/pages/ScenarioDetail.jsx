import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import PhishingSender from '../components/PhishingSender';

const ghostStateConfig = {
  DORMANT:    { color: '#9dc0c3', label: 'Dormant',    icon: '●' },
  SPAWNED:    { color: '#eab308', label: 'Spawned',    icon: '⚡' },
  PROFILING:  { color: '#3b82f6', label: 'Profiling',  icon: '👁' },
  SPREADING:  { color: '#ff7a59', label: 'Spreading',  icon: '☠' },
  ESCALATING: { color: '#ff4444', label: 'Escalating', icon: '☠', pulse: true },
  TERMINATED: { color: '#3dd6c6', label: 'Terminated', icon: '✓' },
  BREACHED:   { color: '#ff4444', label: 'Breached',   icon: '🚨', pulse: true },
};

const attackColors = {
  email_phishing: '#ff7a59', credential_harvesting: '#ff4444', social_engineering: '#a855f7',
  malware_simulation: '#eab308', sim_swap: '#f97316', bec: '#ec4899', ai_deepfake: '#3dd6c6',
};

const resultColors = { CLICKED: '#ff7a59', SUBMITTED: '#ff4444', REPORTED: '#3dd6c6' };
const channelIcon = { email: '✉', sms: '📱', whatsapp: '💬', phone: '📞' };

const ScenarioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [scenario, setScenario] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 700));

      setScenario({
        id, name: 'Q3 Invoice Phish', status: 'ACTIVE', difficulty: 'HIGH',
        attackTypes: ['email_phishing', 'credential_harvesting'],
        ghostState: 'SPREADING', compromisedCount: 14,
        financialExposure: 15400,
        patientZero: { name: 'Alice Zhang', dept: 'Finance', role: 'Senior Accountant' },
        aggression: 3, currentTechnique: 'SMTP Header Spoofing',
        techniqueHistory: ['Initial Reconnaissance', 'Domain Enumeration', 'Spear Phishing Prep', 'SMTP Header Spoofing'],
        targetCount: 215
      });

      setEvents([
        { id: 'e1', employeeName: 'Bob Martinez', dept: 'Sales', attackType: 'email_phishing', result: 'CLICKED', channel: 'email', time: '2m ago', isPatientZero: false },
        { id: 'e2', employeeName: 'Alice Zhang', dept: 'Finance', attackType: 'credential_harvesting', result: 'SUBMITTED', channel: 'whatsapp', time: '5m ago', isPatientZero: true },
        { id: 'e3', employeeName: 'Carol Kim', dept: 'Marketing', attackType: 'email_phishing', result: 'REPORTED', channel: 'email', time: '12m ago', isPatientZero: false },
      ]);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="p-8 flex gap-6 animate-pulse">
      <div className="flex-1 flex flex-col gap-4">
        <div className="h-24 bg-[rgba(61,214,198,0.06)] rounded-lg" />
        <div className="h-16 bg-[rgba(61,214,198,0.06)] rounded-lg" />
        <div className="h-96 bg-[rgba(61,214,198,0.06)] rounded-lg" />
      </div>
      <div className="w-[360px] flex flex-col gap-4">
        <div className="h-80 bg-[rgba(61,214,198,0.06)] rounded-lg" />
        <div className="h-32 bg-[rgba(61,214,198,0.06)] rounded-lg" />
      </div>
    </div>
  );

  const gs = ghostStateConfig[scenario.ghostState] || ghostStateConfig.DORMANT;
  const isAdmin = user?.role === 'admin';
  const canSendPhishing = ['admin', 'analyst', 'defender'].includes(user?.role);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto pb-20">
      {/* Launch Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] z-50 flex items-center justify-center">
          <div className="card max-w-[440px] w-full animate-fadeUp">
            <h3 className="text-[var(--as-accent)] font-bold text-[16px] uppercase tracking-widest mb-3">⚠ LAUNCH CONFIRMATION</h3>
            <p className="text-[var(--as-text)] text-[13px] leading-relaxed mb-2">
              This fires <span className="text-[#ff4444] font-bold">REAL emails, SMS, WhatsApp, and voice calls</span> to all{' '}
              <span className="text-[var(--as-accent)] font-bold">{scenario.targetCount}</span> targets.
            </p>
            <p className="text-[var(--as-muted)] text-[12px] mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-ghost flex-1">CANCEL</button>
              <button onClick={async () => { setActionLoading(true); await new Promise(r=>setTimeout(r,800)); setShowConfirm(false); setActionLoading(false); }}
                className="flex-1 bg-[var(--as-accent)] text-[#08131b] font-bold uppercase tracking-wider py-3 rounded-[4px] hover:brightness-110 transition-all flex items-center justify-center gap-2">
                {actionLoading ? <div className="w-4 h-4 border-2 border-[#08131b] border-t-transparent rounded-full animate-spin"/> : '🚀 LAUNCH'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT MAIN */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">

          {/* 1. Header */}
          <div className="card animate-slideInLeft">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <h2 className="text-[var(--as-text)] text-[22px] font-bold uppercase tracking-wider">{scenario.name}</h2>
              <div className="flex gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${scenario.status === 'ACTIVE' ? 'text-[#ff4444] bg-[#ff444420] border-[#ff444440]' : 'text-[var(--as-accent2)] bg-[rgba(61,214,198,0.1)] border-[var(--as-line)]'}`}>
                  {scenario.status === 'ACTIVE' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff4444] animate-pulse mr-1.5 -mb-px" />}
                  {scenario.status}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${scenario.difficulty === 'CRITICAL' ? 'text-[#ff4444] border-[#ff444440]' : scenario.difficulty === 'HIGH' ? 'text-[var(--as-accent)] border-[rgba(255,122,89,0.4)]' : 'text-[var(--as-accent2)] border-[var(--as-line)]'}`}>
                  {scenario.difficulty}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {scenario.attackTypes.map(t => (
                <span key={t} className="text-[10px] uppercase px-2 py-0.5 rounded-[3px]"
                  style={{ color: attackColors[t], background: `${attackColors[t]}22`, border: `1px solid ${attackColors[t]}44` }}>
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Admin Action Bar */}
          {isAdmin && (
            <div className="card flex flex-wrap gap-3 items-center p-4 animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
              <button onClick={() => setShowConfirm(true)} className="btn-primary text-[12px]">🚀 LAUNCH SCENARIO</button>
              <button className="px-4 py-2 bg-transparent border border-[#ff4444] text-[#ff4444] text-[12px] uppercase tracking-widest font-bold rounded-[4px] hover:bg-[rgba(255,68,68,0.1)] transition-colors">TERMINATE</button>
              <button onClick={() => navigate(`/scenarios/${id}/live`)} className="btn-ghost text-[12px]">VIEW LIVE MAP →</button>
            </div>
          )}

          {/* 2b. Send phishing by channel (admin, analyst, defender) */}
          {canSendPhishing && (
            <>
              <PhishingSender scenarioId={id} />
              <p className="text-[11px] text-[var(--as-muted)]">
                Or{' '}
                <button type="button" onClick={() => navigate('/send-phishing')} className="text-[var(--as-accent)] hover:underline uppercase tracking-wider">
                  open full Send Phishing page →
                </button>
              </p>
            </>
          )}

          {/* 3. Event Feed */}
          <div className="card flex flex-col animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-4">SIMULATION EVENTS</div>
            <div className="flex flex-col divide-y divide-[rgba(61,214,198,0.08)] max-h-[480px] overflow-y-auto">
              {events.length === 0 ? (
                <div className="text-center py-12 text-[var(--as-muted)] text-[13px]">No events yet — scenario pending launch</div>
              ) : events.map((ev, i) => (
                <div key={ev.id} className="py-3 flex items-start gap-3 animate-fadeUp" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: `${resultColors[ev.result]}22`, color: resultColors[ev.result] }}>
                    {ev.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold text-[var(--as-text)]">{ev.employeeName}</span>
                      {ev.isPatientZero && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444" title="Patient Zero"><path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/><circle cx="9" cy="11" r="1.5" fill="#07141F"/><circle cx="15" cy="11" r="1.5" fill="#07141F"/></svg>
                      )}
                      <span className="text-[11px] text-[var(--as-muted)]">{ev.dept}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-[2px]"
                        style={{ color: attackColors[ev.attackType], background: `${attackColors[ev.attackType]}22` }}>
                        {ev.attackType.replace(/_/g,' ')}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{ color: resultColors[ev.result], background: `${resultColors[ev.result]}15` }}>
                        {ev.result}
                      </span>
                      <span className="text-[12px] text-[var(--as-muted)]">{channelIcon[ev.channel]}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--as-muted)] shrink-0">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-[360px] flex flex-col gap-4 lg:sticky lg:top-6">

          {/* 4. Ghost Status */}
          <div className="card animate-slideInRight" style={{ borderLeft: `3px solid ${gs.color}` }}>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-3">Ghost Entity</div>
            <div className={`flex items-center gap-2 mb-4 ${gs.pulse ? 'animate-pulse' : ''}`}>
              <span style={{ fontSize: 20, color: gs.color }}>{gs.icon}</span>
              <span className="text-[16px] font-bold uppercase tracking-widest" style={{ color: gs.color }}>{gs.label}</span>
            </div>

            {/* Patient Zero */}
            <div className="mb-4 p-3 bg-[rgba(7,20,31,0.5)] rounded-[4px] border border-[rgba(255,68,68,0.2)]">
              <div className="text-[10px] text-[var(--as-muted)] uppercase mb-1.5">Patient Zero</div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ff4444"><path d="M12 2C8 2 5 5 5 9V20C5 21 6 22 7 21C8 20 9 20 10 21C11 22 13 22 14 21C15 20 16 20 17 21C18 22 19 21 19 20V9C19 5 16 2 12 2Z"/><circle cx="9" cy="11" r="1.5" fill="#07141F"/><circle cx="15" cy="11" r="1.5" fill="#07141F"/></svg>
                <span className="text-[13px] font-bold text-[var(--as-text)]">{scenario.patientZero.name}</span>
              </div>
              <div className="text-[11px] text-[var(--as-muted)] mt-0.5">{scenario.patientZero.dept} · {scenario.patientZero.role}</div>
            </div>

            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-1">Compromised</div>
            <div className="text-[36px] font-bold text-[#ff4444] mb-4">{scenario.compromisedCount}</div>

            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-2">Aggression</div>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-[28px] h-[8px] rounded-sm" style={{ background: i <= scenario.aggression ? '#ff4444' : 'rgba(255,68,68,0.2)' }} />
              ))}
            </div>

            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-1">Current Technique</div>
            <div className="text-[13px] text-[var(--as-accent)] font-bold mb-4">{scenario.currentTechnique}</div>

            <div className="text-[10px] text-[var(--as-muted)] uppercase mb-2">Technique History</div>
            <div className="max-h-[140px] overflow-y-auto flex flex-col gap-1 text-[11px]">
              {scenario.techniqueHistory.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-[var(--as-muted)]">
                  <span className="text-[var(--as-line)] font-mono">{i+1}.</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Financial Exposure */}
          <div className="card animate-slideInRight" style={{ animationDelay: '0.15s' }}>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">Financial Exposure</div>
            <div className="text-[28px] font-bold text-[#ff4444]">${scenario.financialExposure.toLocaleString()}</div>
            <button onClick={() => navigate('/financial')} className="text-[11px] text-[var(--as-accent2)] uppercase tracking-widest mt-3 hover:underline">VIEW FULL REPORT →</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ScenarioDetail;
