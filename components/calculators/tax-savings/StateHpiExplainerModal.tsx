'use client';

import React, { useEffect } from 'react';
import { TaxStateCode } from '../../../lib/tax-savings-engine';
import stateHpiData from '../../../src/data/stateHpiData.json';

interface StateHpiExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedState: TaxStateCode;
  onApplyStateHpiRate?: (ratePct: number) => void;
}

const ORDERED_CODES: Array<TaxStateCode | 'US'> = ['CA', 'WA', 'UT', 'AZ', 'FL', 'US'];

export default function StateHpiExplainerModal({
  isOpen,
  onClose,
  selectedState,
  onApplyStateHpiRate,
}: StateHpiExplainerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const active = stateHpiData.states[selectedState];
  const cp = active.cycleCheckpoints;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(5px)',
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
        aria-labelledby="hpi-explainer-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '760px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #EFB51E',
          boxShadow: '0 28px 60px -12px rgba(0, 0, 0, 0.75)',
          overflow: 'hidden',
        }}
      >
        {/* Navy Header */}
        <div
          style={{
            backgroundColor: '#060A2D',
            color: '#FFFFFF',
            padding: '1rem 1.35rem',
            borderBottom: '3px solid #EFB51E',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#EFB51E',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              FHFA 20-Year Historical Home Appreciation ({stateHpiData.startQuarter} →{' '}
              {stateHpiData.endQuarter})
            </div>
            <h3
              id="hpi-explainer-title"
              style={{
                margin: '0.18rem 0 0',
                fontSize: '1.18rem',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              {active.name}: {active.cagr20YrPct.toFixed(2)}% Annualized (20-Yr CAGR)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: '999px',
              padding: '0.32rem 0.78rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '1.25rem 1.35rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
            fontSize: '0.86rem',
            color: '#1E293B',
            lineHeight: 1.55,
          }}
        >
          {/* Exact Math Box for Selected State */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderLeft: '4px solid #060A2D',
              borderRadius: '12px',
              padding: '1rem 1.1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#0468E9',
                marginBottom: '0.45rem',
              }}
            >
              How {active.name}&apos;s {active.cagr20YrPct.toFixed(2)}%/yr Was Calculated
            </div>
            <p style={{ margin: '0 0 0.65rem', color: '#334155' }}>
              To avoid cherry-picking only recent boom years, this benchmark measures{' '}
              <strong>20 full years</strong> from{' '}
              <strong>
                {active.startQuarter} (Index: {active.startIndex.toFixed(2)})
              </strong>{' '}
              near the mid-2000s peak to{' '}
              <strong>
                {active.endQuarter} (Index: {active.endIndex.toFixed(2)})
              </strong>
              , spanning multiple full housing and economic cycles.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: '0.6rem',
                marginBottom: '0.7rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>
                  {active.startQuarter} Index
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#060A2D' }}>
                  {active.startIndex.toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>
                  {active.endQuarter} Index
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#060A2D' }}>
                  {active.endIndex.toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>
                  20-Yr Total Growth
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803D' }}>
                  +{active.totalGrowthPct.toFixed(2)}%
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#060A2D',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.8rem',
              }}
            >
              CAGR = ({active.endIndex.toFixed(2)} ÷ {active.startIndex.toFixed(2)})^(1/20) − 1 ={' '}
              <strong style={{ color: '#EFB51E' }}>{active.cagr20YrPct.toFixed(2)}% / yr</strong>
            </div>

            {cp && (
              <div
                style={{
                  marginTop: '0.65rem',
                  fontSize: '0.79rem',
                  color: '#475569',
                  lineHeight: 1.5,
                }}
              >
                <strong>Economic Cycles Captured in {active.name}:</strong>{' '}
                {cp.preCrashPeak && cp.greatRecessionTrough ? (
                  <>
                    2000s peak ({cp.preCrashPeak.quarter}: {cp.preCrashPeak.index.toFixed(2)}) →
                    Great Recession trough ({cp.greatRecessionTrough.quarter}:{' '}
                    {cp.greatRecessionTrough.index.toFixed(2)},{' '}
                    <strong>{cp.peakToTroughPct}%</strong> drawdown)
                    {cp.preCovid2019
                      ? ` → Pre-COVID (${cp.preCovid2019.quarter}: ${cp.preCovid2019.index.toFixed(
                          2
                        )})`
                      : ''}
                    {` → ${active.endQuarter} (${active.endIndex.toFixed(2)}, `}
                    <strong>+{cp.troughToLatestPct}%</strong> from trough).
                  </>
                ) : (
                  'Spans the 2006–2012 housing downturn, 2012–2019 expansion, 2020–2022 surge, and 2022–2026 rate cycle.'
                )}
              </div>
            )}
          </div>

          {/* 5-State + U.S. Comparison Table */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#060A2D',
                }}
              >
                20-Year FHFA Benchmark Across All 5 States &amp; U.S. Average
              </div>
              {onApplyStateHpiRate && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyStateHpiRate(active.cagr20YrPct);
                    onClose();
                  }}
                  style={{
                    padding: '0.32rem 0.72rem',
                    borderRadius: '999px',
                    border: '1px solid #060A2D',
                    backgroundColor: '#EFB51E',
                    color: '#060A2D',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Use {active.name}&apos;s {active.cagr20YrPct.toFixed(2)}% Rate
                </button>
              )}
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '10px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#060A2D', color: '#FFFFFF' }}>
                    <th style={{ padding: '0.55rem 0.7rem', textAlign: 'left' }}>State</th>
                    <th style={{ padding: '0.55rem 0.7rem', textAlign: 'right' }}>
                      {stateHpiData.startQuarter}
                    </th>
                    <th style={{ padding: '0.55rem 0.7rem', textAlign: 'right' }}>
                      {stateHpiData.endQuarter}
                    </th>
                    <th style={{ padding: '0.55rem 0.7rem', textAlign: 'right' }}>20-Yr Gain</th>
                    <th style={{ padding: '0.55rem 0.7rem', textAlign: 'right' }}>
                      20-Yr CAGR
                    </th>
                    <th style={{ padding: '0.55rem 0.7rem', textAlign: 'center' }}>FRED Series</th>
                  </tr>
                </thead>
                <tbody>
                  {ORDERED_CODES.map((code, idx) => {
                    const row = stateHpiData.states[code];
                    const isSelected = code === selectedState;
                    return (
                      <tr
                        key={code}
                        style={{
                          backgroundColor: isSelected
                            ? '#FFFBEB'
                            : idx % 2 === 0
                            ? '#FFFFFF'
                            : '#F8FAFC',
                          fontWeight: isSelected ? 700 : 500,
                          borderBottom: '1px solid #E2E8F0',
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.7rem', color: '#060A2D' }}>
                          {row.name} {isSelected ? '(Selected)' : ''}
                        </td>
                        <td style={{ padding: '0.5rem 0.7rem', textAlign: 'right' }}>
                          {row.startIndex.toFixed(2)}
                        </td>
                        <td style={{ padding: '0.5rem 0.7rem', textAlign: 'right' }}>
                          {row.endIndex.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '0.5rem 0.7rem',
                            textAlign: 'right',
                            color: '#15803D',
                            fontWeight: 700,
                          }}
                        >
                          +{row.totalGrowthPct.toFixed(1)}%
                        </td>
                        <td
                          style={{
                            padding: '0.5rem 0.7rem',
                            textAlign: 'right',
                            color: '#060A2D',
                            fontWeight: 800,
                          }}
                        >
                          {row.cagr20YrPct.toFixed(2)}%/yr
                        </td>
                        <td style={{ padding: '0.5rem 0.7rem', textAlign: 'center' }}>
                          <a
                            href={row.fredUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#0468E9',
                              fontWeight: 700,
                              textDecoration: 'underline',
                            }}
                          >
                            {row.seriesId} ↗
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Source Footer */}
          <div
            style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '10px',
              padding: '0.75rem 0.95rem',
              fontSize: '0.76rem',
              color: '#475569',
              lineHeight: 1.5,
            }}
          >
            <div>
              <strong>Official Source:</strong> {stateHpiData.source}. You can verify any state or
              metro period directly with the{' '}
              <a
                href={stateHpiData.fhfaCalculatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0468E9', fontWeight: 700, textDecoration: 'underline' }}
              >
                FHFA HPI® Calculator ↗
              </a>
              .
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <em>
                Disclaimer: Historical 20-year appreciation rates span multiple economic cycles for
                educational reference only and do not guarantee future home price performance. Local
                county and neighborhood results vary.
              </em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
