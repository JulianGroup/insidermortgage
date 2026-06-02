"use client";
import React, { useState, useMemo } from 'react';
import loanLimitsData from '../data/loanLimits2026.json';

const BASELINE_1_UNIT_LIMIT = 832750;
const NATIONAL_LIMITS = {
  unit1: 832750,
  unit2: 1106250,
  unit3: 1288800,
  unit4: 1601750
};

export default function LoanLimitTool() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');

  const states = useMemo(() => {
    return Object.keys(loanLimitsData).filter(state => {
      // Only include state if it has at least one county with a high-balance limit (> 832,750)
      return Object.values(loanLimitsData[state]).some(county => county.unit1 > BASELINE_1_UNIT_LIMIT);
    }).sort();
  }, []);
  
  const counties = useMemo(() => {
    if (!selectedState || !loanLimitsData[selectedState]) return [];
    return Object.keys(loanLimitsData[selectedState]).filter(county => {
      // Only include county if its 1-unit limit is > 832,750
      return loanLimitsData[selectedState][county].unit1 > BASELINE_1_UNIT_LIMIT;
    }).sort();
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
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* National Conforming Limits Banner */}
          <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--accent)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.3rem' }}>National Conforming Loan Limits (2026)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              <span>1-Unit: {formatCurrency(NATIONAL_LIMITS.unit1)}</span>
              <span>2-Unit: {formatCurrency(NATIONAL_LIMITS.unit2)}</span>
              <span>3-Unit: {formatCurrency(NATIONAL_LIMITS.unit3)}</span>
              <span>4-Unit: {formatCurrency(NATIONAL_LIMITS.unit4)}</span>
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
              * If a county is not listed below, it is subject to the standard national conforming loan limits above.
            </p>
          </div>
          
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
              <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>High-Balance Loan Limits for {selectedCounty}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', overflowX: 'auto' }}>
                
                <div style={{ backgroundColor: 'white', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #10B981', minWidth: '150px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>1-Unit</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit1)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #F59E0B', minWidth: '150px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>2-Unit</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit2)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #3B82F6', minWidth: '150px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>3-Unit</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {formatCurrency(limits.unit3)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem 1rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', textAlign: 'center', borderTop: '4px solid #8B5CF6', minWidth: '150px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>4-Unit</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
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
