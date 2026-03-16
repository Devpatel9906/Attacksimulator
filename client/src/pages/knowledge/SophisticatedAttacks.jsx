import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'rgba(255,68,68,0.15)',  color: '#ff4444' },
  HIGH:     { bg: 'rgba(255,122,89,0.15)', color: '#ff7a59' },
  MEDIUM:   { bg: 'rgba(234,179,8,0.15)',  color: '#eab308' },
};

const ATTACKS = [
  {
    name: 'Zero Day Exploits',
    severity: 'CRITICAL',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    description: 'Vulnerabilities unknown to the vendor, with no available patch. Attackers exploit these before defenders even know the hole exists — often sold for millions on black markets.',
    spot: ['Unexpected application crashes or freezes', 'Unusual network traffic to unknown IPs', 'Security vendor advisories about unpatched software'],
    prevent: ['Keep all software updated (patches close past zero-days)', 'Use endpoint detection with behavioral analysis', 'Network segmentation limits blast radius', 'Disable or restrict rarely used features/services'],
  },
  {
    name: 'Supply Chain Attacks',
    severity: 'CRITICAL',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="1.8"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    description: 'Attackers compromise a trusted software vendor (e.g., SolarWinds 2020) to inject malware into updates delivered to thousands of customers simultaneously. The breach enters via a trusted, signed update.',
    spot: ['Unexpected behavior after software updates', 'Software communicating with unusual external servers', 'Vendor security advisories about compromised builds'],
    prevent: ['Monitor vendor security bulletins', 'Use software bill of materials (SBOM)', 'Apply principle of least privilege to all installed software', 'Network monitor for unusual outbound connections'],
  },
  {
    name: 'AI Deepfakes',
    severity: 'HIGH',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="1.8"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,
    description: 'AI-generated voice cloning and video synthesis used to impersonate executives on calls or video conferences, authorizing fraudulent transactions. Notable example: $25M lost via deepfake CFO video call (Hong Kong, 2024).',
    spot: ['Unusual out-of-band communication requesting urgent action', 'Video call quality issues, odd lip sync', 'Executive calling from a personal number for financial requests'],
    prevent: ['Establish verbal code words for verification in high-stakes calls', 'Always verify financial requests through the official chain', 'Be skeptical of urgency in video calls requesting unusual actions'],
  },
  {
    name: 'Fileless Malware',
    severity: 'CRITICAL',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
    description: 'Malware that lives entirely in RAM, using legitimate tools like PowerShell, WMI, or Mshta to execute. No file is written to disk — evading traditional antivirus that scans files.',
    spot: ['PowerShell executing encoded commands you didn\'t trigger', 'Unusual WMI subscriptions', 'Behavioral detection alerts from EDR tools'],
    prevent: ['Restrict PowerShell execution policy (constrained mode)', 'Enable script block logging in Windows', 'Use EDR with behavioral analysis, not just signature scanning', 'Apply AppLocker or Windows Defender Application Control'],
  },
  {
    name: 'SIM Swapping & SS7',
    severity: 'CRITICAL',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    description: 'Attacker transfers your phone number to their SIM by social-engineering your carrier, then intercepts SMS 2FA codes. SS7 exploits do this remotely via telecom infrastructure — no carrier interaction needed.',
    spot: ['Phone suddenly shows "No Service" or "Emergency Calls Only"', 'Unexpected password reset emails you didn\'t request', 'Unable to make calls while still having data briefly'],
    prevent: ['Set a SIM PIN and port-out freeze with your carrier', 'Replace SMS 2FA with authenticator apps (TOTP)', 'Use hardware security keys (FIDO2) for critical accounts', 'Enable account notifications for password changes'],
  },
  {
    name: 'Watering Hole (Drive-By)',
    severity: 'HIGH',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    description: 'Attackers compromise industry-specific websites to deliver drive-by downloads. Visitors get infected just by loading the page — no clicks needed. Often targets niche communities that share a trusted site.',
    spot: ['Browser prompts for unexpected plugin installs', 'Antivirus alerts on legitimate-looking sites', 'Sudden new tabs or redirects when browsing'],
    prevent: ['Keep browsers and plugins up to date', 'Disable or remove obsolete plugins (Flash, Java)', 'Use a script-blocking extension (uBlock Origin)', 'Enable Enhanced Safe Browsing in Chrome or similar'],
  },
];

function AttackCard({ attack }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY_STYLES[attack.severity];
  return (
    <div className="card overflow-hidden transition-all" style={{ padding: 0 }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[rgba(61,214,198,0.03)] transition-colors text-left" style={{ minHeight: 54 }}>
        <span className="shrink-0">{attack.icon}</span>
        <span className="flex-1 text-[14px] font-bold text-[var(--as-text)]">{attack.name}</span>
        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mr-3" style={{ background: sev.bg, color: sev.color }}>{attack.severity}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9dc0c3" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div style={{ maxHeight: open ? 600 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[var(--as-line)]">
          <p className="text-[13px] text-[var(--as-muted)] leading-[1.7] mt-3">{attack.description}</p>
          <div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">How to Spot It</div>
            {attack.spot.map((s, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-accent2)] mt-1.5 shrink-0"/>
                <span className="text-[13px] text-[var(--as-text)]">{s}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">How to Prevent It</div>
            {attack.prevent.map((p, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2.5" className="mt-0.5 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                <span className="text-[13px] text-[var(--as-text)]">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SophisticatedAttacks() {
  const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-6 animate-slideInLeft">
        <h1 className="text-[26px] font-bold text-[var(--as-text)] uppercase tracking-wider">Cyber Threat Library</h1>
        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[rgba(255,68,68,0.15)] text-[#ff4444]">Advanced Threats</span>
      </div>

      {/* SIM Swap Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 px-5 py-4 rounded-[8px] animate-fadeUp"
        style={{ background: 'rgba(255,122,89,0.08)', border: '1px solid rgba(255,122,89,0.3)' }}>
        <div>
          <div className="text-[11px] text-[var(--as-accent)] uppercase tracking-wider mb-0.5">Interactive Simulation Available</div>
          <div className="text-[14px] font-bold text-[var(--as-text)]">SIM Swap Attack — The Silent Switch</div>
        </div>
        <button onClick={() => navigate('/knowledge/simswap')} className="btn-primary text-[12px] shrink-0">
          ENTER SIMULATION →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ATTACKS.map((a, i) => (
          <div key={a.name} className="animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
            <AttackCard attack={a} />
          </div>
        ))}
      </div>
    </div>
  );
}
