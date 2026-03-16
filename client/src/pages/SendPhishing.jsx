import React, { useState } from 'react';
import PhishingSender from '../components/PhishingSender';

export default function SendPhishing() {
  const [scenarioId, setScenarioId] = useState('');

  return (
    <div className="p-4 md:p-8 max-w-[900px] mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-[var(--as-text)] text-[24px] font-bold uppercase tracking-wider mb-2">
          Send Phishing
        </h1>
        <p className="text-[var(--as-muted)] text-[13px]">
          Choose a delivery channel, select a target employee, and send a simulated phishing message. This uses your configured server (email, SMS, WhatsApp, voice, Telegram).
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="card p-4">
          <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-2">
            Scenario ID (optional)
          </label>
          <input
            type="text"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            placeholder="e.g. 507f1f77bcf86cd799439011"
            className="w-full max-w-md bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] placeholder-[var(--as-muted)] focus:outline-none focus:border-[var(--as-accent)]"
          />
        </div>

        <PhishingSender scenarioId={scenarioId.trim() || undefined} />
      </div>
    </div>
  );
}
