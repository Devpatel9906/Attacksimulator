import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, label: 'Digital Stalking' },
  { id: 2, label: 'Identity Theft' },
  { id: 3, label: '2FA Paradox' },
  { id: 4, label: 'Clean Sweep' },
];

export default function SimSwapStoryboard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const next = () => setStep(s => Math.min(s + 1, 5));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      
      {/* PROGRESS BAR */}
      <div className="sticky top-0 z-20 py-6 mb-8" style={{ background: 'rgba(7,20,31,0.9)', backdropFilter: 'blur(8px)' }}>
        <div className="flex flex-col items-center">
          <div className="text-[13px] font-bold text-[var(--as-accent2)] uppercase tracking-[0.2em] mb-6">
            The Silent Switch — SIM Swap Attack Simulation
          </div>
          <div className="relative flex items-center justify-between w-full max-w-md px-4">
            {/* Line */}
            <div className="absolute left-4 right-4 h-0.5 bg-[rgba(255,122,89,0.2)] top-[16px]" />
            <div 
              className="absolute left-4 h-0.5 bg-[var(--as-accent)] top-[16px] transition-all duration-500" 
              style={{ width: `${((step - 1) / 3) * 100}%`, maxWidth: 'calc(100% - 32px)' }}
            />
            
            {STEPS.map((s) => (
              <div key={s.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-all duration-500 ${
                    step >= s.id ? 'bg-[var(--as-accent)] text-[#08131b]' : 'bg-[rgba(255,122,89,0.1)] border border-[rgba(255,122,89,0.3)] text-[var(--as-accent)]'
                  }`}
                >
                  {s.id}
                </div>
                <span className={`text-[9px] uppercase mt-2 font-bold tracking-tighter ${step === s.id ? 'text-[var(--as-accent)]' : 'text-[var(--as-muted)]'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card min-h-[500px] flex flex-col">
        {step === 1 && (
          <div className="animate-fadeUp flex flex-col items-center text-center max-w-2xl mx-auto py-8">
            <div className="w-full h-64 mb-8 bg-[rgba(13,34,48,0.4)] rounded-lg flex items-center justify-center relative overflow-hidden">
               {/* Abstract SVG Scene 1 */}
               <svg width="400" height="200" viewBox="0 0 400 200">
                  <rect x="180" y="100" width="40" height="60" rx="4" fill="#12364a" opacity="0.3" className="animate-pulse" />
                  <circle cx="200" cy="80" r="20" fill="#ff7a59" opacity="0.1" />
                  <path d="M190 75 L210 75 M200 65 L200 85" stroke="#ff7a59" strokeWidth="2" opacity="0.5" />
                  {/* Floating Icons */}
                  <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                    <rect x="50" y="40" width="30" height="30" rx="4" fill="#0077b5" />
                    <text x="65" y="60" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">in</text>
                  </g>
                  <g className="animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                    <rect x="320" y="50" width="30" height="30" rx="4" fill="#1877f2" />
                    <text x="335" y="72" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">f</text>
                  </g>
                  <g className="animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                    <rect x="100" y="120" width="30" height="30" rx="4" fill="#ff0000" />
                    <circle cx="115" cy="135" r="8" stroke="white" strokeWidth="2" fill="none" />
                  </g>
                  <path d="M80 70 Q 150 70 180 100" stroke="#ff7a59" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.4" />
                  <path d="M320 80 Q 250 80 220 100" stroke="#ff7a59" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.4" />
               </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[var(--as-accent)] mb-4">STEP 1 — DIGITAL STALKING</h2>
            <p className="text-[14px] text-[var(--as-muted)] leading-[1.8] mb-8">
              The attacker spends 2 days building your profile. LinkedIn reveals your employer and phone carrier. 
              Facebook shows your birthday. A data breach site has your last 4 SSN digits. 
              You posted your new phone last month. They know everything.
            </p>
            <div className="w-full p-4 rounded-md border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.08)] mb-8">
              <span className="text-[14px] font-bold text-[#ff4444] uppercase tracking-wider">YOUR PUBLIC PROFILE JUST BECAME A WEAPON.</span>
            </div>
            <button onClick={next} className="btn-primary self-center">NEXT STEP →</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeUp flex flex-col items-center text-center max-w-2xl mx-auto py-8">
            <div className="w-full h-64 mb-8 bg-[rgba(13,34,48,0.4)] rounded-lg flex items-center justify-center">
               {/* Scene 2: Carrier Counter */}
               <svg width="400" height="200" viewBox="0 0 400 200">
                  <rect x="50" y="160" width="300" height="10" fill="#3dd6c6" opacity="0.3" />
                  <circle cx="120" cy="110" r="25" fill="#9dc0c3" opacity="0.2" />
                  <rect x="110" y="110" width="20" height="50" fill="#9dc0c3" opacity="0.2" />
                  <circle cx="280" cy="110" r="25" fill="#3dd6c6" opacity="0.2" />
                  <rect x="270" y="110" width="20" height="50" fill="#3dd6c6" opacity="0.2" />
                  
                  <rect x="150" y="130" width="40" height="25" rx="2" fill="#edf7f7" className="animate-slideInLeft" />
                  <text x="170" y="147" textAnchor="middle" fill="#07141f" fontSize="8" fontWeight="bold">ID CARD</text>
                  
                  <path d="M145 90 Q 180 60 215 90" stroke="white" fill="none" opacity="0.5" />
                  <text x="180" y="105" textAnchor="middle" fill="white" fontSize="9">"I lost my phone..."</text>
               </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[var(--as-accent)] mb-4">STEP 2 — IDENTITY THEFT AT CARRIER</h2>
            <p className="text-[14px] text-[var(--as-muted)] leading-[1.8] mb-8">
              The attacker walks into your carrier with a fake ID and your public info. 
              The store rep verifies: name ✓, address ✓, last 4 SSN ✓. Carrier PIN? 
              "I forgot it, can you reset?" Three minutes later, your phone number belongs to someone else.
            </p>
            <div className="w-full p-4 rounded-md border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.08)] mb-8">
              <span className="text-[14px] font-bold text-[#ff4444] uppercase tracking-wider">YOUR PHONE NUMBER NOW BELONGS TO SOMEONE ELSE.</span>
            </div>
            <button onClick={next} className="btn-primary self-center">NEXT STEP →</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeUp flex flex-col items-center text-center max-w-3xl mx-auto py-8">
            <div className="w-full grid grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-64 border-4 border-[#333] rounded-2xl bg-black p-2">
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="text-[#ff4444] font-bold text-[10px] animate-pulse">NO SERVICE</div>
                    <div className="w-12 h-1 bg-[#222] rounded-full" />
                    <div className="p-2 border border-[#333] rounded text-[8px] text-[#9dc0c3]">
                      Network unavailable
                    </div>
                  </div>
                </div>
                <span className="text-[10px] uppercase text-[#ff4444] mt-3">Your Phone</span>
              </div>
              <div className="flex flex-col items-center">
                 <div className="relative w-32 h-64 border-4 border-[#ff7a59] rounded-2xl bg-black p-2">
                    <div className="w-full h-full flex flex-col gap-2 p-1 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[#3dd6c6] text-[8px] font-bold">4G LTE</div>
                        <div className="flex gap-0.5"><div className="w-1 h-2 bg-[#3dd6c6]"/><div className="w-1 h-3 bg-[#3dd6c6]"/><div className="w-1 h-4 bg-[#3dd6c6]"/></div>
                      </div>
                      <div className="bg-[#1a3040] p-1.5 rounded animate-slideInRight" style={{ animationDelay: '0s' }}>
                        <div className="text-[8px] font-bold text-[#3dd6c6]">BANK: 847291</div>
                      </div>
                      <div className="bg-[#1a3040] p-1.5 rounded animate-slideInRight" style={{ animationDelay: '1s' }}>
                        <div className="text-[8px] font-bold text-[#3dd6c6]">LOGIN: 193847</div>
                      </div>
                      <div className="mt-auto mb-4 text-center">
                        <div className="text-[10px] text-[#9dc0c3]">WIRING...</div>
                        <div className="text-[14px] font-bold text-[#ff4444]">$47,832 → $0</div>
                      </div>
                    </div>
                 </div>
                 <span className="text-[10px] uppercase text-[#3dd6c6] mt-3">Attacker's Phone</span>
              </div>
            </div>
            <h2 className="text-[20px] font-bold text-[var(--as-accent)] mb-4">STEP 3 — THE 2FA PARADOX</h2>
            <p className="text-[14px] text-[var(--as-muted)] leading-[1.8] mb-8">
              While your phone shows 'No Service', every SMS goes to the attacker. 
              Your bank sends the verification code to them. In minutes, they've changed your password, 
              bypassed 2FA, and drained your account.
            </p>
            <div className="w-full p-4 rounded-md border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.08)] mb-8">
              <span className="text-[14px] font-bold text-[#ff4444] uppercase tracking-wider">EVERY OTP IS GOING STRAIGHT TO THE ATTACKER.</span>
            </div>
            <button onClick={next} className="btn-primary self-center">NEXT STEP →</button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fadeUp flex flex-col items-center text-center max-w-2xl mx-auto py-8">
             <div className="w-full flex-1 flex flex-col gap-2 mb-8 items-start px-12">
                {[
                  "Email password changed",
                  "Bank account drained",
                  "Crypto wallet emptied",
                  "Recovery codes used",
                  "Contact list downloaded",
                  "LinkedIn account taken"
                ].map((txt, i) => (
                  <div key={i} className="flex items-center gap-3 animate-slideInRight" style={{ animationDelay: `${i * 0.4}s` }}>
                    <span className="text-[#ff4444] font-bold text-[18px]">✗</span>
                    <span className="text-[14px] text-[var(--as-muted)] mono">{txt}</span>
                  </div>
                ))}
                <div className="w-full h-px bg-[rgba(255,122,89,0.2)] my-4" />
                <div className="w-full flex justify-between items-baseline">
                   <div className="text-[36px] font-bold text-[#ff4444] font-['Chakra_Petch']">$0.00</div>
                   <div className="text-[12px] text-[var(--as-muted)]">TIME ELAPSED: 11 minutes</div>
                </div>
             </div>
            <h2 className="text-[20px] font-bold text-[var(--as-accent)] mb-4">STEP 4 — CLEAN SWEEP</h2>
            <p className="text-[14px] text-[var(--as-muted)] leading-[1.8] mb-8">
              The attacker doesn't just take your money. They lock you out of your digital life. 
              They use recovery codes to change your secondary emails, lock your social profiles, 
              and download your contact lists to target your friends next.
            </p>
            <div className="w-full p-4 rounded-md border border-[rgba(255,68,68,0.2)] bg-[rgba(255,68,68,0.08)] mb-8">
              <span className="text-[14px] font-bold text-[#ff4444] uppercase tracking-wider">IN 11 MINUTES, YOUR DIGITAL LIFE WAS ERASED.</span>
            </div>
            <button onClick={next} className="btn-primary self-center">SEE HOW TO PROTECT YOURSELF →</button>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fadeUp flex flex-col items-center py-8">
            <h2 className="text-[24px] font-bold text-[var(--as-accent2)] mb-12 uppercase tracking-widest text-center">How To Protect Yourself</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="card text-center flex flex-col items-center border-t-4 border-t-[var(--as-accent2)] animate-fadeUp" style={{ animationDelay: '0s' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5" className="mb-4">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/><rect x="9" y="8" width="6" height="6" rx="1"/>
                </svg>
                <h3 className="font-bold text-[14px] mb-3 uppercase tracking-wider">ENABLE SIM PIN</h3>
                <p className="text-[12px] text-[var(--as-muted)] leading-relaxed">
                  Call your carrier today and set a SIM PIN or port-out freeze. This blocks any SIM swap request without a physical presence or secret PIN.
                </p>
              </div>
              <div className="card text-center flex flex-col items-center border-t-4 border-t-[var(--as-accent2)] animate-fadeUp" style={{ animationDelay: '0.15s' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5" className="mb-4">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"/>
                </svg>
                <h3 className="font-bold text-[14px] mb-3 uppercase tracking-wider">USE AUTHENTICATOR APPS</h3>
                <p className="text-[12px] text-[var(--as-muted)] leading-relaxed">
                  Replace SMS 2FA with app-based codes (TOTP) or hardware keys. These can't be intercepted via SIM swap because they don't rely on the cellular network.
                </p>
              </div>
              <div className="card text-center flex flex-col items-center border-t-4 border-t-[var(--as-accent2)] animate-fadeUp" style={{ animationDelay: '0.3s' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5" className="mb-4">
                  <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88m3.63-1.42a15.91 15.91 0 016.5-1"/>
                </svg>
                <h3 className="font-bold text-[14px] mb-3 uppercase tracking-wider">MONITOR FOR NO SERVICE</h3>
                <p className="text-[12px] text-[var(--as-muted)] leading-relaxed">
                  Unexpected "No Service" is a major red flag. If it happens in a high-signal area, call your carrier immediately from another phone — don't wait for it to "fix itself".
                </p>
              </div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => navigate('/me/modules')} className="btn-primary">TAKE THE AWARENESS QUIZ →</button>
               <button onClick={() => navigate('/knowledge/advanced')} className="btn-ghost">BACK TO KNOWLEDGE BASE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
