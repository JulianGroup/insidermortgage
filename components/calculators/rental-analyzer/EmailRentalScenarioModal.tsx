'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UnderwriteInputs, runUnderwriteModel } from '../../../lib/financial-engine';
import { FeaturedDeal } from './featuredDeals';
import { extractStreetAddress } from './stateDetector';

export interface EmailScenarioOption {
  id: string;
  name: string;
  sourceLabel: 'Current Scenario' | 'Saved on Device';
  inputs: UnderwriteInputs;
  featuredDeal?: FeaturedDeal | null;
}

interface EmailRentalScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioOptions: EmailScenarioOption[];
  defaultSelectedId: string;
  buildShareUrlForInputs: (inputs: UnderwriteInputs, featuredDealId?: string | null) => string;
}

const STORAGE_KEY_USER_EMAIL = 'im_wa_user_email';

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function EmailRentalScenarioModal({
  isOpen,
  onClose,
  scenarioOptions,
  defaultSelectedId,
  buildShareUrlForInputs,
}: EmailRentalScenarioModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  // Initialize selection and load saved email whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    setEmailStatus(null);
    const hasDefault = scenarioOptions.some((opt) => opt.id === defaultSelectedId);
    if (hasDefault) {
      setSelectedIds([defaultSelectedId]);
    } else if (scenarioOptions.length > 0) {
      setSelectedIds([scenarioOptions[0].id]);
    } else {
      setSelectedIds([]);
    }

    if (typeof window !== 'undefined') {
      try {
        const storedEmail = window.localStorage.getItem(STORAGE_KEY_USER_EMAIL);
        if (storedEmail) setUserEmail(storedEmail);
      } catch {
        // ignore storage errors
      }
    }
  }, [isOpen, defaultSelectedId, scenarioOptions]);

  // Close on Escape key
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

  const scenarioPreviews = useMemo(() => {
    return scenarioOptions.map((opt) => {
      const summary = runUnderwriteModel(opt.inputs);
      const cocPct =
        summary.initialCashInvested > 0
          ? (summary.year1CashFlow / summary.initialCashInvested) * 100
          : 0;
      const monthlyTax = (opt.inputs.purchasePrice * opt.inputs.propertyTaxRate) / 12;
      const monthlyIns = (opt.inputs.purchasePrice * opt.inputs.insuranceRate) / 12;
      const totalMonthlyPitia =
        summary.monthlyPmt + monthlyTax + monthlyIns + (opt.inputs.monthlyHoa || 0);
      const dscr = totalMonthlyPitia > 0 ? summary.totalMonthlyRent / totalMonthlyPitia : 0;
      const aduMult = opt.inputs.unitCount > 1 && opt.inputs.aduCount === 2 ? 2 : 1;
      const aduYr1 = opt.inputs.aduEnabled && (opt.inputs.aduStartMonth ?? 0) < 12;
      const basis =
        (opt.inputs.purchasePrice || 0) +
        (opt.inputs.makeReadyCost || 0) +
        (aduYr1 ? (opt.inputs.aduCost || 0) * aduMult : 0);
      const capRate = basis > 0 ? (summary.year1Noi / basis) * 100 : 0;

      return {
        option: opt,
        summary,
        cocPct,
        dscr,
        totalMonthlyPitia,
        capRate,
      };
    });
  }, [scenarioOptions]);

  if (!isOpen) return null;

  const toggleScenarioId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allSelected =
    scenarioOptions.length > 0 && selectedIds.length === scenarioOptions.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedIds(scenarioOptions.length > 0 ? [scenarioOptions[0].id] : []);
    } else {
      setSelectedIds(scenarioOptions.map((o) => o.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedIds.length === 0) {
      setEmailStatus({
        type: 'error',
        message: 'Please select at least one scenario to email.',
      });
      return;
    }

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

    try {
      window.localStorage.setItem(STORAGE_KEY_USER_EMAIL, trimmedUser);
    } catch {
      // ignore storage errors
    }

    const selectedPayloads = scenarioPreviews
      .filter((item) => selectedIds.includes(item.option.id))
      .map(({ option, summary, cocPct, dscr, totalMonthlyPitia, capRate }) => {
        const inp = option.inputs;
        const shareUrl = buildShareUrlForInputs(inp, option.featuredDeal?.id ?? null);
        const refiNote = inp.refiEnabled
          ? `Year ${inp.refiYear ?? 3} at ${((inp.refiNewRate ?? 0.0625) * 100).toFixed(3)}%`
          : '';
        const aduNote = inp.aduEnabled
          ? `${inp.unitCount > 1 && inp.aduCount === 2 ? '2 ADUs' : '1 ADU'} (+${currencyFmt.format(
              (inp.aduRentMonthly ?? 2200) * (inp.unitCount > 1 && inp.aduCount === 2 ? 2 : 1)
            )}/mo)`
          : '';
        const agentInfo = option.featuredDeal
          ? `${option.featuredDeal.agent.name}${
              option.featuredDeal.agent.brokerage
                ? ` (${option.featuredDeal.agent.brokerage})`
                : ''
            } · ${option.featuredDeal.agent.phone}`
          : '';

        return {
          name: option.name || extractStreetAddress(inp.propertyAddress),
          propertyAddress: inp.propertyAddress || option.name || 'Investment Property',
          unitCount: inp.unitCount,
          purchasePrice: inp.purchasePrice,
          downPaymentPct: inp.downPaymentPct,
          interestRate: inp.interestRate,
          loanAmount: summary.loanAmount,
          initialCashInvested: summary.initialCashInvested,
          totalMonthlyRent: summary.totalMonthlyRent,
          totalMonthlyPitia,
          cocPct,
          year1CashFlow: summary.year1CashFlow,
          dscr,
          year1Noi: summary.year1Noi,
          capRate,
          irr5Pct: summary.fiveYear.irrPct,
          profit5: summary.fiveYear.totalProfit,
          roi5Pct: summary.fiveYear.totalRoiPct,
          irr10Pct: summary.tenYear.irrPct,
          profit10: summary.tenYear.totalProfit,
          roi10Pct: summary.tenYear.totalRoiPct,
          refiNote,
          aduNote,
          agentInfo,
          listingUrl: option.featuredDeal?.listingUrl ?? '',
          shareUrl,
        };
      });

    setEmailSending(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/send-rental-scenario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: trimmedUser,
          otherEmails: parsedOthers,
          shareWithTeam,
          note: emailNote.trim(),
          scenarios: selectedPayloads,
          website: emailHoneypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Unable to send email right now.');
      }
      const recipientSummary = [
        trimmedUser,
        ...parsedOthers,
        ...(shareWithTeam ? ['dsrj@insidermtg.com'] : []),
      ].join(', ');
      setEmailStatus({
        type: 'success',
        message: `✓ Scenario email sent to ${recipientSummary}!`,
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
      className="no-print"
      onClick={() => {
        if (!emailSending) onClose();
      }}
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="ra-email-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          border: '2px solid #060A2D',
          boxShadow: '0 25px 50px -12px rgba(6, 10, 45, 0.45)',
          overflow: 'hidden',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
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
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#EFB51E',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              ✉️ Insider Mortgage
            </div>
            <h3
              id="ra-email-modal-title"
              style={{
                margin: '0.15rem 0 0',
                fontSize: '1.08rem',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              Email Investment Property Analyzer scenario
            </h3>
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
              padding: '0.3rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.95rem',
            overflowY: 'auto',
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

          {/* Scenario Selection */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.35rem',
              }}
            >
              <label
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#060A2D',
                }}
              >
                1. Select Scenarios to Share <span style={{ color: '#DC2626' }}>*</span>
              </label>
              {scenarioOptions.length > 1 && (
                <button
                  type="button"
                  onClick={handleToggleAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0468E9',
                    cursor: 'pointer',
                  }}
                >
                  {allSelected ? 'Select Current Only' : `Select All (${scenarioOptions.length})`}
                </button>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                maxHeight: '165px',
                overflowY: 'auto',
                padding: '0.2rem 0.1rem',
              }}
            >
              {scenarioPreviews.map(({ option, cocPct, summary }) => {
                const isChecked = selectedIds.includes(option.id);
                return (
                  <label
                    key={option.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      backgroundColor: isChecked ? '#EFF6FF' : '#F8FAFC',
                      border: isChecked ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleScenarioId(option.id)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#060A2D',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: '#060A2D',
                          }}
                        >
                          {option.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.08rem 0.42rem',
                            borderRadius: '999px',
                            backgroundColor:
                              option.sourceLabel === 'Current Scenario'
                                ? '#FEF3C7'
                                : '#E2E8F0',
                            color:
                              option.sourceLabel === 'Current Scenario'
                                ? '#92400E'
                                : '#334155',
                          }}
                        >
                          {option.sourceLabel}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: '#64748B',
                          marginTop: '2px',
                        }}
                      >
                        {currencyFmt.format(Math.round(option.inputs.purchasePrice))} ·{' '}
                        {currencyFmt.format(Math.round(summary.totalMonthlyRent))}/mo rent · COC{' '}
                        {cocPct.toFixed(1)}% · 10-Yr IRR {summary.tenYear.irrPct.toFixed(1)}%
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {scenarioOptions.length === 1 && (
              <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '0.3rem' }}>
                Tip: Click &ldquo;Save Scenario&rdquo; on other properties to include multiple saved
                scenarios in one email.
              </div>
            )}
          </div>

          {/* User Email */}
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
              2. Your Email Address <span style={{ color: '#DC2626' }}>*</span>
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

          {/* Other Emails */}
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
              3. Share with Others{' '}
              <span style={{ color: '#64748B', fontWeight: 500 }}>
                (Optional, comma-separated)
              </span>
            </label>
            <input
              type="text"
              value={otherEmails}
              onChange={(e) => setOtherEmails(e.target.value)}
              placeholder="spouse@example.com, advisor@example.com"
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

          {/* Share with David & Rakesh */}
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
                Send a copy to Insider Mortgage for a custom investment property financing review or
                rate quote.
              </span>
            </span>
          </label>

          {/* Optional Note */}
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

          {/* Status Message */}
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

          {/* Action Buttons */}
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
              disabled={emailSending || selectedIds.length === 0}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor:
                  emailSending || selectedIds.length === 0 ? '#64748B' : '#060A2D',
                color: '#EFB51E',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor:
                  emailSending || selectedIds.length === 0 ? 'not-allowed' : 'pointer',
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
