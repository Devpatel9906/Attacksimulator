import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/* ── MOCK DATA ─────────────────────────────────────────── */
const MOCK_MODULE = {
  id: 'm3', title: 'Business Email Compromise', attackType: 'bec', difficulty: 'Intermediate', time: 12,
  simulationType: 'hacker_dashboard',
  content: `Business Email Compromise (BEC) is one of the most financially damaging attack types, costing organizations billions annually.\n\nAttackers impersonate executives or trusted partners to trick employees into wiring money or sharing sensitive data.\n\n**Key red flags to watch for:**\n- Urgency language ("need this IMMEDIATELY")\n- Requests to bypass normal approval processes\n- Slightly misspelled domains (acmecorp.co vs acmecorp.com)\n- Requests for wire transfers or gift cards\n- Executive making unusual requests via email only\n\nAlways verify high-stakes requests via a known phone number — never reply to the suspicious email.`,
  quiz: [
    { q: 'Your CFO emails you asking for an urgent $50,000 wire transfer. What do you do?', opts: ['Wire it immediately — the CFO said urgent', 'Call the CFO on a known number to verify', 'Reply to the email asking for more info', 'Forward to accounting to handle'], ans: 1 },
    { q: 'Which domain is suspicious? You work at acmecorp.com', opts: ['acmecorp.com', 'mail.acmecorp.com', 'acmecorp-invoices.net', 'hr.acmecorp.com'], ans: 2 },
    { q: 'A vendor you work with asks you to update their bank account via email. You should:', opts: ['Update it — they\'re a trusted vendor', 'Verify via a phone number you already have on file', 'Email them back to confirm', 'Ask your manager via email'], ans: 1 },
    { q: 'BEC attacks primarily target:', opts: ['System administrators only', 'Anyone with access to finances, credentials, or sensitive data', 'Remote workers only', 'C-suite executives only'], ans: 1 },
  ]
};

const PHASES = ['content', 'simulation', 'quiz'];

/* ── SIMULATIONS ──────────────────────────────────────── */
function RansomwareDesktop() {
  const FILES = ['report.xlsx', 'q3-budget.docx', 'client-data.csv', 'contracts.pdf', 'passwords.txt', 'photos/', 'backup.zip', 'invoice.pdf'];
  const [locked, setLocked] = useState([]);
  const [breached, setBreached] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setLocked(prev => {
        if (prev.length >= FILES.length) { clearInterval(interval); setTimeout(() => setBreached(true), 800); return prev; }
        return [...prev, FILES[prev.length]];
      });
    }, 600);
    return () => clearInterval(interval);
  }, []);
  const [countdown, setCountdown] = useState(72 * 3600);
  useEffect(() => { if (!breached) return; const t = setInterval(() => setCountdown(c => c - 1), 1000); return () => clearInterval(t); }, [breached]);
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return (
    <div className="relative w-full h-[380px] rounded-[6px] overflow-hidden border border-[rgba(61,214,198,0.2)]">
      <div className="w-full h-full bg-[#1c2536] flex flex-wrap gap-4 content-start p-4 pt-8">
        <div className="absolute top-0 left-0 right-0 h-6 bg-[#0f1520] flex items-center px-3 gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff4444]"/><div className="w-2 h-2 rounded-full bg-[#eab308]"/><div className="w-2 h-2 rounded-full bg-[#3dd6c6]"/>
          <span className="text-[9px] text-[#9dc0c3] ml-2 font-mono">MY DOCUMENTS — ACMECORP\alice.zhang</span>
        </div>
        {FILES.map(f => (
          <div key={f} className="flex flex-col items-center gap-1 w-[72px] transition-all duration-500">
            {locked.includes(f) ? (
              <div className="w-10 h-10 flex items-center justify-center animate-pulse" style={{ filter: 'drop-shadow(0 0 8px #ff7a59)' }}>
                <span className="text-[28px]">🔒</span>
              </div>
            ) : (
              <span className="text-[28px]">{f.endsWith('/') ? '📁' : f.endsWith('.xlsx') || f.endsWith('.csv') ? '📊' : f.endsWith('.pdf') ? '📄' : '📝'}</span>
            )}
            <span className="text-[8px] text-center truncate w-full" style={{ color: locked.includes(f) ? '#ff7a59' : '#9dc0c3' }}>{f}</span>
          </div>
        ))}
      </div>
      {breached && (
        <div className="absolute inset-0 bg-[rgba(200,0,0,0.93)] flex flex-col items-center justify-center z-10 animate-fadeUp">
          <span className="text-[48px] mb-2">☠</span>
          <div className="text-white text-[18px] font-bold uppercase tracking-widest text-center mb-2">YOUR FILES HAVE BEEN ENCRYPTED</div>
          <div className="font-mono text-[36px] text-white font-bold mb-2">{fmt(countdown)}</div>
          <div className="text-white opacity-80 text-[11px] uppercase tracking-wider">PAYMENT REQUIRED — BTC 0.9 to wallet: 1A2B3C4D5E6F</div>
        </div>
      )}
    </div>
  );
}

function HackerDashboard() {
  const LINES = [
    { label: 'You believed you sent:',    side: 'left',  lines: ['email: alice@acmecorp.com', 'password: ••••••••••••'] },
    { label: 'Attacker actually received:', side: 'right', lines: [`Session ID: ${crypto.randomUUID?.() || '8f3a-49cb-1e2d'}`, 'Device: Chrome/Windows 10', 'Time to submit: 4.3s', 'CREDENTIALS CAPTURED ✓'] },
  ];
  const [shown, setShown] = useState([[], []]);
  useEffect(() => {
    let col = 0; let row = 0; let charPos = 0; let typed = [[''], ['']];
    const t = setInterval(() => {
      const src = LINES[col].lines[row] || '';
      if (charPos < src.length) {
        typed[col] = [...typed[col]]; typed[col][typed[col].length - 1] = src.slice(0, charPos + 1);
        setShown([...typed]); charPos++;
      } else {
        row++; charPos = 0;
        if (row >= LINES[col].lines.length) { col++; row = 0; if (col >= LINES.length) { clearInterval(t); return; } typed[col] = ['']; }
        else { typed[col] = [...typed[col], '']; }
      }
    }, 40);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-full rounded-[6px] border border-[#333] overflow-hidden">
      <div className="h-7 bg-[#111] flex items-center px-3 gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff4444]"/><div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"/><div className="w-2.5 h-2.5 rounded-full bg-[#3dd6c6]"/>
        <span className="text-[9px] text-[#3dd6c6] font-mono ml-2">ATTACKER TERMINAL — BREACH CONFIRMED</span>
      </div>
      <div className="bg-[#0a0a0a] p-4 grid grid-cols-2 gap-8 min-h-[180px]">
        {LINES.map((col, ci) => (
          <div key={ci}>
            <div className="text-[9px] uppercase tracking-wider text-[#3dd6c6] mb-2 font-mono">{col.label}</div>
            {shown[ci].map((line, li) => (
              <div key={li} className="text-[12px] font-mono" style={{ color: ci === 1 && li === shown[ci].length - 1 && shown[ci][li].startsWith('CRED') ? '#00ff41' : '#3dd6c6' }}>
                {line}<span className="animate-pulse">█</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentityTree() {
  const BRANCHES = [
    { label: 'Bank Info',      consequence: 'Bank Info: -$47,000', angle: -60 },
    { label: 'Medical Records',consequence: 'Medical: sold for $1,200', angle: -20 },
    { label: 'Home Address',   consequence: 'Location: exposed', angle: 20  },
    { label: 'Email Accounts', consequence: 'Accounts hijacked', angle: 60  },
  ];
  const [burning, setBurning] = useState([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i < BRANCHES.length) { setBurning(b => [...b, i]); i++; }
      else { setDone(true); clearInterval(t); }
    }, 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="w-full h-[300px] flex flex-col items-center justify-end relative overflow-hidden rounded-[6px] bg-[#0a1520] border border-[rgba(61,214,198,0.2)]">
      <svg viewBox="0 0 400 280" className="w-full h-full absolute">
        <line x1="200" y1="280" x2="200" y2="160" stroke="#4a7c59" strokeWidth="12" strokeLinecap="round" />
        {BRANCHES.map((b, i) => {
          const rad = (b.angle * Math.PI) / 180;
          const x2 = 200 + Math.sin(rad) * 90; const y2 = 160 - Math.cos(rad) * 80;
          const isBurning = burning.includes(i);
          return (
            <g key={i}>
              <line x1="200" y1="160" x2={x2} y2={y2} stroke={isBurning ? '#ff7a59' : '#4a7c59'} strokeWidth="7"
                strokeLinecap="round" style={{ filter: isBurning ? 'drop-shadow(0 0 6px #ff7a59)' : 'none', transition: 'stroke 0.5s' }} />
              <circle cx={x2} cy={y2} r="24" fill={isBurning ? 'rgba(255,68,68,0.3)' : 'rgba(61,214,198,0.15)'}
                stroke={isBurning ? '#ff4444' : '#3dd6c6'} strokeWidth="1.5" style={{ transition: 'all 0.5s' }} />
              <text x={x2} y={y2 + 4} textAnchor="middle" fill={isBurning ? '#ff7a59' : '#9dc0c3'} fontSize="8" fontFamily="Chakra Petch">{b.label}</text>
              {isBurning && (
                <text x={x2} y={y2 - 32} textAnchor="middle" fill="#ff4444" fontSize="7" fontFamily="Chakra Petch">{b.consequence}</text>
              )}
            </g>
          );
        })}
        <circle cx="200" cy="160" r="12" fill="rgba(255,68,68,0.4)" stroke="#ff4444" />
        <text x="200" y="164" textAnchor="middle" fill="#ff4444" fontSize="9" fontFamily="Chakra Petch">YOU</text>
      </svg>
      {done && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.6)] animate-fadeUp">
          <div className="text-[14px] font-bold text-[#ff4444] uppercase tracking-widest text-center">YOUR DIGITAL IDENTITY HAS BEEN COMPROMISED</div>
        </div>
      )}
    </div>
  );
}

function GhostInMachine() {
  const CMDS = [
    { cmd: 'whoami', result: 'ACMECORP\\alice.zhang' },
    { cmd: 'Get-Process | findstr "chrome"', result: 'chrome.exe  PID: 4892' },
    { cmd: 'dir C:\\Users\\alice.zhang\\Documents', result: 'q3-budget.xlsx  contracts.pdf  passwords.txt' },
  ];
  const ACCESS = ['📷 Camera: ACCESSED', '⌨ Keystrokes: RECORDING', '📁 Files: UPLOADING TO REMOTE'];
  const [lines, setLines] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | typing | access
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase('typing');
      let i = 0;
      const add = () => { if (i < CMDS.length) { setLines(l => [...l, CMDS[i]]); i++; setTimeout(add, 900); } else { setTimeout(() => setPhase('access'), 400); } };
      add();
    }, 1000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="w-full rounded-[6px] overflow-hidden border border-[#555] bg-[#1e1e1e] min-h-[220px]">
      <div className="h-7 bg-[#2d2d2d] flex items-center px-3 gap-2">
        <div className="w-2 h-2 rounded-full bg-[#ff5f57]"/><div className="w-2 h-2 rounded-full bg-[#febc2e]"/><div className="w-2 h-2 rounded-full bg-[#28c840]"/>
        <span className="text-[9px] text-[#aaa] font-mono ml-2">Windows PowerShell</span>
      </div>
      <div className="p-4 font-mono text-[12px]">
        {lines.map((l, i) => (
          <div key={i} className="mb-2">
            <div className="text-[#3dd6c6]">PS C:\Users\alice.zhang&gt; {l.cmd}</div>
            <div className="text-[#aaa] ml-2">{l.result}</div>
          </div>
        ))}
        {phase === 'access' && (
          <div className="mt-3 animate-fadeUp">
            {ACCESS.map((a, i) => (
              <div key={i} className="text-[#ff4444] font-bold animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{a}</div>
            ))}
            <div className="mt-3 text-[14px] font-bold text-[#ff4444] tracking-wider">ALL YOUR ACTIVITY IS NOW VISIBLE</div>
          </div>
        )}
        <span className="text-[#3dd6c6] animate-pulse">█</span>
      </div>
    </div>
  );
}

function SimulationFor({ type, onNext }) {
  const SIMS = { ransomware_desktop: RansomwareDesktop, hacker_dashboard: HackerDashboard, identity_tree: IdentityTree, ghost_in_machine: GhostInMachine };
  const Sim = SIMS[type] || HackerDashboard;
  return (
    <div className="flex flex-col gap-6">
      <div className="text-[13px] text-[var(--as-muted)] leading-relaxed">Watch the simulation below to understand how this attack unfolds in real-time.</div>
      <Sim />
      <button onClick={onNext} className="btn-primary w-full py-3 mt-2">CONTINUE TO QUIZ →</button>
    </div>
  );
}

/* ── QUIZ ─────────────────────────────────────────────── */
function QuizPhase({ quiz, onComplete }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const submit = () => {
    const newAnswers = [...answers, selected];
    if (qIdx < quiz.length - 1) { setAnswers(newAnswers); setQIdx(q => q + 1); setSelected(null); }
    else {
      const correct = newAnswers.filter((a, i) => a === quiz[i].ans).length;
      setScore(correct); setAnswers(newAnswers); setFinished(true);
    }
  };

  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    const passed = pct >= 70;
    const col = passed ? '#3dd6c6' : '#ff7a59';
    return (
      <div className="flex flex-col gap-6 animate-fadeUp">
        <div className="text-center">
          <div className="text-[64px] font-bold font-['Chakra_Petch']" style={{ color: col }}>{pct}%</div>
          <div className="text-[14px] text-[var(--as-muted)]">{score}/{quiz.length} Correct</div>
        </div>
        <div className={`card border ${passed ? 'border-[rgba(61,214,198,0.4)] bg-[rgba(61,214,198,0.08)]' : 'border-[rgba(255,122,89,0.4)] bg-[rgba(255,122,89,0.08)]'}`}>
          {passed ? (
            <div className="flex items-center gap-3">
              <span className="text-[28px]">🎉</span>
              <div>
                <div className="font-bold text-[var(--as-accent2)] mb-0.5">Module Complete! +12 points added to your security score.</div>
                <div className="text-[12px] text-[var(--as-muted)]">Badge unlocked: Chain Breaker 🔗</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-bold text-[var(--as-accent)] mb-1">Keep Learning</div>
              <div className="text-[12px] text-[var(--as-muted)] mb-3">You need 70% to pass. Review the material and try again.</div>
              <div className="flex gap-3">
                <button onClick={() => { setQIdx(0); setSelected(null); setAnswers([]); setFinished(false); }} className="btn-ghost py-2 text-[12px]">RETRY QUIZ</button>
                <button onClick={() => onComplete(false)} className="btn-ghost py-2 text-[12px]">REVIEW MODULE</button>
              </div>
            </div>
          )}
        </div>
        {quiz.map((q, i) => {
          const isCorrect = answers[i] === q.ans;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 ${isCorrect ? 'bg-[rgba(61,214,198,0.2)] text-[#3dd6c6]' : 'bg-[rgba(255,68,68,0.2)] text-[#ff4444]'}`}>{isCorrect ? '✓' : '✗'}</div>
              <div>
                <div className="text-[13px] text-[var(--as-text)] mb-1">{q.q}</div>
                {!isCorrect && <div className="text-[11px] text-[var(--as-accent2)]">Correct: {q.opts[q.ans]}</div>}
              </div>
            </div>
          );
        })}
        {passed && <button onClick={() => onComplete(true)} className="btn-primary w-full py-3">BACK TO MODULES →</button>}
      </div>
    );
  }

  const q = quiz[qIdx];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-[var(--as-muted)]">Question {qIdx + 1} of {quiz.length}</span>
        <div className="flex-1 h-1 bg-[rgba(61,214,198,0.1)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--as-accent)] rounded-full transition-all" style={{ width: `${((qIdx + 1) / quiz.length) * 100}%` }} />
        </div>
      </div>
      <div className="text-[15px] text-[var(--as-text)] leading-relaxed">{q.q}</div>
      <div className="flex flex-col gap-3">
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => setSelected(i)}
            className="w-full text-left px-4 py-3 rounded-[6px] border transition-all text-[14px] font-['Chakra_Petch'] flex items-center justify-between"
            style={{ background: selected === i ? 'rgba(61,214,198,0.1)' : 'rgba(13,34,48,0.6)', borderColor: selected === i ? '#3dd6c6' : 'rgba(61,214,198,0.24)', color: selected === i ? '#edf7f7' : '#9dc0c3' }}>
            <span>{opt}</span>
            {selected === i && <span className="text-[var(--as-accent2)]">✓</span>}
          </button>
        ))}
      </div>
      <button onClick={submit} disabled={selected === null} className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed">
        {qIdx === quiz.length - 1 ? 'SUBMIT FINAL ANSWER' : 'NEXT QUESTION →'}
      </button>
    </div>
  );
}

/* ── MAIN ─────────────────────────────────────────────── */
export default function ModuleViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('content');
  const mod = MOCK_MODULE;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-16">

      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {['Content', 'Simulation', 'Quiz'].map((p, i) => {
          const pKey = PHASES[i];
          const isDone = PHASES.indexOf(phase) > i;
          const isCur  = phase === pKey;
          return (
            <React.Fragment key={p}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full transition-colors" style={{ background: isCur ? '#ff7a59' : isDone ? '#3dd6c6' : 'rgba(61,214,198,0.2)' }} />
                <span className="text-[10px] uppercase" style={{ color: isCur ? '#ff7a59' : isDone ? '#3dd6c6' : '#9dc0c3' }}>{p}</span>
              </div>
              {i < 2 && <div className="w-8 h-px bg-[rgba(61,214,198,0.2)]" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Module header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-[22px] font-bold text-[var(--as-text)]">{mod.title}</h2>
          <div className="flex gap-2 shrink-0">
            <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-[rgba(168,85,247,0.15)] text-[#a855f7]">{mod.attackType.replace(/_/g,' ')}</span>
            <span className="text-[9px] uppercase px-2 py-0.5 rounded border border-[var(--as-line)] text-[var(--as-muted)]">{mod.difficulty}</span>
          </div>
        </div>
        <span className="text-[11px] text-[var(--as-muted)]">~{mod.time} min</span>
      </div>

      {/* Phase content */}
      <div className="card">
        {phase === 'content' && (
          <div className="flex flex-col gap-5">
            <div className="text-[14px] text-[#9dc0c3] leading-[1.75]" style={{ whiteSpace: 'pre-line' }}>
              {mod.content.split('\n').map((line, i) => (
                <p key={i} className="mb-2 text-[14px]" style={{ color: line.startsWith('**') ? '#edf7f7' : '#9dc0c3' }}>
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
            </div>
            <button onClick={() => setPhase('simulation')} className="btn-primary w-full py-3 mt-2">CONTINUE TO SIMULATION →</button>
          </div>
        )}
        {phase === 'simulation' && <SimulationFor type={mod.simulationType} onNext={() => setPhase('quiz')} />}
        {phase === 'quiz' && <QuizPhase quiz={mod.quiz} onComplete={() => navigate('/me/modules')} />}
      </div>
    </div>
  );
}
