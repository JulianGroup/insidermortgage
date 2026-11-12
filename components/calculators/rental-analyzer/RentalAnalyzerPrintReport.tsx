'use client';

import React, { useMemo } from 'react';
import {
  UnderwriteInputs,
  UnderwriteSummary,
  runUnderwriteModel,
  computeMortgagePmt,
} from '../../../lib/financial-engine';
import { detectPropertyState } from './stateDetector';

interface RentalAnalyzerPrintReportProps {
  inputs: UnderwriteInputs;
  summary: UnderwriteSummary;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function RentalAnalyzerPrintReport({
  inputs,
  summary,
}: RentalAnalyzerPrintReportProps) {
  const stateInfo = useMemo(
    () => detectPropertyState(inputs.propertyAddress),
    [inputs.propertyAddress]
  );

  const price = inputs.purchasePrice || 0;
  const downPaymentDollar = Math.round(price * inputs.downPaymentPct);
  const loanAmountDollar = Math.round(price - downPaymentDollar);

  // PITIA computation
  const monthlyPi = computeMortgagePmt(
    loanAmountDollar,
    inputs.interestRate,
    inputs.loanTermYears || 30
  );
  const monthlyPropertyTax = (price * inputs.propertyTaxRate) / 12;
  const monthlyInsurance = (price * inputs.insuranceRate) / 12;
  const monthlyHoaFee = inputs.monthlyHoa || 0;
  const totalMonthlyPitia =
    monthlyPi + monthlyPropertyTax + monthlyInsurance + monthlyHoaFee;

  const monthlyNoi = summary.year1Noi / 12;
  const monthlyCf = summary.year1CashFlow / 12;
  const capRate = price > 0 ? (summary.year1Noi / price) * 100 : 0;
  // Standard Residential DSCR Loan Convention: Gross Monthly Rent / Total Monthly PITIA
  const dscr = totalMonthlyPitia > 0 ? summary.totalMonthlyRent / totalMonthlyPitia : 0;
  const cashOnCashYr1 =
    summary.initialCashInvested > 0
      ? (summary.year1CashFlow / summary.initialCashInvested) * 100
      : 0;

  // Counterfactual simulations for AI narrative
  const refiSim = useMemo(() => {
    if (inputs.refiEnabled) return null;
    return runUnderwriteModel({
      ...inputs,
      refiEnabled: true,
      refiYear: inputs.refiYear ?? 3,
      refiNewRate: inputs.refiNewRate ?? 0.0625,
      refiReset30: true,
    });
  }, [inputs]);

  const aduSim = useMemo(() => {
    if (inputs.aduEnabled) return null;
    return runUnderwriteModel({
      ...inputs,
      aduEnabled: true,
      aduCount: inputs.unitCount > 1 ? (inputs.aduCount ?? 1) : 1,
      aduCost: inputs.aduCost ?? 200000,
      aduRentMonthly: inputs.aduRentMonthly ?? 2200,
      aduConstructionMonths: inputs.aduConstructionMonths ?? 6,
      aduMainRentDiscountPct: inputs.aduMainRentDiscountPct ?? 0.25,
    });
  }, [inputs]);

  // Deal classification
  let badgeText = 'Coastal Equity & Appreciation Compounder';
  let badgeColor = '#0468E9';
  let badgeBg = '#EFF6FF';

  if (price === 0 || summary.totalMonthlyRent === 0) {
    badgeText = 'Property Underwriting Benchmark';
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

  const unitTypeLabel =
    inputs.unitCount === 1
      ? 'Single-Family Home'
      : inputs.unitCount === 2
      ? 'Duplex (2 Units)'
      : inputs.unitCount === 3
      ? 'Triplex (3 Units)'
      : 'Fourplex (4 Units)';

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="ra-print-report" aria-hidden="true">
      {/* ============================================================== */}
      {/* PAGE 1: EXECUTIVE UNDERWRITING OVERVIEW & WEALTH HORIZONS      */}
      {/* ============================================================== */}
      <section className="ra-print-page ra-print-page-1">
        {/* Header Bar */}
        <header className="ra-print-header">
          <div className="ra-print-brand-col">
            <div className="ra-print-logo-row">
              <span className="ra-print-brand-name">INSIDER MORTGAGE</span>
              <span className="ra-print-brand-tag">UNDERWRITING ENGINE</span>
            </div>
            <div className="ra-print-report-title">
              1–4 Unit Rental Property &amp; ADU Investment Analysis
            </div>
          </div>
          <div className="ra-print-meta-col">
            <div className="ra-print-address">
              {inputs.propertyAddress || 'Subject Investment Property'}
            </div>
            <div className="ra-print-submeta">
              <span className="ra-print-meta-pill">{unitTypeLabel}</span>
              {inputs.aduEnabled && (
                <span className="ra-print-meta-pill gold">+ Detached ADU</span>
              )}
              <span className="ra-print-meta-date">{formattedDate}</span>
            </div>
          </div>
        </header>

        {/* 3-Column Top Grid: Rent Schedule | Financing | Expenses */}
        <div className="ra-print-grid-3">
          {/* Col 1: Rent Schedule */}
          <div className="ra-print-panel">
            <div className="ra-print-panel-title">
              <span className="ra-print-num-badge">1</span>
              <span>Unit Rent Schedule</span>
            </div>
            <table className="ra-print-mini-table">
              <tbody>
                {inputs.units.map((unit, idx) => (
                  <tr key={unit.id || idx}>
                    <td className="ra-print-unit-lbl">
                      {unit.label || `Unit ${idx + 1}`}
                    </td>
                    <td className="ra-print-unit-val">
                      {currencyFmt.format(unit.monthlyRent || 0)}/mo
                    </td>
                  </tr>
                ))}
                {inputs.aduEnabled && (
                  <tr className="ra-print-highlight-row">
                    <td className="ra-print-unit-lbl">
                      Detached ADU ({inputs.aduCount === 2 ? '2 Units' : '1 Unit'})
                    </td>
                    <td className="ra-print-unit-val">
                      +{currencyFmt.format((inputs.aduRentMonthly ?? 2200) * (inputs.aduCount === 2 ? 2 : 1))}/mo
                    </td>
                  </tr>
                )}
                <tr className="ra-print-total-row">
                  <td>Total Scheduled Gross Rent</td>
                  <td className="ra-print-total-val">
                    {currencyFmt.format(summary.totalMonthlyRent)}/mo
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="ra-print-panel-foot">
              Annual GSR: {currencyFmt.format(summary.totalMonthlyRent * 12)}/yr
            </div>
          </div>

          {/* Col 2: Acquisition & Loan Terms */}
          <div className="ra-print-panel">
            <div className="ra-print-panel-title">
              <span className="ra-print-num-badge">2</span>
              <span>Acquisition &amp; Financing</span>
            </div>
            <div className="ra-print-kv-list">
              <div className="ra-print-kv">
                <span>Purchase Price</span>
                <strong>{currencyFmt.format(inputs.purchasePrice)}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Down Payment ({Math.round(inputs.downPaymentPct * 100)}%)</span>
                <strong>{currencyFmt.format(downPaymentDollar)}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Loan Amount (30-Yr Fixed)</span>
                <strong>{currencyFmt.format(loanAmountDollar)}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Interest Rate</span>
                <strong>{(inputs.interestRate * 100).toFixed(3)}%</strong>
              </div>
              <div className="ra-print-kv">
                <span>Make-Ready / Rehab Budget</span>
                <strong>{currencyFmt.format(inputs.makeReadyCost)}</strong>
              </div>
              <div className="ra-print-kv ra-print-kv-total">
                <span>Total Cash Invested</span>
                <strong className="ra-print-accent-text">
                  {currencyFmt.format(summary.initialCashInvested)}
                </strong>
              </div>
            </div>
          </div>

          {/* Col 3: Initial Monthly PITIA Breakdown Box */}
          <div className="ra-print-pitia-box">
            <div className="ra-print-pitia-head">
              <div>
                <div className="ra-print-pitia-sub">Monthly Housing Payment Breakdown</div>
                <div className="ra-print-pitia-title">Initial Monthly PITIA</div>
              </div>
              <div className="ra-print-pitia-badge">
                {currencyFmt.format(Math.round(totalMonthlyPitia))}
                <span className="ra-print-pitia-mo">/mo</span>
              </div>
            </div>

            {/* Color-Coded Segmented Progress Bar */}
            {totalMonthlyPitia > 0 && (
              <div className="ra-print-pitia-bar">
                <div
                  style={{
                    width: `${(monthlyPi / totalMonthlyPitia) * 100}%`,
                    backgroundColor: '#060A2D',
                  }}
                  title="P&I"
                />
                <div
                  style={{
                    width: `${(monthlyPropertyTax / totalMonthlyPitia) * 100}%`,
                    backgroundColor: '#0468E9',
                  }}
                  title="Taxes"
                />
                <div
                  style={{
                    width: `${(monthlyInsurance / totalMonthlyPitia) * 100}%`,
                    backgroundColor: '#EFB51E',
                  }}
                  title="Insurance"
                />
                {monthlyHoaFee > 0 && (
                  <div
                    style={{
                      width: `${(monthlyHoaFee / totalMonthlyPitia) * 100}%`,
                      backgroundColor: '#10B981',
                    }}
                    title="HOA"
                  />
                )}
              </div>
            )}

            {/* 4 Line Items with Colored Dots */}
            <div className="ra-print-pitia-items">
              <div className="ra-print-pitia-item">
                <span className="ra-print-pitia-item-label">
                  <span className="ra-print-dot dot-navy" />
                  Principal &amp; Interest (P&amp;I)
                </span>
                <strong>{currencyFmt.format(Math.round(monthlyPi))}/mo</strong>
              </div>

              <div className="ra-print-pitia-item">
                <span className="ra-print-pitia-item-label">
                  <span className="ra-print-dot dot-blue" />
                  Property Taxes ({(inputs.propertyTaxRate * 100).toFixed(2)}%)
                </span>
                <strong>{currencyFmt.format(Math.round(monthlyPropertyTax))}/mo</strong>
              </div>

              <div className="ra-print-pitia-item">
                <span className="ra-print-pitia-item-label">
                  <span className="ra-print-dot dot-gold" />
                  Home Insurance ({(inputs.insuranceRate * 100).toFixed(2)}%)
                </span>
                <strong>{currencyFmt.format(Math.round(monthlyInsurance))}/mo</strong>
              </div>

              <div className="ra-print-pitia-item">
                <span className="ra-print-pitia-item-label">
                  <span className="ra-print-dot dot-green" />
                  HOA / Association Fees
                </span>
                <strong>{currencyFmt.format(monthlyHoaFee)}/mo</strong>
              </div>
            </div>

            <div className="ra-print-pitia-annual">
              <span>Annualized Total PITIA:</span>
              <strong>{currencyFmt.format(Math.round(totalMonthlyPitia * 12))}/yr</strong>
            </div>
          </div>
        </div>

        {/* Year 1 Operating Snapshot (Clean Executive Card - Light Background & 2-Column Design) */}
        <div className="ra-print-hero-card light">
          <div className="ra-print-hero-header light">
            <div className="ra-print-hero-badge dark">YEAR 1 OPERATING SNAPSHOT</div>
            <div className="ra-print-hero-ratios dark">
              <span>
                Unlevered Cap Rate: <strong>{capRate.toFixed(2)}%</strong>
              </span>
              <span className="ra-print-dot-sep">·</span>
              <span>
                DSCR (Rent / PITIA): <strong>{dscr.toFixed(2)}x</strong>
              </span>
              <span className="ra-print-dot-sep">·</span>
              <span>
                Cash-on-Cash Return: <strong>{cashOnCashYr1.toFixed(1)}%</strong>
              </span>
            </div>
          </div>

          {/* 2-Column (2x2) Grid Design for Maximum Readability and Vertical Balance */}
          <div className="ra-print-hero-kpis two-col">
            {/* Col 1, Row 1: Year 1 NOI */}
            <div className="ra-print-kpi-box light accent-green">
              <div className="ra-print-kpi-label dark">Year 1 Net Operating Income (NOI)</div>
              <div className="ra-print-kpi-val green">{currencyFmt.format(Math.round(summary.year1Noi))}/yr</div>
              <div className="ra-print-kpi-sub dark">{currencyFmt.format(Math.round(monthlyNoi))}/mo after mgmt, maintenance (${inputs.monthlyMaintenance ?? 200}/mo), taxes &amp; ins</div>
            </div>

            {/* Col 2, Row 1: Annual Debt Service */}
            <div className="ra-print-kpi-box light accent-navy">
              <div className="ra-print-kpi-label dark">Annual Debt Service (P&amp;I)</div>
              <div className="ra-print-kpi-val navy">{currencyFmt.format(Math.round(monthlyPi * 12))}/yr</div>
              <div className="ra-print-kpi-sub dark">{currencyFmt.format(Math.round(monthlyPi))}/mo @ {(inputs.interestRate * 100).toFixed(3)}% (30-Yr Fixed)</div>
            </div>

            {/* Col 1, Row 2: Net Cash Flow */}
            <div className={`ra-print-kpi-box light ${monthlyCf >= 0 ? 'accent-green' : 'accent-red'}`}>
              <div className="ra-print-kpi-label dark">Year 1 Net Cash Flow</div>
              <div className={`ra-print-kpi-val ${monthlyCf >= 0 ? 'green' : 'red'}`}>
                {monthlyCf >= 0 ? '+' : ''}{currencyFmt.format(Math.round(monthlyCf))}/mo
              </div>
              <div className="ra-print-kpi-sub dark">
                Annual Net Cash Flow: {summary.year1CashFlow >= 0 ? '+' : ''}{currencyFmt.format(Math.round(summary.year1CashFlow))}/yr
              </div>
            </div>

            {/* Col 2, Row 2: Total Initial Capital Outlay */}
            <div className="ra-print-kpi-box light accent-blue">
              <div className="ra-print-kpi-label dark">Total Initial Capital Outlay</div>
              <div className="ra-print-kpi-val navy">{currencyFmt.format(summary.initialCashInvested)}</div>
              <div className="ra-print-kpi-sub dark">Equity Down ({Math.round(inputs.downPaymentPct * 100)}%) + Initial Reserves / Rehab</div>
            </div>
          </div>
        </div>

        {/* 5-Year & 10-Year Horizon Returns (Side-by-Side Cards) */}
        <div className="ra-print-horizons-grid">
          {/* 5-Year Horizon */}
          <div className="ra-print-horizon-card">
            <div className="ra-print-horizon-head">
              <div>
                <span className="ra-print-horizon-sub">MEDIUM-TERM EXIT</span>
                <div className="ra-print-horizon-title">5-Year Horizon Returns</div>
              </div>
              <div className="ra-print-irr-badge">
                <span className="ra-print-irr-num">{summary.fiveYear.irrPct.toFixed(2)}%</span>
                <span className="ra-print-irr-label">5-YR IRR</span>
              </div>
            </div>
            <div className="ra-print-horizon-body">
              <div className="ra-print-kv">
                <span>Projected Year 5 Property Value</span>
                <strong>{currencyFmt.format(Math.round(summary.fiveYear.propertyValue))}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Remaining Loan Balance</span>
                <strong>{currencyFmt.format(Math.round(summary.fiveYear.remainingBalance))}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Net Sale Proceeds (after 5% costs)</span>
                <strong>{currencyFmt.format(Math.round(summary.fiveYear.netSaleProceeds))}</strong>
              </div>
              <div className="ra-print-kv">
                <span>5-Yr Cumulative Cash Flow</span>
                <strong className={summary.fiveYear.cumulativeCashFlow >= 0 ? 'pos-txt' : 'neg-txt'}>
                  {currencyFmt.format(Math.round(summary.fiveYear.cumulativeCashFlow))}
                </strong>
              </div>
              <div className="ra-print-kv ra-print-kv-highlight">
                <span>Net 5-Yr Lifetime Profit</span>
                <strong className="ra-print-green-txt">
                  {currencyFmt.format(Math.round(summary.fiveYear.totalProfit))}
                  <span className="ra-print-roi-tag"> ({summary.fiveYear.totalRoiPct.toFixed(1)}% ROI)</span>
                </strong>
              </div>
            </div>
          </div>

          {/* 10-Year Horizon */}
          <div className="ra-print-horizon-card">
            <div className="ra-print-horizon-head">
              <div>
                <span className="ra-print-horizon-sub">LONG-TERM WEALTH HORIZON</span>
                <div className="ra-print-horizon-title">10-Year Horizon Returns</div>
              </div>
              <div className="ra-print-irr-badge gold">
                <span className="ra-print-irr-num">{summary.tenYear.irrPct.toFixed(2)}%</span>
                <span className="ra-print-irr-label">10-YR IRR</span>
              </div>
            </div>
            <div className="ra-print-horizon-body">
              <div className="ra-print-kv">
                <span>Projected Year 10 Property Value</span>
                <strong>{currencyFmt.format(Math.round(summary.tenYear.propertyValue))}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Remaining Loan Balance (Paydown: {currencyFmt.format(Math.round(principalPaydown10Yr))})</span>
                <strong>{currencyFmt.format(Math.round(summary.tenYear.remainingBalance))}</strong>
              </div>
              <div className="ra-print-kv">
                <span>Net Sale Proceeds (after 5% costs)</span>
                <strong>{currencyFmt.format(Math.round(summary.tenYear.netSaleProceeds))}</strong>
              </div>
              <div className="ra-print-kv">
                <span>10-Yr Cumulative Cash Flow</span>
                <strong className={summary.tenYear.cumulativeCashFlow >= 0 ? 'pos-txt' : 'neg-txt'}>
                  {currencyFmt.format(Math.round(summary.tenYear.cumulativeCashFlow))}
                </strong>
              </div>
              <div className="ra-print-kv ra-print-kv-highlight">
                <span>Net 10-Yr Lifetime Profit</span>
                <strong className="ra-print-green-txt">
                  {currencyFmt.format(Math.round(summary.tenYear.totalProfit))}
                  <span className="ra-print-roi-tag"> ({summary.tenYear.totalRoiPct.toFixed(1)}% ROI)</span>
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Engine Assumptions & What-If Scenario Box (Prominent & Clear Font Size) */}
        <div className="ra-print-assumptions-box">
          <div className="ra-print-assumptions-row">
            <span className="ra-print-assumptions-title">ENGINE ASSUMPTIONS:</span>
            <span className="ra-print-assumptions-text">
              Rent Growth: <strong>{(inputs.annualRentGrowth * 100).toFixed(1)}%/yr</strong>
            </span>
            <span className="ra-print-dot-sep">·</span>
            <span className="ra-print-assumptions-text">
              Appreciation: <strong>{(inputs.annualAppreciation * 100).toFixed(1)}%/yr</strong>
            </span>
            <span className="ra-print-dot-sep">·</span>
            <span className="ra-print-assumptions-text">
              Tax Escalation: <strong>{((inputs.propertyTaxGrowthRate ?? 0.02) * 100).toFixed(0)}%/yr</strong>
            </span>
            <span className="ra-print-dot-sep">·</span>
            <span className="ra-print-assumptions-text">
              Ins Escalation: <strong>{((inputs.insuranceGrowthRate ?? 0.05) * 100).toFixed(0)}%/yr</strong>
            </span>
            <span className="ra-print-dot-sep">·</span>
            <span className="ra-print-assumptions-text">
              Maintenance: <strong>${inputs.monthlyMaintenance ?? 200}/mo</strong>
            </span>
            <span className="ra-print-dot-sep">·</span>
            <span className="ra-print-assumptions-text">
              Exit Friction: <strong>{(inputs.sellingCostPct * 100).toFixed(1)}%</strong>
            </span>
          </div>
          {(inputs.refiEnabled || inputs.aduEnabled) && (
            <div className="ra-print-assumptions-row value-add">
              <span className="ra-print-assumptions-title gold">ACTIVE WHAT-IF:</span>
              {inputs.refiEnabled && (
                <span className="ra-print-assumptions-text">
                  Refinance modeled in Year {inputs.refiYear ?? 3} @ {((inputs.refiNewRate ?? 0.0625) * 100).toFixed(2)}%
                </span>
              )}
              {inputs.refiEnabled && inputs.aduEnabled && <span className="ra-print-dot-sep">·</span>}
              {inputs.aduEnabled && (
                <span className="ra-print-assumptions-text">
                  Detached ADU modeled (+{currencyFmt.format(inputs.aduRentMonthly ?? 2200)}/mo)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Page 1 Footer */}
        <footer className="ra-print-page-footer">
          <span>Insider Mortgage · Investment Property Underwriting Report</span>
          <span>Confidential &amp; Proprietary Analysis</span>
          <span>Page 1 of 2</span>
        </footer>
      </section>

      {/* ============================================================== */}
      {/* PAGE 2: 10-YEAR PRO-FORMA SCHEDULE & AI UNDERWRITING VERDICT  */}
      {/* ============================================================== */}
      <section className="ra-print-page ra-print-page-2">
        {/* Header Bar */}
        <header className="ra-print-header mini">
          <div className="ra-print-brand-col">
            <div className="ra-print-logo-row">
              <span className="ra-print-brand-name">INSIDER MORTGAGE</span>
              <span className="ra-print-brand-tag">PRO-FORMA SCHEDULE &amp; ADVISOR MEMO</span>
            </div>
          </div>
          <div className="ra-print-meta-col right">
            <div className="ra-print-address-sm">{inputs.propertyAddress || 'Subject Investment Property'}</div>
            <div className="ra-print-submeta-sm">{formattedDate}</div>
          </div>
        </header>

        {/* 10-Year Annual Operating & Equity Pro-Forma Schedule Table */}
        <div className="ra-print-table-section">
          <div className="ra-print-section-title">
            <span>10-Year Annual Operating &amp; Equity Pro-Forma Schedule</span>
            <span className="ra-print-section-sub">
              Compounding {(inputs.annualRentGrowth * 100).toFixed(1)}% rent, {(inputs.annualAppreciation * 100).toFixed(1)}% apprec, {((inputs.propertyTaxGrowthRate ?? 0.02) * 100).toFixed(0)}% tax &amp; {((inputs.insuranceGrowthRate ?? 0.05) * 100).toFixed(0)}% ins escalation
            </span>
          </div>

          <table className="ra-print-proforma-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Gross Rent<br /><span className="th-sub">(Mo)</span></th>
                <th>Effective Gross (EGI)</th>
                <th>Operating Expenses</th>
                <th>Net Operating Income (NOI)</th>
                <th>Annual Debt Service</th>
                <th>Annual Net Cash Flow</th>
                <th>Monthly Cash Flow</th>
                <th>Projected Value</th>
                <th>Loan Balance</th>
                <th>Gross Equity</th>
              </tr>
            </thead>
            <tbody>
              {summary.schedule.map((row) => {
                const isHighlight =
                  (inputs.refiEnabled && row.year === (inputs.refiYear ?? 3)) ||
                  row.year === 5 ||
                  row.year === 10;
                return (
                  <tr key={row.year} className={isHighlight ? 'ra-row-highlight' : ''}>
                    <td className="ra-td-year">{row.year}</td>
                    <td>{currencyFmt.format(Math.round(row.monthlyGrossRent))}</td>
                    <td>{currencyFmt.format(Math.round(row.effectiveGrossIncome))}</td>
                    <td className="ra-td-neg">-{currencyFmt.format(Math.round(row.operatingExpenses))}</td>
                    <td className="ra-td-bold">{currencyFmt.format(Math.round(row.noi))}</td>
                    <td className="ra-td-neg">-{currencyFmt.format(Math.round(row.annualDebtService))}</td>
                    <td className={`ra-td-bold ${row.netCashFlow >= 0 ? 'ra-td-pos' : 'ra-td-neg'}`}>
                      {row.netCashFlow >= 0 ? '+' : ''}{currencyFmt.format(Math.round(row.netCashFlow))}
                    </td>
                    <td className={`ra-td-bold ${row.netCashFlow >= 0 ? 'ra-td-pos' : 'ra-td-neg'}`}>
                      {row.netCashFlow >= 0 ? '+' : ''}{currencyFmt.format(Math.round(row.netCashFlow / 12))}
                    </td>
                    <td>{currencyFmt.format(Math.round(row.propertyValue))}</td>
                    <td>{currencyFmt.format(Math.round(row.remainingBalance))}</td>
                    <td className="ra-td-bold ra-td-pos">{currencyFmt.format(Math.round(row.propertyValue - row.remainingBalance))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 6: AI Investment Underwriting Analysis */}
        <div className="ra-print-ai-section">
          <div className="ra-print-ai-header">
            <div className="ra-print-ai-title">
              <span className="ra-print-num-badge dark">6</span>
              <span>AI Investment Underwriting Analysis</span>
            </div>
            <span className="ra-print-deal-badge">✦ {badgeText}</span>
          </div>
          <div className="ra-print-ai-subtitle">
            Automated deal synthesis across cash flow, DSCR coverage, 10-year equity, and value-add levers
          </div>

          <div className="ra-print-ai-grid">
            {/* Memo 1: Executive Verdict */}
            <div className="ra-print-ai-card border-navy">
              <div className="ra-print-ai-card-title">1. Executive Underwriting Verdict</div>
              <p>
                At an acquisition price of <strong>{currencyFmt.format(inputs.purchasePrice)}</strong> (
                <strong>{currencyFmt.format(summary.initialCashInvested)}</strong> initial outlay) and{' '}
                <strong>{currencyFmt.format(summary.totalMonthlyRent)}/mo</strong> scheduled rent across{' '}
                <strong>{inputs.unitCount} {inputs.unitCount === 1 ? 'unit' : 'units'}</strong>
                {inputs.aduEnabled ? ' + ADU' : ''}, this property generates Year 1 Net Operating Income of{' '}
                <strong>{currencyFmt.format(Math.round(summary.year1Noi))}/yr</strong> (
                <strong>{capRate.toFixed(2)}% Cap Rate</strong>). Over a 10-year hold, compounding appreciation and amortization project{' '}
                <strong className="ra-print-green-txt">
                  {currencyFmt.format(Math.round(summary.tenYear.totalProfit))}
                </strong>{' '}
                in net lifetime profit (<strong>{summary.tenYear.totalRoiPct.toFixed(1)}% Total ROI</strong> /{' '}
                <strong>{summary.tenYear.irrPct.toFixed(2)}% annualized IRR</strong>).
              </p>
            </div>

            {/* Memo 2: DSCR & Cash Flow Trajectory */}
            <div className="ra-print-ai-card border-blue">
              <div className="ra-print-ai-card-title">2. Debt Service Coverage (DSCR) &amp; Cash Flow</div>
              <p>
                Year 1 net cash flow is{' '}
                <strong className={monthlyCf >= 0 ? 'ra-print-green-txt' : 'ra-print-red-txt'}>
                  {currencyFmt.format(Math.round(monthlyCf))}/mo
                </strong>{' '}
                ({currencyFmt.format(Math.round(summary.year1CashFlow))}/yr) with a{' '}
                <strong>{dscr.toFixed(2)}x DSCR (Gross Rent ÷ Monthly PITIA)</strong> (
                {cashOnCashYr1.toFixed(1)}% Year 1 Cash-on-Cash return).{' '}
                {dscr >= 1.25
                  ? 'Strong debt service coverage exceeding prime 1.20x–1.25x investor loan qualification standards.'
                  : dscr >= 1.0
                  ? 'Satisfies standard 1.00x DSCR break-even investor loan qualification guidelines.'
                  : `Qualifies via liquidity reserves, blended portfolio cash flows, or specialized low-DSCR loan programs ($${currencyFmt.format(Math.round(Math.max(0, totalMonthlyPitia - summary.totalMonthlyRent)))}/mo initial deficit against PITIA).`}{' '}
                {monthlyCf >= 0
                  ? 'Self-sustaining from Day 1, servicing debt and compounding cash flow through Year 10.'
                  : 'An initial operating deficit makes this a prime candidate for a future rate-drop refinance, larger down payment, or ADU rent expansion.'}
              </p>
            </div>

            {/* Memo 3: 5-Year vs. 10-Year Equity */}
            <div className="ra-print-ai-card border-green">
              <div className="ra-print-ai-card-title">3. 5-Year vs. 10-Year Equity &amp; Return Profile</div>
              <p>
                Exiting at <strong>Year 5</strong> yields{' '}
                <strong>{currencyFmt.format(Math.round(summary.fiveYear.netSaleProceeds))}</strong> in net proceeds (after 5.0% selling friction) and a{' '}
                <strong>{summary.fiveYear.irrPct.toFixed(2)}% IRR</strong>. Holding through{' '}
                <strong>Year 10</strong> expands annualized IRR to{' '}
                <strong>{summary.tenYear.irrPct.toFixed(2)}%</strong> as tenant-funded amortization pays down{' '}
                <strong>{currencyFmt.format(Math.round(principalPaydown10Yr))}</strong> in principal and 4.0% appreciation lifts asset value to{' '}
                <strong>{currencyFmt.format(Math.round(summary.tenYear.propertyValue))}</strong>.
              </p>
            </div>

            {/* Memo 4: Strategic Value-Add Levers */}
            <div className="ra-print-ai-card border-gold">
              <div className="ra-print-ai-card-title">4. Strategic Value-Add Opportunities</div>
              <ul className="ra-print-memo-list">
                {inputs.refiEnabled ? (
                  <li>
                    <strong>Active Refinance (Year {inputs.refiYear ?? 3}):</strong> New rate of {((inputs.refiNewRate ?? 0.0625) * 100).toFixed(2)}% lifts Year {(inputs.refiYear ?? 3) + 1} cash flow to {currencyFmt.format(Math.round((summary.schedule[inputs.refiYear ?? 3]?.netCashFlow ?? 0) / 12))}/mo.
                  </li>
                ) : refiSim ? (
                  <li>
                    <strong>Rate-Drop Refinance Upside:</strong> Modeling a Year {inputs.refiYear ?? 3} refi at {((inputs.refiNewRate ?? 0.0625) * 100).toFixed(2)}% would boost 10-Year Profit by <strong className="ra-print-green-txt">+{currencyFmt.format(Math.round(refiSim.tenYear.totalProfit - summary.tenYear.totalProfit))}</strong> and lift 10-Yr IRR to <strong>{refiSim.tenYear.irrPct.toFixed(2)}%</strong>.
                  </li>
                ) : null}
                {inputs.aduEnabled ? (
                  <li>
                    <strong>Active ADU Value-Add:</strong> Generating {currencyFmt.format((inputs.aduRentMonthly ?? 2200) * (inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1))}/mo supplemental rent expands Year 10 asset value to {currencyFmt.format(Math.round(summary.tenYear.propertyValue))}.
                  </li>
                ) : aduSim ? (
                  <li>
                    <strong>Detached ADU Value-Add Potential:</strong> Adding a {currencyFmt.format(inputs.aduCost ?? 200000)} ADU generating {currencyFmt.format(inputs.aduRentMonthly ?? 2200)}/mo increases Year 2+ NOI to <strong>{currencyFmt.format(Math.round(aduSim.schedule[1].noi))}/yr</strong> and lifts 10-Yr IRR to <strong>{aduSim.tenYear.irrPct.toFixed(2)}%</strong>.
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information & Licensing Box */}
        <div className="ra-print-contact-section">
          <div className="ra-print-contact-header">
            <div className="ra-print-contact-title">
              {stateInfo.isRakeshOnly
                ? `MORTGAGE FINANCING & UNDERWRITING ADVISOR (${stateInfo.stateName.toUpperCase()})`
                : 'MORTGAGE FINANCING & UNDERWRITING ADVISORS'}
            </div>
            <div className="ra-print-contact-sub">
              Insider Mortgage · Powered by C2 Financial Corporation (NMLS #135622)
            </div>
          </div>

          <div className={`ra-print-officers-grid ${stateInfo.isRakeshOnly ? 'single' : 'dual'}`}>
            {/* If CA or Other: Show David Sider */}
            {!stateInfo.isRakeshOnly && (
              <div className="ra-print-officer-card">
                <div className="ra-print-officer-name">David Sider</div>
                <div className="ra-print-officer-role">Managing Partner &amp; Broker</div>
                <div className="ra-print-officer-licenses">
                  NMLS #254108 · CA DRE #01193796
                </div>
                <div className="ra-print-officer-contact">
                  <span>Phone: <strong>(858) 848-5653</strong></span>
                  <span>·</span>
                  <span>Email: <strong>DSider@InsiderMtg.com</strong></span>
                </div>
              </div>
            )}

            {/* Rakesh Jain (Always Included) */}
            <div className="ra-print-officer-card">
              <div className="ra-print-officer-name">Rakesh Jain</div>
              <div className="ra-print-officer-role">Senior Loan Officer &amp; Partner</div>
              <div className="ra-print-officer-licenses">
                NMLS #240594 · {stateInfo.rakeshLicense}
                {!stateInfo.isRakeshOnly && ' · AZ #1050797 · FL #LO121680 · UT #13917645 · WA #MLO-240594'}
              </div>
              <div className="ra-print-officer-contact">
                <span>Phone: <strong>(858) 848-5653</strong></span>
                <span>·</span>
                <span>Email: <strong>Rjain@insidermtg.com</strong></span>
              </div>
            </div>
          </div>

          {/* Compliance & Regulatory Disclaimer */}
          <div className="ra-print-compliance-note">
            <div className="ra-print-eho-row">
              <span className="ra-print-eho-badge">🏠 EQUAL HOUSING LENDER</span>
              <span>Office: 12230 El Camino Real #100, San Diego, CA 92130 · (858) 848-5653 · www.insidermortgage.com</span>
            </div>
            <div className="ra-print-disclaimer-text">
              C2 Financial Corporation (NMLS #135622) is licensed in CA (DRE #01821025 / CFLL #603L442), AZ (#BK-2009362), FL (#MLD2635), UT (UDRE #13748829), and WA (#MB135622). This underwriting scenario analysis is prepared for educational and investment modeling purposes only and does not constitute a commitment to lend. Rates, terms, and guidelines are subject to property appraisal, investor guidelines, and borrower qualification.
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <footer className="ra-print-page-footer">
          <span>Insider Mortgage · (858) 848-5653 · www.insidermortgage.com</span>
          <span>NMLS #135622 · Equal Housing Opportunity</span>
          <span>Page 2 of 2</span>
        </footer>
      </section>
    </div>
  );
}
