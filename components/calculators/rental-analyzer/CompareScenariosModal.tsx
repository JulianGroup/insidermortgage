'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  UnderwriteInputs,
  UnderwriteSummary,
  runUnderwriteModel,
} from '../../../lib/financial-engine';
import { FeaturedDeal } from './featuredDeals';

export interface ComparableScenarioItem {
  id: string;
  name: string;
  sourceLabel: string; // 'Current' | 'Saved on Device' | 'Featured Deal'
  inputs: UnderwriteInputs;
  featuredDeal?: FeaturedDeal | null;
}

interface CompareScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableScenarios: ComparableScenarioItem[];
  initialSelectedIds: string[];
  onLoadScenario: (item: ComparableScenarioItem) => void;
}

interface ComputedScenario {
  item: ComparableScenarioItem;
  summary: UnderwriteSummary;
  downPayment: number;
  loanAmount: number;
  totalMonthlyPitia: number;
  monthlyCashFlow: number;
  cocPct: number;
  dscr: number;
  makeReadyAndYr1AduCost: number;
  basisValue: number;
  capRate: number;
  breakEvenRent: number;
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const fmt = (n: number) => currencyFmt.format(Math.round(n));

/** Computes all side-by-side comparison metrics for a scenario item. */
function computeScenarioMetrics(item: ComparableScenarioItem): ComputedScenario {
  const { inputs } = item;
  const summary = runUnderwriteModel(inputs);
  const downPayment = inputs.purchasePrice * inputs.downPaymentPct;
  const loanAmount = summary.loanAmount;
  const monthlyPropertyTax = (inputs.purchasePrice * inputs.propertyTaxRate) / 12;
  const monthlyInsurance = (inputs.purchasePrice * inputs.insuranceRate) / 12;
  const monthlyHoa = inputs.monthlyHoa || 0;
  const totalMonthlyPitia =
    summary.monthlyPmt + monthlyPropertyTax + monthlyInsurance + monthlyHoa;
  const monthlyCashFlow = summary.year1CashFlow / 12;
  const cocPct =
    summary.initialCashInvested > 0
      ? (summary.year1CashFlow / summary.initialCashInvested) * 100
      : 0;
  const dscr = totalMonthlyPitia > 0 ? summary.totalMonthlyRent / totalMonthlyPitia : 0;

  const aduMultiplier = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;
  const aduInYear1 = Boolean(inputs.aduEnabled && (inputs.aduStartMonth ?? 0) < 12);
  const effectiveAduCostYr1 = aduInYear1 ? (inputs.aduCost || 0) * aduMultiplier : 0;
  const makeReadyAndYr1AduCost = (inputs.makeReadyCost || 0) + effectiveAduCostYr1;
  const basisValue = (inputs.purchasePrice || 0) + makeReadyAndYr1AduCost;
  const capRate = basisValue > 0 ? (summary.year1Noi / basisValue) * 100 : 0;

  const egiFactor = 12 * (1 - inputs.vacancyRate) * (1 - inputs.propMgmtRate);
  const breakEvenRent =
    egiFactor > 0
      ? summary.totalMonthlyRent - summary.year1CashFlow / egiFactor
      : summary.totalMonthlyRent;

  return {
    item,
    summary,
    downPayment,
    loanAmount,
    totalMonthlyPitia,
    monthlyCashFlow,
    cocPct,
    dscr,
    makeReadyAndYr1AduCost,
    basisValue,
    capRate,
    breakEvenRent,
  };
}

const BASELINE_DEFAULTS: Partial<UnderwriteInputs> = {
  downPaymentPct: 0.25,
  interestRate: 0.075,
  loanTermYears: 30,
  makeReadyCost: 10000,
  vacancyRate: 0.03,
  propMgmtRate: 0.05,
  propertyTaxRate: 0.0125,
  insuranceRate: 0.0035,
  monthlyHoa: 0,
  monthlyMaintenance: 200,
  propertyTaxGrowthRate: 0.02,
  insuranceGrowthRate: 0.05,
  annualRentGrowth: 0.03,
  annualAppreciation: 0.04,
  sellingCostPct: 0.05,
  refiEnabled: false,
  refiYear: 3,
  refiNewRate: 0.0625,
  refiReset30: true,
  aduEnabled: false,
  aduCount: 1,
  aduCost: 200000,
  aduRentMonthly: 2200,
  aduStartMonth: 0,
  aduConstructionMonths: 6,
  aduMainRentDiscountPct: 0.25,
};

/** Builds a compact, clickable share URL that opens the exact scenario in the analyzer. */
function buildScenarioShareUrl(item: ComparableScenarioItem): string {
  if (typeof window === 'undefined') return '';
  const originPath = `${window.location.origin}${window.location.pathname}`;
  try {
    const { inputs } = item;
    const compact: Record<string, unknown> = {
      propertyAddress: inputs.propertyAddress,
      unitCount: inputs.unitCount,
      units: inputs.units.slice(0, inputs.unitCount),
      purchasePrice: inputs.purchasePrice,
    };
    (Object.keys(inputs) as (keyof UnderwriteInputs)[]).forEach((key) => {
      if (
        key !== 'propertyAddress' &&
        key !== 'unitCount' &&
        key !== 'units' &&
        key !== 'purchasePrice' &&
        inputs[key] !== BASELINE_DEFAULTS[key]
      ) {
        compact[key] = inputs[key];
      }
    });
    const utf8Bytes = unescape(encodeURIComponent(JSON.stringify(compact)));
    const b64url = window
      .btoa(utf8Bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const dealSuffix = item.featuredDeal
      ? `&deal=${encodeURIComponent(item.featuredDeal.id)}`
      : '';
    return `${originPath}?s=${b64url}${dealSuffix}`;
  } catch {
    return originPath;
  }
}

/** Side-by-side comparison modal allowing users to select and compare 2 to 4 properties. */
export default function CompareScenariosModal({
  isOpen,
  onClose,
  availableScenarios,
  initialSelectedIds,
  onLoadScenario,
}: CompareScenariosModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds.slice(0, 4));
    }
  }, [isOpen, initialSelectedIds]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const selectedComputed = useMemo(() => {
    const byId = new Map(availableScenarios.map((s) => [s.id, s]));
    return selectedIds
      .map((id) => byId.get(id))
      .filter((s): s is ComparableScenarioItem => Boolean(s))
      .map(computeScenarioMetrics);
  }, [availableScenarios, selectedIds]);

  if (!isOpen) return null;

  const handleToggleScenario = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((existing) => existing !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const getBestIndex = (values: number[], direction: 'max' | 'min'): number | null => {
    if (values.length < 2) return null;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    if (Math.abs(maxVal - minVal) < 1e-6) return null;
    const target = direction === 'max' ? maxVal : minVal;
    return values.findIndex((v) => Math.abs(v - target) < 1e-6);
  };

  const handleEmailComparison = () => {
    if (typeof window === 'undefined' || selectedComputed.length === 0) return;
    const names = selectedComputed.map((c) => c.item.name).join(' vs. ');
    const subject = `Rental Property Comparison: ${names}`;
    const lines: string[] = [
      `Side-by-Side Rental Property Comparison (${selectedComputed.length} Properties)`,
      '',
    ];

    selectedComputed.forEach((c, idx) => {
      const { inputs } = c.item;
      const flags = [
        `${inputs.unitCount} ${inputs.unitCount === 1 ? 'Unit' : 'Units'}`,
        inputs.aduEnabled ? '+ ADU' : '',
        inputs.refiEnabled ? `+ Yr ${inputs.refiYear ?? 3} Refi` : '',
      ]
        .filter(Boolean)
        .join(' ');
      const shareUrl = buildScenarioShareUrl(c.item);
      lines.push(
        `${idx + 1}. ${inputs.propertyAddress || c.item.name} (${flags})`,
        `   • Purchase Price: ${fmt(inputs.purchasePrice)} | Total Cash Invested: ${fmt(
          c.summary.initialCashInvested
        )}`,
        `   • Gross Rent: ${fmt(c.summary.totalMonthlyRent)}/mo | PITIA: ${fmt(
          c.totalMonthlyPitia
        )}/mo | Yr 1 Cash Flow: ${fmt(c.monthlyCashFlow)}/mo (${fmt(c.summary.year1CashFlow)}/yr)`,
        `   • CoC: ${c.cocPct.toFixed(2)}% | DSCR: ${c.dscr.toFixed(2)}% | NOI: ${fmt(
          c.summary.year1Noi
        )}/yr | Cap Rate: ${c.capRate.toFixed(2)}%`,
        `   • 5-Yr IRR: ${c.summary.fiveYear.irrPct.toFixed(
          2
        )}% | 10-Yr IRR: ${c.summary.tenYear.irrPct.toFixed(2)}%`,
        `   • Direct Scenario Link: ${shareUrl} `,
        ''
      );
    });

    lines.push(
      'Open the analyzer to compare or edit scenarios:',
      `${window.location.origin}/tools/rental-analyzer `
    );
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(lines.join('\r\n'))}`;
  };

  const bestCashInvestedIdx = getBestIndex(
    selectedComputed.map((c) => c.summary.initialCashInvested),
    'min'
  );
  const bestCashFlowIdx = getBestIndex(
    selectedComputed.map((c) => c.summary.year1CashFlow),
    'max'
  );
  const bestCocIdx = getBestIndex(
    selectedComputed.map((c) => c.cocPct),
    'max'
  );
  const bestDscrIdx = getBestIndex(
    selectedComputed.map((c) => c.dscr),
    'max'
  );
  const bestNoiIdx = getBestIndex(
    selectedComputed.map((c) => c.summary.year1Noi),
    'max'
  );
  const bestCapRateIdx = getBestIndex(
    selectedComputed.map((c) => c.capRate),
    'max'
  );
  const bestIrr5Idx = getBestIndex(
    selectedComputed.map((c) => c.summary.fiveYear.irrPct),
    'max'
  );
  const bestIrr10Idx = getBestIndex(
    selectedComputed.map((c) => c.summary.tenYear.irrPct),
    'max'
  );

  const renderSectionRow = (title: string) => (
    <tr>
      <td
        colSpan={selectedComputed.length + 1}
        style={{
          backgroundColor: '#EFF6FF',
          color: '#0468E9',
          fontSize: '0.73rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '0.5rem 0.75rem',
          borderTop: '1px solid #DBEAFE',
          borderBottom: '1px solid #DBEAFE',
        }}
      >
        {title}
      </td>
    </tr>
  );

  const renderMetricRow = (
    label: string,
    cells: React.ReactNode[],
    bestIdx: number | null = null,
    subLabel?: string
  ) => (
    <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
      <td
        style={{
          padding: '0.55rem 0.75rem',
          fontWeight: 600,
          fontSize: '0.82rem',
          color: '#334155',
          backgroundColor: '#F8FAFC',
          position: 'sticky',
          left: 0,
          zIndex: 1,
          minWidth: '175px',
        }}
      >
        <div>{label}</div>
        {subLabel && (
          <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748B' }}>{subLabel}</div>
        )}
      </td>
      {cells.map((cell, idx) => {
        const isBest = bestIdx === idx;
        return (
          <td
            key={idx}
            style={{
              padding: '0.55rem 0.75rem',
              fontSize: '0.84rem',
              fontWeight: isBest ? 800 : 600,
              color: isBest ? '#15803D' : '#0F172A',
              backgroundColor: isBest ? '#F0FDF4' : '#FFFFFF',
              textAlign: 'right',
              verticalAlign: 'middle',
              minWidth: '150px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
              <span>{cell}</span>
              {isBest && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    border: '1px solid #86EFAC',
                    padding: '0.06rem 0.32rem',
                    borderRadius: '4px',
                  }}
                >
                  Best
                </span>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  );

  return (
    <div
      className="no-print"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(6, 10, 45, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-modal-title"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '1060px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(6, 10, 45, 0.45)',
          border: '2px solid #060A2D',
          overflow: 'hidden',
        }}
      >
        {/* Top Navy Header */}
        <div
          style={{
            backgroundColor: '#060A2D',
            color: '#FFFFFF',
            padding: '0.95rem 1.2rem',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: '#EFB51E',
                }}
              >
                ⚖️ Side-by-Side Underwriting Comparison
              </div>
              <h3
                id="compare-modal-title"
                style={{
                  margin: '0.15rem 0 0',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                Compare 2 to 4 Properties
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {selectedComputed.length >= 2 && (
                <button
                  type="button"
                  onClick={handleEmailComparison}
                  style={{
                    backgroundColor: '#EFB51E',
                    color: '#060A2D',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  ✉️ Email Comparison
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close comparison"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '999px',
                  padding: '0.38rem 0.8rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Property Picker Bar */}
          <div
            style={{
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginBottom: '0.45rem',
                fontSize: '0.74rem',
                color: '#CBD5E1',
              }}
            >
              <span>
                Select 2 to 4 properties to compare ({selectedIds.length}/4 selected):
              </span>
              {selectedIds.length >= 4 && (
                <span style={{ color: '#EFB51E', fontWeight: 700 }}>
                  Maximum of 4 properties reached — uncheck one to swap
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {availableScenarios.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isDisabled = !isSelected && selectedIds.length >= 4;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleToggleScenario(item.id)}
                    title={isDisabled ? 'Max 4 properties selected' : `Toggle ${item.name}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.7rem',
                      borderRadius: '999px',
                      border: isSelected
                        ? '1px solid #EFB51E'
                        : '1px solid rgba(255,255,255,0.24)',
                      backgroundColor: isSelected
                        ? '#EFB51E'
                        : 'rgba(255,255,255,0.09)',
                      color: isSelected ? '#060A2D' : '#FFFFFF',
                      opacity: isDisabled ? 0.45 : 1,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{item.name}</span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        opacity: isSelected ? 0.8 : 0.7,
                        fontWeight: 600,
                      }}
                    >
                      ({item.sourceLabel})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Comparison Table */}
        <div style={{ overflow: 'auto', flex: 1, padding: '0 0 1rem' }}>
          {selectedComputed.length < 2 ? (
            <div
              style={{
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: '#475569',
                fontSize: '0.95rem',
              }}
            >
              <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>⚖️</div>
              <strong>Select at least 2 properties above</strong> to compare them side by side.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '2px solid #060A2D',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  <th
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#475569',
                      backgroundColor: '#F8FAFC',
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                    }}
                  >
                    Underwriting Metric
                  </th>
                  {selectedComputed.map((c) => (
                    <th
                      key={c.item.id}
                      style={{
                        padding: '0.75rem',
                        textAlign: 'right',
                        verticalAlign: 'bottom',
                        backgroundColor: '#F8FAFC',
                        minWidth: '165px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#0468E9',
                          marginBottom: '0.15rem',
                        }}
                      >
                        {c.item.sourceLabel}
                      </div>
                      <div
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          color: '#060A2D',
                          lineHeight: 1.25,
                        }}
                      >
                        {c.item.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadScenario(c.item);
                          onClose();
                        }}
                        style={{
                          marginTop: '0.4rem',
                          padding: '0.22rem 0.55rem',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#060A2D',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Load in Analyzer →
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renderSectionRow('1. Acquisition & Cash Required')}
                {renderMetricRow(
                  'Units & Strategy',
                  selectedComputed.map((c) => {
                    const { inputs } = c.item;
                    const parts = [
                      `${inputs.unitCount} ${inputs.unitCount === 1 ? 'Unit' : 'Units'}`,
                    ];
                    if (inputs.aduEnabled) {
                      parts.push(`+ ${inputs.unitCount > 1 && inputs.aduCount === 2 ? '2 ADUs' : 'ADU'}`);
                    }
                    if (inputs.refiEnabled) {
                      parts.push(`+ Yr ${inputs.refiYear ?? 3} Refi`);
                    }
                    return parts.join(' ');
                  })
                )}
                {renderMetricRow(
                  'Purchase Price',
                  selectedComputed.map((c) => fmt(c.item.inputs.purchasePrice))
                )}
                {renderMetricRow(
                  'Down Payment',
                  selectedComputed.map(
                    (c) =>
                      `${fmt(c.downPayment)} (${Math.round(c.item.inputs.downPaymentPct * 100)}%)`
                  )
                )}
                {renderMetricRow(
                  'Loan Amount & Rate',
                  selectedComputed.map(
                    (c) =>
                      `${fmt(c.loanAmount)} @ ${Number(
                        (c.item.inputs.interestRate * 100).toFixed(3)
                      )}%`
                  )
                )}
                {renderMetricRow(
                  'Make-Ready + Yr 1 ADU Cost',
                  selectedComputed.map((c) => fmt(c.makeReadyAndYr1AduCost))
                )}
                {renderMetricRow(
                  'Total Cash into Project',
                  selectedComputed.map((c) => fmt(c.summary.initialCashInvested)),
                  bestCashInvestedIdx,
                  'Lowest upfront cash highlighted'
                )}

                {renderSectionRow('2. Monthly Rent, PITIA & Cash Flow')}
                {renderMetricRow(
                  'Gross Monthly Rent',
                  selectedComputed.map((c) => `${fmt(c.summary.totalMonthlyRent)}/mo`)
                )}
                {renderMetricRow(
                  'Initial Monthly PITIA',
                  selectedComputed.map((c) => `${fmt(c.totalMonthlyPitia)}/mo`)
                )}
                {renderMetricRow(
                  'Year 1 Net Cash Flow',
                  selectedComputed.map((c) => (
                    <span
                      key={c.item.id}
                      style={{ color: c.monthlyCashFlow >= 0 ? '#15803D' : '#B91C1C' }}
                    >
                      {fmt(c.monthlyCashFlow)}/mo ({fmt(c.summary.year1CashFlow)}/yr)
                    </span>
                  )),
                  bestCashFlowIdx
                )}

                {renderSectionRow('3. Investment Overview (2×2 KPIs)')}
                {renderMetricRow(
                  'Cash on Cash (COC)',
                  selectedComputed.map((c) => (
                    <span
                      key={c.item.id}
                      style={{ color: c.cocPct >= 0 ? '#15803D' : '#B91C1C' }}
                    >
                      {c.cocPct.toFixed(2)}%
                    </span>
                  )),
                  bestCocIdx
                )}
                {renderMetricRow(
                  'DSCR (Rent ÷ PITIA)',
                  selectedComputed.map((c) => `${c.dscr.toFixed(2)}%`),
                  bestDscrIdx
                )}
                {renderMetricRow(
                  'Net Operating Income (NOI)',
                  selectedComputed.map((c) => `${fmt(c.summary.year1Noi)}/yr`),
                  bestNoiIdx
                )}
                {renderMetricRow(
                  'Cap Rate (on Basis)',
                  selectedComputed.map((c) => `${c.capRate.toFixed(2)}%`),
                  bestCapRateIdx
                )}

                {renderSectionRow('4. 5-Year & 10-Year Horizons')}
                {renderMetricRow(
                  '5-Yr Net Lifetime Profit & ROI',
                  selectedComputed.map(
                    (c) =>
                      `${fmt(c.summary.fiveYear.totalProfit)} (${c.summary.fiveYear.totalRoiPct.toFixed(
                        1
                      )}%)`
                  )
                )}
                {renderMetricRow(
                  '5-Yr IRR',
                  selectedComputed.map((c) => `${c.summary.fiveYear.irrPct.toFixed(2)}%`),
                  bestIrr5Idx
                )}
                {renderMetricRow(
                  '10-Yr Net Lifetime Profit & ROI',
                  selectedComputed.map(
                    (c) =>
                      `${fmt(c.summary.tenYear.totalProfit)} (${c.summary.tenYear.totalRoiPct.toFixed(
                        1
                      )}%)`
                  )
                )}
                {renderMetricRow(
                  '10-Yr IRR',
                  selectedComputed.map((c) => `${c.summary.tenYear.irrPct.toFixed(2)}%`),
                  bestIrr10Idx
                )}
                {renderMetricRow(
                  'Day-1 Break-Even Rent Needed',
                  selectedComputed.map((c) => `${fmt(c.breakEvenRent)}/mo`)
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
