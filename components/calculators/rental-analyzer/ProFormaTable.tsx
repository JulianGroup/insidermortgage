'use client';

import React from 'react';
import { UnderwriteInputs, UnderwriteSummary } from '../../../lib/financial-engine';

interface ProFormaTableProps {
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

export default function ProFormaTable({
  inputs,
  summary,
  isLockedPublic = false,
  onRequestUnlock,
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
            {isLockedPublic ? '🔒 Print / Save PDF' : '🖨 Print / Save PDF Report'}
          </button>
        </div>
      </div>

      <div className={`ra-table-wrap ${isLockedPublic ? 'ra-locked-blur' : ''}`}>
        <table className="ra-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Gross Rent/Mo</th>
              <th>Effective Gross (EGI)</th>
              <th>OpEx</th>
              <th>Net Operating Income</th>
              <th>Debt Service</th>
              <th>Annual Cash Flow</th>
              <th>Monthly CF</th>
              <th>Property Value</th>
              <th>Loan Balance</th>
              <th>Net Equity (after 5%)</th>
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
