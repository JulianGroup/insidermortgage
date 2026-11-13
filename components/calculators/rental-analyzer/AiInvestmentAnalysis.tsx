'use client';

import React, { useMemo } from 'react';
import {
  UnderwriteInputs,
  UnderwriteSummary,
  runUnderwriteModel,
} from '../../../lib/financial-engine';
import { getDealClassification } from './dealClassifier';
import { computeUnderwritingInsights } from './underwritingInsights';

interface AiInvestmentAnalysisProps {
  inputs: UnderwriteInputs;
  summary: UnderwriteSummary;
  isLockedPublic?: boolean;
  onRequestUnlock?: () => void;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function AiInvestmentAnalysis({
  inputs,
  summary,
  isLockedPublic = false,
  onRequestUnlock,
}: AiInvestmentAnalysisProps) {
  const analysis = useMemo(() => {
    const price = inputs.purchasePrice || 0;
    const monthlyNoi = summary.year1Noi / 12;
    const monthlyCf = summary.year1CashFlow / 12;
    const capRate = price > 0 ? (summary.year1Noi / price) * 100 : 0;

    const monthlyPi = summary.monthlyPmt;
    const monthlyPropertyTax = (price * inputs.propertyTaxRate) / 12;
    const monthlyInsurance = (price * inputs.insuranceRate) / 12;
    const monthlyHoaFee = inputs.monthlyHoa || 0;
    const totalMonthlyPitia =
      monthlyPi + monthlyPropertyTax + monthlyInsurance + monthlyHoaFee;
    // Standard Residential DSCR Loan Convention: Gross Monthly Rent / Total Monthly PITIA
    const dscr = totalMonthlyPitia > 0 ? summary.totalMonthlyRent / totalMonthlyPitia : 0;

    const cashOnCashYr1 =
      summary.initialCashInvested > 0
        ? (summary.year1CashFlow / summary.initialCashInvested) * 100
        : 0;

    // Find first positive cash-flow year in schedule
    const breakEvenRow = summary.schedule.find((r) => r.netCashFlow >= 0);
    const breakEvenYear = breakEvenRow ? breakEvenRow.year : null;

    // Simulate counterfactual Refi if not currently enabled
    const refiSim = !inputs.refiEnabled
      ? runUnderwriteModel({
          ...inputs,
          refiEnabled: true,
          refiYear: inputs.refiYear ?? 3,
          refiNewRate: inputs.refiNewRate ?? 0.0625,
          refiReset30: true,
        })
      : null;

    // Dynamic Deal Classification Tagline
    const { badgeText, badgeColor, badgeBg } = getDealClassification({
      purchasePrice: price,
      totalMonthlyRent: summary.totalMonthlyRent,
      monthlyCf,
      dscr: Math.round(dscr * 100) / 100,
      totalMonthlyPitia,
      tenYearIrrPct: summary.tenYear.irrPct,
      breakEvenYear,
    });

    const principalPaydown10Yr = Math.max(
      0,
      summary.loanAmount - summary.tenYear.remainingBalance
    );

    return {
      price,
      monthlyNoi,
      monthlyCf,
      capRate,
      dscr,
      totalMonthlyPitia,
      cashOnCashYr1,
      breakEvenYear,
      refiSim,
      badgeText,
      badgeColor,
      badgeBg,
      principalPaydown10Yr,
    };
  }, [inputs, summary]);

  const insights = useMemo(
    () => computeUnderwritingInsights(inputs, summary),
    [inputs, summary]
  );

  return (
    <div className="ra-card" style={{ position: 'relative', border: '2px solid #060A2D' }}>
      {/* Header Row with Box 6 Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.65rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            6
          </span>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#060A2D', margin: 0 }}>
              Investment Underwriting Analysis
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Holding cost, break-even levers, and appreciation stress test
            </div>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            backgroundColor: analysis.badgeBg,
            color: analysis.badgeColor,
            letterSpacing: '0.02em',
          }}
        >
          ✦ {analysis.badgeText}
        </span>
      </div>

      {/* Main AI Synthesis Body */}
      <div className={isLockedPublic ? 'ra-locked-blur' : ''}>
        {analysis.price === 0 || summary.totalMonthlyRent === 0 ? (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
              color: '#475569',
              fontSize: '0.9rem',
            }}
          >
            Enter a <strong>Purchase Price</strong> and <strong>Unit Expected Rents</strong> in Step 1 &amp; Step 2 to generate your custom underwriting memo.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* 1. Verdict: What It Costs to Hold */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderLeft: '4px solid #060A2D',
                borderRadius: '0 10px 10px 0',
                padding: '0.9rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#060A2D',
                  letterSpacing: '0.04em',
                  marginBottom: '0.25rem',
                }}
              >
                1. Verdict: What It Costs to Hold
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#060A2D', marginBottom: '0.3rem' }}>
                {insights.verdictHeadline}
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.55 }}>
                {insights.verdictText}
              </p>
            </div>

            {/* 2. What It Would Take to Cash-Flow */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderLeft: '4px solid #0468E9',
                borderRadius: '0 10px 10px 0',
                padding: '0.9rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#0468E9',
                  letterSpacing: '0.04em',
                  marginBottom: '0.4rem',
                }}
              >
                2. What It Would Take
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {insights.levers.map((l) => (
                  <div
                    key={l.label}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(150px, 1.1fr) auto minmax(140px, 1.4fr)',
                      gap: '0.6rem',
                      alignItems: 'baseline',
                      fontSize: '0.86rem',
                      color: '#1E293B',
                      paddingBottom: '0.3rem',
                      borderBottom: '1px dashed #E2E8F0',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{l.label}</span>
                    <strong style={{ color: '#060A2D', textAlign: 'right' }}>{l.value}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{l.note}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Stress Test: Appreciation Dependence */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderLeft: '4px solid #15803D',
                borderRadius: '0 10px 10px 0',
                padding: '0.9rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#15803D',
                  letterSpacing: '0.04em',
                  marginBottom: '0.3rem',
                }}
              >
                3. Stress Test: How Much Depends on Appreciation
              </div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.86rem', color: '#1E293B', lineHeight: 1.5 }}>
                10-year gains: appreciation{' '}
                <strong>{currencyFmt.format(Math.round(insights.profitSources.appreciation))}</strong>, loan paydown{' '}
                <strong>{currencyFmt.format(Math.round(insights.profitSources.principalPaydown))}</strong>, cash flow{' '}
                <strong style={{ color: insights.profitSources.cashFlow >= 0 ? '#15803D' : '#B91C1C' }}>
                  {currencyFmt.format(Math.round(insights.profitSources.cashFlow))}
                </strong>
                , less selling &amp; make-ready costs{' '}
                <strong>{currencyFmt.format(Math.round(insights.profitSources.frictionCosts))}</strong>.{' '}
                <strong>{insights.profitSources.appreciationSharePct.toFixed(0)}%</strong> of gains come from appreciation.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.25rem 0', fontWeight: 700 }}>Annual appreciation</th>
                    <th style={{ padding: '0.25rem 0', fontWeight: 700, textAlign: 'right' }}>10-yr profit</th>
                    <th style={{ padding: '0.25rem 0', fontWeight: 700, textAlign: 'right' }}>10-yr IRR</th>
                  </tr>
                </thead>
                <tbody>
                  {insights.stress.map((s) => (
                    <tr key={s.label} style={{ borderTop: '1px dashed #E2E8F0' }}>
                      <td style={{ padding: '0.25rem 0' }}>{s.label}</td>
                      <td
                        style={{
                          padding: '0.25rem 0',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: s.totalProfit >= 0 ? '#15803D' : '#B91C1C',
                        }}
                      >
                        {currencyFmt.format(Math.round(s.totalProfit))}
                      </td>
                      <td style={{ padding: '0.25rem 0', textAlign: 'right', fontWeight: 700 }}>
                        {s.irrPct === null ? 'n/m' : `${s.irrPct.toFixed(2)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Strategic Value-Add Recommendations (Refi & ADU) */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderLeft: '4px solid #EFB51E',
                borderRadius: '0 10px 10px 0',
                padding: '0.9rem 1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#92400E',
                  letterSpacing: '0.04em',
                  marginBottom: '0.25rem',
                }}
              >
                4. Value-Add Opportunities
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.15rem',
                  fontSize: '0.86rem',
                  color: '#1E293B',
                  lineHeight: 1.55,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}
              >
                {inputs.refiEnabled ? (
                  <li>
                    <strong>Refinance Active (Year {inputs.refiYear ?? 3}):</strong> Refinancing into{' '}
                    {((inputs.refiNewRate ?? 0.0625) * 100).toFixed(3)}% improves Year{' '}
                    {(inputs.refiYear ?? 3) + 1} cash flow to{' '}
                    <strong>
                      {currencyFmt.format(
                        Math.round(
                          (summary.schedule[inputs.refiYear ?? 3]?.netCashFlow ?? 0) / 12
                        )
                      )}
                      /mo
                    </strong>{' '}
                    and supports a <strong>{summary.tenYear.irrPct.toFixed(2)}% 10-Yr IRR</strong>.
                  </li>
                ) : (
                  analysis.refiSim && (
                    <li>
                      <strong>Rate-Drop Refinance Upside:</strong> Enabling a Year{' '}
                      {inputs.refiYear ?? 3} refinance at{' '}
                      {((inputs.refiNewRate ?? 0.0625) * 100).toFixed(2)}% (in Box 5) would boost 10-Year Total Profit by{' '}
                      <strong style={{ color: '#15803D' }}>
                        +
                        {currencyFmt.format(
                          Math.round(
                            analysis.refiSim.tenYear.totalProfit - summary.tenYear.totalProfit
                          )
                        )}
                      </strong>{' '}
                      and lift 10-Year IRR from{' '}
                      <strong>{summary.tenYear.irrPct.toFixed(2)}%</strong> to{' '}
                      <strong>{analysis.refiSim.tenYear.irrPct.toFixed(2)}%</strong>.
                    </li>
                  )
                )}

                {inputs.aduEnabled && (
                  <li>
                    <strong>California ADU Value-Add Active:</strong> Adding{' '}
                    {inputs.unitCount > 1 && inputs.aduCount === 2 ? '2 detached ADUs' : '1 ADU'} contributes{' '}
                    <strong>
                      {currencyFmt.format(
                        (inputs.aduRentMonthly ?? 2200) *
                          (inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1)
                      )}
                      /mo
                    </strong>{' '}
                    in stabilized supplemental rent and expands Year 10 property valuation to{' '}
                    <strong>{currencyFmt.format(Math.round(summary.tenYear.propertyValue))}</strong>.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Public Teaser Lock Overlay */}
      {isLockedPublic && (
        <div
          style={{
            position: 'absolute',
            inset: '4.25rem 0 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.68)',
            backdropFilter: 'blur(3px)',
            borderRadius: '0 0 16px 16px',
            padding: '1.25rem',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={onRequestUnlock}
            style={{
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              padding: '0.75rem 1.4rem',
              borderRadius: '999px',
              border: '2px solid #EFB51E',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(6, 10, 45, 0.22)',
            }}
          >
            ✦ Unlock Box 6 Underwriting Analysis &amp; 10-Yr Pro-Forma
          </button>
        </div>
      )}
    </div>
  );
}
