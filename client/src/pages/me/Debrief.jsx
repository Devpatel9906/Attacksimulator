import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ATTACK_FLAGS = {
  email_phishing: [
    'Sender domain: attacker-mail.co ≠ microsoft.com',
    'Urgent language: "Immediate action required"',
    'Hover reveals: http://login-secure-corp.xyz',
  ],
  credential_harvesting: [
    'URL was not accounts.google.com',
    'No valid HTTPS padlock on the page',
    'Requested your password before any verification',
  ],
  bec: [
    'CFO email: cfo@acme-corp.co (not acmecorp.com)',
    'Unusual wire transfer request with no approval chain',
    'Created urgency — "must be done before close of day"',
  ],
};

const CORRECT_RESPONSES = {
  email_phishing: [
    'Hover over every link before clicking — verify the destination URL',
    'Check sender domain carefully, not just the display name',
    'When in doubt, navigate directly to the site instead of clicking the link',
    'Report the email to your security team using the "Report Phishing" button',
  ],
  credential_harvesting: [
    'Always verify the URL bar shows the legitimate domain before entering credentials',
    'Look for the HTTPS padlock and certificate details',
    'Use a password manager — it won\'t autofill on fake domains',
    'Report immediately even if you already clicked',
  ],
  bec: [
    'Verify wire transfer requests via a known phone number — never reply to the email',
    'Check the sender domain character-by-character, not just the display name',
    'Follow the multi-approval policy for any financial transaction',
    'When urgency is created artificially, that\'s a red flag, not a reason to rush',
  ],
};

const CHAIN_STEPS = [
  { text: 'Your login credentials captured',    color: '#9dc0c3' },
  { text: '→ Your email inbox (sent/received)', color: '#ff7a59' },
  { text: '→ Company contacts + file access',   color: '#ff4444' },
  { text: '→ Sold on dark web within 4 hours',  color: '#ff4444' },
];

function ChainStep({ step, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className="flex items-center gap-3 transition-all duration-500"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateX(0)' : 'translateX(-10px)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      <span className="text-[13px]" style={{ color: step.color }}>{step.text}</span>
    </div>
  );
}

export default function Debrief() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  // Mock: employee was compromised via email phishing
  const compromised = true;
  const attackType = 'email_phishing';
  const flags = ATTACK_FLAGS[attackType] || ATTACK_FLAGS.email_phishing;
  const responses = CORRECT_RESPONSES[attackType] || CORRECT_RESPONSES.email_phishing;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20 flex flex-col gap-6">

      {/* HEADER */}
      <div className="animate-slideInLeft">
        <h1 className="text-[26px] font-bold text-[var(--as-text)] uppercase tracking-wider mb-1">Your Security Debrief</h1>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[14px] text-[var(--as-muted)]">Q3 Invoice Phishing Simulation</p>
          <span className="text-[11px] text-[var(--as-muted)] font-mono">Feb 14, 2026 — 10:42 AM</span>
        </div>
      </div>

      {compromised ? (
        <>
          {/* COMPROMISED STATUS */}
          <div className="card animate-fadeUp" style={{ borderLeft: '4px solid #ff4444' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-bold uppercase px-3 py-1 rounded-full"
                style={{ background: 'rgba(255,68,68,0.15)', border: '1px solid rgba(255,68,68,0.4)', color: '#ff4444' }}>
                ⚠ YOU WERE COMPROMISED
              </span>
            </div>
            <p className="text-[14px] text-[var(--as-text)] mb-1">
              Compromised via <span className="text-[var(--as-accent)] font-bold">Email Phishing</span> through email channel at <span className="text-[var(--as-muted)]">10:42 AM</span>
            </p>
            <p className="text-[13px] text-[var(--as-muted)]">
              Time from delivery to action: <span className="text-[#ff7a59] font-bold">6 seconds</span>
              <span className="text-[#ff7a59] text-[11px] ml-2">(Rushed Responder pattern)</span>
            </p>
          </div>

          {/* RED FLAGS */}
          <div className="animate-fadeUp" style={{ animationDelay: '0.1s', background: 'rgba(255,122,89,0.06)', border: '1px solid rgba(255,122,89,0.2)', borderRadius: 8, padding: 20 }}>
            <div className="text-[11px] text-[var(--as-accent)] uppercase tracking-wider mb-3">Red Flags You Missed</div>
            <div className="flex flex-col gap-3">
              {flags.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-accent)] mt-1.5 shrink-0" />
                  <span className="text-[13px] text-[var(--as-text)]">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ATTACK CHAIN */}
          <div className="card animate-fadeUp" style={{ animationDelay: '0.2s' }}>
            <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-4">Attack Chain — What Was At Risk</div>
            <div className="flex flex-col gap-3">
              {CHAIN_STEPS.map((step, i) => (
                <ChainStep key={i} step={step} delay={300 + i * 800} />
              ))}
            </div>
          </div>

          {/* WHAT YOU SHOULD HAVE DONE */}
          <div className="card animate-fadeUp" style={{ animationDelay: '0.3s', borderLeft: '4px solid #3dd6c6' }}>
            <div className="text-[11px] text-[var(--as-accent2)] uppercase tracking-wider mb-3">What You Should Have Done</div>
            <div className="flex flex-col gap-3">
              {responses.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2.5" className="mt-0.5 shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-[13px] text-[var(--as-text)] leading-[1.7]">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* REPORTED — success state */
        <div className="card animate-fadeUp" style={{ borderLeft: '4px solid #3dd6c6' }}>
          <div className="flex items-center gap-3 mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <h3 className="text-[16px] font-bold text-[var(--as-accent2)]">Excellent Catch! You Reported a Phishing Attack.</h3>
          </div>
          <p className="text-[13px] text-[var(--as-muted)] leading-relaxed">
            You identified the sender domain mismatch and reported before any credentials were submitted.
            Your quick action prevented the ghost from advancing further in the simulation.
          </p>
        </div>
      )}

      {/* SCORE IMPACT */}
      <div className="card animate-fadeUp" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1">Security Score Impact</div>
            <div className="text-[28px] font-bold font-['Chakra_Petch'] text-[#ff4444]">-8</div>
          </div>
          <button onClick={() => navigate('/me/modules/m1')} className="btn-primary text-[12px]">
            START RELATED MODULE →
          </button>
        </div>
      </div>

    </div>
  );
}
