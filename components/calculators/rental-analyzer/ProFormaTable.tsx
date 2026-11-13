'use client';

import React from 'react';
import { UnderwriteInputs, UnderwriteSummary } from '../../../lib/financial-engine';
import { MathMetricKey } from './MathReceiptModal';

interface ProFormaTableProps {
  inputs: UnderwriteInputs;
  summary: UnderwriteSummary;
  isLockedPublic?: boolean;
  onRequestUnlock?: () => void;
  onPrintReport?: () => void;
  onOpenMath?: (metric: MathMetricKey) => void;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ProFormaTable({
  inputs,
  summary,
  isLockedPublic = false,
  onRequestUnlock,
  onPrintReport,
  onOpenMath,
}: ProFormaTableProps) {
  const handleExportCsv = () => {
    if (isLockedPublic && onRequestUnlock) {
      onRequestUnlock();
      return;
    }

    const headers = [
      'Year',
      'Monthly Gross Rent',
      'Effective Gross Income (EGI)',
      'Operating Expenses',
      'Net Operating Income (NOI)',
      'Annual Debt Service',
      'Annual Net Cash Flow',
      'Monthly Net Cash Flow',
      'Projected Property Value',
      'Remaining Loan Balance',
      'Gross Equity',
    ];

    const rows = summary.schedule.map((row) => [
      `Year ${row.year}`,
      Math.round(row.monthlyGrossRent),
      Math.round(row.effectiveGrossIncome),
      Math.round(row.operatingExpenses),
      Math.round(row.noi),
      Math.round(row.annualDebtService),
      Math.round(row.netCashFlow),
      Math.round(row.netCashFlow / 12),
      Math.round(row.propertyValue),
      Math.round(row.remainingBalance),
      Math.round(row.propertyValue - row.remainingBalance),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const safeAddress = (inputs.propertyAddress || 'property')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();
    link.setAttribute('download', `pro-forma-10yr-${safeAddress}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = () => {
    if (isLockedPublic && onRequestUnlock) {
      onRequestUnlock();
      return;
    }
    if (onPrintReport) {
      onPrintReport();
      return;
    }
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="ra-card" style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#060A2D' }}>
            10-Year Annual Operating &amp; Equity Pro-Forma Schedule
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#64748B' }}>
            Compounding {(inputs.annualRentGrowth * 100).toFixed(1)}% annual rent growth &amp;{' '}
            {(inputs.annualAppreciation * 100).toFixed(1)}% property appreciation across{' '}
            {inputs.unitCount} {inputs.unitCount === 1 ? 'unit' : 'units'}
            {inputs.aduEnabled ? ' + ADU' : ''}
            {inputs.refiEnabled ? ` (Refi in Year ${inputs.refiYear ?? 3})` : ''}.
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#060A2D',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {isLockedPublic ? '🔒 Export CSV' : '⬇ Export CSV'}
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#060A2D',
              color: '#EFB51E',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {isLockedPublic ? '🔒 Print / Save PDF' : '🖨 Print / Save 2-Page PDF'}
          </button>
        </div>
      </div>

      <div className={`ra-table-wrap ${isLockedPublic ? 'ra-locked-blur' : ''}`}>
        <table className="ra-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>
                Gross Rent
                <br />
                <span style={{ fontWeight: 500, color: '#CBD5E1', fontSize: '0.67rem' }}>(Monthly)</span>
              </th>
              <th>
                Effective
                <br />
                Gross (EGI)
              </th>
              <th>
                Operating
                <br />
                Expenses
              </th>
              <th>
                Net Operating
                <br />
                Income (NOI)
              </th>
              <th>
                Annual Debt
                <br />
                Service
              </th>
              <th>
                Annual Net
                <br />
                Cash Flow
              </th>
              <th>
                Monthly
                <br />
                Cash Flow
              </th>
              <th>
                Property
                <br />
                Value
              </th>
              <th>
                Loan
                <br />
                Balance
              </th>
              <th>
                Net Equity
                <br />
                <span style={{ fontWeight: 500, color: '#EFB51E', fontSize: '0.67rem' }}>(After 5%)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {summary.schedule.map((row) => {
              const isRefiStart =
                inputs.refiEnabled && row.year === (inputs.refiYear ?? 3) + 1;
              const isMilestone = row.year === 5 || row.year === 10;
              const netSaleEquity =
                row.propertyValue * (1 - inputs.sellingCostPct) - row.remainingBalance;

              return (
                <tr
                  key={row.year}
                  className={isMilestone || isRefiStart ? 'ra-highlight-row' : ''}
                >
                  <td style={{ fontWeight: 700, color: '#060A2D' }}>
                    Year {row.year}
                    {isRefiStart && (
                      <span
                        style={{
                          marginLeft: '0.4rem',
                          fontSize: '0.68rem',
                          backgroundColor: '#DBEAFE',
                          color: '#1D4ED8',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '999px',
                        }}
                      >
                        Refi
                      </span>
                    )}
                  </td>
                  <td>{currencyFmt.format(Math.round(row.monthlyGrossRent))}</td>
                  <td>{currencyFmt.format(Math.round(row.effectiveGrossIncome))}</td>
                  <td style={{ color: '#64748B' }}>
                    -{currencyFmt.format(Math.round(row.operatingExpenses))}
                  </td>
                  <td style={{ fontWeight: 700, color: '#060A2D' }}>
                    {currencyFmt.format(Math.round(row.noi))}
                  </td>
                  <td style={{ color: '#475569' }}>
                    -{currencyFmt.format(Math.round(row.annualDebtService))}
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: row.netCashFlow >= 0 ? '#15803D' : '#B91C1C',
                    }}
                  >
                    {currencyFmt.format(Math.round(row.netCashFlow))}
                  </td>
                  <td
                    style={{
                      fontWeight: 600,
                      color: row.netCashFlow >= 0 ? '#15803D' : '#B91C1C',
                    }}
                  >
                    {currencyFmt.format(Math.round(row.netCashFlow / 12))}/mo
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {currencyFmt.format(Math.round(row.propertyValue))}
                  </td>
                  <td style={{ color: '#475569' }}>
                    {currencyFmt.format(Math.round(row.remainingBalance))}
                  </td>
                  <td style={{ fontWeight: 700, color: '#0468E9' }}>
                    {currencyFmt.format(Math.round(netSaleEquity))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pro-Forma Term Index / Glossary Below Schedule */}
      <div
        className={isLockedPublic ? 'ra-locked-blur' : ''}
        style={{
          marginTop: '1.15rem',
          padding: '1rem 1.15rem',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          <div
            style={{
              fontSize: '0.76rem',
              fontWeight: 800,
              color: '#060A2D',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Pro-Forma Term Index &amp; Formula Definitions
          </div>
          <span
            className="no-print"
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#0468E9',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
            }}
          >
            ∑ Tap any number below to see its live step-by-step math receipt
          </span>
        </div>

        {/* Interactive 7-Metric Live Math Receipt Strip */}
        <div
          className="no-print"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '0.55rem',
            marginBottom: '1rem',
          }}
        >
          {[
            {
              key: 'cap-rate' as MathMetricKey,
              label: 'Cap Rate',
              value: `${(
                inputs.purchasePrice > 0
                  ? (summary.year1Noi / inputs.purchasePrice) * 100
                  : 0
              ).toFixed(2)}%`,
              sub: 'NOI ÷ Price',
            },
            {
              key: 'noi' as MathMetricKey,
              label: 'Year 1 NOI',
              value: `${currencyFmt.format(Math.round(summary.year1Noi))}/yr`,
              sub: 'EGI − OpEx',
            },
            {
              key: 'cash-flow' as MathMetricKey,
              label: 'Yr 1 Cash Flow',
              value: `${currencyFmt.format(Math.round(summary.year1CashFlow / 12))}/mo`,
              sub: 'NOI − Mortgage',
            },
            {
              key: 'irr-5' as MathMetricKey,
              label: '5-Year IRR',
              value: `${summary.fiveYear.irrPct.toFixed(2)}%`,
              sub: 'Annualized Return',
            },
            {
              key: 'profit-5' as MathMetricKey,
              label: '5-Yr Net Profit',
              value: `${currencyFmt.format(Math.round(summary.fiveYear.totalProfit))} (${summary.fiveYear.totalRoiPct.toFixed(1)}% ROI)`,
              sub: 'Sale + Rent − Cash In',
            },
            {
              key: 'irr-10' as MathMetricKey,
              label: '10-Year IRR',
              value: `${summary.tenYear.irrPct.toFixed(2)}%`,
              sub: 'Annualized Return',
            },
            {
              key: 'profit-10' as MathMetricKey,
              label: '10-Yr Net Profit',
              value: `${currencyFmt.format(Math.round(summary.tenYear.totalProfit))} (${summary.tenYear.totalRoiPct.toFixed(1)}% ROI)`,
              sub: 'Sale + Rent − Cash In',
            },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onOpenMath?.(item.key)}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.2rem',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#0468E9',
                    backgroundColor: '#EFF6FF',
                    padding: '0.06rem 0.35rem',
                    borderRadius: '4px',
                  }}
                >
                  ∑ Math
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#060A2D',
                  textDecoration: 'underline',
                  textDecorationStyle: 'dotted',
                  textUnderlineOffset: '3px',
                }}
              >
                {item.value}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{item.sub}</div>
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '0.75rem 1.25rem',
            fontSize: '0.8rem',
            color: '#334155',
            lineHeight: 1.5,
          }}
        >
          <div>
            <strong style={{ color: '#060A2D' }}>Effective Gross Income (EGI):</strong> Annual Gross
            Scheduled Rent across all units minus the{' '}
            <strong>{(inputs.vacancyRate * 100).toFixed(1)}%</strong> vacancy allowance. Represents
            actual collected rental income.
          </div>
          <div>
            <strong style={{ color: '#060A2D' }}>Operating Expenses (OpEx):</strong> Annual Property
            Taxes ({(inputs.propertyTaxRate * 100).toFixed(2)}%, escalating +{((inputs.propertyTaxGrowthRate ?? 0.02) * 100).toFixed(0)}%/yr), Home Insurance (
            {(inputs.insuranceRate * 100).toFixed(2)}%, escalating +{((inputs.insuranceGrowthRate ?? 0.05) * 100).toFixed(0)}%/yr), Monthly Maintenance Budget (
            ${inputs.monthlyMaintenance ?? 200}/mo), Property Management Fee (
            {(inputs.propMgmtRate * 100).toFixed(0)}% of EGI), and HOA dues. Excludes mortgage
            payments.
          </div>
          <div>
            <strong style={{ color: '#060A2D' }}>Net Operating Income (NOI):</strong>{' '}
            <code>EGI − Operating Expenses</code>. Measures the property&apos;s pure unlevered
            operating income before debt service.
          </div>
          <div>
            <strong style={{ color: '#060A2D' }}>Annual Debt Service:</strong> Total annual
            principal &amp; interest (P&amp;I) mortgage payments (<code>Monthly P&amp;I × 12</code>).
            Subtracting Annual Debt Service from NOI yields <strong>Annual Net Cash Flow</strong>.
          </div>
        </div>
      </div>

      {isLockedPublic && (
        <div
          style={{
            position: 'absolute',
            inset: '4.5rem 0 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(248, 250, 252, 0.55)',
            borderRadius: '0 0 16px 16px',
            padding: '1.5rem',
          }}
        >
          <button
            type="button"
            onClick={onRequestUnlock}
            style={{
              backgroundColor: '#060A2D',
              color: '#FFFFFF',
              padding: '0.85rem 1.6rem',
              borderRadius: '999px',
              border: '2px solid #EFB51E',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(6, 10, 45, 0.25)',
            }}
          >
            🔓 Unlock Full 10-Year Table &amp; Printable Investor PDF
          </button>
        </div>
      )}
    </div>
  );
}
