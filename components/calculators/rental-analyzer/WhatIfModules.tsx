'use client';

import React from 'react';
import { UnderwriteInputs } from '../../../lib/financial-engine';

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
    });
  };

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
                Model a future refinance once interest rates drop to boost net cash flow.
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
            </div>
          )}
        </div>

        {/* Module B: ADU Addition */}
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
                  <input
                    type="number"
                    min={50000}
                    max={400000}
                    step={5000}
                    className="ra-input"
                    value={inputs.aduCost ?? 200000}
                    onChange={(e) =>
                      onChange({ aduCost: Math.max(0, Number(e.target.value) || 0) })
                    }
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
                  <input
                    type="number"
                    min={1000}
                    max={5000}
                    step={100}
                    className="ra-input"
                    value={inputs.aduRentMonthly ?? 2200}
                    onChange={(e) =>
                      onChange({ aduRentMonthly: Math.max(0, Number(e.target.value) || 0) })
                    }
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
                  <span>Year 1 Construction Downtime</span>
                  <span style={{ color: '#060A2D', fontWeight: 700 }}>
                    {inputs.aduConstructionMonths ?? 6} Months
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={inputs.aduConstructionMonths ?? 6}
                  onChange={(e) => onChange({ aduConstructionMonths: Number(e.target.value) })}
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
                  Existing Units Rent Drag During Construction
                </label>
                <select
                  className="ra-input"
                  value={inputs.aduMainRentDiscountPct ?? 0.25}
                  onChange={(e) => onChange({ aduMainRentDiscountPct: Number(e.target.value) })}
                >
                  <option value={0}>None (0% Rent Discount During Build)</option>
                  <option value={0.25}>25% Construction Disruption Discount (Default)</option>
                  <option value={1.0}>Full Vacant During Construction (100% Drag)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
