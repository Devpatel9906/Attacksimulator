import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const getParam = (key) => new URLSearchParams(window.location.search).get(key) || '';

const ATTACK_INFO = {
  email_phishing: {
    label: 'Email Phishing',
    platform: 'Microsoft 365',
    explanation: 'You received a convincing email mimicking a Microsoft sign-in page. The domain and design were carefully copied to appear authentic. Real attackers use tools like Evilginx2 to proxy real Microsoft pages in real-time.',
  },
  credential_harvesting: {
    label: 'Credential Harvesting',
    platform: 'Microsoft 365',
    explanation: 'A cloned login portal collected your credentials. Attackers use these to log in immediately or sell them on dark web marketplaces within hours of collection.',
  },
  bec: {
    label: 'Business Email Compromise',
    platform: 'DocuSign',
    explanation: 'An attacker impersonated your CFO to trick you into authorizing a fraudulent wire transfer. BEC attacks cost businesses over $2.7 billion annually with no malware required.',
  },
  social_engineering: {
    label: 'Social Engineering',
    platform: 'IT Portal',
    explanation: 'Fake IT urgency created a high-pressure environment that bypassed your normal security instincts. Social engineers exploit authority and urgency — not technical vulnerabilities.',
  },
};

function Elapsed({ start }) {
  const [sec, setSec] = useState(Math.floor((Date.now() - start) / 1000));
  useEffect(() => { const t = setInterval(() => setSec(s => s + 1), 1000); return () => clearInterval(t); }, []);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s2 = String(sec % 60).padStart(2, '0');
  return <span>{m}:{s2}</span>;
}

export default function SimTransparency() {
  const navigate  = useNavigate();
  const token     = getParam('token');
  const attackType = getParam('type') || 'email_phishing';
  const info      = ATTACK_INFO[attackType] || ATTACK_INFO.email_phishing;
  const [bannerIn, setBannerIn] = useState(false);
  const [breachStart] = useState(Date.now());
  const sessionId = crypto.randomUUID(); // mock for display
  const deviceStr = navigator.userAgent.includes('Chrome')
    ? 'Chrome / ' + (navigator.userAgent.includes('Windows') ? 'Windows 10' : navigator.userAgent.includes('Mac') ? 'macOS' : 'Linux')
    : 'Browser / Unknown OS';

  useEffect(() => { const t = setTimeout(() => setBannerIn(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen" style={{ background: '#07141f', fontFamily: "'Chakra Petch', sans-serif", paddingBottom: 80 }}>

      {/* TOP BANNER */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 overflow-hidden"
        style={{ height: 52, background: '#ff4444', transform: bannerIn ? 'translateY(0)' : 'translateY(-52px)', transition: 'transform 0.5s ease' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span className="text-white font-bold uppercase tracking-wider text-[13px]">THIS WAS A CONTROLLED SECURITY SIMULATION — YOUR DATA IS SAFE</span>
      </div>

      <div className="max-w-[960px] mx-auto px-4" style={{ paddingTop: 100 }}>

        {/* TITLE */}
        <div className="text-center mb-8 animate-fadeUp">
          <h1 className="text-[32px] font-bold text-[#edf7f7] uppercase tracking-wide mb-2">What Just Happened</h1>
          <p className="text-[var(--as-muted)] text-[13px]">This was a controlled phishing simulation run by your security team.</p>
        </div>

        {/* SPLIT SCREEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 animate-fadeUp" style={{ animationDelay: '0.1s' }}>

          {/* LEFT — What you believed */}
          <div className="card" style={{ borderTop: '3px solid #9dc0c3' }}>
            <div className="flex flex-col items-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9dc0c3" strokeWidth="1.5" className="mb-2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-[0.15em]">You Thought You Were Submitting</span>
            </div>
            <div className="rounded-[4px] p-4 mb-3" style={{ background: 'rgba(7,20,31,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-[12px] font-mono text-[#edf7f7] mb-1">Email: <span className="text-[#3dd6c6]">alice.zhang@acmecorp.com</span></div>
              <div className="text-[12px] font-mono text-[#edf7f7]">Password: <span className="text-[#edf7f7] tracking-widest">●●●●●●●●●●</span></div>
            </div>
            <p className="text-[13px] text-[var(--as-muted)] text-center">You believed you were logging into <strong className="text-[#edf7f7]">{info.platform}</strong></p>
          </div>

          {/* RIGHT — What was captured */}
          <div className="card" style={{ borderTop: '3px solid #3dd6c6' }}>
            <div className="flex flex-col items-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5" className="mb-2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="text-[10px] text-[var(--as-muted)] uppercase tracking-[0.15em]">What the Server Actually Received</span>
            </div>
            <div className="rounded-[4px] mb-4 overflow-hidden" style={{ background: 'rgba(7,20,31,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { label: 'Credential Data',   value: 'NOT CAPTURED', ok: true  },
                { label: 'Session ID',        value: sessionId.slice(0, 18) + '…', ok: false },
                { label: 'Device',            value: deviceStr, ok: false },
                { label: 'Time to Submit',    value: '12 seconds', ok: false },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-[rgba(255,255,255,0.06)] last:border-0">
                  <span className="text-[11px] text-[var(--as-muted)]">{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    {row.ok && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                    <span className="text-[11px] font-mono" style={{ color: row.ok ? '#3dd6c6' : '#edf7f7' }}>{row.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <div className="text-[15px] font-bold text-[var(--as-accent2)] font-mono mb-1">credentialsCaptured: FALSE</div>
              <p className="text-[10px] text-[var(--as-muted)]">(hardcoded — your credentials were never transmitted)</p>
            </div>
          </div>
        </div>

        {/* RED WARNING BOX */}
        <div className="rounded-[8px] p-6 mb-5 text-center animate-fadeUp" style={{ animationDelay: '0.2s', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.4)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" className="mx-auto mb-3">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-[16px] text-[#ff7a59] font-bold mb-3 leading-snug">
            In a REAL attack, your credentials would have been sold on the dark web within 4 hours.
          </p>
          <p className="text-[13px] text-[var(--as-muted)] mb-4 max-w-[560px] mx-auto leading-relaxed">
            Average dark web credential price: $15–30. Your account could unlock your bank, email, and every system you use.
          </p>
          <div className="text-[13px] text-[var(--as-muted)]">
            Time since simulated breach: &nbsp;
            <span className="text-[#ff4444] font-bold font-mono text-[15px]"><Elapsed start={breachStart} /></span>
          </div>
        </div>

        {/* ATTACK EXPLANATION */}
        <div className="card mb-8 animate-fadeUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-[rgba(255,122,89,0.2)] text-[var(--as-accent)]">{info.label}</span>
            <span className="text-[12px] text-[var(--as-muted)] uppercase tracking-wider">How This Attack Worked</span>
          </div>
          <p className="text-[14px] text-[var(--as-muted)] leading-[1.75]">{info.explanation}</p>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="text-center animate-fadeUp flex flex-col items-center gap-3" style={{ animationDelay: '0.4s' }}>
          <button onClick={() => navigate('/me/modules/m1')} className="btn-primary px-10 py-3.5 text-[13px]">
            START YOUR AWARENESS MODULE NOW →
          </button>
          <button onClick={() => navigate('/me')} className="btn-ghost px-10 py-3 text-[12px]">
            VIEW YOUR SECURITY DASHBOARD →
          </button>
        </div>
      </div>
    </div>
  );
}
