import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

const ARCHETYPES = [
  { id: 'ALL', label: 'All' },
  { id: 'rushed_responder',    label: 'Rushed Responder' },
  { id: 'trusting_delegator',  label: 'Trusting Delegator' },
  { id: 'distracted_clicker',  label: 'Distracted Clicker' },
  { id: 'skeptical_verifier',  label: 'Skeptical Verifier' },
];

const ARCHETYPE_STYLES = {
  rushed_responder:   { bg: 'rgba(255,122,89,0.15)',  color: '#ff7a59' },
  trusting_delegator: { bg: 'rgba(168,85,247,0.15)',  color: '#a855f7' },
  distracted_clicker: { bg: 'rgba(234,179,8,0.15)',   color: '#eab308' },
  skeptical_verifier: { bg: 'rgba(61,214,198,0.15)',  color: '#3dd6c6' },
};

const DEPARTMENTS = ['ALL', 'Finance', 'Sales', 'Marketing', 'Engineering', 'HR', 'Legal'];

const MOCK_EMPLOYEES = [
  { id: 'e1', name: 'Alice Zhang',  role: 'Senior Accountant', dept: 'Finance',     archetype: 'distracted_clicker', score: 34, passed: 1, failed: 3, compromised: true  },
  { id: 'e2', name: 'Bob Lee',      role: 'Account Executive', dept: 'Sales',       archetype: 'rushed_responder',   score: 52, passed: 3, failed: 2, compromised: false },
  { id: 'e3', name: 'Carol Kim',    role: 'Campaign Manager',  dept: 'Marketing',   archetype: 'skeptical_verifier', score: 88, passed: 5, failed: 0, compromised: false },
  { id: 'e4', name: 'Dave Wu',      role: 'CFO',               dept: 'Finance',     archetype: 'trusting_delegator', score: 41, passed: 2, failed: 2, compromised: true  },
  { id: 'e5', name: 'Eve Park',     role: 'Recruiter',         dept: 'HR',          archetype: 'rushed_responder',   score: 29, passed: 0, failed: 4, compromised: false },
  { id: 'e6', name: 'Frank Ross',   role: 'Staff Engineer',    dept: 'Engineering', archetype: 'skeptical_verifier', score: 91, passed: 6, failed: 0, compromised: false },
  { id: 'e7', name: 'Grace Liu',    role: 'Sales Director',    dept: 'Sales',       archetype: 'trusting_delegator', score: 63, passed: 3, failed: 1, compromised: false },
  { id: 'e8', name: 'Henry Brown',  role: 'Legal Counsel',     dept: 'Legal',       archetype: 'skeptical_verifier', score: 77, passed: 4, failed: 0, compromised: false },
];

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', role: '', department: '', managerEmail: '' };
const PAGE_SIZE = 6;

const scoreColor = s => s < 40 ? '#ff4444' : s < 70 ? '#ff7a59' : '#3dd6c6';

export default function EmployeeList() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';

  const [dept, setDept] = useState('ALL');
  const [archetype, setArchetype] = useState('ALL');
  const [search, setSearch] = useState('');
  const [compromisedOnly, setCompromisedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  const filtered = MOCK_EMPLOYEES.filter(e => {
    if (dept !== 'ALL' && e.dept !== dept) return false;
    if (archetype !== 'ALL' && e.archetype !== archetype) return false;
    if (compromisedOnly && !e.compromised) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.role.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!form.email.endsWith('@acmecorp.com')) errs.email = 'Must be @acmecorp.com';
    if (!form.role.trim()) errs.role = 'Required';
    if (!form.department.trim()) errs.department = 'Required';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    // Mock success
    setShowSlideOver(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const inputCls = (err) => `w-full bg-[rgba(7,20,31,0.8)] border ${err ? 'border-[#ff4444]' : 'border-[rgba(61,214,198,0.24)]'} text-[var(--as-text)] placeholder-[var(--as-muted)] px-3 py-2.5 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none transition-colors text-[13px] font-['Chakra_Petch']`;
  const selectCls = `w-full bg-[rgba(7,20,31,0.8)] border border-[rgba(61,214,198,0.24)] text-[var(--as-text)] px-3 py-2.5 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none text-[13px] font-['Chakra_Petch']`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 animate-slideInLeft">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--as-accent2)] uppercase tracking-wider">Employee Intelligence</h1>
          <p className="text-[var(--as-muted)] text-[12px] mt-0.5">{MOCK_EMPLOYEES.length} employees · {MOCK_EMPLOYEES.filter(e=>e.compromised).length} compromised</p>
        </div>
        {isAdmin && (
          <div className="flex gap-3">
            <button onClick={() => setShowCSVModal(true)} className="btn-ghost text-[12px]">BULK IMPORT CSV</button>
            <button onClick={() => setShowSlideOver(true)} className="btn-primary text-[12px]">+ ADD EMPLOYEE</button>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="card p-4 flex flex-wrap gap-4 items-center animate-fadeUp">
        {/* Department */}
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1); }} className={selectCls + ' w-[150px]'}>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'ALL' ? 'All Depts' : d}</option>)}
        </select>

        {/* Archetype tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {ARCHETYPES.map(a => (
            <button key={a.id} onClick={() => { setArchetype(a.id); setPage(1); }}
              className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all font-['Chakra_Petch'] ${archetype === a.id ? 'bg-[var(--as-accent)] text-[#08131b] border-[var(--as-accent)]' : 'text-[var(--as-muted)] border-[rgba(61,214,198,0.24)] hover:border-[var(--as-accent2)]'}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--as-muted)]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by name or role..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[rgba(7,20,31,0.8)] border border-[rgba(61,214,198,0.24)] text-[var(--as-text)] placeholder-[var(--as-muted)] pl-9 pr-3 py-2.5 rounded-[4px] focus:border-[var(--as-accent2)] focus:outline-none text-[13px] font-['Chakra_Petch']" />
        </div>

        {/* Compromised toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative w-10 h-5" onClick={() => setCompromisedOnly(p => !p)}>
            <div className={`w-10 h-5 rounded-full transition-colors ${compromisedOnly ? 'bg-[var(--as-accent2)]' : 'bg-[rgba(61,214,198,0.2)]'}`} />
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${compromisedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-[11px] text-[var(--as-muted)] uppercase tracking-wider">Compromised Only</span>
        </label>
      </div>

      {/* TABLE */}
      <div className="card overflow-x-auto animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[rgba(61,214,198,0.2)]">
              {['', 'Name / Role', 'Department', 'Archetype', 'Score', 'Scenarios', 'Status', 'Actions'].map(h => (
                <th key={h} className="pb-3 px-3 text-left text-[10px] text-[var(--as-muted)] uppercase tracking-[0.1em] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((emp, i) => {
              const at = ARCHETYPE_STYLES[emp.archetype] || { bg: 'rgba(61,214,198,0.1)', color: '#3dd6c6' };
              const initials = emp.name.split(' ').map(n => n[0]).join('');
              return (
                <tr key={emp.id} className="border-b border-[rgba(61,214,198,0.08)] hover:bg-[rgba(61,214,198,0.03)] transition-colors animate-fadeUp" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="py-3.5 px-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold font-['Chakra_Petch']"
                      style={{ background: at.bg, color: at.color }}>{initials}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-[13px] font-bold text-[var(--as-text)]">{emp.name}</div>
                    <div className="text-[11px] text-[var(--as-muted)]">{emp.role}</div>
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-[var(--as-text)]">{emp.dept}</td>
                  <td className="py-3.5 px-3">
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                      style={{ background: at.bg, color: at.color }}>
                      {emp.archetype.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-[16px] font-bold font-['Chakra_Petch']" style={{ color: scoreColor(emp.score) }}>{emp.score}</span>
                  </td>
                  <td className="py-3.5 px-3 text-[12px] text-[var(--as-muted)]">
                    <span className="text-[var(--as-accent2)]">{emp.passed} passed</span> / <span className="text-[#ff4444]">{emp.failed} failed</span>
                  </td>
                  <td className="py-3.5 px-3">
                    {emp.compromised ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff4444] animate-pulse" />
                        <span className="text-[10px] font-bold text-[#ff4444] uppercase">Compromised</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--as-accent2)] uppercase">Safe</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <button onClick={() => navigate(`/org/employees/${emp.id}`)}
                      className="text-[11px] text-[var(--as-accent2)] uppercase tracking-wider hover:underline">
                      VIEW PROFILE →
                    </button>
                  </td>
                </tr>
              );
            })}
            {paged.length === 0 && (
              <tr><td colSpan={8} className="py-12 text-center text-[var(--as-muted)] text-[13px]">No employees match the current filters.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center text-[11px] font-bold rounded border transition-colors ${p === page ? 'bg-[var(--as-accent)] text-[#08131b] border-[var(--as-accent)]' : 'text-[var(--as-muted)] border-[var(--as-line)] hover:border-[var(--as-accent2)]'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SLIDE-OVER: Add Employee */}
      {showSlideOver && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40" onClick={() => setShowSlideOver(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0d2230] border-l border-[rgba(61,214,198,0.2)] z-50 flex flex-col shadow-2xl"
            style={{ animation: 'slideInRight 0.3s ease both' }}>
            <div className="flex items-center justify-between p-5 border-b border-[rgba(61,214,198,0.15)]">
              <h3 className="text-[16px] font-bold text-[var(--as-accent2)] uppercase tracking-wider">Add Employee</h3>
              <button onClick={() => setShowSlideOver(false)} className="text-[var(--as-muted)] hover:text-[var(--as-text)] text-[20px]">×</button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
              {[
                { key: 'firstName', label: 'First Name', type: 'text' },
                { key: 'lastName',  label: 'Last Name',  type: 'text' },
                { key: 'email',     label: 'Email',      type: 'email' },
                { key: 'phone',     label: 'Phone',      type: 'tel' },
                { key: 'role',      label: 'Role',       type: 'text' },
                { key: 'managerEmail', label: 'Manager Email (optional)', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider block mb-1">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className={inputCls(formErrors[f.key])} />
                  {formErrors[f.key] && <div className="text-[#ff4444] text-[10px] mt-0.5">{formErrors[f.key]}</div>}
                </div>
              ))}
              <div>
                <label className="text-[10px] text-[var(--as-muted)] uppercase tracking-wider block mb-1">Department</label>
                <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className={selectCls}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.filter(d => d !== 'ALL').map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {formErrors.department && <div className="text-[#ff4444] text-[10px] mt-0.5">{formErrors.department}</div>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSlideOver(false)} className="btn-ghost flex-1 py-2.5">CANCEL</button>
                <button type="submit" className="btn-primary flex-1 py-2.5">ADD EMPLOYEE</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* CSV MODAL */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] z-50 flex items-center justify-center">
          <div className="card max-w-[520px] w-full animate-fadeUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-[var(--as-accent2)] uppercase tracking-wider">Bulk Import Employees</h3>
              <button onClick={() => { setShowCSVModal(false); setCsvResult(null); }} className="text-[var(--as-muted)] hover:text-[var(--as-text)] text-[20px]">×</button>
            </div>

            <div
              className="border-[1.5px] border-dashed rounded-[8px] p-10 flex flex-col items-center justify-center cursor-pointer transition-all mb-4"
              style={{ borderColor: dragOver ? '#3dd6c6' : 'rgba(61,214,198,0.4)', background: dragOver ? 'rgba(61,214,198,0.06)' : 'transparent' }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); setCsvResult({ created: 42, skipped: 3, invalid: 1, rows: [{ row: 14, reason: 'Invalid email format' }] }); }}
              onClick={() => document.getElementById('csv-upload').click()}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3dd6c6" strokeWidth="1.5" className="mb-3">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-[13px] text-[var(--as-muted)]">{dragOver ? 'Drop CSV here' : 'Drag CSV file here or click to browse'}</p>
              <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={() => setCsvResult({ created: 42, skipped: 3, invalid: 1, rows: [{ row: 14, reason: 'Invalid email format' }] })} />
            </div>

            <div className="text-[11px] text-[var(--as-muted)] mb-2">
              Required columns: <span className="text-[var(--as-accent2)] font-mono">firstName, lastName, email, phone, role, department</span>
              <span className="opacity-60"> (manager_email optional)</span>
            </div>
            <button className="text-[11px] text-[var(--as-accent2)] hover:underline mb-4">Download CSV Template</button>

            {csvResult && (
              <div className="bg-[rgba(7,20,31,0.6)] border border-[var(--as-line)] rounded-[4px] p-4 mb-4 flex flex-col gap-2">
                <div className="flex gap-4 text-[13px]">
                  <span className="text-[#3dd6c6] font-bold">Created: {csvResult.created} ✓</span>
                  <span className="text-[#ff7a59]">Skipped: {csvResult.skipped}</span>
                  <span className="text-[#ff4444]">Invalid: {csvResult.invalid}</span>
                </div>
                {csvResult.invalid > 0 && (
                  <div className="max-h-[120px] overflow-y-auto text-[11px] text-[var(--as-muted)] flex flex-col gap-1 mt-1">
                    {csvResult.rows.map((r, i) => (
                      <div key={i} className="flex gap-3"><span className="text-[var(--as-accent)]">Row {r.row}</span><span>{r.reason}</span></div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="btn-primary w-full" onClick={() => document.getElementById('csv-upload').click()}>UPLOAD CSV FILE</button>
          </div>
        </div>
      )}
    </div>
  );
}
