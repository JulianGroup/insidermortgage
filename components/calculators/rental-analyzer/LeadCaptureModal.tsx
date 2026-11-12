'use client';

import React, { useState } from 'react';
import { UnderwriteInputs, UnderwriteSummary } from '../../../lib/financial-engine';
import { submitInvestmentAnalysisLead } from '../../../src/lib/submitLead';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  inputs: UnderwriteInputs;
  summary: UnderwriteSummary;
}

const LOAN_OPTIONS = [
  'DSCR Investor Loan (Qualify on Property Rent)',
  'Conventional 1–4 Unit Investment Loan',
  'Multi-Unit + ADU Construction / Renovation Financing',
  'Bank Statement / 1099 Self-Employed Investor Loan',
  'House-Hack (Owner-Occupied 2–4 Unit Low Down Payment)',
];

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function LeadCaptureModal({
  isOpen,
  onClose,
  onUnlocked,
  inputs,
  summary,
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLoanOption, setSelectedLoanOption] = useState(LOAN_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [smsConsent, setSmsConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Please enter your name and email address.');
      return;
    }

    setSubmitting(true);
    try {
      await submitInvestmentAnalysisLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        selectedLoanOption,
        smsConsent,
        notes: notes.trim(),
        inputs,
        summary,
      });

      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem('im_rental_analyzer_unlocked', 'true');
        } catch {
          // ignore storage errors
        }
      }
      onUnlocked();
    } catch {
      // Even if network/mail fails in local preview, unlock for user after attempt
      onUnlocked();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ra-lead-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(6, 10, 45, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          maxWidth: '540px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(6, 10, 45, 0.45)',
          border: '2px solid #060A2D',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #060A2D 0%, #0C1764 100%)',
            color: '#FFFFFF',
            padding: '1.5rem 1.75rem',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '1.1rem',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          <div
            style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#EFB51E',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.35rem',
            }}
          >
            Instant Underwriting Access
          </div>
          <h3
            id="ra-lead-modal-title"
            style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}
          >
            Unlock Your 10-Year Pro-Forma, IRR &amp; ADU/Refi Model
          </h3>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.86rem', color: '#CBD5E1', lineHeight: 1.5 }}>
            Enter your contact info below to immediately unlock the 5-year &amp; 10-year IRR analysis,
            ADU/Refinance modeling, and printable PDF report for{' '}
            <strong style={{ color: '#EFB51E' }}>
              {inputs.propertyAddress || 'your investment property'}
            </strong>
            .
          </p>
        </div>

        {/* Property Summary Pill */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: '#334155',
          }}
        >
          <span>
            <strong>Price:</strong> {currencyFmt.format(inputs.purchasePrice)} ({inputs.unitCount}{' '}
            {inputs.unitCount === 1 ? 'Unit' : 'Units'})
          </span>
          <span>
            <strong>Gross Rent:</strong> {currencyFmt.format(summary.totalMonthlyRent)}/mo
          </span>
          <span>
            <strong>Yr 1 NOI:</strong> {currencyFmt.format(Math.round(summary.year1Noi))}/yr
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#B91C1C',
                fontSize: '0.84rem',
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '0.9rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '0.3rem',
              }}
            >
              Full Name *
            </label>
            <input
              type="text"
              required
              className="ra-input"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="ra-two-col" style={{ marginBottom: '0.9rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '0.3rem',
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                required
                className="ra-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: '0.3rem',
                }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                required
                className="ra-input"
                placeholder="(858) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: '0.9rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '0.3rem',
              }}
            >
              Preferred Financing Strategy
            </label>
            <select
              className="ra-input"
              value={selectedLoanOption}
              onChange={(e) => setSelectedLoanOption(e.target.value)}
            >
              {LOAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '0.9rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '0.3rem',
              }}
            >
              Questions or Scenario Notes (Optional)
            </label>
            <input
              type="text"
              className="ra-input"
              placeholder="e.g. Planning a garage ADU conversion or comparing 20% vs 25% down"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.76rem',
              color: '#64748B',
              marginBottom: '1.2rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span>
              I agree to receive financing insights from Rakesh Jain &amp; David Sider at Insider
              Mortgage (C2 Financial). Your information is never sold.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#EFB51E',
              color: '#060A2D',
              fontWeight: 800,
              fontSize: '0.98rem',
              cursor: submitting ? 'wait' : 'pointer',
              boxShadow: '0 8px 20px rgba(239, 181, 30, 0.35)',
            }}
          >
            {submitting
              ? 'Unlocking Your Full 10-Year Pro-Forma…'
              : 'Unlock 10-Year Pro-Forma, ADU Model & PDF →'}
          </button>
        </form>
      </div>
    </div>
  );
}
