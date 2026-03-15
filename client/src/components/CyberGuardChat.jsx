import React from 'react';

const CyberGuardChat = ({ response, isLoading, onGenerate, buttonText, title = "CyberGuard AI" }) => {
  return (
    <div className="card w-full animate-fadeUp border-t-4 border-t-[#3dd6c6]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M16 12L12 8l-4 4" />
            <path d="M12 16V8" />
          </svg>
          <h2 className="text-[16px] font-bold text-[#3dd6c6] font-['Chakra_Petch'] uppercase tracking-wider">{title}</h2>
        </div>
        {onGenerate && (
          <button 
            onClick={onGenerate}
            disabled={isLoading}
            className="btn-ghost text-[#3dd6c6] hover:bg-[#3dd6c6] hover:text-[#07141f] border-[#3dd6c6] text-[12px] px-3 py-1.5 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/></svg>
            )}
            {buttonText || 'ASK CYBERGUARD'}
          </button>
        )}
      </div>

      <div className="bg-[#0a192f] p-4 rounded-md border border-[rgba(61,214,198,0.2)] min-h-[100px] relative font-mono text-[13px] text-[#e2f1f8] leading-relaxed whitespace-pre-wrap">
        {isLoading ? (
          <div className="flex items-center gap-2 text-[#3dd6c6] animate-pulse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            CyberGuard is analyzing...
          </div>
        ) : response ? (
          response
        ) : (
          <div className="text-[var(--as-muted)] italic">
            CyberGuard AI is ready. Click the button above to generate insights.
          </div>
        )}
      </div>
    </div>
  );
};

export default CyberGuardChat;
