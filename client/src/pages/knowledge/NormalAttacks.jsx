import React, { useState } from 'react';

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'rgba(255,68,68,0.15)',   color: '#ff4444' },
  HIGH:     { bg: 'rgba(255,122,89,0.15)',  color: '#ff7a59' },
  MEDIUM:   { bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
};

const ATTACKS = [
  {
    name: 'Phishing & Smishing',
    severity: 'HIGH',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="1.8">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    description: 'Phishing uses deceptive emails or texts (smishing) to trick users into revealing credentials or clicking malicious links. Attackers impersonate trusted brands like Microsoft, banks, or internal IT departments.',
    spot: ['Sender domain doesn\'t match the real company', 'Urgent or threatening language', 'Generic greetings like "Dear User"', 'Links pointing to unfamiliar domains'],
    prevent: ['Always verify sender domain character-by-character', 'Hover over links before clicking', 'Use a password manager — it won\'t autofill on fake sites', 'Use the "Report Phishing" button in your email client'],
  },
  {
    name: 'Credential Stuffing',
    severity: 'MEDIUM',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    description: 'Attackers use lists of leaked username-password pairs (from data breaches) to automate login attempts across hundreds of sites, betting you reused the same password.',
    spot: ['Unexpected login alerts from services you use', 'Account activity from unknown locations', '"Someone signed in" emails you didn\'t trigger'],
    prevent: ['Use a unique password for every account', 'Enable a password manager', 'Turn on multi-factor authentication everywhere', 'Check haveibeenpwned.com for your email breaches'],
  },
  {
    name: 'Malware & Adware',
    severity: 'HIGH',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    description: 'Malicious software installed via email attachments, fake downloads, or drive-by infections. Ranges from adware that hijacks browsers to ransomware that encrypts all your files.',
    spot: ['Unexpected software installing itself', 'Browser home page changed without your action', 'Slow system performance and high CPU usage', 'Pop-ups and redirects when browsing normally'],
    prevent: ['Never open unsolicited email attachments', 'Download software only from official sources', 'Keep OS and applications updated', 'Use endpoint detection software (EDR)'],
  },
  {
    name: 'Social Engineering',
    severity: 'HIGH',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    description: 'Attackers manipulate victims psychologically rather than technically — exploiting trust, authority, fear, or urgency to extract information or access. No malware required.',
    spot: ['Caller claims urgency and authority simultaneously', 'Request to bypass normal procedures "just this once"', 'Unsolicited request for sensitive information', 'Emotional pressure: fear of losing access, being fired'],
    prevent: ['Verify identity through a separate, known channel', 'Never bypass approval processes for anyone', 'Be skeptical of urgency-based requests', 'When in doubt, escalate to your manager'],
  },
  {
    name: 'Business Email Compromise',
    severity: 'CRITICAL',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="1.8">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    description: 'Attackers impersonate executives or vendors via spoofed email to authorize fraudulent wire transfers or data exfiltration. Over $2.7 billion lost annually. No malware, no clicks required.',
    spot: ['Executive email with slightly different domain', 'Request for wire transfer bypassing normal approval', 'Unusual sense of urgency or secrecy', 'New bank account details from a familiar vendor'],
    prevent: ['Verify any financial request via a known phone number', 'Implement multi-person approval for transfers', 'Check sender domain — not just the display name', 'Set up email authentication (DMARC, SPF, DKIM)'],
  },
  {
    name: 'Watering Hole Attack',
    severity: 'HIGH',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
    description: 'Attackers identify websites frequently visited by their target audience (e.g. an industry forum), compromise them, and inject malicious code that runs automatically when victims visit.',
    spot: ['Unexpected browser prompts on normally trusted sites', 'Sudden tab redirects or pop-ups on familiar sites', 'Antivirus alerts when visiting known-good sites'],
    prevent: ['Keep browser and plugins updated', 'Use a browser with script blocking (uBlock Origin)', 'Enable Safe Browsing features in your browser', 'Avoid using outdated browsers or plugins (Flash, Java)'],
  },
];

function AttackCard({ attack }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY_STYLES[attack.severity] || SEVERITY_STYLES.HIGH;

  return (
    <div className="card overflow-hidden transition-all duration-300" style={{ padding: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[rgba(61,214,198,0.03)] transition-colors text-left"
        style={{ minHeight: 54 }}>
        <span className="shrink-0">{attack.icon}</span>
        <span className="flex-1 text-[14px] font-bold text-[var(--as-text)]">{attack.name}</span>
        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mr-3" style={{ background: sev.bg, color: sev.color }}>
          {attack.severity}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9dc0c3" strokeWidth="2"
          className="transition-transform shrink-0" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? 600 : 0 }}>
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[var(--as-line)]">
          <p className="text-[13px] text-[var(--as-muted)] leading-[1.7] mt-3">{attack.description}</p>

          <div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">How to Spot It</div>
            <div className="flex flex-col gap-1.5">
              {attack.spot.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--as-accent2)] mt-1.5 shrink-0"/>
                  <span className="text-[13px] text-[var(--as-text)]">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider mb-2">How to Prevent It</div>
            <div className="flex flex-col gap-1.5">
              {attack.prevent.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2.5" className="mt-0.5 shrink-0">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-[13px] text-[var(--as-text)]">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NormalAttacks() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8 animate-slideInLeft">
        <h1 className="text-[26px] font-bold text-[var(--as-text)] uppercase tracking-wider">Cyber Threat Library</h1>
        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[rgba(255,122,89,0.15)] text-[var(--as-accent)]">Common Attacks</span>
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
