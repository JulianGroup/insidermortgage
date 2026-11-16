'use client';

import React from 'react';
import { UnderwriteInputs, UnderwriteSummary } from '../../../lib/financial-engine';
import { MathMetricKey } from './MathReceiptModal';

interface SummaryKpiCardsProps {
  inputs: UnderwriteInputs;
  summary: UnderwriteSummary;
  isLockedPublic?: boolean;
  onRequestUnlock?: () => void;
  onOpenMath?: (metric: MathMetricKey) => void;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function SummaryKpiCards({
  inputs,
  summary,
  isLockedPublic = false,
  onRequestUnlock,
  onOpenMath,
}: SummaryKpiCardsProps) {
  const monthlyCashFlow = summary.year1CashFlow / 12;
  const monthlyNoi = summary.year1Noi / 12;
  const monthlyPi = summary.monthlyPmt;
  const monthlyPropertyTax = (inputs.purchasePrice * inputs.propertyTaxRate) / 12;
  const monthlyInsurance = (inputs.purchasePrice * inputs.insuranceRate) / 12;
  const monthlyHoaFee = inputs.monthlyHoa || 0;
  const totalMonthlyPitia =
    monthlyPi + monthlyPropertyTax + monthlyInsurance + monthlyHoaFee;
  // DSCR Loan Convention: Gross Monthly Rent / Total Monthly PITIA
  const dscr =
    totalMonthlyPitia > 0
      ? Math.round((summary.totalMonthlyRent / totalMonthlyPitia) * 100) / 100
      : 0;
  const aduMultiplier = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;
  const aduInYear1 = inputs.aduEnabled && (inputs.aduStartMonth ?? 0) < 12;
  const effectiveAduCostYr1 = aduInYear1 ? (inputs.aduCost || 0) * aduMultiplier : 0;
  const basisValue =
    (inputs.purchasePrice || 0) + (inputs.makeReadyCost || 0) + effectiveAduCostYr1;
  const capRate = basisValue > 0 ? (summary.year1Noi / basisValue) * 100 : 0;
  const cocPct =
    summary.initialCashInvested > 0
      ? (summary.year1CashFlow / summary.initialCashInvested) * 100
      : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Investment Overview Hero Card (Always Visible) */}
      <div className="ra-card-navy">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#EFB51E',
                backgroundColor: 'rgba(239, 181, 30, 0.14)',
                border: '1px solid rgba(239, 181, 30, 0.35)',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                marginBottom: '0.4rem',
              }}
            >
              Investment Overview
            </div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
              {inputs.propertyAddress || 'Subject Investment Property'}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#E2E8F0',
              }}
            >
              Total PITIA: <strong style={{ color: '#EFB51E' }}>{currencyFmt.format(Math.round(totalMonthlyPitia))}/mo</strong>
            </span>
          </div>
        </div>

        {/* 4 Core KPI Tiles (2x2 Quadrant) */}
        <div className="ra-kpi-grid">
          {/* Top-Left: Cash on Cash Return */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenMath?.('cash-flow')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenMath?.('cash-flow');
              }
            }}
            title="Tap to see how Cash-on-Cash Return & Year 1 Cash Flow are calculated"
            style={{
              backgroundColor:
                monthlyCashFlow >= 0
                  ? 'rgba(34, 197, 94, 0.14)'
                  : 'rgba(248, 113, 113, 0.14)',
              border:
                monthlyCashFlow >= 0
                  ? '1px solid rgba(74, 222, 128, 0.38)'
                  : '1px solid rgba(248, 113, 113, 0.38)',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#E2E8F0', textTransform: 'uppercase', fontWeight: 700 }}>
                Cash on Cash Return
              </div>
              <span
                className="no-print"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                ∑ Math
              </span>
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: cocPct >= 0 ? '#4ADE80' : '#FCA5A5',
                marginTop: '0.2rem',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '4px',
              }}
            >
              {cocPct.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.3rem' }}>
              CoC = Cash Flow ÷ Cash into Project
            </div>
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: monthlyCashFlow >= 0 ? '#86EFAC' : '#FECACA',
                marginTop: '0.15rem',
              }}
            >
              {currencyFmt.format(Math.round(monthlyCashFlow))}/mo ={' '}
              {currencyFmt.format(Math.round(summary.year1CashFlow))}/yr
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem', lineHeight: 1.35 }}>
              Cash into project: {currencyFmt.format(Math.round(summary.initialCashInvested))} (Down pmt + improvements)
            </div>
          </div>

          {/* Top-Right: DSCR = Rent / PITIA */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenMath?.('dscr')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenMath?.('dscr');
              }
            }}
            title="Tap to see how DSCR is calculated"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>
                DSCR = Rent ÷ PITIA
              </div>
              <span
                className="no-print"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#EFB51E',
                  backgroundColor: 'rgba(239, 181, 30, 0.16)',
                  border: '1px solid rgba(239, 181, 30, 0.35)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                ∑ Math
              </span>
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: dscr >= 1.0 ? '#4ADE80' : '#EFB51E',
                marginTop: '0.2rem',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '4px',
              }}
            >
              {dscr.toFixed(2)}x
            </div>
            <div style={{ fontSize: '0.74rem', color: '#CBD5E1', marginTop: '0.3rem', lineHeight: 1.4 }}>
              {currencyFmt.format(Math.round(summary.totalMonthlyRent))}/mo Rent ÷{' '}
              {currencyFmt.format(Math.round(totalMonthlyPitia))}/mo PITIA
            </div>
          </div>

          {/* Bottom-Left: NOI = Gross Income - Operating Expenses */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenMath?.('noi')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenMath?.('noi');
              }
            }}
            title="Tap to see how Year 1 Net Operating Income is calculated"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.73rem', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>
                NOI = Gross Income − Operating Expenses
              </div>
              <span
                className="no-print"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#EFB51E',
                  backgroundColor: 'rgba(239, 181, 30, 0.16)',
                  border: '1px solid rgba(239, 181, 30, 0.35)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                ∑ Math
              </span>
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#EFB51E',
                marginTop: '0.35rem',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '4px',
              }}
            >
              {currencyFmt.format(Math.round(monthlyNoi))}/mo ={' '}
              {currencyFmt.format(Math.round(summary.year1Noi))}/yr
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.3rem', lineHeight: 1.35 }}>
              Net of vacancy, taxes, insurance, HOA, maintenance &amp; prop mgmt
            </div>
          </div>

          {/* Bottom-Right: CAP RATE = NOI / VALUE */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenMath?.('cap-rate')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenMath?.('cap-rate');
              }
            }}
            title="Tap to see how Cap Rate is calculated"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '12px',
              padding: '1rem',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#CBD5E1', textTransform: 'uppercase', fontWeight: 700 }}>
                Cap Rate = NOI ÷ Value
              </div>
              <span
                className="no-print"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#EFB51E',
                  backgroundColor: 'rgba(239, 181, 30, 0.16)',
                  border: '1px solid rgba(239, 181, 30, 0.35)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                ∑ Math
              </span>
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#EFB51E',
                marginTop: '0.2rem',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '4px',
              }}
            >
              {capRate.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#CBD5E1', marginTop: '0.3rem', lineHeight: 1.35 }}>
              Value is Basis (PP + Costs), not appreciation
            </div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94A3B8', marginTop: '0.15rem' }}>
              Value: {currencyFmt.format(Math.round(basisValue))}
            </div>
          </div>
        </div>
      </div>

      {/* 5-Year & 10-Year Exit Horizon Return Cards */}
      <div style={{ position: 'relative' }}>
        <div className={`ra-horizon-grid ${isLockedPublic ? 'ra-locked-blur' : ''}`}>
          {/* 5-Year Exit Horizon */}
          <div className="ra-card" style={{ border: '2px solid #060A2D' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Medium-Term Exit
                </div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#060A2D' }}>
                  5-Year Horizon Returns
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onOpenMath?.('irr-5')}
                title="Tap to see how 5-Year IRR is calculated"
                style={{
                  backgroundColor: '#060A2D',
                  color: '#EFB51E',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '999px',
                  border: '1px dashed rgba(239, 181, 30, 0.65)',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                  minWidth: '88px',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <span>{summary.fiveYear.irrPct.toFixed(2)}%</span>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>IRR · ∑</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>Projected Year 5 Value:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                  {currencyFmt.format(Math.round(summary.fiveYear.propertyValue))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>Remaining Loan Balance:</span>
                <span style={{ fontWeight: 600, color: '#475569' }}>
                  {currencyFmt.format(Math.round(summary.fiveYear.remainingBalance))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>Net Sale Proceeds (after 5% cost):</span>
                <span style={{ fontWeight: 700, color: '#060A2D' }}>
                  {currencyFmt.format(Math.round(summary.fiveYear.netSaleProceeds))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>5-Yr Cumulative Cash Flow:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: summary.fiveYear.cumulativeCashFlow >= 0 ? '#15803D' : '#B91C1C',
                  }}
                >
                  {currencyFmt.format(Math.round(summary.fiveYear.cumulativeCashFlow))}
                </span>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenMath?.('profit-5')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenMath?.('profit-5');
                  }
                }}
                title="Tap to see how Net 5-Year Profit & ROI are calculated"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingTop: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: 700, color: '#060A2D' }}>
                  Net 5-Yr Lifetime Profit:{' '}
                  <span
                    className="no-print"
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#0468E9',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      padding: '0.08rem 0.35rem',
                      borderRadius: '4px',
                      marginLeft: '0.25rem',
                      verticalAlign: 'middle',
                    }}
                  >
                    ∑ Math
                  </span>
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#15803D',
                      lineHeight: 1.2,
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {currencyFmt.format(Math.round(summary.fiveYear.totalProfit))}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                    {summary.fiveYear.totalRoiPct.toFixed(1)}% ROI
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 10-Year Exit Horizon */}
          <div className="ra-card" style={{ border: '2px solid #060A2D' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.9rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0468E9', textTransform: 'uppercase' }}>
                  Long-Term Wealth Horizon
                </div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#060A2D' }}>
                  10-Year Horizon Returns
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onOpenMath?.('irr-10')}
                title="Tap to see how 10-Year IRR is calculated"
                style={{
                  backgroundColor: '#EFB51E',
                  color: '#060A2D',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '999px',
                  border: '1px dashed #060A2D',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.2,
                  minWidth: '88px',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <span>{summary.tenYear.irrPct.toFixed(2)}%</span>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>IRR · ∑</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>Projected Year 10 Value:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                  {currencyFmt.format(Math.round(summary.tenYear.propertyValue))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>Remaining Loan Balance:</span>
                <span style={{ fontWeight: 600, color: '#475569' }}>
                  {currencyFmt.format(Math.round(summary.tenYear.remainingBalance))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>Net Sale Proceeds (after 5% cost):</span>
                <span style={{ fontWeight: 700, color: '#060A2D' }}>
                  {currencyFmt.format(Math.round(summary.tenYear.netSaleProceeds))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #E2E8F0', paddingBottom: '0.45rem' }}>
                <span style={{ color: '#64748B' }}>10-Yr Cumulative Cash Flow:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: summary.tenYear.cumulativeCashFlow >= 0 ? '#15803D' : '#B91C1C',
                  }}
                >
                  {currencyFmt.format(Math.round(summary.tenYear.cumulativeCashFlow))}
                </span>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenMath?.('profit-10')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenMath?.('profit-10');
                  }
                }}
                title="Tap to see how Net 10-Year Profit & ROI are calculated"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  paddingTop: '0.35rem',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: 700, color: '#060A2D' }}>
                  Net 10-Yr Lifetime Profit:{' '}
                  <span
                    className="no-print"
                    style={{
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#0468E9',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      padding: '0.08rem 0.35rem',
                      borderRadius: '4px',
                      marginLeft: '0.25rem',
                      verticalAlign: 'middle',
                    }}
                  >
                    ∑ Math
                  </span>
                </span>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#15803D',
                      lineHeight: 1.2,
                      textDecoration: 'underline',
                      textDecorationStyle: 'dotted',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {currencyFmt.format(Math.round(summary.tenYear.totalProfit))}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#15803D', marginTop: '2px' }}>
                    {summary.tenYear.totalRoiPct.toFixed(1)}% ROI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Teaser Lock Overlay on 5-Yr / 10-Yr Return Cards */}
        {isLockedPublic && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(3px)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #060A2D',
                borderRadius: '16px',
                padding: '1.35rem 1.75rem',
                maxWidth: '460px',
                boxShadow: '0 20px 30px -10px rgba(6, 10, 45, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#0468E9',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.35rem',
                }}
              >
                5-Year &amp; 10-Year IRR + Equity Projection Ready
              </div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#060A2D' }}>
                Unlock Full 10-Year Pro-Forma, IRR &amp; ADU/Refi Report
              </h4>
              <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                See your exact 5-year and 10-year Internal Rate of Return (IRR), net sale proceeds,
                and interactive ADU &amp; Refinance scenarios.
              </p>
              <button
                type="button"
                onClick={onRequestUnlock}
                style={{
                  backgroundColor: '#EFB51E',
                  color: '#060A2D',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  padding: '0.7rem 1.4rem',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 181, 30, 0.4)',
                }}
              >
                Unlock Full 10-Year Pro-Forma &amp; PDF →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
