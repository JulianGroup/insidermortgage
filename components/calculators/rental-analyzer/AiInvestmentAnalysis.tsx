'use client';

import React, { useMemo } from 'react';
import {
  UnderwriteInputs,
  UnderwriteSummary,
  runUnderwriteModel,
} from '../../../lib/financial-engine';

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

    // Simulate counterfactual Refi & ADU if not currently enabled so AI can quantify upside
    const refiSim = !inputs.refiEnabled
      ? runUnderwriteModel({
          ...inputs,
          refiEnabled: true,
          refiYear: inputs.refiYear ?? 3,
          refiNewRate: inputs.refiNewRate ?? 0.0625,
          refiReset30: true,
        })
      : null;

    const aduSim = !inputs.aduEnabled
      ? runUnderwriteModel({
          ...inputs,
          aduEnabled: true,
          aduCount: inputs.unitCount > 1 ? (inputs.aduCount ?? 1) : 1,
          aduCost: inputs.aduCost ?? 200000,
          aduRentMonthly: inputs.aduRentMonthly ?? 2200,
          aduConstructionMonths: inputs.aduConstructionMonths ?? 6,
          aduMainRentDiscountPct: inputs.aduMainRentDiscountPct ?? 0.25,
        })
      : null;

    // Deal classification
    let badgeText = 'Appreciation & Equity Compounder';
    let badgeColor = '#0468E9';
    let badgeBg = 'rgba(4, 104, 233, 0.12)';

    if (price === 0 || summary.totalMonthlyRent === 0) {
      badgeText = 'Awaiting Property Inputs';
      badgeColor = '#64748B';
      badgeBg = '#F1F5F9';
    } else if (monthlyCf >= 250 && summary.tenYear.irrPct >= 10) {
      badgeText = 'Strong Cash-Flow & High-IRR Core Asset';
      badgeColor = '#15803D';
      badgeBg = '#DCFCE7';
    } else if (monthlyCf >= 0) {
      badgeText = 'Self-Sustaining Positive Cash-Flow Hold';
      badgeColor = '#15803D';
      badgeBg = '#DCFCE7';
    } else if (summary.tenYear.irrPct >= 6.5) {
      badgeText = 'Coastal Equity & Appreciation Compounder';
      badgeColor = '#0468E9';
      badgeBg = '#DBEAFE';
    } else {
      badgeText = 'Yield-Constrained — Value-Add / Refi Candidate';
      badgeColor = '#B45309';
      badgeBg = '#FEF3C7';
    }

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
      aduSim,
      badgeText,
      badgeColor,
      badgeBg,
      principalPaydown10Yr,
    };
  }, [inputs, summary]);

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
              AI Investment Underwriting Analysis
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Automated deal synthesis across cash flow, DSCR coverage, 10-year equity, and value-add levers
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
            Enter a <strong>Purchase Price</strong> and <strong>Unit Expected Rents</strong> in Step 1 &amp; Step 2 to generate your custom AI underwriting memo.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* 1. Executive Deal Summary */}
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
                1. Executive Underwriting Verdict
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.55 }}>
                At an acquisition price of <strong>{currencyFmt.format(inputs.purchasePrice)}</strong> (
                <strong>{currencyFmt.format(summary.initialCashInvested)}</strong> initial capital outlay) and{' '}
                <strong>{currencyFmt.format(summary.totalMonthlyRent)}/mo</strong> in scheduled rent across{' '}
                <strong>
                  {inputs.unitCount} {inputs.unitCount === 1 ? 'unit' : 'units'}
                </strong>
                , this property generates a Year 1 Net Operating Income (NOI) of{' '}
                <strong>{currencyFmt.format(Math.round(summary.year1Noi))}/yr</strong> (an unlevered{' '}
                <strong>{analysis.capRate.toFixed(2)}% Cap Rate</strong>). Over a 10-year hold, compounding appreciation and loan amortization project{' '}
                <strong style={{ color: '#15803D' }}>
                  {currencyFmt.format(Math.round(summary.tenYear.totalProfit))}
                </strong>{' '}
                in net lifetime profit (<strong>{summary.tenYear.totalRoiPct.toFixed(1)}% Total ROI</strong> /{' '}
                <strong>{summary.tenYear.irrPct.toFixed(2)}% annualized IRR</strong>).
              </p>
            </div>

            {/* 2. Cash Flow, DSCR & Break-Even Horizon */}
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
                  marginBottom: '0.25rem',
                }}
              >
                2. Debt Service Coverage (DSCR) &amp; Cash-Flow Trajectory
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.55 }}>
                Year 1 net cash flow is{' '}
                <strong style={{ color: analysis.monthlyCf >= 0 ? '#15803D' : '#B91C1C' }}>
                  {currencyFmt.format(Math.round(analysis.monthlyCf))}/mo
                </strong>{' '}
                ({currencyFmt.format(Math.round(summary.year1CashFlow))}/yr) with a{' '}
                <strong>{analysis.dscr.toFixed(2)}x DSCR (Gross Rent ÷ Monthly PITIA)</strong> (
                {analysis.cashOnCashYr1.toFixed(1)}% Year 1 Cash-on-Cash return).{' '}
                {analysis.dscr >= 1.25
                  ? 'Strong debt service coverage exceeding prime 1.20x–1.25x investor loan qualification benchmarks.'
                  : analysis.dscr >= 1.0
                  ? 'Satisfies standard 1.00x DSCR break-even investor loan qualification guidelines.'
                  : `Qualifies via liquidity reserves, blended portfolio cash flows, or specialized low/no-ratio investor loan programs ($${currencyFmt.format(Math.round(Math.max(0, analysis.totalMonthlyPitia - summary.totalMonthlyRent)))}/mo initial deficit against PITIA).`}{' '}
                {analysis.monthlyCf >= 0 ? (
                  <>
                    The property is <strong>cash-flow positive from Day 1</strong>, comfortably covering all operating expenses and debt service while growing net cash flow to{' '}
                    <strong>
                      {currencyFmt.format(Math.round(summary.schedule[9].netCashFlow / 12))}/mo
                    </strong>{' '}
                    by Year 10.
                  </>
                ) : analysis.breakEvenYear ? (
                  <>
                    With {(inputs.annualRentGrowth * 100).toFixed(1)}% annual rent growth, operating cash flow crosses break-even in{' '}
                    <strong>Year {analysis.breakEvenYear}</strong> (reaching{' '}
                    <strong>
                      {currencyFmt.format(Math.round(summary.schedule[9].netCashFlow / 12))}/mo
                    </strong>{' '}
                    by Year 10).
                  </>
                ) : (
                  <>
                    At {(inputs.interestRate * 100).toFixed(2)}% financing and{' '}
                    {Math.round(inputs.downPaymentPct * 100)}% down, the property carries an annual cash-flow shortfall through Year 10—making it a candidate for a future rate refinance, higher down payment, or ADU rent expansion.
                  </>
                )}
              </p>
            </div>

            {/* 3. 5-Year vs. 10-Year Wealth Decomposition */}
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
                  marginBottom: '0.25rem',
                }}
              >
                3. 5-Year vs. 10-Year Equity &amp; Return Profile
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.55 }}>
                Exiting at <strong>Year 5</strong> yields{' '}
                <strong>{currencyFmt.format(Math.round(summary.fiveYear.netSaleProceeds))}</strong> in net sale proceeds (after {(inputs.sellingCostPct * 100).toFixed(1)}% selling costs) and a{' '}
                <strong>{summary.fiveYear.irrPct.toFixed(2)}% IRR</strong>. Holding through{' '}
                <strong>Year 10</strong> expands annualized IRR to{' '}
                <strong>{summary.tenYear.irrPct.toFixed(2)}%</strong> as tenant-funded amortization pays down{' '}
                <strong>{currencyFmt.format(Math.round(analysis.principalPaydown10Yr))}</strong> of loan principal and {(inputs.annualAppreciation * 100).toFixed(1)}% annual appreciation lifts asset value to{' '}
                <strong>{currencyFmt.format(Math.round(summary.tenYear.propertyValue))}</strong>.
              </p>
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
                4. AI Optimization &amp; Value-Add Opportunities
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

                {inputs.aduEnabled ? (
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
                ) : (
                  analysis.aduSim && (
                    <li>
                      <strong>California ADU Expansion Potential:</strong> Adding a{' '}
                      {currencyFmt.format(inputs.aduCost ?? 200000)} detached ADU generating{' '}
                      {currencyFmt.format(inputs.aduRentMonthly ?? 2200)}/mo (in Box 5) would increase Year 2+ NOI to{' '}
                      <strong>
                        {currencyFmt.format(Math.round(analysis.aduSim.schedule[1].noi))}/yr
                      </strong>{' '}
                      and shift 10-Year IRR to{' '}
                      <strong>{analysis.aduSim.tenYear.irrPct.toFixed(2)}%</strong>.
                    </li>
                  )
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
            ✦ Unlock Box 6 AI Underwriting Analysis &amp; 10-Yr Pro-Forma
          </button>
        </div>
      )}
    </div>
  );
}
