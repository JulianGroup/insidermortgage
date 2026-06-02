"use client";
import React, { useState, useMemo } from 'react';
import './SelfEmployed.css';
import CurrencyInput from '../components/CurrencyInput';

export default function WeightedAverage() {
  const [rows, setRows] = useState([
    { id: 1, description: 'First Mortgage', rate: '6.5', payment: '2500', balance: '400000', payoff: false },
    { id: 2, description: 'Auto Loan', rate: '8.2', payment: '650', balance: '35000', payoff: true },
    { id: 3, description: 'Credit Card', rate: '22.9', payment: '400', balance: '12000', payoff: true }
  ]);
  const [helocRate, setHelocRate] = useState('8.5');

  const addRow = () => {
    if (rows.length < 10) {
      setRows([...rows, { id: Date.now(), description: '', rate: '', payment: '', balance: '', payoff: false }]);
    }
  };

  const removeRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
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
      } else {
        unchangedPayment += payment;
        unchangedWeightedRateSum += (rate * balance);
      }
    });

    const weightedAverageRate = totalBalance > 0 ? (weightedRateSum / totalBalance) : 0;

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
      <section style={{ padding: '6rem 1rem 3rem', textAlign: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Weighted Average Calculator</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Enter your current debts to calculate your combined weighted average interest rate. Check the boxes to simulate consolidating debts into a HELOC.
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)', fontWeight: '600', width: '90px', fontSize: '0.9rem' }}>Payoff w/<br/>HELOC</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600' }}>Description</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '15%' }}>Rate (%)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '20%' }}>Monthly Payment ($)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '20%' }}>Balance ($)</th>
                    <th style={{ padding: '1rem', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: row.payoff ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={row.payoff}
                          onChange={(e) => updateRow(row.id, 'payoff', e.target.checked)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="text" 
                          value={row.description} 
                          onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                          placeholder={`Debt ${index + 1}`}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="text" 
                          value={row.rate} 
                          onChange={(e) => updateRow(row.id, 'rate', e.target.value)}
                          placeholder="0.00"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <CurrencyInput 
                          value={row.payment} 
                          onChange={(val) => updateRow(row.id, 'payment', val)}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <CurrencyInput 
                          value={row.balance} 
                          onChange={(val) => updateRow(row.id, 'balance', val)}
                          placeholder="0"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => removeRow(row.id)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.5rem' }}
                          title="Remove Row"
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'24px', height:'24px'}}>
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
                  style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'20px', height:'20px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Debt
                </button>
              )}
            </div>

            {/* Current Results Section */}
            <div style={{ backgroundColor: 'white', padding: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Current Debt Summary</h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                <div style={{ flex: '1', minWidth: '180px', backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderBottom: '4px solid #10B981', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Total Monthly Payment</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(totals.totalPayment)}
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '180px', backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderBottom: '4px solid #F59E0B', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Weighted Average Rate</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {totals.weightedAverageRate.toFixed(3)}%
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '180px', backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderBottom: '4px solid #6366F1', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Total Balance</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(totals.totalBalance)}
                  </div>
                </div>
              </div>
            </div>

            {/* HELOC Simulation Section */}
            <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.05)', padding: '2.5rem', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>HELOC Consolidation Scenario</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Simulating the payoff of checked debts using a Home Equity Line of Credit (Interest-Only Payment).
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                  <label style={{ fontWeight: '600', color: 'var(--primary)' }}>New HELOC Rate (%):</label>
                  <input 
                    type="text" 
                    value={helocRate} 
                    onChange={(e) => {
                      if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setHelocRate(e.target.value);
                    }}
                    style={{ width: '80px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1.1rem', textAlign: 'center' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                <div style={{ flex: '1', minWidth: '180px', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderBottom: '4px solid #10B981', textAlign: 'center', position: 'relative' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>New Total Payment</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(totals.newTotalPayment)}
                  </div>
                  {totals.newTotalPayment < totals.totalPayment && (
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#10B981', color: 'white', padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}>
                      Save {formatCurrency(totals.totalPayment - totals.newTotalPayment)}/mo
                    </div>
                  )}
                </div>

                <div style={{ flex: '1', minWidth: '180px', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderBottom: '4px solid #F59E0B', textAlign: 'center', position: 'relative' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>New Weighted Avg Rate</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {totals.newWeightedAverageRate.toFixed(3)}%
                  </div>
                  {totals.newWeightedAverageRate < totals.weightedAverageRate && (
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: '#F59E0B', color: 'white', padding: '4px 8px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: 'var(--shadow-sm)' }}>
                      Drop of {(totals.weightedAverageRate - totals.newWeightedAverageRate).toFixed(2)}%
                    </div>
                  )}
                </div>

                <div style={{ flex: '1', minWidth: '180px', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderBottom: '4px solid #6366F1', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Total Balance</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(totals.newTotalBalance)}
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                * HELOC requires a balance of {formatCurrency(totals.helocBalance)} with an interest-only monthly payment of {formatCurrency(totals.helocPayment)}.
              </div>

            </div>
          </div>
          
        </div>
      </section>
    </main>
  );
}
