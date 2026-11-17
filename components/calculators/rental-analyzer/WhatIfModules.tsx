'use client';

import React, { useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import { UnderwriteInputs, runUnderwriteModel } from '../../../lib/financial-engine';

interface WhatIfModulesProps {
  inputs: UnderwriteInputs;
  onChange: (patch: Partial<UnderwriteInputs>) => void;
  isLockedPublic?: boolean;
  onRequestUnlock?: () => void;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// Toggle to true to re-enable the California ADU Construction Project module in the future
const SHOW_ADU_MODULE = false;

export default function WhatIfModules({
  inputs,
  onChange,
  isLockedPublic = false,
  onRequestUnlock,
}: WhatIfModulesProps) {
  const handleToggleRefi = () => {
    if (isLockedPublic && onRequestUnlock) {
      onRequestUnlock();
      return;
    }
    onChange({
      refiEnabled: !inputs.refiEnabled,
      refiYear: inputs.refiYear ?? 3,
      refiNewRate: inputs.refiNewRate ?? 0.0625,
      refiReset30: inputs.refiReset30 ?? true,
      refiClosingCost: inputs.refiClosingCost ?? 4000,
      refiCashOut: inputs.refiCashOut ?? 0,
    });
  };

  const refiComparison = useMemo(() => {
    if (!inputs.refiEnabled || isLockedPublic) return null;
    const before = runUnderwriteModel({ ...inputs, refiEnabled: false });
    const after = runUnderwriteModel(inputs);
    const pmtBefore = before.monthlyPmt;
    const pmtAfter = after.postRefiMonthlyPmt ?? after.monthlyPmt;
    const monthlySavings = pmtBefore - pmtAfter;
    const closingCost = Math.max(0, inputs.refiClosingCost ?? 0);
    const breakEvenMonths =
      closingCost === 0
        ? 0
        : monthlySavings > 0
          ? Math.ceil(closingCost / monthlySavings)
          : null;
    return {
      before,
      after,
      pmtBefore,
      pmtAfter,
      monthlySavings,
      closingCost,
      breakEvenMonths,
    };
  }, [inputs, isLockedPublic]);

  const handleToggleAdu = () => {
    if (isLockedPublic && onRequestUnlock) {
      onRequestUnlock();
      return;
    }
    onChange({
      aduEnabled: !inputs.aduEnabled,
      aduCount: inputs.aduCount ?? 1,
      aduCost: inputs.aduCost ?? 200000,
      aduRentMonthly: inputs.aduRentMonthly ?? 2200,
      aduStartMonth: inputs.aduStartMonth ?? 0,
      aduConstructionMonths: inputs.aduConstructionMonths ?? 6,
      aduMainRentDiscountPct: inputs.aduMainRentDiscountPct ?? 0.25,
    });
  };

  const aduMultiplier = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;

  return (
    <div className="ra-card bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
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
            }}
          >
            5
          </span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#060A2D', margin: 0 }}>
            Interactive &ldquo;What-If&rdquo; Value-Add Modules
          </h2>
        </div>

        {isLockedPublic && (
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            VIP / Full Report Feature
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Module A: Future Refinance */}
        <div
          style={{
            border: inputs.refiEnabled ? '2px solid #0468E9' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1rem',
            backgroundColor: inputs.refiEnabled ? '#F8FAFC' : '#FFFFFF',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#060A2D', fontSize: '0.98rem' }}>
                🔄 What-If: Future Rate-and-Term Refinance
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Model a future rate-and-term or cash-out refinance once interest rates drop.
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleRefi}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: inputs.refiEnabled ? '#0468E9' : '#E2E8F0',
                color: inputs.refiEnabled ? '#FFFFFF' : '#334155',
              }}
            >
              {isLockedPublic ? '🔒 Unlock' : inputs.refiEnabled ? 'Enabled' : 'Enable'}
            </button>
          </div>

          {inputs.refiEnabled && !isLockedPublic && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  <span>Target Refinance Year</span>
                  <span style={{ color: '#0468E9', fontWeight: 700 }}>
                    End of Year {inputs.refiYear ?? 3} (Starts Year {(inputs.refiYear ?? 3) + 1})
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={1}
                  value={inputs.refiYear ?? 3}
                  onChange={(e) => onChange({ refiYear: Number(e.target.value) })}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  <span>New Refinance Rate (%)</span>
                  <span style={{ color: '#0468E9', fontWeight: 700 }}>
                    {((inputs.refiNewRate ?? 0.0625) * 100).toFixed(3)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={4.0}
                  max={8.5}
                  step={0.125}
                  value={Number(((inputs.refiNewRate ?? 0.0625) * 100).toFixed(3))}
                  onChange={(e) => onChange({ refiNewRate: Number(e.target.value) / 100 })}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                  Amortization Schedule on Refinance
                </span>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#060A2D',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={inputs.refiReset30 ?? true}
                    onChange={(e) => onChange({ refiReset30: e.target.checked })}
                  />
                  Reset to Fresh 30-Yr Term
                </label>
              </div>

              <div className="ra-two-col">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Refinance Closing Costs ($)
                  </label>
                  <NumericFormat
                    thousandSeparator=","
                    decimalScale={0}
                    allowNegative={false}
                    prefix="$"
                    className="ra-input"
                    style={{ fontWeight: 700 }}
                    value={(inputs.refiClosingCost ?? 4000) === 0 ? '' : inputs.refiClosingCost ?? 4000}
                    onValueChange={(values) =>
                      onChange({ refiClosingCost: Math.max(0, Number(values.floatValue) || 0) })
                    }
                    placeholder="$0"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Cash-Out Amount ($)
                  </label>
                  <NumericFormat
                    thousandSeparator=","
                    decimalScale={0}
                    allowNegative={false}
                    prefix="$"
                    className="ra-input"
                    style={{ fontWeight: 700 }}
                    value={(inputs.refiCashOut ?? 0) === 0 ? '' : inputs.refiCashOut ?? 0}
                    onValueChange={(values) =>
                      onChange({ refiCashOut: Math.max(0, Number(values.floatValue) || 0) })
                    }
                    placeholder="$0"
                  />
                </div>
              </div>

              {refiComparison && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #BFDBFE',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#060A2D',
                      color: '#FFFFFF',
                      padding: '0.55rem 0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.4rem',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                    }}
                  >
                    <span style={{ color: '#EFB51E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Before vs. After Refinance (10-Yr View)
                    </span>
                    <span style={{ color: '#E2E8F0' }}>
                      Break-Even:{' '}
                      <strong style={{ color: '#4ADE80' }}>
                        {refiComparison.breakEvenMonths === null
                          ? 'N/A (No Payment Savings)'
                          : refiComparison.breakEvenMonths === 0
                            ? 'Immediate (0 mos)'
                            : `${refiComparison.breakEvenMonths} ${
                                refiComparison.breakEvenMonths === 1 ? 'Month' : 'Months'
                              }`}
                      </strong>
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '0.45rem 0.65rem', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                          Metric
                        </th>
                        <th style={{ padding: '0.45rem 0.55rem', textAlign: 'right', color: '#64748B', fontWeight: 700 }}>
                          Before
                        </th>
                        <th style={{ padding: '0.45rem 0.55rem', textAlign: 'right', color: '#0468E9', fontWeight: 800 }}>
                          After
                        </th>
                        <th style={{ padding: '0.45rem 0.65rem', textAlign: 'right', color: '#060A2D', fontWeight: 800 }}>
                          Savings / Δ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const fmtSignedDollar = (val: number, suffix = '') => {
                          const r = Math.round(val);
                          if (r === 0) return `$0${suffix}`;
                          return `${r > 0 ? '+' : '-'}${currencyFmt.format(Math.abs(r))}${suffix}`;
                        };
                        const pmtDiff = refiComparison.pmtBefore - refiComparison.pmtAfter;
                        const intDiff =
                          refiComparison.before.totalInterest10Yr -
                          refiComparison.after.totalInterest10Yr;
                        const balDiff =
                          refiComparison.before.tenYear.remainingBalance -
                          refiComparison.after.tenYear.remainingBalance;
                        const profitDiff =
                          refiComparison.after.tenYear.totalProfit -
                          refiComparison.before.tenYear.totalProfit;
                        const irrDiff =
                          refiComparison.after.tenYear.irrPct -
                          refiComparison.before.tenYear.irrPct;

                        return [
                          {
                            label: 'Monthly P&I Payment',
                            before: `${currencyFmt.format(Math.round(refiComparison.pmtBefore))}/mo`,
                            after: `${currencyFmt.format(Math.round(refiComparison.pmtAfter))}/mo`,
                            diffText: fmtSignedDollar(pmtDiff, '/mo'),
                            diffNum: pmtDiff,
                          },
                          {
                            label: 'Total Interest (10 Yrs)',
                            before: currencyFmt.format(Math.round(refiComparison.before.totalInterest10Yr)),
                            after: currencyFmt.format(Math.round(refiComparison.after.totalInterest10Yr)),
                            diffText: fmtSignedDollar(intDiff),
                            diffNum: intDiff,
                          },
                          {
                            label: 'Loan Balance (End Yr 10)',
                            before: currencyFmt.format(Math.round(refiComparison.before.tenYear.remainingBalance)),
                            after: currencyFmt.format(Math.round(refiComparison.after.tenYear.remainingBalance)),
                            diffText: fmtSignedDollar(balDiff),
                            diffNum: balDiff,
                          },
                          {
                            label: '10-Yr Net Profit',
                            before: currencyFmt.format(Math.round(refiComparison.before.tenYear.totalProfit)),
                            after: currencyFmt.format(Math.round(refiComparison.after.tenYear.totalProfit)),
                            diffText: fmtSignedDollar(profitDiff),
                            diffNum: profitDiff,
                          },
                          {
                            label: '10-Yr IRR',
                            before: `${refiComparison.before.tenYear.irrPct.toFixed(2)}%`,
                            after: `${refiComparison.after.tenYear.irrPct.toFixed(2)}%`,
                            diffText: `${irrDiff >= 0 ? '+' : ''}${irrDiff.toFixed(2)}%`,
                            diffNum: irrDiff,
                          },
                        ];
                      })().map((row) => {
                        const isPositive = row.diffNum > 0.001;
                        const isNegative = row.diffNum < -0.001;
                        return (
                          <tr key={row.label} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '0.45rem 0.65rem', fontWeight: 600, color: '#334155' }}>
                              {row.label}
                            </td>
                            <td style={{ padding: '0.45rem 0.55rem', textAlign: 'right', color: '#64748B' }}>
                              {row.before}
                            </td>
                            <td style={{ padding: '0.45rem 0.55rem', textAlign: 'right', fontWeight: 700, color: '#060A2D' }}>
                              {row.after}
                            </td>
                            <td
                              style={{
                                padding: '0.45rem 0.65rem',
                                textAlign: 'right',
                                fontWeight: 800,
                                color: isPositive ? '#15803D' : isNegative ? '#B91C1C' : '#64748B',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {row.diffText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Module B: ADU Addition (retired for now; toggle SHOW_ADU_MODULE to restore) */}
        {SHOW_ADU_MODULE && (
        <div
          style={{
            border: inputs.aduEnabled ? '2px solid #EFB51E' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1rem',
            backgroundColor: inputs.aduEnabled ? '#FFFBEB' : '#FFFFFF',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#060A2D', fontSize: '0.98rem' }}>
                🏡 What-If: California ADU Construction Project
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Model cash-funded detached ADU build cost, construction downtime, and new rental stream.
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAdu}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                backgroundColor: inputs.aduEnabled ? '#060A2D' : '#E2E8F0',
                color: inputs.aduEnabled ? '#EFB51E' : '#334155',
              }}
            >
              {isLockedPublic ? '🔒 Unlock' : inputs.aduEnabled ? 'Enabled' : 'Enable'}
            </button>
          </div>

          {inputs.aduEnabled && !isLockedPublic && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #FDE68A',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              {/* Multi-family CA ADU Law: 1 or 2 detached ADUs when unitCount > 1 */}
              {inputs.unitCount > 1 && (
                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#060A2D' }}>
                      CA Multi-Family Detached ADU Allowance
                    </div>
                    <div style={{ fontSize: '0.73rem', color: '#64748B' }}>
                      2–4 unit lots qualify for up to 2 detached ADUs under CA state law
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {([1, 2] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => onChange({ aduCount: cnt })}
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          backgroundColor: (inputs.aduCount ?? 1) === cnt ? '#060A2D' : '#FFFFFF',
                          color: (inputs.aduCount ?? 1) === cnt ? '#EFB51E' : '#334155',
                        }}
                      >
                        {cnt} Detached ADU{cnt > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ra-two-col">
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Build Budget {aduMultiplier > 1 ? '(Per ADU $)' : '($)'}
                  </label>
                  <NumericFormat
                    thousandSeparator=","
                    decimalScale={0}
                    allowNegative={false}
                    prefix="$"
                    className="ra-input"
                    style={{ fontWeight: 700 }}
                    value={(inputs.aduCost ?? 200000) === 0 ? '' : inputs.aduCost ?? 200000}
                    onValueChange={(values) =>
                      onChange({ aduCost: Math.max(0, Number(values.floatValue) || 0) })
                    }
                    placeholder="$0"
                  />
                  {aduMultiplier > 1 && (
                    <span style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 600 }}>
                      Total for 2 ADUs: {currencyFmt.format((inputs.aduCost ?? 200000) * 2)}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Expected ADU Rent {aduMultiplier > 1 ? '(Per ADU $/mo)' : '($/mo)'}
                  </label>
                  <NumericFormat
                    thousandSeparator=","
                    decimalScale={0}
                    allowNegative={false}
                    prefix="$"
                    className="ra-input"
                    style={{ fontWeight: 700 }}
                    value={(inputs.aduRentMonthly ?? 2200) === 0 ? '' : inputs.aduRentMonthly ?? 2200}
                    onValueChange={(values) =>
                      onChange({ aduRentMonthly: Math.max(0, Number(values.floatValue) || 0) })
                    }
                    placeholder="$0"
                  />
                  {aduMultiplier > 1 && (
                    <span style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 600 }}>
                      Total for 2 ADUs: {currencyFmt.format((inputs.aduRentMonthly ?? 2200) * 2)}/mo
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  <span>ADU Construction Start</span>
                  <span style={{ color: '#060A2D', fontWeight: 700 }}>
                    {(() => {
                      const start = inputs.aduStartMonth ?? 0;
                      if (start === 0) return 'Right Away (Month 0)';
                      if (start % 12 === 0) return `Month ${start} (End of Year ${start / 12})`;
                      return `Month ${start} (Year ${Math.floor(start / 12) + 1})`;
                    })()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={1}
                  value={inputs.aduStartMonth ?? 0}
                  onChange={(e) => onChange({ aduStartMonth: Number(e.target.value) })}
                />
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.2rem' }}>
                  Controls when build budget is deployed and ADU construction begins (Month 0 to End of Year 5).
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  <span>Construction Downtime</span>
                  <span style={{ color: '#060A2D', fontWeight: 700 }}>
                    {(() => {
                      const m = inputs.aduConstructionMonths ?? 6;
                      if (m === 12) return '12 Months (1 Year)';
                      if (m === 24) return '24 Months (2 Years)';
                      return `${m} ${m === 1 ? 'Month' : 'Months'}`;
                    })()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={1}
                  value={inputs.aduConstructionMonths ?? 6}
                  onChange={(e) => onChange({ aduConstructionMonths: Number(e.target.value) })}
                />
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '0.3rem',
                  }}
                >
                  <span>Existing Units Rent Discount During Construction</span>
                  <span style={{ color: '#060A2D', fontWeight: 700 }}>
                    {(() => {
                      const pct = Math.round((inputs.aduMainRentDiscountPct ?? 0.2) * 100);
                      if (pct === 0) return '0% (No Discount)';
                      if (pct === 100) return '100% (Full Vacant)';
                      return `${pct}%`;
                    })()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={Math.round((inputs.aduMainRentDiscountPct ?? 0.2) * 100)}
                  onChange={(e) => onChange({ aduMainRentDiscountPct: Number(e.target.value) / 100 })}
                />
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
