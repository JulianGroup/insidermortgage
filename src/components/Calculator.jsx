"use client";
import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import './Calculator.css';

const formatCurrency = (val) => {
  if (isNaN(val) || val === Infinity || val === -Infinity) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

const formatNumber = (val, decimals = 2) => {
  if (isNaN(val) || val === Infinity || val === -Infinity) return 'N/A';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);
};

const Calculator = () => {
  const [activeTab, setActiveTab] = useState('standard');

  // Standard Purchase State
  const [homePrice, setHomePrice] = useState(500000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  
  // Tax, Insurance, and HOA State
  const [propertyTax, setPropertyTax] = useState(500000 * 0.0125);
  const [homeInsurance, setHomeInsurance] = useState(500000 * 0.0035);
  const [monthlyHoa, setMonthlyHoa] = useState(0);
  
  // Flags to know if the user manually overrode the defaults
  const [manualTax, setManualTax] = useState(false);
  const [manualIns, setManualIns] = useState(false);

  // Auto-calculate defaults if user hasn't manually overridden them
  useEffect(() => {
    if (!manualTax) setPropertyTax(homePrice * 0.0125);
    if (!manualIns) setHomeInsurance(homePrice * 0.0035);
  }, [homePrice, manualTax, manualIns]);

  // DSCR State
  const [monthlyRent, setMonthlyRent] = useState(3500);

  // Utility (What's Missing) State
  const [solveFor, setSolveFor] = useState('payment');
  const [uPrincipal, setUPrincipal] = useState(300000);
  const [uRate, setURate] = useState(6.5);
  const [uTerm, setUTerm] = useState(360);
  const [uPayment, setUPayment] = useState(1896.20);
  const [copied, setCopied] = useState(false);

  // Helper to safely parse normal inputs
  const parseInput = (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  };

  // --- Calculation Logic: Standard & DSCR ---
  const calculatePI = (principal, annualRate, years) => {
    const monthlyRate = (annualRate || 0) / 100 / 12;
    const numberOfPayments = (years || 0) * 12;
    if (monthlyRate === 0) return principal / (numberOfPayments || 1);
    return (
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    );
  };

  const loanAmount = homePrice - (homePrice * (downPaymentPct / 100));
  const principalInterest = calculatePI(loanAmount, interestRate, loanTerm);
  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const safeHoa = monthlyHoa || 0;
  const totalPayment = principalInterest + monthlyTax + monthlyInsurance + safeHoa;
  const dscrRatio = monthlyRent / totalPayment;

  // Calculate dynamic property tax rate for display
  const effectiveTaxRate = homePrice > 0 ? (propertyTax / homePrice) * 100 : 0;

  // --- Calculation Logic: Utility (What's Missing) ---
  let solvedPrincipal = uPrincipal;
  let solvedRate = uRate;
  let solvedTerm = uTerm;
  let solvedPayment = uPayment;

  if (activeTab === 'utility') {
    const safePrincipal = uPrincipal || 0;
    const safeRate = uRate || 0;
    const safeTerm = uTerm || 1; // Prevent division by zero
    const safePayment = uPayment || 0;

    try {
      if (solveFor === 'payment') {
        const i = (safeRate / 100) / 12;
        solvedPayment = i === 0 ? (safePrincipal / safeTerm) : safePrincipal * (i * Math.pow(1 + i, safeTerm)) / (Math.pow(1 + i, safeTerm) - 1);
      } else if (solveFor === 'principal') {
        const i = (safeRate / 100) / 12;
        solvedPrincipal = i === 0 ? (safePayment * safeTerm) : safePayment * (Math.pow(1 + i, safeTerm) - 1) / (i * Math.pow(1 + i, safeTerm));
      } else if (solveFor === 'term') {
        const i = (safeRate / 100) / 12;
        if (i === 0) {
          solvedTerm = safePrincipal / (safePayment || 1);
        } else {
          const val = 1 - (i * safePrincipal) / safePayment;
          solvedTerm = val <= 0 ? NaN : -Math.log(val) / Math.log(1 + i);
        }
      } else if (solveFor === 'rate') {
        let low = 0.0;
        let high = 100.0;
        let guessRate = 0;
        for (let iter = 0; iter < 100; iter++) {
          guessRate = (low + high) / 2;
          const i = (guessRate / 100) / 12;
          const pmt = safePrincipal * (i * Math.pow(1 + i, safeTerm)) / (Math.pow(1 + i, safeTerm) - 1);
          if (pmt > safePayment) high = guessRate;
          else low = guessRate;
        }
        solvedRate = guessRate;
      }
    } catch (e) {
      console.error("Calculation Error", e);
    }
  }

  // --- Copy to Clipboard Logic ---
  const handleCopy = async () => {
    let text = `Insider Mortgage\n\n`;
    
    if (activeTab !== 'utility') {
      text += `Property Value: ${formatCurrency(homePrice)}\n`;
      text += `Loan Amount: ${formatCurrency(loanAmount)}\n`;
      text += `Interest Rate: ${interestRate}%\n`;
      text += `Term: ${loanTerm} Years\n\n`;
      text += `--- Monthly Payment Breakdown ---\n`;
      text += `Principal & Interest: ${formatCurrency(principalInterest)}\n`;
      text += `Property Taxes: ${formatCurrency(monthlyTax)}\n`;
      text += `Homeowners Insurance: ${formatCurrency(monthlyInsurance)}\n`;
      if (safeHoa > 0) text += `HOA Fees: ${formatCurrency(safeHoa)}\n`;
      text += `Total Monthly Payment: ${formatCurrency(totalPayment)}\n`;
      
      if (activeTab === 'dscr') {
        text += `\n--- Cash Flow Analysis ---\n`;
        text += `Expected Rent: ${formatCurrency(monthlyRent)}\n`;
        text += `DSCR Ratio: ${formatNumber(dscrRatio, 2)}\n`;
      }
    } else {
      text += `--- Utility Calculator Results ---\n`;
      text += `Monthly Payment: ${formatCurrency(solveFor === 'payment' ? solvedPayment : uPayment)}\n`;
      text += `Loan Amount: ${formatCurrency(solveFor === 'principal' ? solvedPrincipal : uPrincipal)}\n`;
      text += `Interest Rate: ${formatNumber(solveFor === 'rate' ? solvedRate : uRate, 3)}%\n`;
      text += `Term (Months): ${formatNumber(solveFor === 'term' ? solvedTerm : uTerm, 0)}\n`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <section className="section calculator-section" id="calculator">
      <div className="container">
        <div className="solutions-header">
          <h2>Interactive Mortgage Tools</h2>
          <p>Estimate your monthly payments, analyze an investment property's cash flow, or use the Utility Calculator to solve for a missing variable.</p>
        </div>

        <div className="calc-tabs">
          <button 
            className={`calc-tab ${activeTab === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard')}
          >
            Standard Purchase
          </button>
          <button 
            className={`calc-tab ${activeTab === 'dscr' ? 'active' : ''}`}
            onClick={() => setActiveTab('dscr')}
          >
            DSCR / Investment
          </button>
          <button 
            className={`calc-tab ${activeTab === 'utility' ? 'active' : ''}`}
            onClick={() => setActiveTab('utility')}
          >
            Utility Calculator
          </button>
        </div>

        <div className="calc-grid">
          <div className="calc-form">
            <div className="calc-inputs">
              
              {/* --- STANDARD & DSCR TAB INPUTS --- */}
              {activeTab !== 'utility' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Property Value ($)</label>
                    <NumericFormat 
                      value={homePrice} 
                      onValueChange={(values) => setHomePrice(values.floatValue || 0)}
                      thousandSeparator={true} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Down Payment (%)</label>
                    <input type="number" className="form-input" value={downPaymentPct} onChange={(e) => setDownPaymentPct(parseInput(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interest Rate (%)</label>
                    <input type="number" step="0.1" className="form-input" value={interestRate} onChange={(e) => setInterestRate(parseInput(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loan Term (Years)</label>
                    <select className="form-select" value={loanTerm} onChange={(e) => setLoanTerm(parseInput(e.target.value))}>
                      <option value={30}>30 Years</option>
                      <option value={15}>15 Years</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Property Tax ($)</label>
                    <NumericFormat 
                      value={propertyTax} 
                      onValueChange={(values) => {
                        setManualTax(true);
                        setPropertyTax(values.floatValue || 0);
                      }}
                      thousandSeparator={true} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Insurance ($)</label>
                    <NumericFormat 
                      value={homeInsurance} 
                      onValueChange={(values) => {
                        setManualIns(true);
                        setHomeInsurance(values.floatValue || 0);
                      }}
                      thousandSeparator={true} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly HOA Fees ($)</label>
                    <NumericFormat 
                      value={monthlyHoa} 
                      onValueChange={(values) => setMonthlyHoa(values.floatValue || 0)}
                      thousandSeparator={true} 
                      className="form-input" 
                    />
                  </div>

                  {activeTab === 'dscr' && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Expected Monthly Gross Rent ($)</label>
                      <NumericFormat 
                        value={monthlyRent} 
                        onValueChange={(values) => setMonthlyRent(values.floatValue || 0)}
                        thousandSeparator={true} 
                        className="form-input" 
                      />
                    </div>
                  )}
                </>
              )}

              {/* --- UTILITY CALCULATOR INPUTS --- */}
              {activeTab === 'utility' && (
                <>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Solve For</label>
                    <select className="form-select" value={solveFor} onChange={(e) => setSolveFor(e.target.value)}>
                      <option value="payment">Monthly Payment</option>
                      <option value="principal">Loan Amount (Principal)</option>
                      <option value="term">Term (Months)</option>
                      <option value="rate">Interest Rate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Loan Amount ($)</label>
                    <NumericFormat 
                      value={solveFor === 'principal' ? solvedPrincipal : uPrincipal} 
                      onValueChange={(values) => setUPrincipal(values.floatValue || 0)}
                      thousandSeparator={true} 
                      decimalScale={2}
                      className="form-input" 
                      disabled={solveFor === 'principal'}
                      style={solveFor === 'principal' ? { backgroundColor: 'var(--bg-color)', borderColor: 'var(--secondary)', color: 'var(--secondary)', fontWeight: 'bold' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Interest Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.001"
                      className="form-input" 
                      value={solveFor === 'rate' ? solvedRate.toFixed(3) : uRate} 
                      onChange={(e) => setURate(parseInput(e.target.value))} 
                      disabled={solveFor === 'rate'}
                      style={solveFor === 'rate' ? { backgroundColor: 'var(--bg-color)', borderColor: 'var(--secondary)', color: 'var(--secondary)', fontWeight: 'bold' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Term (Months)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={solveFor === 'term' ? (isNaN(solvedTerm) ? 0 : solvedTerm.toFixed(1)) : uTerm} 
                      onChange={(e) => setUTerm(parseInput(e.target.value))} 
                      disabled={solveFor === 'term'}
                      style={solveFor === 'term' ? { backgroundColor: 'var(--bg-color)', borderColor: 'var(--secondary)', color: 'var(--secondary)', fontWeight: 'bold' } : {}}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Payment ($)</label>
                    <NumericFormat 
                      value={solveFor === 'payment' ? solvedPayment : uPayment} 
                      onValueChange={(values) => setUPayment(values.floatValue || 0)}
                      thousandSeparator={true} 
                      decimalScale={2}
                      className="form-input" 
                      disabled={solveFor === 'payment'}
                      style={solveFor === 'payment' ? { backgroundColor: 'var(--bg-color)', borderColor: 'var(--secondary)', color: 'var(--secondary)', fontWeight: 'bold' } : {}}
                    />
                  </div>
                </>
              )}

            </div>
          </div>

          <div className="calc-results" style={{ position: 'relative' }}>
            <button 
              onClick={handleCopy}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '2rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              {copied ? '✅ Copied!' : '📋 Copy Results'}
            </button>

            {activeTab !== 'utility' ? (
              <>
                <h3 style={{ color: 'white', marginBottom: '1.5rem', paddingRight: '100px' }}>
                  {activeTab === 'standard' ? 'Payment Breakdown' : 'Cash Flow Analysis'}
                </h3>
                <div className="result-item">
                  <span>Loan Amount</span>
                  <span>{formatCurrency(loanAmount)}</span>
                </div>
                <div className="result-item">
                  <span>Principal & Interest</span>
                  <span>{formatCurrency(principalInterest)}</span>
                </div>
                <div className="result-item">
                  <span>Property Taxes ({formatNumber(effectiveTaxRate, 2)}%)</span>
                  <span>{formatCurrency(monthlyTax)}</span>
                </div>
                <div className="result-item">
                  <span>Homeowners Insurance</span>
                  <span>{formatCurrency(monthlyInsurance)}</span>
                </div>
                {safeHoa > 0 && (
                  <div className="result-item">
                    <span>HOA Fees</span>
                    <span>{formatCurrency(safeHoa)}</span>
                  </div>
                )}
                <div className="result-item total">
                  <span>Total Monthly Payment</span>
                  <span>{formatCurrency(totalPayment)}</span>
                </div>
                {activeTab === 'dscr' && (
                  <>
                    <div className="result-item" style={{ marginTop: '1rem' }}>
                      <span>Expected Rent</span>
                      <span>{formatCurrency(monthlyRent)}</span>
                    </div>
                    <div className={`dscr-alert ${dscrRatio >= 1 ? 'dscr-good' : 'dscr-bad'}`}>
                      DSCR Ratio: {formatNumber(dscrRatio, 2)} 
                      {dscrRatio >= 1.2 ? ' (Excellent)' : dscrRatio >= 1 ? ' (Qualifies)' : ' (Needs Higher Rent or Down Payment)'}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <h3 style={{ color: 'white', marginBottom: '1.5rem', paddingRight: '100px' }}>Utility Solution</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Select the variable you want to solve for in the dropdown.
                </p>
                <div className="result-item total" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
                  <span style={{ fontSize: '1.1rem' }}>
                    {solveFor === 'payment' && 'Calculated Payment'}
                    {solveFor === 'principal' && 'Calculated Loan Amount'}
                    {solveFor === 'rate' && 'Calculated Interest Rate'}
                    {solveFor === 'term' && 'Calculated Term'}
                  </span>
                  <span>
                    {solveFor === 'payment' && formatCurrency(solvedPayment)}
                    {solveFor === 'principal' && formatCurrency(solvedPrincipal)}
                    {solveFor === 'rate' && `${formatNumber(solvedRate, 3)}%`}
                    {solveFor === 'term' && (isNaN(solvedTerm) ? 'N/A' : `${formatNumber(solvedTerm, 0)} mos`)}
                  </span>
                </div>
                
                {/* Detailed breakdown listed below as requested */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <div className="result-item">
                    <span>Monthly Payment</span>
                    <span>{formatCurrency(solveFor === 'payment' ? solvedPayment : uPayment)}</span>
                  </div>
                  <div className="result-item">
                    <span>Loan Amount</span>
                    <span>{formatCurrency(solveFor === 'principal' ? solvedPrincipal : uPrincipal)}</span>
                  </div>
                  <div className="result-item">
                    <span>Interest Rate</span>
                    <span>{formatNumber(solveFor === 'rate' ? solvedRate : uRate, 3)}%</span>
                  </div>
                  <div className="result-item">
                    <span>Term (Months)</span>
                    <span>{formatNumber(solveFor === 'term' ? solvedTerm : uTerm, 0)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculator;

