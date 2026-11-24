'use client';

import React, { useEffect, useState } from 'react';
import { TaxSavingsInputs, TaxSavingsResult } from '../../../lib/tax-savings-engine';

interface EmailTaxScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioName: string;
  inputs: TaxSavingsInputs;
  result: TaxSavingsResult;
  horizonLabel: string;
  buildShareUrl: () => string;
}

const STORAGE_KEY_USER_EMAIL = 'im_wa_user_email';

export default function EmailTaxScenarioModal({
  isOpen,
  onClose,
  scenarioName,
  inputs,
  result,
  horizonLabel,
  buildShareUrl,
}: EmailTaxScenarioModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [otherEmails, setOtherEmails] = useState('');
  const [shareWithTeam, setShareWithTeam] = useState(false);
  const [emailNote, setEmailNote] = useState('');
  const [emailHoneypot, setEmailHoneypot] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setEmailStatus(null);
    if (typeof window !== 'undefined') {
      try {
        const storedEmail = window.localStorage.getItem(STORAGE_KEY_USER_EMAIL);
        if (storedEmail) setUserEmail(storedEmail);
      } catch {
        // ignore storage errors
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !emailSending) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, emailSending, onClose]);

  if (!isOpen) return null;

  const effectiveScenarioName =
    scenarioName.trim() || 'First-Time Buyer 2026 Tax Savings Scenario';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = userEmail.trim();
    if (!trimmedUser || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUser)) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    const parsedOthers = otherEmails
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const addr of parsedOthers) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
        setEmailStatus({ type: 'error', message: `Invalid email address: ${addr}` });
        return;
      }
    }

    const totalCount = 1 + parsedOthers.length + (shareWithTeam ? 1 : 0);
    if (totalCount > 5) {
      setEmailStatus({
        type: 'error',
        message: 'You can send to up to 5 recipients at a time.',
      });
      return;
    }

    const shareUrl = buildShareUrl();
    try {
      window.localStorage.setItem(STORAGE_KEY_USER_EMAIL, trimmedUser);
      window.history.replaceState({}, '', shareUrl);
    } catch {
      // ignore storage/history errors
    }

    const otherHousingMonthly =
      result.monthlyInsurance + result.monthlyPmi + result.monthlyHoa;

    setEmailSending(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/send-tax-scenario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: trimmedUser,
          otherEmails: parsedOthers,
          shareWithTeam,
          note: emailNote.trim(),
          scenarioName: effectiveScenarioName,
          shareUrl,
          website: emailHoneypot,
          scenario: {
            purchasePrice: inputs.purchasePrice,
            downPaymentAmount: result.downPaymentAmount,
            downPaymentPct: inputs.downPaymentPct,
            loanAmount: result.loanAmount,
            interestRate: inputs.interestRate,
            loanTermYears: inputs.loanTermYears,
            stateLabel: result.stateLabel,
            filingStatus: inputs.filingStatus,
            monthsInTaxYear: result.monthsInTaxYear,
            horizonLabel,
            w2Wages: inputs.w2Wages,
            grossMonthlyPitia: result.grossMonthlyPitia,
            netMonthlyCashFlow: result.netMonthlyCashFlow,
            monthlyTaxSavings: result.monthlyTaxSavings,
            annualTaxSavings: result.annualTaxSavings,
            fedTaxSavingsMonthly: result.fedTaxSavingsMonthly,
            stateTaxSavingsMonthly: result.stateTaxSavingsMonthly,
            monthlyPi: result.monthlyPi,
            monthlyPropertyTax: result.monthlyPropertyTax,
            otherHousingMonthly,
            betterOffStandardDeduction: result.annualTaxSavings <= 0,
            fedBuyerItemizes: result.fedBuyerItemizes,
            stateBuyerItemizes: result.stateBuyerItemizes,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Unable to send email right now.');
      }
      setEmailStatus({
        type: 'success',
        message: `✓ Scenario email sent to ${[
          trimmedUser,
          ...parsedOthers,
          ...(shareWithTeam ? ['dsrj@insidermtg.com'] : []),
        ].join(', ')}!`,
      });
      setEmailNote('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to send email right now. Please try again.';
      setEmailStatus({
        type: 'error',
        message: msg,
      });
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!emailSending) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(6, 10, 45, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tax-email-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          border: '2px solid #060A2D',
          boxShadow: '0 25px 50px -12px rgba(6, 10, 45, 0.45)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#060A2D',
            color: '#FFFFFF',
            padding: '1rem 1.25rem',
            borderBottom: '3px solid #EFB51E',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#EFB51E',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              ✉️ Insider Mortgage
            </div>
            <h3
              id="tax-email-modal-title"
              style={{
                margin: '0.15rem 0 0',
                fontSize: '1.08rem',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.25,
              }}
            >
              Email 2026 Tax Savings Scenario
            </h3>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.85)',
                marginTop: '0.12rem',
              }}
            >
              {effectiveScenarioName}
            </div>
          </div>
          <button
            type="button"
            disabled={emailSending}
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: '999px',
              padding: '0.3rem 0.7rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕ Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.95rem',
          }}
        >
          {/* Honeypot */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={emailHoneypot}
            onChange={(e) => setEmailHoneypot(e.target.value)}
            style={{
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              height: 0,
              width: 0,
            }}
            aria-hidden="true"
          />

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#060A2D',
                marginBottom: '0.3rem',
              }}
            >
              1. Your Email Address <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.92rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#060A2D',
                marginBottom: '0.3rem',
              }}
            >
              2. Share with Others{' '}
              <span style={{ color: '#64748B', fontWeight: 500 }}>
                (Optional, comma-separated)
              </span>
            </label>
            <input
              type="text"
              value={otherEmails}
              onChange={(e) => setOtherEmails(e.target.value)}
              placeholder="spouse@example.com, cpa@example.com"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.92rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.55rem',
              padding: '0.7rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: shareWithTeam ? '#FFFBEB' : '#F8FAFC',
              border: shareWithTeam ? '1px solid #EFB51E' : '1px solid #E2E8F0',
              cursor: 'pointer',
              fontSize: '0.84rem',
              color: '#0F172A',
            }}
          >
            <input
              type="checkbox"
              checked={shareWithTeam}
              onChange={(e) => setShareWithTeam(e.target.checked)}
              style={{
                marginTop: '2px',
                width: '17px',
                height: '17px',
                accentColor: '#060A2D',
                cursor: 'pointer',
              }}
            />
            <span>
              <strong>Share with David &amp; Rakesh</strong> (
              <code style={{ fontSize: '0.8rem' }}>dsrj@insidermtg.com</code>)
              <span
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#64748B',
                  marginTop: '2px',
                }}
              >
                Send a copy to Insider Mortgage for a custom pre-approval or rate quote.
              </span>
            </span>
          </label>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#060A2D',
                marginBottom: '0.3rem',
              }}
            >
              Optional Note
            </label>
            <textarea
              rows={2}
              value={emailNote}
              onChange={(e) => setEmailNote(e.target.value)}
              placeholder="Add a short message to include at the top of the email..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.88rem',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {emailStatus && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                backgroundColor: emailStatus.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                border:
                  emailStatus.type === 'success'
                    ? '1px solid #86EFAC'
                    : '1px solid #FECACA',
                color: emailStatus.type === 'success' ? '#166534' : '#B91C1C',
              }}
            >
              {emailStatus.message}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.6rem',
              marginTop: '0.25rem',
            }}
          >
            <button
              type="button"
              disabled={emailSending}
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {emailStatus?.type === 'success' ? 'Done' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={emailSending}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: emailSending ? '#64748B' : '#060A2D',
                color: '#EFB51E',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: emailSending ? 'not-allowed' : 'pointer',
              }}
            >
              {emailSending ? 'Sending...' : '✉️ Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
