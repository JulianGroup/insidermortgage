"use client";
import React, { useState, useMemo } from 'react';
import loanLimits2026 from '../data/loanLimits2026.json';
import loanLimits2027 from '../data/loanLimits2027.json';
import RelatedInsights from '../components/blog/RelatedInsights';

const YEAR_CONFIG = {
  '2027': {
    baseline1Unit: 855400,
    nationalLimits: {
      unit1: 855400,
      unit2: 1095250,
      unit3: 1323900,
      unit4: 1645350,
    },
    data: loanLimits2027,
  },
  '2026': {
    baseline1Unit: 832750,
    nationalLimits: {
      unit1: 832750,
      unit2: 1066250,
      unit3: 1288800,
      unit4: 1601750,
    },
    data: loanLimits2026,
  },
};

const UNIT_CARDS = [
  { key: 'unit1', label: '1-Unit', borderColor: '#10B981' },
  { key: 'unit2', label: '2-Unit', borderColor: '#F59E0B' },
  { key: 'unit3', label: '3-Unit', borderColor: '#3B82F6' },
  { key: 'unit4', label: '4-Unit', borderColor: '#8B5CF6' },
];

export default function LoanLimitTool() {
  const [selectedYear, setSelectedYear] = useState('2027');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('');

  const currentConfig = YEAR_CONFIG[selectedYear];
  const activeData = currentConfig.data;
  const baseline = currentConfig.baseline1Unit;

  const handleYearChange = (nextYear) => {
    if (nextYear === selectedYear) return;
    setSelectedYear(nextYear);

    const nextCfg = YEAR_CONFIG[nextYear];
    const nextStateData = selectedState ? nextCfg.data[selectedState] : null;
    const stateStillHasHighBalance =
      nextStateData &&
      Object.values(nextStateData).some((c) => c.unit1 > nextCfg.baseline1Unit);

    if (!stateStillHasHighBalance) {
      setSelectedState('');
      setSelectedCounty('');
      return;
    }

    const countyLimits = selectedCounty ? nextStateData[selectedCounty] : null;
    if (!countyLimits || countyLimits.unit1 <= nextCfg.baseline1Unit) {
      setSelectedCounty('');
    }
  };

  const states = useMemo(() => {
    return Object.keys(activeData)
      .filter((state) =>
        Object.values(activeData[state]).some((county) => county.unit1 > baseline)
      )
      .sort();
  }, [activeData, baseline]);

  const counties = useMemo(() => {
    if (!selectedState || !activeData[selectedState]) return [];
    return Object.keys(activeData[selectedState])
      .filter((county) => activeData[selectedState][county].unit1 > baseline)
      .sort();
  }, [activeData, baseline, selectedState]);

  const limits = useMemo(() => {
    if (!selectedState || !selectedCounty || !activeData[selectedState]?.[selectedCounty]) {
      return null;
    }
    return activeData[selectedState][selectedCounty];
  }, [activeData, selectedState, selectedCounty]);

  const prev2026Limits = useMemo(() => {
    if (!selectedState || !selectedCounty) return null;
    return loanLimits2026[selectedState]?.[selectedCounty] || null;
  }, [selectedState, selectedCounty]);

  const next2027Limits = useMemo(() => {
    if (!selectedState || !selectedCounty) return null;
    return loanLimits2027[selectedState]?.[selectedCounty] || null;
  }, [selectedState, selectedCounty]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(val);

  return (
    <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      <section style={{ padding: '6rem 1rem 3rem', textAlign: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>{selectedYear} Loan Limit Look-Up</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '640px', margin: '0 auto 1.75rem' }}>
            Instantly check the 2027 and 2026 maximum conforming and high-balance loan limits by state and county.
          </p>

          {/* Year Switcher */}
          <div
            role="group"
            aria-label="Loan Limit Year"
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              padding: '0.35rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            {['2027', '2026'].map((yr) => {
              const isActive = selectedYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleYearChange(yr)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 1.35rem',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'var(--accent, #EFB51E)' : 'transparent',
                    color: isActive ? 'var(--primary, #060A2D)' : '#FFFFFF',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{yr} Limits</span>
                  {yr === '2027' && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        padding: '0.12rem 0.45rem',
                        borderRadius: '9999px',
                        backgroundColor: isActive ? 'var(--primary, #060A2D)' : 'var(--accent, #EFB51E)',
                        color: isActive ? '#FFFFFF' : 'var(--primary, #060A2D)',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section style={{ padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          {/* National Conforming Limits Banner */}
          <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--accent)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '3rem', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.3rem' }}>
              National Conforming Loan Limits ({selectedYear})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
              <span>1-Unit: {formatCurrency(currentConfig.nationalLimits.unit1)}</span>
              <span>2-Unit: {formatCurrency(currentConfig.nationalLimits.unit2)}</span>
              <span>3-Unit: {formatCurrency(currentConfig.nationalLimits.unit3)}</span>
              <span>4-Unit: {formatCurrency(currentConfig.nationalLimits.unit4)}</span>
            </div>
            {selectedYear === '2027' && (
              <p style={{ marginTop: '0.85rem', marginBottom: 0, fontSize: '0.92rem', color: '#059669', fontWeight: 600 }}>
                Up +$22,650 (+2.72%) on 1-unit properties from the 2026 baseline of $832,750.
              </p>
            )}
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
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
              <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                High-Balance Loan Limits for {selectedCounty} ({selectedYear})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {UNIT_CARDS.map(({ key, label, borderColor }) => {
                  const val = limits[key];
                  const prevVal = prev2026Limits?.[key];
                  const nextVal = next2027Limits?.[key];
                  const diff = typeof prevVal === 'number' ? val - prevVal : null;

                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor: 'white',
                        padding: '1.5rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)',
                        textAlign: 'center',
                        borderTop: `4px solid ${borderColor}`,
                      }}
                    >
                      <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {formatCurrency(val)}
                      </div>
                      {selectedYear === '2027' && diff !== null && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: diff > 0 ? '#059669' : 'var(--text-muted)',
                          }}
                        >
                          {diff > 0
                            ? `+${formatCurrency(diff)} vs. 2026 (${formatCurrency(prevVal)})`
                            : 'Unchanged from 2026'}
                        </div>
                      )}
                      {selectedYear === '2026' && typeof nextVal === 'number' && (
                        <div
                          style={{
                            marginTop: '0.5rem',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                          }}
                        >
                          2027 Limit: {formatCurrency(nextVal)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                * Limits exceeding the baseline indicate high-cost area limits. Loans subject to high-cost area limits must comply with high-balance loan requirements.
              </div>
            </div>
          )}

        </div>
      </section>

      <RelatedInsights
        calculatorId="calc-loan-limits"
        title="Conforming, High-Balance & Multi-Unit Loan Guides"
        subtitle="How county loan limits impact down payments and pricing."
        background="#FFFFFF"
      />
    </main>
  );
}
