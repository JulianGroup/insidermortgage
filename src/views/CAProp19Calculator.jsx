"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ScheduleCallForm from '../components/ScheduleCallForm';
import CurrencyInput from '../components/CurrencyInput';

export default function CAProp19Calculator() {
  const [address, setAddress] = useState('');
  const [netTaxableValue, setNetTaxableValue] = useState('1154400');

  const [salePrice, setSalePrice] = useState('1350000');
  const [purchasePrice, setPurchasePrice] = useState('1500000');
  const [timingMultiplier, setTimingMultiplier] = useState(1.05);
  const [taxRate, setTaxRate] = useState('1.15');

  // Extract street address from user's entered address (e.g. "123 Main St, San Diego" -> "123 Main St")
  const streetName = useMemo(() => {
    if (!address || !address.trim()) return '';
    return address.trim().split(',')[0].trim();
  }, [address]);

  // Handle Google Assessment search
  const handleGoogleSearch = () => {
    const trimmed = address.trim();
    if (!trimmed) {
      alert('Please enter your California property address first.');
      return;
    }
    const query = `property tax assessment net taxable value ${trimmed}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currencyFmt = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }),
    []
  );

  // Calculations
  const calculations = useMemo(() => {
    const originalBase = Math.max(0, parseFloat(netTaxableValue) || 0);

    const origSale = Math.max(0, parseFloat(salePrice) || 0);
    const newPurchase = Math.max(0, parseFloat(purchasePrice) || 0);
    const multiplier = parseFloat(timingMultiplier) || 1.0;
    const rate = (parseFloat(taxRate) || 1.15) / 100;

    const allowedCap = origSale * multiplier;

    let newAssessedBase = originalBase;
    let buyUpDifference = 0;
    let isBuyUp = false;

    if (newPurchase > allowedCap) {
      isBuyUp = true;
      buyUpDifference = Math.max(0, newPurchase - origSale);
      newAssessedBase = originalBase + buyUpDifference;
    }

    const standardTax = newPurchase * rate;
    const prop19Tax = newAssessedBase * rate;
    const annualSavings = Math.max(0, standardTax - prop19Tax);

    // 10-Year cumulative with 2% statutory Prop 13 cap
    let cumulativeSavings = 0;
    let stdCompounded = standardTax;
    let p19Compounded = prop19Tax;

    for (let yr = 1; yr <= 10; yr++) {
      cumulativeSavings += Math.max(0, stdCompounded - p19Compounded);
      stdCompounded *= 1.02;
      p19Compounded *= 1.02;
    }

    return {
      originalBase,
      allowedCap,
      isBuyUp,
      buyUpDifference,
      newAssessedBase,
      standardTax,
      prop19Tax,
      annualSavings,
      cumulativeSavings
    };
  }, [netTaxableValue, salePrice, purchasePrice, timingMultiplier, taxRate]);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <section style={{ padding: '4.5rem 1rem 3rem', backgroundColor: '#060a2d', color: '#ffffff', textAlign: 'center' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: 'rgba(242, 194, 48, 0.15)',
            border: '1px solid rgba(242, 194, 48, 0.4)',
            color: '#f2c230',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            California Proposition 19 Senior Benefit
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: '#ffffff' }}>
            Keep Your Low Property Taxes When Moving
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'rgba(255, 255, 255, 0.85)', maxWidth: '780px', margin: '0 auto', lineHeight: 1.6 }}>
            California homeowners <strong>age 55 and older</strong> can transfer their protected Prop 13 property tax base 
            to a replacement residence anywhere in California—even when buying a higher-value home.
          </p>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div style={{ maxWidth: '1120px', margin: '-2rem auto 0', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Form Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Step 1: Current Property Assessment */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#060a2d', color: '#f2c230', borderRadius: '50%', fontWeight: 700, fontSize: '0.9rem' }}>1</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#060a2d', margin: 0 }}>Current Property Assessment</h2>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Under Prop 19, your transferred tax base starts from your current <em>net assessed value</em> on the county tax roll, not current market value.
              </p>

              {/* Address Lookup */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Current Home Address
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 16557 4S Ranch Pkwy, San Diego, CA 92127"
                    style={{
                      flex: '1 1 240px',
                      padding: '11px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.95rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGoogleSearch}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '10px 16px',
                      backgroundColor: '#060a2d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Search Google for your home&apos;s Net Taxable Value ↗
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                  Click to open Google’s public record tax roll card for your property’s net assessed taxable value.
                </p>
              </div>

              {/* Single Net Taxable Value Input */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Current Net Taxable Value ($)
                </label>
                <CurrencyInput
                  value={netTaxableValue}
                  onChange={setNetTaxableValue}
                  placeholder="e.g. $1,154,400"
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1rem', fontWeight: 600 }}
                />
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                  Enter your current Net Taxable Value from your county property tax bill (or assessor portal). This is the protected base amount that transfers under Prop 19.
                </p>
              </div>

              {/* Net Base Callout */}
              <div style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#065f46', letterSpacing: '0.04em' }}>
                    Net Factored Base Value (Transfers under Prop 19)
                  </span>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#065f46' }}>
                    {currencyFmt.format(calculations.originalBase)}
                  </div>
                </div>
                <span style={{ padding: '4px 10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Current Tax Base
                </span>
              </div>
            </div>

            {/* Step 2: Relocation & Purchase Plan */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#060a2d', color: '#f2c230', borderRadius: '50%', fontWeight: 700, fontSize: '0.9rem' }}>2</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#060a2d', margin: 0 }}>Relocation & Purchase Plan</h2>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Select your purchase timing, then enter your sale price and replacement purchase price to calculate whether you qualify for a 100% transfer or the Prop 19 buy-up formula.
              </p>

              {/* Timing Rule Dropdown (Asked First) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Timing of Replacement Home Purchase
                </label>
                <select
                  value={timingMultiplier}
                  onChange={(e) => setTimingMultiplier(parseFloat(e.target.value))}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', backgroundColor: '#ffffff' }}
                >
                  <option value={1.00}>Purchased BEFORE selling current home (100% Cap)</option>
                  <option value={1.05}>Purchased within 1 year AFTER selling current home (105% Cap)</option>
                  <option value={1.10}>Purchased between 1 and 2 years AFTER selling current home (110% Cap)</option>
                </select>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                  California law gives you a 5% inflation buffer in Year 1 and 10% in Year 2 when purchasing after selling.
                </p>
              </div>

              {/* Price Fields with Dynamic Labels based on Timing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                    {timingMultiplier > 1.0
                      ? (streetName ? `${streetName} Expected Sales Price ($)` : 'Expected Sales Price ($)')
                      : (streetName ? `${streetName} Sale Price ($)` : 'Original Home Sale Price ($)')}
                  </label>
                  <CurrencyInput
                    value={salePrice}
                    onChange={setSalePrice}
                    placeholder={
                      timingMultiplier > 1.0
                        ? (streetName ? `Expected sales price for ${streetName}` : 'Expected Sales Price')
                        : (streetName ? `Sales price for ${streetName}` : 'Original Home Sale Price')
                    }
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                    {timingMultiplier > 1.0
                      ? 'Expected Replacement Purchase Price ($)'
                      : 'New Replacement Purchase Price ($)'}
                  </label>
                  <CurrencyInput
                    value={purchasePrice}
                    onChange={setPurchasePrice}
                    placeholder={
                      timingMultiplier > 1.0
                        ? 'Expected Replacement Purchase Price'
                        : 'New Replacement Purchase Price'
                    }
                    style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              {/* County Tax Rate */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Estimated County Property Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  max="2.0"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem' }}
                />
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px' }}>
                  Standard CA base is 1.00% + local voter bonds (San Diego County is typically ~1.15% to 1.25%).
                </p>
              </div>
            </div>

            {/* Official Guidance & Form Download */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', fontSize: '0.9rem', color: '#475569' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#060a2d', marginBottom: '0.75rem' }}>
                Official California Prop 19 Claim Filing
              </h3>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                To claim your tax transfer, you must file <strong>Form BOE-19-B</strong> (<em>Claim for Transfer of Base Year Value to Replacement Primary Residence for Persons at Least Age 55 Years</em>) with your county assessor within 3 years of purchasing the replacement home.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href="https://www.boe.ca.gov/proptaxes/pdf/boe19b.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#060a2d',
                    fontWeight: 700,
                    textDecoration: 'underline'
                  }}
                >
                  Download Official State Form BOE-19-B (PDF) ↗
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Results Dashboard */}
          <div style={{ position: 'sticky', top: '2rem' }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '2px solid #060a2d',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 20px 30px -10px rgba(6,10,45,0.15)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#060a2d', marginBottom: '1.25rem' }}>
                Your Estimated Tax Savings
              </h3>

              {/* Savings Hero Callout */}
              <div style={{
                textAlign: 'center',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  First-Year Property Tax Savings
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#15803d', lineHeight: 1.1 }}>
                  {currencyFmt.format(calculations.annualSavings)} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>/ yr</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '6px' }}>
                  Direct reduction on your annual California tax bill
                </div>
              </div>

              {/* Comparison Breakdown Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' }}>
                  <span style={{ color: '#64748b' }}>Standard Market Reassessment:</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>
                    {currencyFmt.format(calculations.standardTax)} / yr
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' }}>
                  <span style={{ color: '#64748b' }}>Prop 19 Transferred Tax Bill:</span>
                  <span style={{ fontWeight: 800, color: '#15803d' }}>
                    {currencyFmt.format(calculations.prop19Tax)} / yr
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px dashed #e2e8f0', fontSize: '0.92rem' }}>
                  <span style={{ color: '#64748b' }}>New Prop 19 Assessed Base:</span>
                  <span style={{ fontWeight: 700, color: '#060a2d' }}>
                    {currencyFmt.format(calculations.newAssessedBase)}
                  </span>
                </div>

                {calculations.isBuyUp && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#92400e'
                  }}>
                    <strong>Buy-Up Adjustment Applied:</strong> Replacement price exceeds the allowed cap ({currencyFmt.format(calculations.allowedCap)}). 
                    Only the {currencyFmt.format(calculations.buyUpDifference)} market difference is added to your original base value.
                  </div>
                )}
              </div>

              {/* 10-Year Cumulative Savings Box */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.25rem',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  10-Year Cumulative Projected Savings
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#060a2d', margin: '4px 0' }}>
                  {currencyFmt.format(calculations.cumulativeSavings)}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                  Factoring in the statutory 2% annual Prop 13 maximum assessment cap.
                </p>
              </div>

              <a
                href="#contact"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  backgroundColor: '#060a2d',
                  color: '#ffffff',
                  padding: '14px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(6,10,45,0.25)',
                  transition: 'background-color 0.2s'
                }}
              >
                Speak with an Insider Mortgage Advisor ↓
              </a>
              <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem', color: '#64748b' }}>
                Direct assistance: <strong>(858) 848-5653</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Embedded Consultation Form Section */}
        <section id="contact" style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#060a2d', letterSpacing: '0.05em' }}>
              Relocation & Replacement Financing
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#060a2d', margin: '8px 0 12px' }}>
              Plan Your Move with Confidence
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6 }}>
              Need bridge financing, a HELOC on your current property to purchase the replacement first, or a pre-approval letter? 
              Connect with senior mortgage specialists Rakesh Jain and David Sider to walk through your numbers.
            </p>
          </div>

          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <ScheduleCallForm source="CA Prop 19 Calculator" title="Schedule Your Prop 19 Consultation" />
          </div>
        </section>

      </div>
    </main>
  );
}
