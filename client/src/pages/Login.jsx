import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Shield, BarChart2, Users, Cpu, ArrowLeft, Check } from 'lucide-react';
import zxcvbn from 'zxcvbn';
import useAuthStore from '../stores/authStore';

const ROLES = [
  { id: 'admin',    label: 'Admin',    icon: Cpu,      desc: 'Full platform access' },
  { id: 'analyst',  label: 'Analyst',  icon: BarChart2, desc: 'Analytics & intelligence' },
  { id: 'defender', label: 'Defender', icon: Shield,    desc: 'Live threat response' },
  { id: 'employee', label: 'Employee', icon: Users,     desc: 'My security modules' },
];

const ROLE_HOME = { admin: '/dashboard', analyst: '/dashboard', defender: '/defender', employee: '/me' };

const DEMO = [
  { label: 'Admin',    email: 'sarah.chen@acmecorp.com',  pass: 'Admin@123456' },
  { label: 'Analyst',  email: 'marcus.webb@acmecorp.com', pass: 'Analyst@123456' },
  { label: 'Defender', email: 'james.ford@acmecorp.com',  pass: 'Defender@123456' },
];

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['#ff4444', '#ff7a59', '#eab308', '#3dd6c6', '#3dd6c6'];

export default function Login() {
  const [step, setStep] = useState('role'); // 'role' | 'login' | 'signup'
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Signup fields
  const [sigName, setSigName] = useState('');
  const [sigEmail, setSigEmail] = useState('');
  const [sigPass, setSigPass] = useState('');
  const [sigConfirm, setSigConfirm] = useState('');
  const [sigErrors, setSigErrors] = useState({});
  const [strength, setStrength] = useState(null);

  const { login, register, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const vantaRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(ROLE_HOME[user.role] || '/dashboard', { replace: true });
  }, [user]);

  // Matrix canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 14;
    const cols = Math.floor(canvas.width / fontSize);
    const drops = Array(cols).fill(1);
    let id;
    const draw = () => {
      ctx.fillStyle = 'rgba(7,20,31,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#6a1bda';
      ctx.font = `${fontSize}px 'Chakra Petch'`;
      drops.forEach((y, i) => {
        ctx.fillText(Math.random() > .5 ? '1' : '0', i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > .975) drops[i] = 0;
        drops[i]++;
      });
      id = requestAnimationFrame(draw);
    };
    id = requestAnimationFrame(draw);
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', onResize); };
  }, []);

  // Vanta
  useEffect(() => {
    let fx;
    const init = () => {
      if (window.VANTA?.NET && !fx) {
        fx = window.VANTA.NET({ el: vantaRef.current, color: 0x3dd6c6, backgroundColor: 0x000000, points: 10, maxDistance: 22, spacing: 18, mouseControls: false, touchControls: false });
      }
    };
    window.VANTA ? init() : setTimeout(init, 800);
    return () => { if (fx) fx.destroy(); };
  }, []);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const u = await login(email, password);
      setSuccess(true);
      setTimeout(() => navigate(ROLE_HOME[u.role] || '/dashboard'), 800);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setError('Invalid credentials. Please try again.');
      else if (status === 423) setError('Account locked — contact your administrator.');
      else if (status === 429) setError('Too many attempts. Try again later.');
      else setError('Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!sigName.trim()) errs.name = 'Name is required';
    if (!validateEmail(sigEmail)) errs.email = 'Please enter a valid email address';
    if (!sigPass) errs.pass = 'Password is required';
    else if (strength && strength.score < 2) errs.pass = 'Password is too weak';
    if (sigPass !== sigConfirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setSigErrors(errs); return; }

    setLoading(true);
    try {
      await register({ name: sigName, email: sigEmail.toLowerCase(), password: sigPass, role: selectedRole || 'employee' });
      setStep('login');
      setEmail(sigEmail.toLowerCase());
      setError('');
    } catch (err) {
      setSigErrors({ general: err?.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d) => { setEmail(d.email); setPassword(d.pass); };

  const inputCls = (hasErr) =>
    `w-full bg-[rgba(7,20,31,0.8)] border ${hasErr ? 'border-[#ff4444]' : 'border-[rgba(61,214,198,0.24)]'} text-[var(--as-text)] placeholder-[var(--as-muted)] px-4 py-3 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none transition-colors font-['Chakra_Petch'] text-[14px]`;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--as-bg)] font-['Chakra_Petch']">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.12 }} />
      <div ref={vantaRef} className="absolute inset-0 z-[-1]" style={{ opacity: 0.35 }} />

      <div className={`card w-full max-w-[480px] z-10 animate-fadeUp transition-all duration-500 ${success ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <img src="/cybersec.webp" alt="AttackSimulator" className="h-10 w-auto object-contain" onError={e => e.target.style.display='none'} />
        </div>
        <h1 className="text-[var(--as-accent)] text-center text-[18px] font-bold uppercase tracking-[0.15em] mb-1">ATTACK SIMULATOR</h1>
        <p className="text-[var(--as-muted)] text-center text-[10px] uppercase tracking-[0.2em] mb-6">Security Awareness Platform</p>

        <div className="w-full h-[1px] bg-[var(--as-line)] mb-6" />

        {/* STEP: Role Selection */}
        {step === 'role' && (
          <div className="animate-fadeUp">
            <p className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-4">Select Login Type</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ROLES.map(r => {
                const Icon = r.icon;
                return (
                  <button key={r.id} onClick={() => { setSelectedRole(r.id); setStep('login'); }}
                    className="card p-4 flex flex-col items-start gap-2 cursor-pointer hover:border-[var(--as-accent2)] hover:bg-[rgba(61,214,198,0.04)] transition-all text-left group">
                    <Icon size={20} className="text-[var(--as-accent2)] group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-[13px] font-bold text-[var(--as-text)] uppercase tracking-wider">{r.label}</div>
                      <div className="text-[10px] text-[var(--as-muted)] mt-0.5">{r.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP: Login Form */}
        {step === 'login' && (
          <div className="animate-slideInRight">
            <button onClick={() => { setStep('role'); setError(''); }} className="flex items-center gap-1.5 text-[11px] text-[var(--as-muted)] uppercase tracking-widest mb-5 hover:text-[var(--as-text)] transition-colors">
              <ArrowLeft size={12} /> BACK
            </button>
            {selectedRole && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-[12px] text-[var(--as-muted)] uppercase">Signed in as:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[rgba(255,122,89,0.15)] text-[var(--as-accent)] border border-[rgba(255,122,89,0.3)]">{selectedRole}</span>
              </div>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input type="email" autoComplete="username" placeholder="Email address (@acmecorp.com)" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} required className={inputCls(false)} />
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className={inputCls(false)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--as-muted)] hover:text-[var(--as-accent2)]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <div className="text-[#ff7a59] text-[12px]">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
                {loading ? <div className="w-4 h-4 border-2 border-[#08131b] border-t-transparent rounded-full animate-spin" /> : 'AUTHENTICATE'}
              </button>
            </form>

            {/* Demo Access */}
            <div className="mt-5 pt-4 border-t border-[var(--as-line)]">
              <button onClick={() => setShowDemo(!showDemo)} className="text-[11px] text-[var(--as-accent2)] hover:underline w-full text-center">Demo Access ▾</button>
              {showDemo && (
                <div className="mt-3 flex flex-col gap-1.5 bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] p-3">
                  {DEMO.map(d => (
                    <div key={d.label} onClick={() => fillDemo(d)} className="flex justify-between items-center cursor-pointer hover:bg-[rgba(61,214,198,0.05)] p-1.5 rounded transition-colors group">
                      <span className="text-[var(--as-accent)] text-[10px] uppercase font-bold w-16">{d.label}</span>
                      <span className="text-[var(--as-muted)] text-[10px] font-mono group-hover:text-[var(--as-accent2)] truncate">{d.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sign up link */}
            <p className="text-[11px] text-center text-[var(--as-muted)] mt-4">
              New to Acme Corp?{' '}
              <button onClick={() => { setStep('signup'); setError(''); }} className="text-[var(--as-accent2)] hover:underline">Create Account</button>
            </p>
          </div>
        )}

        {/* STEP: Signup */}
        {step === 'signup' && (
          <div className="animate-slideInRight">
            <button onClick={() => { setStep('login'); setSigErrors({}); }} className="flex items-center gap-1.5 text-[11px] text-[var(--as-muted)] uppercase tracking-widest mb-5 hover:text-[var(--as-text)] transition-colors">
              <ArrowLeft size={12} /> BACK TO LOGIN
            </button>
            <p className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-4">Create Account</p>
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div>
                <input placeholder="Full Name" autoComplete="name" value={sigName} onChange={e => { setSigName(e.target.value); setSigErrors(p=>({...p,name:''})); }} className={inputCls(sigErrors.name)} />
                {sigErrors.name && <div className="text-[#ff4444] text-[11px] mt-1">{sigErrors.name}</div>}
              </div>
              <div>
                <input type="email" autoComplete="email" placeholder="Email (@acmecorp.com)" value={sigEmail} onChange={e => { setSigEmail(e.target.value); setSigErrors(p=>({...p,email:''})); }} className={inputCls(sigErrors.email)} />
                {sigErrors.email && <div className="text-[#ff4444] text-[11px] mt-1">{sigErrors.email}</div>}
              </div>
              <div>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="Password" value={sigPass} onChange={e => { setSigPass(e.target.value); setStrength(zxcvbn(e.target.value)); setSigErrors(p=>({...p,pass:''})); }} className={inputCls(sigErrors.pass)} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--as-muted)] hover:text-[var(--as-accent2)]">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {sigPass && strength && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i <= strength.score ? strengthColors[strength.score] : 'rgba(61,214,198,0.1)' }} />
                      ))}
                    </div>
                    <span className="text-[10px]" style={{ color: strengthColors[strength.score] }}>{strengthLabels[strength.score]}</span>
                  </div>
                )}
                {sigErrors.pass && <div className="text-[#ff4444] text-[11px] mt-1">{sigErrors.pass}</div>}
              </div>
              <div>
                <input type="password" autoComplete="new-password" placeholder="Confirm Password" value={sigConfirm} onChange={e => { setSigConfirm(e.target.value); setSigErrors(p=>({...p,confirm:''})); }} className={inputCls(sigErrors.confirm)} />
                {sigErrors.confirm && <div className="text-[#ff4444] text-[11px] mt-1">{sigErrors.confirm}</div>}
              </div>
              {sigErrors.general && <div className="text-[#ff4444] text-[12px]">{sigErrors.general}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
                {loading ? <div className="w-4 h-4 border-2 border-[#08131b] border-t-transparent rounded-full animate-spin" /> : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        )}

        {/* Success flash */}
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-[var(--as-bg)] z-50 animate-fadeUp">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--as-accent2)] flex items-center justify-center animate-pulse">
                <Check size={32} className="text-[var(--as-accent2)]" />
              </div>
              <div className="text-[var(--as-accent2)] text-[14px] uppercase tracking-widest">Access Granted</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
