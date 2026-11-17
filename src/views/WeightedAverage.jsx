"use client";
import React, { useState, useMemo, useEffect } from 'react';
import './SelfEmployed.css';
import CurrencyInput from '../components/CurrencyInput';
import RelatedInsights from '../components/blog/RelatedInsights';

const STORAGE_KEY_ROWS = 'insider_mortgage_wa_rows_v1';
const STORAGE_KEY_HELOC = 'insider_mortgage_wa_heloc_v1';
const STORAGE_KEY_SAVED_SCENARIOS = 'insider_mortgage_wa_saved_scenarios_v1';
const STORAGE_KEY_USER_EMAIL = 'insider_mortgage_wa_user_email_v1';

const SAMPLE_ROWS = [
  { id: 1, description: 'First Mortgage', rate: '6.5', payment: '2500', balance: '400000', payoff: false },
  { id: 2, description: 'Auto Loan', rate: '8.2', payment: '650', balance: '35000', payoff: true },
  { id: 3, description: 'Credit Card', rate: '22.9', payment: '400', balance: '12000', payoff: true }
];

const DEFAULT_HELOC_RATE = '8.5';

export default function WeightedAverage() {
  const [rows, setRows] = useState(SAMPLE_ROWS);
  const [helocRate, setHelocRate] = useState(DEFAULT_HELOC_RATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otherEmails, setOtherEmails] = useState('');
  const [shareWithTeam, setShareWithTeam] = useState(false);
  const [emailNote, setEmailNote] = useState('');
  const [emailHoneypot, setEmailHoneypot] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  // Load saved scenarios, user email, optional shared ?s= URL state, and last entries on mount
  useEffect(() => {
    try {
      const savedEmail = window.localStorage.getItem(STORAGE_KEY_USER_EMAIL);
      if (savedEmail) {
        setUserEmail(savedEmail);
      }
      const savedListRaw = window.localStorage.getItem(STORAGE_KEY_SAVED_SCENARIOS);
      if (savedListRaw) {
        const parsedList = JSON.parse(savedListRaw);
        if (Array.isArray(parsedList)) {
          setSavedScenarios(parsedList);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('s');
      let loadedFromUrl = false;
      if (encoded) {
        try {
          const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
          const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
          const rawStr = window.atob(padded);
          const decodedJson = decodeURIComponent(escape(rawStr));
          const parsedUrl = JSON.parse(decodedJson);
          if (parsedUrl && Array.isArray(parsedUrl.rows) && parsedUrl.rows.length > 0) {
            setRows(parsedUrl.rows);
            if (parsedUrl.helocRate !== undefined) {
              setHelocRate(String(parsedUrl.helocRate));
            }
            if (typeof parsedUrl.name === 'string') {
              setScenarioName(parsedUrl.name);
            }
            loadedFromUrl = true;
          }
        } catch {
          // ignore malformed share URL parameter
        }
      }

      if (!loadedFromUrl) {
        const savedRows = window.localStorage.getItem(STORAGE_KEY_ROWS);
        if (savedRows) {
          const parsed = JSON.parse(savedRows);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRows(parsed);
          }
        }
        const savedHeloc = window.localStorage.getItem(STORAGE_KEY_HELOC);
        if (savedHeloc !== null) {
          setHelocRate(savedHeloc);
        }
      }
    } catch (err) {
      console.warn('Unable to read from localStorage:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save user entries to browser localStorage whenever rows or helocRate change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY_ROWS, JSON.stringify(rows));
      window.localStorage.setItem(STORAGE_KEY_HELOC, helocRate);
    } catch (err) {
      console.warn('Unable to write to localStorage:', err);
    }
  }, [rows, helocRate, isHydrated]);

  const addRow = () => {
    if (rows.length < 10) {
      setRows([...rows, { id: Date.now(), description: '', rate: '', payment: '', balance: '', payoff: false }]);
    }
  };

  const removeRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const clearAllRows = () => {
    setRows([
      { id: Date.now(), description: '', rate: '', payment: '', balance: '', payoff: false },
      { id: Date.now() + 1, description: '', rate: '', payment: '', balance: '', payoff: false },
      { id: Date.now() + 2, description: '', rate: '', payment: '', balance: '', payoff: false }
    ]);
  };

  const resetToSample = () => {
    setRows(SAMPLE_ROWS);
    setHelocRate(DEFAULT_HELOC_RATE);
  };

  const updateRow = (id, field, value) => {
    if (field !== 'description' && field !== 'payoff' && value !== '') {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const totals = useMemo(() => {
    let totalBalance = 0;
    let totalPayment = 0;
    let weightedRateSum = 0;

    let helocBalance = 0;
    let payoffPayment = 0;
    let payoffWeightedRateSum = 0;
    let unchangedPayment = 0;
    let unchangedWeightedRateSum = 0;

    rows.forEach(row => {
      const balance = parseFloat(row.balance) || 0;
      const payment = parseFloat(row.payment) || 0;
      const rate = parseFloat(row.rate) || 0;

      totalBalance += balance;
      totalPayment += payment;
      weightedRateSum += (rate * balance);

      if (row.payoff) {
        helocBalance += balance;
        payoffPayment += payment;
        payoffWeightedRateSum += (rate * balance);
      } else {
        unchangedPayment += payment;
        unchangedWeightedRateSum += (rate * balance);
      }
    });

    const weightedAverageRate = totalBalance > 0 ? (weightedRateSum / totalBalance) : 0;
    const payoffWeightedAverageRate = helocBalance > 0 ? (payoffWeightedRateSum / helocBalance) : 0;

    // HELOC Calculations
    const parsedHelocRate = parseFloat(helocRate) || 0;
    // Assuming Interest-Only payments for the HELOC draw period
    const helocPayment = (helocBalance * (parsedHelocRate / 100)) / 12; 
    
    const newTotalBalance = totalBalance; // Balance shifts but total remains the same
    const newTotalPayment = unchangedPayment + helocPayment;
    const newWeightedRateSum = unchangedWeightedRateSum + (helocBalance * parsedHelocRate);
    const newWeightedAverageRate = newTotalBalance > 0 ? (newWeightedRateSum / newTotalBalance) : 0;

    return { 
      totalBalance, totalPayment, weightedAverageRate,
      payoffPayment, payoffWeightedAverageRate,
      helocBalance, helocPayment, newTotalPayment, newTotalBalance, newWeightedAverageRate
    };
  }, [rows, helocRate]);

  // General Rule: US Dollar format with NO cents
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(val);

  const getEffectiveScenarioName = () => scenarioName.trim() || 'Debt & HELOC Scenario';

  const buildShareUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const payload = {
        name: scenarioName.trim(),
        helocRate,
        rows,
      };
      const utf8Bytes = unescape(encodeURIComponent(JSON.stringify(payload)));
      const b64url = window
        .btoa(utf8Bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const pathname = window.location.pathname.endsWith('/')
        ? window.location.pathname
        : `${window.location.pathname}/`;
      return `${window.location.origin}${pathname}?s=${b64url}`;
    } catch {
      return window.location.href;
    }
  };

  const handleSaveScenario = () => {
    if (typeof window === 'undefined') return;
    let resolvedName = scenarioName.trim();
    if (!resolvedName) {
      let n = 1;
      while (savedScenarios.some((s) => s.name === `Scenario ${n}`)) {
        n += 1;
      }
      resolvedName = `Scenario ${n}`;
      setScenarioName(resolvedName);
    }
    const id = resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `scenario-${Date.now()}`;
    const entry = {
      id,
      name: resolvedName,
      savedAt: new Date().toISOString(),
      rows,
      helocRate,
    };
    const nextList = [entry, ...savedScenarios.filter((s) => s.id !== id)].slice(0, 15);
    setSavedScenarios(nextList);
    setActiveScenarioId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY_SAVED_SCENARIOS, JSON.stringify(nextList));
    } catch (err) {
      console.warn('Unable to save scenario to localStorage:', err);
    }
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2200);
  };

  const handleLoadSavedScenario = (sc) => {
    if (Array.isArray(sc.rows) && sc.rows.length > 0) {
      setRows(sc.rows);
    }
    if (sc.helocRate !== undefined) {
      setHelocRate(String(sc.helocRate));
    }
    setScenarioName(sc.name || '');
    setActiveScenarioId(sc.id);
  };

  const handleDeleteSavedScenario = (id, e) => {
    e.stopPropagation();
    const nextList = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(nextList);
    if (activeScenarioId === id) {
      setActiveScenarioId(null);
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY_SAVED_SCENARIOS, JSON.stringify(nextList));
      } catch (err) {
        console.warn('Unable to update saved scenarios:', err);
      }
    }
  };

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = buildShareUrl();
    try {
      window.history.replaceState({}, '', shareUrl);
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleEmailScenario = () => {
    setEmailStatus(null);
    setIsEmailModalOpen(true);
  };

  useEffect(() => {
    if (!isEmailModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !emailSending) {
        setIsEmailModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEmailModalOpen, emailSending]);

  const handleSendEmailScenario = async (e) => {
    e.preventDefault();
    const trimmedUser = userEmail.trim();
    if (!trimmedUser || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUser)) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const parsedOthers = otherEmails
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const addr of parsedOthers) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
        setEmailStatus({ type: 'error', message: `Invalid email address: ${addr}` });
        return;
      }
    }

    const totalCount = 1 + parsedOthers.length + (shareWithTeam ? 1 : 0);
    if (totalCount > 5) {
      setEmailStatus({ type: 'error', message: 'You can send to up to 5 recipients at a time.' });
      return;
    }

    const shareUrl = buildShareUrl();
    try {
      window.localStorage.setItem(STORAGE_KEY_USER_EMAIL, trimmedUser);
      window.history.replaceState({}, '', shareUrl);
    } catch {
      // ignore storage/history errors
    }

    setEmailSending(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/send-scenario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: trimmedUser,
          otherEmails: parsedOthers,
          shareWithTeam,
          note: emailNote.trim(),
          scenarioName: getEffectiveScenarioName(),
          shareUrl,
          helocRate,
          rows,
          totals,
          website: emailHoneypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Unable to send email right now.');
      }
      setEmailStatus({
        type: 'success',
        message: `✓ Branded HTML report sent to ${[
          trimmedUser,
          ...parsedOthers,
          ...(shareWithTeam ? ['dsrj@insidermtg.com'] : []),
        ].join(', ')}!`,
      });
      setEmailNote('');
    } catch (err) {
      setEmailStatus({
        type: 'error',
        message: err?.message || 'Unable to send email right now. Please try again.',
      });
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Compact Header */}
      <section style={{ padding: '2.25rem 1rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', color: 'white' }}>Weighted Average Calculator</h1>
          <p style={{ fontSize: '1rem', opacity: 0.9, maxWidth: '720px', margin: '0 auto' }}>
            Enter your current debts to calculate your combined weighted average interest rate. Check the boxes to simulate consolidating debts into a HELOC.
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: '1.5rem 1rem 2.5rem' }}>
        <div className="container" style={{ maxWidth: '1120px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
            {/* Top Action Bar: Scenario Name, Save, Email Share, Copy Link, Clear & Reset */}
            <div style={{ padding: '0.85rem 1.5rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 260px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="Scenario name (e.g., Smith Debt Consolidation)"
                    aria-label="Scenario name"
                    style={{
                      flex: '1 1 230px',
                      maxWidth: '310px',
                      padding: '0.42rem 0.7rem',
                      fontSize: '0.84rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: 'white',
                      color: '#0F172A',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveScenario}
                    title="Save this scenario privately on your device"
                    style={{
                      padding: '0.42rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      backgroundColor: saveFeedback ? '#15803D' : '#166534',
                      border: '1px solid #15803D',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    {saveFeedback ? '✓ Saved!' : '💾 Save Scenario'}
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailScenario}
                    title="Share this exact scenario via email link"
                    style={{
                      padding: '0.42rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      backgroundColor: 'white',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    ✉️ Email Scenario
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    title="Copy shareable link to this scenario"
                    style={{
                      padding: '0.42rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: copyFeedback ? '#FFFFFF' : 'var(--primary)',
                      backgroundColor: copyFeedback ? '#0468E9' : 'white',
                      border: copyFeedback ? '1px solid #0468E9' : '1px solid #CBD5E1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    {copyFeedback ? '✓ Link Copied!' : '🔗 Copy Link'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={clearAllRows}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#DC2626',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All / Start Fresh
                  </button>
                  <button
                    type="button"
                    onClick={resetToSample}
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      backgroundColor: 'white',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Reset to Sample Numbers
                  </button>
                </div>
              </div>

              {savedScenarios.length > 0 && (
                <div
                  style={{
                    marginTop: '0.7rem',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.45rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      color: 'var(--primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginRight: '0.2rem',
                    }}
                  >
                    Saved on Device:
                  </span>
                  {savedScenarios.map((sc) => {
                    const isActive = activeScenarioId === sc.id;
                    return (
                      <div
                        key={sc.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleLoadSavedScenario(sc)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLoadSavedScenario(sc);
                          }
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.28rem 0.65rem',
                          borderRadius: '999px',
                          border: isActive ? '1px solid var(--primary)' : '1px solid #CBD5E1',
                          backgroundColor: isActive ? 'var(--primary)' : '#FFFFFF',
                          color: isActive ? '#FFFFFF' : '#0F172A',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <span>{sc.name}</span>
                        <span
                          role="button"
                          tabIndex={0}
                          title={`Delete saved scenario "${sc.name}"`}
                          onClick={(e) => handleDeleteSavedScenario(sc.id, e)}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            opacity: 0.75,
                            padding: '0 2px',
                          }}
                        >
                          ✕
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
                🔒 Your entries and saved scenarios stay privately in your browser on this device.
              </div>
            </div>

            {/* Compact Debt Input Table */}
            <div style={{ padding: '0.85rem 1.5rem 1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
                    <th style={{ padding: '0.5rem 0.6rem', textAlign: 'center', color: 'var(--primary)', fontWeight: '600', width: '85px', fontSize: '0.82rem', lineHeight: '1.15' }}>Payoff w/<br/>HELOC</th>
                    <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>Description</th>
                    <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '15%', fontSize: '0.9rem' }}>Rate (%)</th>
                    <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '20%', fontSize: '0.9rem' }}>Monthly Payment ($)</th>
                    <th style={{ padding: '0.5rem 0.6rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '20%', fontSize: '0.9rem' }}>Balance ($)</th>
                    <th style={{ padding: '0.5rem', width: '42px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: row.payoff ? 'rgba(239, 68, 68, 0.035)' : 'transparent' }}>
                      <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={row.payoff}
                          onChange={(e) => updateRow(row.id, 'payoff', e.target.checked)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)', verticalAlign: 'middle' }}
                        />
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>
                        <input 
                          type="text" 
                          value={row.description} 
                          onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                          placeholder={`Debt ${index + 1}`}
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>
                        <input 
                          type="text" 
                          value={row.rate} 
                          onChange={(e) => updateRow(row.id, 'rate', e.target.value)}
                          placeholder="0.00"
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>
                        <CurrencyInput 
                          value={row.payment} 
                          onChange={(val) => updateRow(row.id, 'payment', val)}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>
                        <CurrencyInput 
                          value={row.balance} 
                          onChange={(val) => updateRow(row.id, 'balance', val)}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.95rem' }}
                        />
                      </td>
                      <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => removeRow(row.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.25rem' }}
                          title="Remove Row"
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'20px', height:'20px'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {rows.length < 10 && (
                <button 
                  onClick={addRow}
                  style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'18px', height:'18px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Debt
                </button>
              )}
            </div>

            {/* Tighter Results Dashboard: All 3 Sections Visible Together */}
            <div style={{ borderTop: '2px solid rgba(0,0,0,0.08)', backgroundColor: '#F8FAFC', padding: '1rem 1.5rem 1.25rem' }}>
              
              {/* Row 1: Current Debt Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '0.65rem' }} className="wa-summary-row">
                <div>
                  <h2 style={{ color: 'var(--primary)', fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>Current Debt Summary</h2>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>All entered debts combined</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }} className="wa-metrics-grid">
                  <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Total Monthly Payment</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totals.totalPayment)}</span>
                  </div>

                  <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Weighted Avg Rate</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totals.weightedAverageRate.toFixed(3)}%</span>
                  </div>

                  <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #6366F1', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Total Balance</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totals.totalBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Debt Being Paid Off */}
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.14)', borderRadius: '10px', marginBottom: '0.65rem' }} className="wa-summary-row">
                <div>
                  <h2 style={{ color: 'var(--primary)', fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>Debt Being Paid Off</h2>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Checked debts selected above</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }} className="wa-metrics-grid">
                  <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #10B981', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Total Monthly Payment</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totals.payoffPayment)}</span>
                  </div>

                  <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Weighted Avg Rate</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totals.payoffWeightedAverageRate.toFixed(3)}%</span>
                  </div>

                  <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #6366F1', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Total Balance</span>
                    <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totals.helocBalance)}</span>
                  </div>
                </div>
              </div>

              {/* Row 3: HELOC Consolidation Scenario */}
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: 'rgba(30, 58, 138, 0.06)', border: '1px solid rgba(30, 58, 138, 0.15)', borderRadius: '10px' }} className="wa-summary-row">
                <div>
                  <h2 style={{ color: 'var(--primary)', fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>HELOC Consolidation</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.4rem' }}>
                    <label style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.82rem' }}>New HELOC Rate (%):</label>
                    <input 
                      type="text" 
                      value={helocRate} 
                      onChange={(e) => {
                        if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setHelocRate(e.target.value);
                      }}
                      style={{ width: '64px', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 'bold', textAlign: 'center', backgroundColor: 'white' }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }} className="wa-metrics-grid">
                    <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #10B981', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>New Total Payment</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totals.newTotalPayment)}</span>
                      {totals.newTotalPayment < totals.totalPayment && (
                        <div style={{ position: 'absolute', top: '-9px', right: '8px', backgroundColor: '#10B981', color: 'white', padding: '2px 7px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}>
                          Save {formatCurrency(totals.totalPayment - totals.newTotalPayment)}/mo
                        </div>
                      )}
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #F59E0B', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>New Weighted Rate</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totals.newWeightedAverageRate.toFixed(3)}%</span>
                      {totals.newWeightedAverageRate < totals.weightedAverageRate && (
                        <div style={{ position: 'absolute', top: '-9px', right: '8px', backgroundColor: '#F59E0B', color: 'white', padding: '2px 7px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}>
                          Drop of {(totals.weightedAverageRate - totals.newWeightedAverageRate).toFixed(2)}%
                        </div>
                      )}
                    </div>

                    <div style={{ backgroundColor: 'white', padding: '0.65rem 0.85rem', borderRadius: '8px', borderLeft: '4px solid #6366F1', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>Total Balance</span>
                      <span style={{ fontSize: '1.45rem', fontWeight: 'bold', color: 'var(--primary)' }}>{formatCurrency(totals.newTotalBalance)}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    * HELOC balance of <strong>{formatCurrency(totals.helocBalance)}</strong> with an interest-only monthly payment of <strong>{formatCurrency(totals.helocPayment)}</strong>.
                  </div>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </section>

      <RelatedInsights
        calculatorId="calc-weighted-avg"
        title="How We Use Blended Debt & HELOC Math in Real Scenarios"
        subtitle="Articles and video walkthroughs that pair with the Weighted Average Calculator."
        background="#FFFFFF"
      />

      {isEmailModalOpen && (
        <div
          onClick={() => !emailSending && setIsEmailModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(6, 10, 45, 0.68)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wa-email-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              border: '2px solid #060A2D',
              boxShadow: '0 25px 50px -12px rgba(6, 10, 45, 0.45)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#060A2D',
                color: '#FFFFFF',
                padding: '1rem 1.25rem',
                borderBottom: '3px solid #EFB51E',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EFB51E', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ✉️ Branded HTML Report
                </div>
                <h3 id="wa-email-modal-title" style={{ margin: '0.15rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Email Scenario: {getEffectiveScenarioName()}
                </h3>
              </div>
              <button
                type="button"
                disabled={emailSending}
                onClick={() => setIsEmailModalOpen(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: '999px',
                  padding: '0.3rem 0.7rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSendEmailScenario} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={emailHoneypot}
                onChange={(e) => setEmailHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
                aria-hidden="true"
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#060A2D', marginBottom: '0.3rem' }}>
                  1. Your Email Address <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#060A2D', marginBottom: '0.3rem' }}>
                  2. Share with Others <span style={{ color: '#64748B', fontWeight: 500 }}>(Optional, comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={otherEmails}
                  onChange={(e) => setOtherEmails(e.target.value)}
                  placeholder="spouse@example.com, advisor@example.com"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: shareWithTeam ? '#FFFBEB' : '#F8FAFC',
                  border: shareWithTeam ? '1px solid #EFB51E' : '1px solid #E2E8F0',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  color: '#0F172A',
                }}
              >
                <input
                  type="checkbox"
                  checked={shareWithTeam}
                  onChange={(e) => setShareWithTeam(e.target.checked)}
                  style={{ marginTop: '2px', width: '17px', height: '17px', accentColor: '#060A2D', cursor: 'pointer' }}
                />
                <span>
                  <strong>Share with David &amp; Rakesh</strong> (<code style={{ fontSize: '0.8rem' }}>dsrj@insidermtg.com</code>)
                  <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                    Send a copy to Insider Mortgage for a custom HELOC review or rate quote.
                  </span>
                </span>
              </label>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#060A2D', marginBottom: '0.3rem' }}>
                  Optional Note
                </label>
                <textarea
                  rows={2}
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  placeholder="Add a short message to include at the top of the email..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {emailStatus && (
                <div
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    backgroundColor: emailStatus.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                    border: emailStatus.type === 'success' ? '1px solid #86EFAC' : '1px solid #FECACA',
                    color: emailStatus.type === 'success' ? '#166534' : '#B91C1C',
                  }}
                >
                  {emailStatus.message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  disabled={emailSending}
                  onClick={() => setIsEmailModalOpen(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {emailStatus?.type === 'success' ? 'Done' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={emailSending}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: emailSending ? '#64748B' : '#060A2D',
                    color: '#EFB51E',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: emailSending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {emailSending ? 'Sending...' : '✉️ Send HTML Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 900px) {
          .wa-summary-row {
            grid-template-columns: 1fr !important;
            gap: 0.6rem !important;
          }
        }
        @media (max-width: 640px) {
          .wa-metrics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </main>
  );
}
