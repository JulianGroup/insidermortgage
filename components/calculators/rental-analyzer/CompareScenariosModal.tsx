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
  const pathname = window.location.pathname.endsWith('/')
    ? window.location.pathname
    : `${window.location.pathname}/`;
  const originPath = `${window.location.origin}${pathname}`;
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
  onLoadScenario,
}: CompareScenariosModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
    }
  }, [isOpen]);

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
      `${window.location.origin}/tools/rental-analyzer/ `
    );
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(lines.join('\r\n'))}`;
  };

  const handleDownloadComparisonPdf = () => {
    if (typeof window === 'undefined' || selectedComputed.length < 2) return;

    const escHtml = (val: string) =>
      val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const renderPrintSection = (title: string) =>
      `<tr class="sec"><td colspan="${selectedComputed.length + 1}">${escHtml(title)}</td></tr>`;

    const renderPrintRow = (
      label: string,
      values: string[],
      bestIdx: number | null = null,
      subLabel?: string
    ) => {
      const cells = values
        .map((v, idx) => {
          const isBest = bestIdx === idx;
          return `<td class="${isBest ? 'best' : ''}">${escHtml(v)}${
            isBest ? ' <span class="badge">BEST</span>' : ''
          }</td>`;
        })
        .join('');
      return `<tr><td class="lbl"><div>${escHtml(label)}</div>${
        subLabel ? `<div class="sub">${escHtml(subLabel)}</div>` : ''
      }</td>${cells}</tr>`;
    };

    const headerCols = selectedComputed
      .map(
        (c) =>
          `<th><div class="src">${escHtml(c.item.sourceLabel)}</div><div class="pname">${escHtml(
            c.item.name
          )}</div></th>`
      )
      .join('');

    const bodyRows = [
      renderPrintSection('1. Acquisition & Cash Required'),
      renderPrintRow(
        'Units & Strategy',
        selectedComputed.map((c) => {
          const { inputs } = c.item;
          const parts = [`${inputs.unitCount} ${inputs.unitCount === 1 ? 'Unit' : 'Units'}`];
          if (inputs.aduEnabled) {
            parts.push(`+ ${inputs.unitCount > 1 && inputs.aduCount === 2 ? '2 ADUs' : 'ADU'}`);
          }
          if (inputs.refiEnabled) {
            parts.push(`+ Yr ${inputs.refiYear ?? 3} Refi`);
          }
          return parts.join(' ');
        })
      ),
      renderPrintRow(
        'Purchase Price',
        selectedComputed.map((c) => fmt(c.item.inputs.purchasePrice))
      ),
      renderPrintRow(
        'Down Payment',
        selectedComputed.map(
          (c) => `${fmt(c.downPayment)} (${Math.round(c.item.inputs.downPaymentPct * 100)}%)`
        )
      ),
      renderPrintRow(
        'Loan Amount & Rate',
        selectedComputed.map(
          (c) =>
            `${fmt(c.loanAmount)} @ ${Number((c.item.inputs.interestRate * 100).toFixed(3))}%`
        )
      ),
      renderPrintRow(
        'Make-Ready + Yr 1 ADU Cost',
        selectedComputed.map((c) => fmt(c.makeReadyAndYr1AduCost))
      ),
      renderPrintRow(
        'Total Cash into Project',
        selectedComputed.map((c) => fmt(c.summary.initialCashInvested)),
        bestCashInvestedIdx,
        'Lowest upfront cash highlighted'
      ),
      renderPrintSection('2. Monthly Rent, PITIA & Cash Flow'),
      renderPrintRow(
        'Gross Monthly Rent',
        selectedComputed.map((c) => `${fmt(c.summary.totalMonthlyRent)}/mo`)
      ),
      renderPrintRow(
        'Initial Monthly PITIA',
        selectedComputed.map((c) => `${fmt(c.totalMonthlyPitia)}/mo`)
      ),
      renderPrintRow(
        'Year 1 Net Cash Flow',
        selectedComputed.map(
          (c) => `${fmt(c.monthlyCashFlow)}/mo (${fmt(c.summary.year1CashFlow)}/yr)`
        ),
        bestCashFlowIdx
      ),
      renderPrintSection('3. Investment Overview (2x2 KPIs)'),
      renderPrintRow(
        'Cash on Cash (COC)',
        selectedComputed.map((c) => `${c.cocPct.toFixed(2)}%`),
        bestCocIdx
      ),
      renderPrintRow(
        'DSCR (Rent / PITIA)',
        selectedComputed.map((c) => `${c.dscr.toFixed(2)}%`),
        bestDscrIdx
      ),
      renderPrintRow(
        'Net Operating Income (NOI)',
        selectedComputed.map((c) => `${fmt(c.summary.year1Noi)}/yr`),
        bestNoiIdx
      ),
      renderPrintRow(
        'Cap Rate (on Basis)',
        selectedComputed.map((c) => `${c.capRate.toFixed(2)}%`),
        bestCapRateIdx
      ),
      renderPrintSection('4. 5-Year & 10-Year Horizons'),
      renderPrintRow(
        '5-Yr Net Lifetime Profit & ROI',
        selectedComputed.map(
          (c) =>
            `${fmt(c.summary.fiveYear.totalProfit)} (${c.summary.fiveYear.totalRoiPct.toFixed(1)}%)`
        )
      ),
      renderPrintRow(
        '5-Yr IRR',
        selectedComputed.map((c) => `${c.summary.fiveYear.irrPct.toFixed(2)}%`),
        bestIrr5Idx
      ),
      renderPrintRow(
        '10-Yr Net Lifetime Profit & ROI',
        selectedComputed.map(
          (c) =>
            `${fmt(c.summary.tenYear.totalProfit)} (${c.summary.tenYear.totalRoiPct.toFixed(1)}%)`
        )
      ),
      renderPrintRow(
        '10-Yr IRR',
        selectedComputed.map((c) => `${c.summary.tenYear.irrPct.toFixed(2)}%`),
        bestIrr10Idx
      ),
      renderPrintRow(
        'Day-1 Break-Even Rent Needed',
        selectedComputed.map((c) => `${fmt(c.breakEvenRent)}/mo`)
      ),
    ].join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Insider Mortgage - Side-by-Side Investment Property Analysis</title>
  <style>
    @page { size: landscape; margin: 0.45in; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0F172A; background: #FFFFFF; }
    .hdr { background: #060A2D; color: #FFFFFF; padding: 14px 18px; border-bottom: 4px solid #EFB51E; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
    .eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #EFB51E; }
    h1 { margin: 3px 0 0; font-size: 18px; font-weight: 800; }
    .meta { text-align: right; font-size: 11px; color: #CBD5E1; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #CBD5E1; font-size: 11px; }
    th { background: #F8FAFC; border-bottom: 2px solid #060A2D; padding: 8px 10px; text-align: right; vertical-align: bottom; }
    th.mcol { text-align: left; text-transform: uppercase; font-size: 10px; color: #475569; letter-spacing: 0.04em; width: 22%; }
    .src { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #0468E9; }
    .pname { font-size: 12px; font-weight: 800; color: #060A2D; margin-top: 2px; }
    tr.sec td { background: #EFF6FF; color: #0468E9; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 10px; border-top: 1px solid #DBEAFE; border-bottom: 1px solid #DBEAFE; text-align: left; }
    td { padding: 6px 10px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 600; }
    td.lbl { text-align: left; background: #F8FAFC; color: #334155; font-weight: 600; }
    .sub { font-size: 9px; font-weight: 500; color: #64748B; }
    td.best { background: #F0FDF4; color: #15803D; font-weight: 800; }
    .badge { display: inline-block; font-size: 8px; font-weight: 800; color: #15803D; background: #DCFCE7; border: 1px solid #86EFAC; padding: 1px 4px; border-radius: 3px; margin-left: 4px; }
    .ftr { margin-top: 10px; padding: 8px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; font-size: 10px; color: #475569; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="hdr">
    <div>
      <div class="eyebrow">Insider Mortgage · Investment Property Analyzer</div>
      <h1>Side-by-Side Investment Property Analysis (${selectedComputed.length} Properties)</h1>
    </div>
    <div class="meta">
      <div>Generated ${escHtml(dateStr)}</div>
      <div>insidermortgage.com/ra</div>
    </div>
  </div>
  <table>
    <thead>
      <tr><th class="mcol">Underwriting Metric</th>${headerCols}</tr>
    </thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <div class="ftr">
    <div><strong>David Sider</strong> (NMLS #254108 · CA DRE #01193796) &amp; <strong>Rakesh Jain</strong> (NMLS #240594 · CA DRE #01336748) · Insider Mortgage powered by C2 Financial Corp (NMLS #135622)</div>
    <div>(858) 848-5653 · dsrj@insidermtg.com</div>
  </div>
</body>
</html>`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 1500);
    }, 150);
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

  const placeholderCount = Math.max(0, 2 - selectedComputed.length);
  const totalDataCols = selectedComputed.length + placeholderCount;

  const renderSectionRow = (title: string) => (
    <tr>
      <td
        colSpan={totalDataCols + 1}
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
      {Array.from({ length: placeholderCount }).map((_, idx) => (
        <td
          key={`empty-${idx}`}
          style={{
            padding: '0.55rem 0.75rem',
            fontSize: '0.84rem',
            fontWeight: 500,
            color: '#CBD5E1',
            backgroundColor: '#FFFFFF',
            textAlign: 'right',
            verticalAlign: 'middle',
            minWidth: '150px',
          }}
        >
          —
        </td>
      ))}
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
        backgroundColor: 'rgba(2, 6, 23, 0.84)',
        backdropFilter: 'blur(6px)',
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
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.22), 0 32px 72px -12px rgba(0, 0, 0, 0.85)',
          border: '2px solid #EFB51E',
          overflow: 'hidden',
        }}
      >
        {/* Top Navy Header */}
        <div
          style={{
            backgroundColor: '#060A2D',
            color: '#FFFFFF',
            padding: '1rem 1.25rem',
            flexShrink: 0,
            borderBottom: '3px solid #EFB51E',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'nowrap',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h3
                id="compare-modal-title"
                style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: '#EFB51E',
                }}
              >
                ⚖️ Side-by-Side Investment Property Analysis
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.65rem 1.25rem',
                  marginTop: '0.55rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {[
                  { num: 1, text: `Select up to 4 properties to compare (${selectedIds.length}/4)` },
                  { num: 2, text: 'Review the report' },
                  { num: 3, text: 'Save as PDF / Email Comparison' },
                ].map((step) => (
                  <div
                    key={step.num}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#060A2D',
                        border: '1.5px solid #EFB51E',
                        color: '#EFB51E',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        flexShrink: 0,
                      }}
                    >
                      {step.num}
                    </span>
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '999px',
                padding: '0.38rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Property Picker Bar */}
          <div
            style={{
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            {selectedIds.length >= 4 && (
              <div
                style={{
                  marginBottom: '0.45rem',
                  fontSize: '0.74rem',
                  color: '#EFB51E',
                  fontWeight: 700,
                }}
              >
                Maximum of 4 properties reached — uncheck one to swap
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {availableScenarios.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isDisabled = !isSelected && selectedIds.length >= 4;
                return (
                  <label
                    key={item.id}
                    title={isDisabled ? 'Max 4 properties selected' : `Select ${item.name}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.35rem 0.72rem',
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
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handleToggleScenario(item.id)}
                      style={{
                        width: '14px',
                        height: '14px',
                        margin: 0,
                        accentColor: '#060A2D',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                    />
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
                  </label>
                );
              })}
            </div>

            {/* Action Buttons Below Saved Scenarios */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.55rem',
                marginTop: '0.8rem',
                paddingTop: '0.7rem',
                borderTop: '1px solid rgba(255,255,255,0.14)',
              }}
            >
              <button
                type="button"
                disabled={selectedComputed.length < 2}
                onClick={handleEmailComparison}
                title={
                  selectedComputed.length < 2
                    ? 'Select at least 2 properties to email comparison'
                    : 'Email this side-by-side comparison'
                }
                style={{
                  backgroundColor: selectedComputed.length >= 2 ? '#EFB51E' : 'rgba(239, 181, 30, 0.28)',
                  color: selectedComputed.length >= 2 ? '#060A2D' : 'rgba(255, 255, 255, 0.55)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: selectedComputed.length >= 2 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                ✉️ Email Comparison
              </button>

              <button
                type="button"
                disabled={selectedComputed.length < 2}
                onClick={handleDownloadComparisonPdf}
                title={
                  selectedComputed.length < 2
                    ? 'Select at least 2 properties to download PDF report'
                    : 'Print or save this side-by-side comparison as a PDF'
                }
                style={{
                  backgroundColor: selectedComputed.length >= 2 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)',
                  color: selectedComputed.length >= 2 ? '#060A2D' : 'rgba(255, 255, 255, 0.55)',
                  border: selectedComputed.length >= 2 ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: selectedComputed.length >= 2 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                🖨 Download PDF Report
              </button>

              {selectedComputed.length < 2 && (
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EFB51E' }}>
                  Select at least 2 properties to enable Email &amp; PDF export.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Comparison Table */}
        <div style={{ overflow: 'auto', flex: 1, padding: '0 0 1rem' }}>
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
                {Array.from({ length: placeholderCount }).map((_, idx) => (
                  <th
                    key={`placeholder-${idx}`}
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
                        color: '#94A3B8',
                        marginBottom: '0.15rem',
                      }}
                    >
                      Property {selectedComputed.length + idx + 1}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#64748B',
                        fontStyle: 'italic',
                      }}
                    >
                      Select above to compare
                    </div>
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
        </div>
      </div>
    </div>
  );
}
