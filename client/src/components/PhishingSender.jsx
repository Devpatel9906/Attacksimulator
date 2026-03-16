import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import useToastStore from '../stores/toastStore';

const CHANNELS = [
  { id: 'email', label: 'Email', icon: '✉', needsSubject: true, needsMessage: true },
  { id: 'sms', label: 'SMS', icon: '📱', needsMessage: true },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬', needsMessage: true },
  { id: 'voice', label: 'Voice', icon: '📞' },
  { id: 'telegram', label: 'Telegram', icon: '✈', needsMessage: true },
];

const EMAIL_TEMPLATES = [
  { id: 'security_alert', label: 'Security Alert' },
  { id: 'it_password_reset', label: 'IT Password Reset' },
  { id: 'invoice_fraud', label: 'Invoice / Urgent Request' },
];

export default function PhishingSender({ scenarioId, onSent }) {
  const addToast = useToastStore((s) => s.addToast);
  const errorToast = useToastStore((s) => s.error);
  const successToast = useToastStore((s) => s.success);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [sending, setSending] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);

  const [channel, setChannel] = useState('email');
  const [targetMode, setTargetMode] = useState('manual');
  const [employeeId, setEmployeeId] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState(EMAIL_TEMPLATES[0]?.id || '');

  useEffect(() => {
    let cancelled = false;
    setEmployeesError(null);
    (async () => {
      setLoadingEmployees(true);
      try {
        const { data } = await api.get('/api/employees');
        if (!cancelled) {
          setEmployees(Array.isArray(data) ? data : []);
          setEmployeesError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setEmployees([]);
          const is401 = err.response?.status === 401;
          setEmployeesError(
            is401
              ? 'Session expired or demo account — sign in with a real account to load employees.'
              : (err.response?.data?.error || 'Failed to load employees')
          );
          if (!is401) errorToast(err.response?.data?.error || 'Failed to load employees');
        }
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    })();
    return () => { cancelled = true; };
  }, [errorToast]);

  const selectedChannelConfig = CHANNELS.find((c) => c.id === channel);

  const getTargetLabel = () => {
    switch (channel) {
      case 'email': return 'Target Email Address';
      case 'sms': 
      case 'voice': return 'Target Phone Number (e.g., +1234567890)';
      case 'whatsapp': return 'Target WhatsApp Number (e.g., +1234567890)';
      case 'telegram': return 'Target Telegram Chat ID';
      default: return 'Target';
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (targetMode === 'employee' && !employeeId) {
      addToast({ message: 'Select an employee', type: 'error' });
      return;
    }
    if (targetMode === 'manual' && !targetInput) {
      addToast({ message: 'Enter a target', type: 'error' });
      return;
    }
    setSending(true);
    try {
      const payload = {
        channel,
        ...(targetMode === 'employee' ? { employeeId } : { targetInput }),
        ...(scenarioId && { scenarioId }),
        ...(subject && { subject }),
        ...(message && { message }),
        ...(template && channel === 'email' && { template }),
      };
      await api.post('/api/attacks/send', payload);
      successToast(`Phishing sent via ${channel}`);
      setEmployeeId('');
      setTargetInput('');
      setSubject('');
      setMessage('');
      if (onSent) onSent();
    } catch (err) {
      errorToast(err.response?.data?.error || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card p-4 animate-slideInLeft">
      <div className="text-[13px] text-[var(--as-accent2)] uppercase tracking-[0.1em] font-semibold mb-4">
        Send phishing by channel
      </div>

      <form onSubmit={handleSend} className="flex flex-col gap-4">
        {/* Channel */}
        <div>
          <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
            Channel
          </label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] focus:outline-none focus:border-[var(--as-accent)]"
          >
            {CHANNELS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        {employeesError && (
          <div className="p-3 rounded-[4px] bg-[rgba(255,122,89,0.12)] border border-[rgba(255,122,89,0.3)] text-[12px] text-[var(--as-accent)]">
            {employeesError}
          </div>
        )}

        {/* Target Mode Toggle */}
        <div className="flex gap-4 mb-2 mt-2">
          <label className="flex items-center gap-2 text-[12px] text-[var(--as-text)] cursor-pointer">
            <input 
              type="radio" 
              name="targetMode" 
              value="manual" 
              checked={targetMode === 'manual'} 
              onChange={() => setTargetMode('manual')} 
              className="accent-[var(--as-accent)]"
            />
            Manual Input
          </label>
          <label className="flex items-center gap-2 text-[12px] text-[var(--as-text)] cursor-pointer">
            <input 
              type="radio" 
              name="targetMode" 
              value="employee" 
              checked={targetMode === 'employee'} 
              onChange={() => setTargetMode('employee')} 
              className="accent-[var(--as-accent)]"
            />
            Existing Employee
          </label>
        </div>

        {/* Target Input */}
        {targetMode === 'employee' ? (
          <div>
            <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
              Target employee *
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required={targetMode === 'employee'}
              disabled={loadingEmployees}
              className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] focus:outline-none focus:border-[var(--as-accent)] disabled:opacity-60"
            >
              <option value="">— Select employee —</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.displayName || [emp.firstName, emp.lastName].filter(Boolean).join(' ') || emp._id}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
              {getTargetLabel()} *
            </label>
            <input
              type={channel === 'email' ? 'email' : 'text'}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              required={targetMode === 'manual'}
              placeholder={channel === 'email' ? "target@example.com" : channel === 'telegram' ? "123456789" : "+1234567890"}
              className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] placeholder-[var(--as-muted)] focus:outline-none focus:border-[var(--as-accent)]"
            />
          </div>
        )}

        {/* Email: template + subject + message */}
        {channel === 'email' && (
          <>
            <div>
              <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
                Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] focus:outline-none focus:border-[var(--as-accent)]"
              >
                {EMAIL_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
                Subject (optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Security Alert – Action Required"
                className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] placeholder-[var(--as-muted)] focus:outline-none focus:border-[var(--as-accent)]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
                Message body (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave empty for default simulation message"
                rows={3}
                className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] placeholder-[var(--as-muted)] focus:outline-none focus:border-[var(--as-accent)] resize-y"
              />
            </div>
          </>
        )}

        {/* SMS / WhatsApp / Telegram: message */}
        {selectedChannelConfig?.needsMessage && channel !== 'email' && (
          <div>
            <label className="block text-[11px] text-[var(--as-muted)] uppercase tracking-wider mb-1.5">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave empty for default simulation message"
              rows={2}
              className="w-full bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] px-3 py-2 text-[13px] text-[var(--as-text)] placeholder-[var(--as-muted)] focus:outline-none focus:border-[var(--as-accent)] resize-y"
            />
          </div>
        )}

        {/* Voice: no extra fields */}
        {channel === 'voice' && (
          <p className="text-[11px] text-[var(--as-muted)]">
            Voice uses server default script. Ensure employee has a phone number.
          </p>
        )}

        <button
          type="submit"
          disabled={sending || (targetMode === 'employee' ? !employeeId : !targetInput)}
          className="btn-primary text-[12px] uppercase tracking-wider py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <span className="w-4 h-4 border-2 border-[#08131b] border-t-transparent rounded-full animate-spin" />
              Sending…
            </>
          ) : (
            <>Send via {selectedChannelConfig?.icon} {selectedChannelConfig?.label}</>
          )}
        </button>
      </form>
    </div>
  );
}
