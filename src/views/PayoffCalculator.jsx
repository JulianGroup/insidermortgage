"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PayoffCalculator() {
  const [balance, setBalance] = useState(500000);
  const [currentRate, setCurrentRate] = useState(6.5);
  const [currentPmt, setCurrentPmt] = useState(3160);
  
  const [newRate, setNewRate] = useState(6.5);
  const [newPmt, setNewPmt] = useState(4000);

  const [results, setResults] = useState(null);

  const calculateNPER = (ratePerPeriod, pmt, pv) => {
    if (ratePerPeriod === 0) return pv / pmt;
    if (pmt <= ratePerPeriod * pv) return Infinity; 
    return -Math.log(1 - (ratePerPeriod * pv) / pmt) / Math.log(1 + ratePerPeriod);
  };

  useEffect(() => {
    // Current Scenario
    const currentRateMonthly = (parseFloat(currentRate) || 0) / 100 / 12;
    const currentNper = calculateNPER(currentRateMonthly, parseFloat(currentPmt) || 0, parseFloat(balance) || 0);

    // New Scenario
    const newRateMonthly = (parseFloat(newRate) || 0) / 100 / 12;
    const newNper = calculateNPER(newRateMonthly, parseFloat(newPmt) || 0, parseFloat(balance) || 0);

    if (isFinite(currentNper) && isFinite(newNper) && currentNper > 0 && newNper > 0) {
      const monthsSaved = Math.max(0, currentNper - newNper);
      setResults({
        currentMonths: Math.ceil(currentNper),
        newMonths: Math.ceil(newNper),
        monthsSaved: Math.floor(monthsSaved),
        yearsSaved: (monthsSaved / 12).toFixed(1)
      });
    } else {
      setResults(null);
    }
  }, [balance, currentRate, currentPmt, newRate, newPmt]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingBottom: '4rem' }}>
      <header style={{ padding: '1.5rem', backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Insider Mortgage
        </Link>
      </header>

      <section style={{ padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/geek-out" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}>
              ← Back to Geek Out Hub
            </Link>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>Refinance & Pre-Payment Calculator</h1>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              See how much time you can save by refinancing to a higher payment or simply making extra principal payments each month.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Current Scenario */}
              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(30, 58, 138, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>Current Mortgage</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Current Balance ($)</label>
                  <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Current Interest Rate (%)</label>
                  <input type="number" step="0.125" value={currentRate} onChange={(e) => setCurrentRate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Current P&I Payment ($)</label>
                  <input type="number" value={currentPmt} onChange={(e) => setCurrentPmt(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} />
                  <small style={{ color: 'var(--text-muted)' }}>*Principal and Interest only, exclude taxes/insurance</small>
                </div>
              </div>

              {/* New Scenario */}
              <div style={{ padding: '1.5rem', backgroundColor: 'rgba(239, 181, 30, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 181, 30, 0.2)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>New Trajectory</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New Interest Rate (%)</label>
                  <input type="number" step="0.125" value={newRate} onChange={(e) => setNewRate(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} />
                  <small style={{ color: 'var(--text-muted)' }}>*Keep same as current to model extra principal only</small>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New P&I Payment ($)</label>
                  <input type="number" value={newPmt} onChange={(e) => setNewPmt(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }} />
                  <small style={{ color: 'var(--text-muted)' }}>*Must be greater than current P&I payment</small>
                </div>
              </div>

            </div>
          </div>

          {/* Results Area */}
          {results && results.monthsSaved > 0 && parseFloat(newPmt) > parseFloat(currentPmt) ? (
            <div className="animate-fade-in" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>By increasing your payment to {formatCurrency(newPmt)}...</div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--accent)' }}>
                You will pay off your mortgage<br/>{results.monthsSaved} months faster!
              </h2>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', minWidth: '200px' }}>
                  <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Current Time Left</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{results.currentMonths} mo</div>
                </div>
                
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', minWidth: '200px' }}>
                  <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>New Time Left</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>{results.newMonths} mo</div>
                </div>
              </div>
              
              <p style={{ marginTop: '2rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
                That's approximately <strong>{results.yearsSaved} years</strong> shaved off your mortgage!
              </p>
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '2px dashed #ddd', color: 'var(--text-muted)' }}>
              Enter a new payment greater than your current payment to see your savings.
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
