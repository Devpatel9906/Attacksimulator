import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

const REPORT_ITEMS = [
  'Executive Summary',
  'Attack Timeline',
  'Ghost Propagation Map',
  'Financial Exposure',
  'Coverage Gap Analysis',
  'Actionable Recommendations',
  'Security Culture Score',
];

export default function BoardReport() {
  const { id } = useParams();
  const [insuranceLimit, setInsuranceLimit] = useState('2000000');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleDownload = async () => {
    setStatus('loading');
    try {
      // Try real API first; fall back to mock blob
      let blob;
      try {
        const res = await api.get(`/api/scenarios/${id}/board-report`, {
          params: { insuranceLimit: parseInt(insuranceLimit) },
          responseType: 'blob',
        });
        blob = res.data;
      } catch {
        // Fallback: create a simple text blob for demo
        const text = `ATTACK SIMULATOR — BOARD REPORT\nScenario: ${id || 'Q3 Invoice Phish'}\nGenerated: ${new Date().toLocaleString()}\n\nThis is a demo report. Connect the backend API to receive a real PDF.`;
        blob = new Blob([text], { type: 'text/plain' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-report-${id || 'scenario'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="p-4 md:p-8 flex justify-center pb-20">
      <div className="w-full max-w-[560px] flex flex-col gap-6 animate-fadeUp">

        {/* Header */}
        <div>
          <h1 className="text-[22px] font-bold text-[var(--as-accent2)] uppercase tracking-wider mb-1">Board Report Generator</h1>
          <p className="text-[var(--as-muted)] text-[13px]">Q3 Invoice Phish — Scenario Report</p>
        </div>

        {/* Insurance Input */}
        <div className="card">
          <label className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider block mb-2">Insurance Limit ($)</label>
          <input
            type="text"
            value={insuranceLimit}
            onChange={e => setInsuranceLimit(e.target.value)}
            className="w-full bg-[rgba(7,20,31,0.8)] border border-[rgba(61,214,198,0.24)] text-[var(--as-text)] placeholder-[var(--as-muted)] px-4 py-3 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none transition-colors font-['Chakra_Petch'] text-[14px]"
            placeholder="2000000"
          />
          <p className="text-[10px] text-[var(--as-muted)] mt-1.5">Used to calculate your coverage gap in the financial summary section.</p>
        </div>

        {/* Contents Preview */}
        <div className="card">
          <div className="text-[12px] text-[var(--as-muted)] mb-3 uppercase tracking-wider">This report will include:</div>
          <div className="flex flex-col gap-2.5">
            {REPORT_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 animate-fadeUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[13px] text-[var(--as-text)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={status === 'loading'}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-[4px] font-['Chakra_Petch'] font-bold text-[14px] uppercase tracking-[0.08em] transition-all ${
            status === 'success'
              ? 'bg-[var(--as-accent2)] text-[#07141f]'
              : status === 'error'
              ? 'bg-[rgba(255,68,68,0.15)] border border-[#ff4444] text-[#ff4444] cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {status === 'loading' && (
            <div className="w-5 h-5 border-2 border-[#08131b] border-t-transparent rounded-full animate-spin" />
          )}
          {status === 'success' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          )}
          {status === 'idle' || status === 'loading' ? (
            <>
              {status === 'idle' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              {status === 'loading' ? 'Generating...' : 'Download Board Report (PDF)'}
            </>
          ) : status === 'success' ? (
            'Report Downloaded ✓'
          ) : (
            'Generation Failed — Try Again'
          )}
        </button>

        {status === 'error' && (
          <button onClick={() => setStatus('idle')} className="text-[11px] text-[var(--as-accent2)] text-center hover:underline">
            Reset and try again
          </button>
        )}

        <p className="text-[11px] text-[var(--as-muted)] text-center">
          Report is formatted for board presentation. Recommended: print landscape A4.
        </p>

      </div>
    </div>
  );
}
