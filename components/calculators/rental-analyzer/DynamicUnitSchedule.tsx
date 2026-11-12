'use client';

import React from 'react';
import { UnitInput } from '../../../lib/financial-engine';

interface DynamicUnitScheduleProps {
  propertyAddress: string;
  onAddressChange: (address: string) => void;
  unitCount: 1 | 2 | 3 | 4;
  onUnitCountChange: (count: 1 | 2 | 3 | 4) => void;
  units: UnitInput[];
  onUnitChange: (index: number, updated: Partial<UnitInput>) => void;
  totalMonthlyRent: number;
  onClearProperty?: () => void;
}

const UNIT_OPTIONS: Array<{ count: 1 | 2 | 3 | 4; title: string; subtitle: string }> = [
  { count: 1, title: '1 Unit', subtitle: 'Single-Family' },
  { count: 2, title: '2 Units', subtitle: 'Duplex' },
  { count: 3, title: '3 Units', subtitle: 'Triplex' },
  { count: 4, title: '4 Units', subtitle: 'Fourplex' },
];

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function DynamicUnitSchedule({
  propertyAddress,
  onAddressChange,
  unitCount,
  onUnitCountChange,
  units,
  onUnitChange,
  totalMonthlyRent,
  onClearProperty,
}: DynamicUnitScheduleProps) {
  return (
    <div className="ra-card">
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
              flexShrink: 0,
            }}
          >
            1
          </span>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#060A2D', margin: 0 }}>
            Property &amp; 1–4 Unit Rent Schedule
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.73rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(4, 104, 233, 0.1)',
              color: '#0468E9',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {unitCount === 1 ? 'SFR (1 Unit)' : `${unitCount}-Unit Multi-Family`}
          </span>

          {onClearProperty && (
            <button
              type="button"
              onClick={onClearProperty}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                border: '1px solid #FECACA',
                cursor: 'pointer',
              }}
              title="Clear preset property and start blank"
            >
              ✕ Clear Property
            </button>
          )}
        </div>
      </div>

      {/* Property Address */}
      <div style={{ marginBottom: '1.15rem' }}>
        <label
          htmlFor="ra-property-address"
          style={{
            display: 'block',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '0.35rem',
          }}
        >
          Subject Property Address
        </label>
        <input
          id="ra-property-address"
          type="text"
          className="ra-input"
          value={propertyAddress}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter property address (e.g. 123 Main St, San Diego, CA)"
        />
      </div>

      {/* Segmented 1-4 Unit Toggle */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '0.45rem',
          }}
        >
          Property Type (1–4 Residential Units)
        </label>
        <div className="ra-segment-group" role="radiogroup" aria-label="Property Unit Count">
          {UNIT_OPTIONS.map((opt) => {
            const active = unitCount === opt.count;
            return (
              <button
                key={opt.count}
                type="button"
                role="radio"
                aria-checked={active}
                className={`ra-segment-btn ${active ? 'active' : ''}`}
                onClick={() => onUnitCountChange(opt.count)}
              >
                <span>{opt.title}</span>
                <span className="ra-segment-sub">{opt.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Unit Rent Schedule Rows */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.35rem',
            marginBottom: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Unit Rent Schedule ({unitCount} {unitCount === 1 ? 'Unit' : 'Units'})
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
            Values preserved when switching unit count
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {units.slice(0, unitCount).map((unit, idx) => (
            <div
              key={unit.id || `unit-${idx + 1}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
                gap: '0.65rem',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                padding: '0.65rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#060A2D',
                    marginBottom: '0.2rem',
                  }}
                >
                  {idx === 0 ? 'Unit 1 (Primary)' : `Unit ${idx + 1}`} Description
                </label>
                <input
                  type="text"
                  className="ra-input"
                  style={{ padding: '0.45rem 0.65rem', fontSize: '0.86rem' }}
                  value={unit.label}
                  onChange={(e) => onUnitChange(idx, { label: e.target.value })}
                  placeholder={idx === 0 ? 'e.g. 3 Bed / 2 Bath Main' : `Unit ${idx + 1} Config`}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#060A2D',
                    marginBottom: '0.2rem',
                  }}
                >
                  Expected Rent ($/mo)
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '0.65rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748B',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    className="ra-input"
                    style={{
                      padding: '0.45rem 0.65rem 0.45rem 1.45rem',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                    }}
                    value={unit.monthlyRent === 0 ? '' : unit.monthlyRent}
                    onChange={(e) =>
                      onUnitChange(idx, { monthlyRent: Math.max(0, Number(e.target.value) || 0) })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Scheduled Gross Rent Banner */}
        <div
          style={{
            marginTop: '0.9rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#060A2D' }}>
              Total Scheduled Gross Rent
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Annual Gross Scheduled Rent (GSR): {currencyFmt.format(totalMonthlyRent * 12)}/yr
            </div>
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#060A2D',
              backgroundColor: 'rgba(239, 181, 30, 0.2)',
              border: '1px solid rgba(239, 181, 30, 0.5)',
              padding: '0.35rem 0.85rem',
              borderRadius: '10px',
            }}
          >
            {currencyFmt.format(totalMonthlyRent)}{' '}
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>/mo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
