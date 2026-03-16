import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const attackColors = {
  email_phishing: '#ff7a59',
  credential_harvesting: '#ff4444',
  social_engineering: '#a855f7',
  malware_simulation: '#eab308',
  sim_swap: '#f97316',
  fileless_malware: '#ef4444',
  watering_hole: '#10b981',
  bec: '#ec4899',
  ai_deepfake: '#3dd6c6',
  supply_chain: '#6366f1'
};

const attackTiles = [
  { id: 'email_phishing', name: 'Email Phishing', desc: 'Simulate deceptive email campaigns targeting staff.' },
  { id: 'credential_harvesting', name: 'Credential Harvesting', desc: 'Attempt to harvest corporate logins.' },
  { id: 'social_engineering', name: 'Social Engineering', desc: 'Multi-channel manipulation via SMS and calls.' },
  { id: 'malware_simulation', name: 'Malware Simulation', desc: 'Benign payload drops via attachments.' },
  { id: 'sim_swap', name: 'SIM Swap', desc: 'Simulate mobile number porting attacks.' },
  { id: 'fileless_malware', name: 'Fileless Malware', desc: 'In-memory execution simulations.' },
  { id: 'watering_hole', name: 'Watering Hole', desc: 'Compromised internal subdomains.' },
  { id: 'bec', name: 'BEC', desc: 'Business Email Compromise (CEO Fraud).' },
  { id: 'ai_deepfake', name: 'AI Deepfake', desc: 'Synthesized voice/video instructions.' },
  { id: 'supply_chain', name: 'Supply Chain', desc: 'Vendor portal mock compromise.' }
];

const diffColors = {
  LOW: '#3dd6c6',
  MEDIUM: '#eab308',
  HIGH: '#ff7a59',
  CRITICAL: '#ff4444'
};
const diffDescs = {
  LOW: 'Obvious flags, generic context',
  MEDIUM: 'Targeted context, minor errors',
  HIGH: 'No errors, deep internal context',
  CRITICAL: 'Multi-vector, perfect spoofing'
};

const ScenarioNew = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('LOW');
  const [selectedVectors, setSelectedVectors] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Mock fetch depts
    const fetchDepts = async () => {
      await new Promise(r => setTimeout(r, 400));
      setDepartments([
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Sales' },
        { id: 3, name: 'Marketing' },
        { id: 4, name: 'HR' },
        { id: 5, name: 'Finance' },
        { id: 6, name: 'Operations' }
      ]);
    };
    fetchDepts();
  }, []);

  const toggleVector = (id) => {
    setSelectedVectors(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
    if (errors.vectors) setErrors(e => ({ ...e, vectors: null }));
  };

  const toggleDept = (id) => {
    setSelectedDepts(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e, isDraft) => {
    e.preventDefault();
    let newErrors = {};
    if (!name.trim()) newErrors.name = 'Scenario name is required';
    if (selectedVectors.length === 0) newErrors.vectors = 'Select at least one attack vector';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic
    await new Promise(r => setTimeout(r, 600)); // mock API delay
    navigate('/scenarios');
  };

  return (
    <div className="p-4 md:p-8 w-full flex justify-center pb-20">
      <div className="card w-full max-w-[680px] animate-fadeUp">
        <h1 className="h2 text-[var(--as-accent2)] mb-8">BUILD SCENARIO</h1>
        
        {/* SEC 1: IDENTITY */}
        <div className="mb-8">
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-3">SCENARIO IDENTITY</div>
          <input 
            type="text" 
            placeholder="Scenario Name (e.g., Q4 Board Phish)" 
            value={name}
            onChange={(e) => {
               setName(e.target.value);
               if (errors.name) setErrors(er => ({ ...er, name: null }));
            }}
            className="w-full bg-[rgba(7,20,31,0.8)] border border-[rgba(61,214,198,0.24)] text-[#edf7f7] placeholder-[#9dc0c3] px-4 py-3 rounded-[4px] focus:border-[#3dd6c6] focus:outline-none transition-colors font-['Chakra_Petch'] mb-4"
          />
          {errors.name && <div className="text-[#ff4444] text-[12px] mt-[-12px] mb-4">{errors.name}</div>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(diff => (
              <div 
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`card p-3 cursor-pointer transition-all border ${
                  difficulty === diff 
                    ? `border-[${diffColors[diff]}] shadow-[0_0_0_1px_${diffColors[diff]}] bg-[rgba(255,122,89,0.08)]` 
                    : 'border-[var(--as-line)] hover:border-[var(--as-line)] hover:bg-[rgba(61,214,198,0.04)]'
                }`}
                style={difficulty === diff ? { borderColor: diffColors[diff], boxShadow: `0 0 0 1px ${diffColors[diff]}` } : {}}
              >
                <div className={`text-[12px] font-bold uppercase tracking-widest ${difficulty === diff && diff === 'CRITICAL' ? 'animate-pulse' : ''}`} style={{ color: diffColors[diff] }}>
                  {diff}
                </div>
                <div className="text-[10px] text-[var(--as-muted)] mt-1 leading-tight">{diffDescs[diff]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SEC 2: VECTORS */}
        <div className="mb-8">
          <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em] mb-3">SELECT ATTACK VECTORS (choose at least 1)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {attackTiles.map(tile => {
              const active = selectedVectors.includes(tile.id);
              const color = attackColors[tile.id];
              return (
                <div 
                  key={tile.id} 
                  onClick={() => toggleVector(tile.id)}
                  className={`card p-3 cursor-pointer relative transition-all ${!active && 'hover:bg-[rgba(61,214,198,0.02)]'}`}
                  style={{
                    borderColor: active ? color : 'var(--as-line)',
                    backgroundColor: active ? `${color}14` : undefined // ~8% opacity
                  }}
                >
                  {active && (
                    <div className="absolute top-3 right-3" style={{ color }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  )}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="mb-2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <div className="font-['Chakra_Petch'] text-[13px] font-bold text-[var(--as-text)] leading-tight uppercase tracking-wider mb-1 pr-6">{tile.name}</div>
                  <div className="text-[10px] text-[var(--as-muted)] leading-snug">{tile.desc}</div>
                </div>
              );
            })}
          </div>
          {errors.vectors && <div className="text-[#ff4444] text-[12px] mt-2">{errors.vectors}</div>}
        </div>

        {/* SEC 3: DEPARTMENTS */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-3 gap-2">
             <div className="text-[11px] text-[var(--as-muted)] uppercase tracking-[0.15em]">TARGET DEPARTMENTS<br/><span className="text-[9px] opacity-70">(optional — leave blank for all)</span></div>
             <div className="flex gap-4 text-[11px] text-[var(--as-accent2)] font-['Chakra_Petch'] uppercase tracking-widest font-bold">
                <button onClick={() => setSelectedDepts(departments.map(d=>d.id))} className="hover:text-[var(--as-text)] transition-colors">Select All</button>
                <div className="w-[1px] bg-[var(--as-line)] h-full"></div>
                <button onClick={() => setSelectedDepts([])} className="hover:text-[#ff7a59] transition-colors">Clear All</button>
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {departments.length === 0 ? (
              <div className="text-[12px] text-[var(--as-muted)] animate-pulse">Loading departments...</div>
            ) : (
              departments.map(d => (
                <button 
                  key={d.id}
                  onClick={() => toggleDept(d.id)}
                  className={`px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded transition-colors border ${
                    selectedDepts.includes(d.id) 
                      ? 'bg-[rgba(61,214,198,0.15)] border-[var(--as-accent2)] text-[var(--as-accent2)]' 
                      : 'bg-[rgba(7,20,31,0.5)] border-[var(--as-line)] text-[var(--as-muted)] hover:border-[var(--as-accent2)] hover:text-[var(--as-text)]'
                  }`}
                >
                  {d.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* SEC 4: SUBMIT */}
        <div className="bg-[rgba(255,68,68,0.08)] border border-[rgba(255,68,68,0.3)] rounded-[4px] p-4 mb-6">
           <div className="flex items-start gap-3">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff7a59" strokeWidth="2" className="mt-0.5 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
             <div className="text-[#ff7a59] text-[12px] leading-relaxed">
               <span className="font-bold mr-1 uppercase tracking-widest">Live Fire Warning:</span><br/> 
               This configuration will dispatch real payloads (emails, SMS, calls) to the selected target employee groups immediately upon clicking Create Scenario.
             </div>
           </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between gap-4 pt-4 border-t border-[var(--as-line)]">
          <button onClick={(e) => handleSubmit(e, true)} className="btn-ghost text-[14px]">SAVE AS DRAFT</button>
          <button onClick={(e) => handleSubmit(e, false)} className="btn-primary text-[14px]">CREATE LETHAL SCENARIO</button>
        </div>

      </div>
    </div>
  );
};

export default ScenarioNew;
