"use client";
import React, { useState, useMemo } from 'react';
import loanLimitsData from '../data/loanLimits2026.json';

export default function LoanLimitTool() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');

  const states = useMemo(() => Object.keys(loanLimitsData).sort(), []);
  
  const counties = useMemo(() => {
    if (!selectedState || !loanLimitsData[selectedState]) return [];
    return Object.keys(loanLimitsData[selectedState]).sort();
  }, [selectedState]);

  const limits = useMemo(() => {
    if (!selectedState || !selectedCounty || !loanLimitsData[selectedState][selectedCounty]) return null;
    return loanLimitsData[selectedState][selectedCounty];
  }, [selectedState, selectedCounty]);

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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>2026 Loan Limit Look-Up</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Instantly check the 2026 maximum conforming and high-balance loan limits by state and county.
          </p>
        </div>
      </section>

      <section style={{ padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          
          <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Select Location</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ flex: '1', minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>State / Territory</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCounty(''); // Reset county when state changes
                  }}
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '1.1rem', backgroundColor: 'white' }}
                >
                  <option value="">-- Choose a State --</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1', minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>County Name</label>
                <select 
                  value={selectedCounty} 
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  disabled={!selectedState}
                  style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '1.1rem', backgroundColor: selectedState ? 'white' : '#f9fafb', opacity: selectedState ? 1 : 0.6 }}
                >
                  <option value="">{selectedState ? "-- Choose a County --" : "Select a State first"}</option>
                  {counties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {limits && (
            <div>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Maximum Loan Limits for {selectedCounty}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #10B981' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>1-Unit Property</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit1)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #F59E0B' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>2-Unit Property</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit2)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #3B82F6' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>3-Unit Property</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit3)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #8B5CF6' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: '600' }}>4-Unit Property</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit4)}
                  </div>
                </div>

              </div>
              
              <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                * Limits exceeding the baseline indicate high-cost area limits. Loans subject to high-cost area limits must comply with high-balance loan requirements.
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
