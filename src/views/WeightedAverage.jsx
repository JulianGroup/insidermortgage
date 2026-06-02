"use client";
import React, { useState, useMemo } from 'react';
import './SelfEmployed.css';

export default function WeightedAverage() {
  const [rows, setRows] = useState([
    { id: 1, description: 'First Mortgage', rate: '6.5', payment: '2500', balance: '400000' },
    { id: 2, description: 'Auto Loan', rate: '8.2', payment: '650', balance: '35000' },
    { id: 3, description: 'Credit Card', rate: '22.9', payment: '400', balance: '12000' }
  ]);

  const addRow = () => {
    if (rows.length < 10) {
      setRows([...rows, { id: Date.now(), description: '', rate: '', payment: '', balance: '' }]);
    }
  };

  const removeRow = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id, field, value) => {
    if (field !== 'description' && value !== '') {
      if (!/^\d*\.?\d*$/.test(value)) return;
    }
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const totals = useMemo(() => {
    let totalBalance = 0;
    let totalPayment = 0;
    let weightedRateSum = 0;

    rows.forEach(row => {
      const balance = parseFloat(row.balance) || 0;
      const payment = parseFloat(row.payment) || 0;
      const rate = parseFloat(row.rate) || 0;

      totalBalance += balance;
      totalPayment += payment;
      weightedRateSum += (rate * balance);
    });

    const weightedAverageRate = totalBalance > 0 ? (weightedRateSum / totalBalance) : 0;

    return { totalBalance, totalPayment, weightedAverageRate };
  }, [rows]);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      <section style={{ padding: '6rem 1rem 3rem', textAlign: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Weighted Average Calculator</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Enter your current debts to calculate your total monthly payment and combined weighted average interest rate.
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
            <div style={{ padding: '2rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600' }}>Description</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '15%' }}>Interest Rate (%)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '20%' }}>Monthly Payment ($)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--primary)', fontWeight: '600', width: '25%' }}>Balance ($)</th>
                    <th style={{ padding: '1rem', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
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
                        <input 
                          type="text" 
                          value={row.payment} 
                          onChange={(e) => updateRow(row.id, 'payment', e.target.value)}
                          placeholder="0.00"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }}
                        />
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <input 
                          type="text" 
                          value={row.balance} 
                          onChange={(e) => updateRow(row.id, 'balance', e.target.value)}
                          placeholder="0.00"
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

            {/* Results Section */}
            <div style={{ backgroundColor: 'rgba(30, 58, 138, 0.03)', padding: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Your Debt Summary</h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
                <div style={{ flex: '1', minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', textAlign: 'center', borderBottom: '4px solid #10B981' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Total Monthly Payment</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(totals.totalPayment)}
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', textAlign: 'center', borderBottom: '4px solid var(--accent)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Weighted Average Rate</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {totals.weightedAverageRate.toFixed(3)}%
                  </div>
                </div>

                <div style={{ flex: '1', minWidth: '200px', backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', textAlign: 'center', borderBottom: '4px solid #6366F1' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Total Balance</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(totals.totalBalance)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </main>
  );
}
