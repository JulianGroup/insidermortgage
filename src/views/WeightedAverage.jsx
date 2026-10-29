"use client";
import React, { useState, useMemo, useEffect } from 'react';
import './SelfEmployed.css';
import CurrencyInput from '../components/CurrencyInput';

const STORAGE_KEY_ROWS = 'insider_mortgage_wa_rows_v1';
const STORAGE_KEY_HELOC = 'insider_mortgage_wa_heloc_v1';

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

  // Load saved user entries from browser localStorage on mount
  useEffect(() => {
    try {
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
            {/* Top Action Bar for Clear All & Reset to Sample */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '0.85rem 1.5rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                🔒 Your entries are saved privately in your browser on this device.
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
