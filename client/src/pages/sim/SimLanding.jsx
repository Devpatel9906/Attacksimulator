import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─── helpers ────────────────────────────────────────── */
const getToken    = () => new URLSearchParams(window.location.search).get('token') || 'demo-token';
const sessionId   = crypto.randomUUID();
const fingerprint = btoa((navigator.userAgent + '|' + screen.width + 'x' + screen.height).slice(0, 200));

/* POST to public endpoint — NO api.js, no auth cookie */
async function simFetch(path, body) {
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

/* ─── Microsoft SSO fake ─────────────────────────────── */
function MicrosoftSSO({ token, loadTime }) {
  const [step, setStep]       = useState('email'); // email | password
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [reported, setReported] = useState(false);
  const emailRef    = useRef();
  const passwordRef = useRef();

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 'email') { setStep('password'); return; }
    // SUBMIT — wipe first, send nothing sensitive
    const timeToActionSeconds = Math.round((Date.now() - loadTime) / 1000);
    document.querySelectorAll('input').forEach(i => (i.value = ''));
    simFetch(`/api/sim/submit/${token}`, { sessionId, deviceFingerprint: fingerprint, timeToActionSeconds })
      .then(data => { window.location.href = data?.redirectTo || `/sim/transparency?token=${token}`; });
    window.location.href = `/sim/transparency?token=${token}`;
  };

  const handleReport = async (e) => {
    e.preventDefault();
    await simFetch(`/api/sim/report/${token}`, { sessionId });
    setReported(true);
    setTimeout(() => (window.location.href = '/me'), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f3f3', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      {/* MS Top bar */}
      <div style={{ width: '100%', background: '#fff', padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
        <svg width="108" height="24" viewBox="0 0 108 24" fill="none">
          <rect x="0" y="0"  width="11" height="11" fill="#f25022"/>
          <rect x="12" y="0"  width="11" height="11" fill="#7fba00"/>
          <rect x="0" y="12" width="11" height="11" fill="#00a4ef"/>
          <rect x="12" y="12" width="11" height="11" fill="#ffb900"/>
          <text x="28" y="16" fill="#737373" fontSize="15" fontFamily="Segoe UI, sans-serif">Microsoft</text>
        </svg>
      </div>

      {/* Sign-in card */}
      <div style={{ background: '#fff', width: '440px', padding: '44px 44px 36px', marginTop: '64px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', borderRadius: 2 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#1b1b1b', marginBottom: 4 }}>Sign in</h1>
        <p style={{ fontSize: 14, color: '#605e5c', marginBottom: 28 }}>to continue to Microsoft 365</p>

        <form onSubmit={handleNext}>
          {step === 'email' ? (
            <div>
              <input ref={emailRef} type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email, phone, or Skype" required autoFocus
                style={{ width: '100%', border: 'none', borderBottom: '1px solid #605e5c', padding: '8px 0', fontSize: 15, outline: 'none', background: 'transparent', boxSizing:'border-box', marginBottom: 24 }} />
              <div style={{ textAlign: 'right', marginBottom: 12 }}>
                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: '#0067b8', textDecoration: 'none' }}>No account? Create one!</a>
              </div>
              <button type="submit" style={{ background: '#0067b8', color: '#fff', border: 'none', width: '100%', padding: '10px 0', fontSize: 15, cursor: 'pointer', letterSpacing: 0 }}>Next</button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '6px 10px', border: '1px solid #ccc', borderRadius: 2, background: '#f8f8f8' }}>
                <span style={{ fontSize: 14, color: '#1b1b1b' }}>{email}</span>
                <button type="button" onClick={() => setStep('email')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#0067b8', cursor: 'pointer', fontSize: 13 }}>✏</button>
              </div>
              <input ref={passwordRef} type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" required autoFocus
                style={{ width: '100%', border: 'none', borderBottom: '1px solid #605e5c', padding: '8px 0', fontSize: 15, outline: 'none', background: 'transparent', boxSizing:'border-box', marginBottom: 24 }} />
              <div style={{ textAlign: 'right', marginBottom: 12 }}>
                <a href="#" onClick={e => e.preventDefault()} style={{ fontSize: 13, color: '#0067b8', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <button type="submit" style={{ background: '#0067b8', color: '#fff', border: 'none', width: '100%', padding: '10px 0', fontSize: 15, cursor: 'pointer' }}>Sign in</button>
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#737373' }}>
          {['Terms of use', 'Privacy & cookies', 'Accessibility'].map((t, i) => (
            <React.Fragment key={t}>
              <a href="#" onClick={e => e.preventDefault()} style={{ color: '#737373', textDecoration: 'none', marginRight: i < 2 ? 8 : 0 }}>{t}</a>
              {i < 2 && <span style={{ marginRight: 8 }}>|</span>}
            </React.Fragment>
          ))}
        </span>
      </div>

      {reported
        ? <div style={{ marginTop: 16, fontSize: 12, color: '#28a745', fontWeight: 600 }}>Thanks for reporting. Our security team has been notified.</div>
        : <a href="#" onClick={handleReport} style={{ marginTop: 16, fontSize: 11, color: '#aaa', display: 'block', textAlign: 'center', textDecoration: 'underline' }}>
            Report this as suspicious
          </a>
      }
    </div>
  );
}

/* ─── DocuSign fake ──────────────────────────────────── */
function DocuSign({ token, loadTime }) {
  const [clicked, setClicked] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReview = (e) => {
    e.preventDefault();
    const timeToActionSeconds = Math.round((Date.now() - loadTime) / 1000);
    document.querySelectorAll('input').forEach(i => (i.value = ''));
    simFetch(`/api/sim/submit/${token}`, { sessionId, deviceFingerprint: fingerprint, timeToActionSeconds });
    window.location.href = `/sim/transparency?token=${token}`;
  };

  const handleReport = async (e) => {
    e.preventDefault();
    await simFetch(`/api/sim/report/${token}`, { sessionId });
    setReported(true);
    setTimeout(() => (window.location.href = '/me'), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#28a745', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="white">
          <circle cx="14" cy="14" r="13" fill="none" stroke="white" strokeWidth="1.5"/>
          <path d="M8 14l4 4 8-8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ color: 'white', fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>DocuSign</span>
      </div>

      <div style={{ maxWidth: 560, margin: '60px auto', background: '#fff', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.15)', padding: 36 }}>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 16, padding: '10px 14px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 3 }}>
          <strong>From:</strong> Michael Chen, CFO &lt;m.chen@acmecorp.com&gt;<br/>
          <strong>Subject:</strong> <span style={{ color: '#c62828' }}>URGENT — Wire Transfer Approval Required</span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1b1b1b', marginBottom: 8 }}>Please review and sign this document</h2>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>This document requires your signature before 5:00 PM today. Please review and provide your authorization.</p>

        {/* Doc preview */}
        <div style={{ height: 180, background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 8 }}>
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none"><rect width="40" height="48" rx="3" fill="#e0e0e0"/><rect x="8" y="10" width="24" height="3" rx="1" fill="#bbb"/><rect x="8" y="17" width="24" height="3" rx="1" fill="#bbb"/><rect x="8" y="24" width="18" height="3" rx="1" fill="#bbb"/><rect x="8" y="36" width="12" height="3" rx="1" fill="#bbb"/></svg>
          <span style={{ fontSize: 12, color: '#999' }}>WIRE_TRANSFER_AUTHORIZATION.pdf</span>
        </div>

        <button onClick={handleReview} style={{ background: '#28a745', color: 'white', border: 'none', width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', borderRadius: 3, letterSpacing: 0.3 }}>
          REVIEW DOCUMENT
        </button>
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#aaa' }}>
          {reported
            ? <span style={{ color: '#28a745' }}>Thanks for reporting. Our security team has been notified.</span>
            : <a href="#" onClick={handleReport} style={{ color: '#aaa', textDecoration: 'underline' }}>Report this as suspicious</a>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── IT Helpdesk fake ───────────────────────────────── */
function ITHelpdesk({ token, loadTime }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [reported, setReported] = useState(false);

  const inputStyle = { width: '100%', border: '1px solid #ccc', padding: '9px 12px', fontSize: 14, borderRadius: 3, marginBottom: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

  const handleSubmit = (e) => {
    e.preventDefault();
    const timeToActionSeconds = Math.round((Date.now() - loadTime) / 1000);
    document.querySelectorAll('input').forEach(i => (i.value = ''));
    simFetch(`/api/sim/submit/${token}`, { sessionId, deviceFingerprint: fingerprint, timeToActionSeconds });
    window.location.href = `/sim/transparency?token=${token}`;
  };

  const handleReport = async (e) => {
    e.preventDefault();
    await simFetch(`/api/sim/report/${token}`, { sessionId });
    setReported(true);
    setTimeout(() => (window.location.href = '/me'), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#edf2f7', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#003087', padding: '0 32px', height: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>AcmeCorp IT Services</span>
        <span style={{ color: '#a0aec0', fontSize: 13, marginLeft: 16 }}>Self-Service Portal</span>
      </div>

      <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <div>
          <strong style={{ color: '#856404', fontSize: 14 }}>IT Security Alert</strong>
          <span style={{ color: '#856404', fontSize: 14 }}> — Suspicious login detected from new location. Password reset required within 15 minutes.</span>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '40px auto', background: '#fff', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c', marginBottom: 6 }}>Password Reset Required</h2>
        <p style={{ fontSize: 13, color: '#718096', marginBottom: 24 }}>Your account has been temporarily locked due to a suspicious login attempt. Please reset your password to regain access.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, display:'block', marginBottom: 4 }}>CURRENT PASSWORD</label>
          <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} style={inputStyle} required />
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, display:'block', marginBottom: 4 }}>NEW PASSWORD</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputStyle} required />
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, display:'block', marginBottom: 4 }}>CONFIRM NEW PASSWORD</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} required />
          <button type="submit" style={{ background: '#003087', color: 'white', border: 'none', width: '100%', padding: '11px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', borderRadius: 3, marginTop: 4 }}>
            RESET PASSWORD
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: '#aaa' }}>
          {reported
            ? <span style={{ color: '#28a745' }}>Thanks for reporting. Our security team has been notified.</span>
            : <a href="#" onClick={handleReport} style={{ color: '#aaa', textDecoration: 'underline' }}>Report this as suspicious</a>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Main router ────────────────────────────────────── */
export default function SimLanding() {
  const token   = getToken();
  const loadTime = useRef(Date.now()).current;
  // In a real integration, fetch attackType from /api/sim/event/:token
  // For demo, read from query param ?type=email_phishing
  const attackType = new URLSearchParams(window.location.search).get('type') || 'email_phishing';

  if (attackType === 'bec') return <DocuSign token={token} loadTime={loadTime} />;
  if (attackType === 'social_engineering') return <ITHelpdesk token={token} loadTime={loadTime} />;
  return <MicrosoftSSO token={token} loadTime={loadTime} />;
}
