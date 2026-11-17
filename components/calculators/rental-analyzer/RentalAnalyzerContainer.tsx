'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  UnderwriteInputs,
  UnitInput,
  runUnderwriteModel,
} from '../../../lib/financial-engine';
import DynamicUnitSchedule from './DynamicUnitSchedule';
import InputControlPanel from './InputControlPanel';
import WhatIfModules from './WhatIfModules';
import SummaryKpiCards from './SummaryKpiCards';
import ProFormaTable from './ProFormaTable';
import AiInvestmentAnalysis from './AiInvestmentAnalysis';
import LeadCaptureModal from './LeadCaptureModal';
import MathReceiptModal, { MathMetricKey } from './MathReceiptModal';
import CompareScenariosModal, { ComparableScenarioItem } from './CompareScenariosModal';
import RentalAnalyzerPrintReport from './RentalAnalyzerPrintReport';
import {
  getRentalReportPdfFileName,
  detectPropertyState,
  extractStreetAddress,
} from './stateDetector';
import { FEATURED_DEALS, FeaturedDeal } from './featuredDeals';
import './rental-analyzer.css';

export interface RentalAnalyzerContainerProps {
  mode?: 'public' | 'admin';
}

interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  inputs: UnderwriteInputs;
}

const SAVED_SCENARIOS_STORAGE_KEY = 'im_rental_saved_scenarios_v1';

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const DEFAULT_UNITS_CACHE: UnitInput[] = [
  { id: 'unit-1', label: '3 Bed / 2 Bath Main House', monthlyRent: 2600 },
  { id: 'unit-2', label: '1 Bed / 1 Bath Attached', monthlyRent: 2200 },
  { id: 'unit-3', label: 'Unit 3 (2 Bed / 1 Bath)', monthlyRent: 2100 },
  { id: 'unit-4', label: 'Unit 4 (1 Bed / 1 Bath)', monthlyRent: 1950 },
];

const BLANK_UNITS_CACHE: UnitInput[] = [
  { id: 'unit-1', label: 'Unit 1', monthlyRent: 0 },
  { id: 'unit-2', label: 'Unit 2', monthlyRent: 0 },
  { id: 'unit-3', label: 'Unit 3', monthlyRent: 0 },
  { id: 'unit-4', label: 'Unit 4', monthlyRent: 0 },
];

const INITIAL_DUPLEX_INPUTS: UnderwriteInputs = {
  propertyAddress: '535 Tam O Shanter Dr, San Marcos, CA 92069',
  unitCount: 2,
  units: DEFAULT_UNITS_CACHE.slice(0, 2),
  purchasePrice: 880000,
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

export default function RentalAnalyzerContainer({
  mode = 'public',
}: RentalAnalyzerContainerProps) {
  const [activePreset, setActivePreset] = useState<
    'tam-o-shanter' | 'crawford' | 'fourplex' | 'custom' | string
  >('tam-o-shanter');
  const [unitCache, setUnitCache] = useState<UnitInput[]>(DEFAULT_UNITS_CACHE);
  const [inputs, setInputs] = useState<UnderwriteInputs>(INITIAL_DUPLEX_INPUTS);
  const [publicUnlocked, setPublicUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMathMetric, setActiveMathMetric] = useState<MathMetricKey | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Load saved scenarios from localStorage
    try {
      const raw = window.localStorage.getItem(SAVED_SCENARIOS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedScenarios(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }

    // 2. Check URL for shared scenario (?s=... and optional ?deal=...)
    try {
      const params = new URLSearchParams(window.location.search);
      const dealParam = params.get('deal');
      const matchedDeal = dealParam
        ? FEATURED_DEALS.find((d) => d.id === dealParam) || null
        : null;
      const encoded = params.get('s');

      if (encoded) {
        // Support both compact base64url and legacy encodeURIComponent base64
        const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        const rawStr = window.atob(padded);
        const decodedJson = rawStr.startsWith('%7B')
          ? decodeURIComponent(rawStr)
          : decodeURIComponent(escape(rawStr));
        const parsedInputs = JSON.parse(decodedJson) as Partial<UnderwriteInputs>;
        if (parsedInputs && typeof parsedInputs === 'object') {
          const merged: UnderwriteInputs = {
            ...INITIAL_DUPLEX_INPUTS,
            ...(matchedDeal ? matchedDeal.inputs : {}),
            ...parsedInputs,
          };
          const nextUnits: UnitInput[] = DEFAULT_UNITS_CACHE.map((u, idx) =>
            merged.units && merged.units[idx] ? { ...u, ...merged.units[idx] } : u
          );
          setUnitCache(nextUnits);
          setInputs({
            ...merged,
            units: nextUnits.slice(0, merged.unitCount || 1),
          });
          setActivePreset(matchedDeal ? matchedDeal.id : 'custom');
        }
      } else if (matchedDeal) {
        const merged: UnderwriteInputs = {
          ...INITIAL_DUPLEX_INPUTS,
          ...matchedDeal.inputs,
        };
        const nextUnits: UnitInput[] = DEFAULT_UNITS_CACHE.map((u, idx) =>
          merged.units && merged.units[idx] ? { ...u, ...merged.units[idx] } : u
        );
        setUnitCache(nextUnits);
        setInputs({
          ...merged,
          units: nextUnits.slice(0, merged.unitCount || 1),
        });
        setActivePreset(matchedDeal.id);
      }
    } catch {
      // ignore invalid URL parameter
    }
  }, []);

  useEffect(() => {
    if (mode === 'public' && typeof window !== 'undefined') {
      try {
        if (window.sessionStorage.getItem('im_rental_analyzer_unlocked') === 'true') {
          setPublicUnlocked(true);
        }
      } catch {
        // ignore storage errors
      }
    }
  }, [mode]);

  const isLockedPublic = mode === 'public' && !publicUnlocked;

  const handlePatchInputs = (patch: Partial<UnderwriteInputs>) => {
    setInputs((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const handleUnitCountChange = (newCount: 1 | 2 | 3 | 4) => {
    setInputs((prev) => ({
      ...prev,
      unitCount: newCount,
      units: unitCache.slice(0, newCount),
      aduCount: newCount === 1 ? 1 : prev.aduCount ?? 1,
    }));
  };

  const handleUnitChange = (index: number, updated: Partial<UnitInput>) => {
    setUnitCache((prevCache) => {
      const nextCache = prevCache.map((u, idx) =>
        idx === index ? { ...u, ...updated } : u
      );
      setInputs((prevInputs) => ({
        ...prevInputs,
        units: nextCache.slice(0, prevInputs.unitCount),
      }));
      return nextCache;
    });
  };

  const clearPropertyOptions = () => {
    const freshBlank = BLANK_UNITS_CACHE.map((u) => ({ ...u }));
    setActivePreset('custom');
    setUnitCache(freshBlank);
    setInputs({
      ...INITIAL_DUPLEX_INPUTS,
      propertyAddress: '',
      unitCount: 1,
      units: freshBlank.slice(0, 1),
      purchasePrice: 0,
      makeReadyCost: 0,
      monthlyHoa: 0,
      monthlyMaintenance: 0,
      refiEnabled: false,
      aduEnabled: false,
    });
  };

  const loadFeaturedDeal = (deal: FeaturedDeal) => {
    const merged: UnderwriteInputs = {
      ...INITIAL_DUPLEX_INPUTS,
      ...deal.inputs,
    };
    const nextUnits: UnitInput[] = DEFAULT_UNITS_CACHE.map((u, idx) =>
      merged.units && merged.units[idx] ? { ...u, ...merged.units[idx] } : u
    );
    setActivePreset(deal.id);
    setUnitCache(nextUnits);
    setInputs({
      ...merged,
      units: nextUnits.slice(0, merged.unitCount || 1),
    });
  };

  const summary = useMemo(() => runUnderwriteModel(inputs), [inputs]);

  const activeFeaturedDeal = useMemo(
    () => FEATURED_DEALS.find((d) => d.id === activePreset) || null,
    [activePreset]
  );

  const availableCompareScenarios = useMemo<ComparableScenarioItem[]>(() => {
    const items: ComparableScenarioItem[] = [];
    const currentSnapshot = JSON.stringify(inputs);

    const savedItems: ComparableScenarioItem[] = savedScenarios.map((sc) => ({
      id: `saved:${sc.id}`,
      name: sc.name,
      sourceLabel: 'Saved on Device',
      inputs: { ...INITIAL_DUPLEX_INPUTS, ...sc.inputs },
    }));

    const featuredItems: ComparableScenarioItem[] = FEATURED_DEALS.map((deal) => ({
      id: `featured:${deal.id}`,
      name: extractStreetAddress(deal.inputs.propertyAddress),
      sourceLabel: 'Featured Deal',
      inputs: { ...INITIAL_DUPLEX_INPUTS, ...deal.inputs },
      featuredDeal: deal,
    }));

    const matchesExisting =
      savedItems.some((s) => JSON.stringify(s.inputs) === currentSnapshot) ||
      featuredItems.some((f) => JSON.stringify(f.inputs) === currentSnapshot);

    if (!matchesExisting && (inputs.purchasePrice > 0 || summary.totalMonthlyRent > 0)) {
      items.push({
        id: 'current',
        name: extractStreetAddress(inputs.propertyAddress),
        sourceLabel: 'Current',
        inputs,
        featuredDeal: activeFeaturedDeal,
      });
    }

    items.push(...savedItems, ...featuredItems);
    return items;
  }, [inputs, savedScenarios, activeFeaturedDeal, summary.totalMonthlyRent]);

  const initialCompareSelectedIds = useMemo(() => {
    const picked: string[] = [];
    const currentItem = availableCompareScenarios.find((i) => i.id === 'current');
    if (currentItem) {
      picked.push(currentItem.id);
    } else if (activePreset.startsWith('saved:')) {
      if (availableCompareScenarios.some((i) => i.id === activePreset)) {
        picked.push(activePreset);
      }
    } else if (activeFeaturedDeal) {
      const fId = `featured:${activeFeaturedDeal.id}`;
      if (availableCompareScenarios.some((i) => i.id === fId)) {
        picked.push(fId);
      }
    }

    for (const item of availableCompareScenarios) {
      if (picked.length >= 2) break;
      if (!picked.includes(item.id)) {
        picked.push(item.id);
      }
    }
    return picked;
  }, [availableCompareScenarios, activePreset, activeFeaturedDeal]);

  const handleLoadComparedScenario = (item: ComparableScenarioItem) => {
    if (item.featuredDeal) {
      loadFeaturedDeal(item.featuredDeal);
      return;
    }
    const merged: UnderwriteInputs = {
      ...INITIAL_DUPLEX_INPUTS,
      ...item.inputs,
    };
    const nextUnits: UnitInput[] = DEFAULT_UNITS_CACHE.map((u, idx) =>
      merged.units && merged.units[idx] ? { ...u, ...merged.units[idx] } : u
    );
    setUnitCache(nextUnits);
    setInputs({
      ...merged,
      units: nextUnits.slice(0, merged.unitCount || 1),
    });
    setActivePreset(item.id.startsWith('saved:') ? item.id : 'custom');
  };

  const stateInfo = useMemo(
    () => detectPropertyState(inputs.propertyAddress),
    [inputs.propertyAddress]
  );

  // Synchronize document.title to formatted PDF name during browser print
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let savedTitle = document.title;

    const handleBeforePrint = () => {
      savedTitle = document.title;
      document.title = getRentalReportPdfFileName(inputs.propertyAddress);
    };

    const handleAfterPrint = () => {
      document.title = savedTitle || 'Rental Property Analyzer | Cash Flow, DSCR & IRR Calculator';
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [inputs.propertyAddress]);

  const handlePrintReport = () => {
    if (isLockedPublic) {
      setIsModalOpen(true);
      return;
    }
    if (typeof window !== 'undefined') {
      const targetTitle = getRentalReportPdfFileName(inputs.propertyAddress);
      const originalTitle = document.title;
      document.title = targetTitle;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    }
  };

  const buildShareUrl = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      // Only include fields that differ from INITIAL_DUPLEX_INPUTS (plus core address/units/price) to keep URL short
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
          inputs[key] !== INITIAL_DUPLEX_INPUTS[key]
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
      const originPath = `${window.location.origin}${window.location.pathname}`;
      const dealSuffix = activeFeaturedDeal
        ? `&deal=${encodeURIComponent(activeFeaturedDeal.id)}`
        : '';
      return `${originPath}?s=${b64url}${dealSuffix}`;
    } catch {
      return window.location.href;
    }
  };

  const handleSaveScenario = () => {
    if (typeof window === 'undefined') return;
    const streetName = extractStreetAddress(inputs.propertyAddress);
    const id = streetName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'rental-property';
    const entry: SavedScenario = {
      id,
      name: streetName,
      savedAt: new Date().toISOString(),
      inputs,
    };
    const nextList = [entry, ...savedScenarios.filter((s) => s.id !== id)].slice(0, 15);
    setSavedScenarios(nextList);
    setActivePreset(`saved:${id}`);
    try {
      window.localStorage.setItem(SAVED_SCENARIOS_STORAGE_KEY, JSON.stringify(nextList));
    } catch {
      // ignore storage quota errors
    }
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2200);
  };

  const handleLoadSavedScenario = (scenario: SavedScenario) => {
    const merged: UnderwriteInputs = {
      ...INITIAL_DUPLEX_INPUTS,
      ...scenario.inputs,
    };
    const nextUnits: UnitInput[] = DEFAULT_UNITS_CACHE.map((u, idx) =>
      merged.units && merged.units[idx] ? { ...u, ...merged.units[idx] } : u
    );
    setUnitCache(nextUnits);
    setInputs({
      ...merged,
      units: nextUnits.slice(0, merged.unitCount || 1),
    });
    setActivePreset(`saved:${scenario.id}`);
  };

  const handleDeleteSavedScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(nextList);
    if (activePreset === `saved:${id}`) {
      setActivePreset('custom');
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SAVED_SCENARIOS_STORAGE_KEY, JSON.stringify(nextList));
      } catch {
        // ignore storage errors
      }
    }
  };

  const handleCopyShareLink = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = buildShareUrl();
    try {
      window.history.replaceState({}, '', shareUrl);
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleEmailScenario = () => {
    if (typeof window === 'undefined') return;
    const shareUrl = buildShareUrl();
    try {
      window.history.replaceState({}, '', shareUrl);
    } catch {
      // ignore history errors
    }
    const streetName = extractStreetAddress(inputs.propertyAddress);
    const cocPct =
      summary.initialCashInvested > 0
        ? (summary.year1CashFlow / summary.initialCashInvested) * 100
        : 0;
    const monthlyTax = (inputs.purchasePrice * inputs.propertyTaxRate) / 12;
    const monthlyIns = (inputs.purchasePrice * inputs.insuranceRate) / 12;
    const totalPitia = summary.monthlyPmt + monthlyTax + monthlyIns + (inputs.monthlyHoa || 0);
    const dscr = totalPitia > 0 ? summary.totalMonthlyRent / totalPitia : 0;
    const aduMult = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;
    const aduYr1 = inputs.aduEnabled && (inputs.aduStartMonth ?? 0) < 12;
    const basis =
      (inputs.purchasePrice || 0) +
      (inputs.makeReadyCost || 0) +
      (aduYr1 ? (inputs.aduCost || 0) * aduMult : 0);
    const capRate = basis > 0 ? (summary.year1Noi / basis) * 100 : 0;

    const subject = `Rental Property Scenario: ${streetName}`;
    const bodyLines = [
      `Rental Property Investment Scenario: ${inputs.propertyAddress || streetName}`,
      '',
      `• Purchase Price: ${currencyFmt.format(Math.round(inputs.purchasePrice))}`,
      `• Cash on Cash (COC): ${cocPct.toFixed(2)}% (${currencyFmt.format(
        Math.round(summary.year1CashFlow)
      )}/yr on ${currencyFmt.format(Math.round(summary.initialCashInvested))})`,
      `• DSCR: ${dscr.toFixed(2)}% (${currencyFmt.format(
        Math.round(summary.totalMonthlyRent)
      )}/mo Rent ÷ ${currencyFmt.format(Math.round(totalPitia))}/mo PITIA)`,
      `• Net Operating Income (NOI): ${currencyFmt.format(Math.round(summary.year1Noi))}/yr`,
      `• Cap Rate: ${capRate.toFixed(2)}%`,
      `• 5-Year IRR: ${summary.fiveYear.irrPct.toFixed(2)}% | 10-Year IRR: ${summary.tenYear.irrPct.toFixed(
        2
      )}%`,
      ...(activeFeaturedDeal
        ? [
            '',
            `Curated By: ${activeFeaturedDeal.agent.name}${
              activeFeaturedDeal.agent.brokerage ? ` (${activeFeaturedDeal.agent.brokerage})` : ''
            }`,
            `Contact: ${activeFeaturedDeal.agent.phone} · ${activeFeaturedDeal.agent.email}`,
            ...(activeFeaturedDeal.listingUrl
              ? [`Listing URL: ${activeFeaturedDeal.listingUrl}`]
              : []),
          ]
        : []),
      '',
      'Open and interact with this exact scenario here:',
      `${shareUrl} `,
    ];
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join('\r\n'))}`;
  };

  return (
    <div className="rental-analyzer-root" style={{ paddingBottom: '4rem' }}>
      {/* 2-Page Executive Printable PDF Report (Hidden on Screen, Visible on Print) */}
      <RentalAnalyzerPrintReport inputs={inputs} summary={summary} />

      <div className="rental-analyzer-screen-content">
      {/* Top Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #060A2D 0%, #0C1764 100%)',
          color: '#FFFFFF',
          padding: mode === 'admin' ? '2rem 0 2.25rem' : '3rem 0 2.5rem',
          borderBottom: '4px solid #EFB51E',
        }}
      >
        <div className="ra-container">
          {mode === 'admin' && (
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <Link
                href="/admin/"
                style={{
                  color: '#EFB51E',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                ← Back to Admin Portal
              </Link>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(74, 222, 128, 0.2)',
                  border: '1px solid rgba(74, 222, 128, 0.45)',
                  color: '#4ADE80',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                ✓ Admin / VIP Unrestricted Mode (No Lead Gate)
              </span>
            </div>
          )}

          <div style={{ maxWidth: '820px', marginBottom: '1.35rem' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(239, 181, 30, 0.16)',
                border: '1px solid rgba(239, 181, 30, 0.4)',
                color: '#EFB51E',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              Insider Mortgage Underwriting Engine
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 3.2vw, 2.55rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 0.5rem',
                lineHeight: 1.15,
              }}
            >
              Rental Property Investment Analyzer | 1–4 Units &amp; ADU Calculator
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '0.98rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.55,
              }}
            >
              Underwrite Single Family, Condos, and 2 - 4 unit properties with dynamic
              unit-level rent schedules, 5-year &amp; 10-year Newton-Raphson IRR, future refinance
              scenarios, and California ADU value-add projections.
            </p>
          </div>

          {/* Featured Investor Deals + Action Bar */}
          <div className="no-print">
            <div
              style={{
                fontSize: '0.73rem',
                fontWeight: 700,
                color: '#EFB51E',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.45rem',
              }}
            >
              ⭐ Featured Investor Deals — Curated by David, Rakesh &amp; Partner Agents:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {FEATURED_DEALS.map((deal) => (
                <button
                  key={deal.id}
                  type="button"
                  onClick={() => loadFeaturedDeal(deal)}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.28)',
                    backgroundColor:
                      activePreset === deal.id ? '#EFB51E' : 'rgba(255,255,255,0.1)',
                    color: activePreset === deal.id ? '#060A2D' : '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {deal.buttonLabel}
                </button>
              ))}

              <button
                type="button"
                onClick={clearPropertyOptions}
                style={{
                  padding: '0.5rem 0.95rem',
                  borderRadius: '8px',
                  border:
                    activePreset === 'custom'
                      ? '2px solid #EFB51E'
                      : '1px solid rgba(248, 113, 113, 0.65)',
                  backgroundColor:
                    activePreset === 'custom'
                      ? '#EFB51E'
                      : 'rgba(239, 68, 68, 0.22)',
                  color: activePreset === 'custom' ? '#060A2D' : '#FECACA',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                ✕ Clear / Enter Custom Property
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: '0.6rem',
              }}
            >
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  title={`Save "${extractStreetAddress(inputs.propertyAddress)}" on this device`}
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(74, 222, 128, 0.55)',
                    backgroundColor: saveFeedback
                      ? '#15803D'
                      : 'rgba(34, 197, 94, 0.18)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {saveFeedback ? '✓ Saved!' : '💾 Save Scenario'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsCompareOpen(true)}
                  title="Compare 2 to 4 properties side by side"
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(96, 165, 250, 0.6)',
                    backgroundColor: 'rgba(4, 104, 233, 0.25)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  ⚖️ Compare Properties
                </button>

                <button
                  type="button"
                  onClick={handleEmailScenario}
                  title="Share this exact scenario via email link"
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.32)',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  ✉️ Email Scenario
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  title="Copy shareable link to this scenario"
                  style={{
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.32)',
                    backgroundColor: copyFeedback
                      ? '#0468E9'
                      : 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {copyFeedback ? '✓ Link Copied!' : '🔗 Copy Link'}
                </button>

                <button
                  type="button"
                  onClick={handlePrintReport}
                  style={{
                    padding: '0.5rem 0.95rem',
                    borderRadius: '8px',
                    border: '1px solid #EFB51E',
                    backgroundColor: '#060A2D',
                    color: '#EFB51E',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🖨 Save PDF Report (2 Pages)
                </button>
            </div>

            {savedScenarios.length > 0 && (
              <div
                style={{
                  marginTop: '0.85rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.45rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#EFB51E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginRight: '0.25rem',
                  }}
                >
                  Saved on Device:
                </span>
                {savedScenarios.map((sc) => {
                  const isActive = activePreset === `saved:${sc.id}`;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => handleLoadSavedScenario(sc)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleLoadSavedScenario(sc);
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '999px',
                        border: isActive
                          ? '1px solid #EFB51E'
                          : '1px solid rgba(255,255,255,0.25)',
                        backgroundColor: isActive
                          ? '#EFB51E'
                          : 'rgba(255,255,255,0.1)',
                        color: isActive ? '#060A2D' : '#FFFFFF',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{sc.name}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        title={`Delete saved scenario "${sc.name}"`}
                        onClick={(e) => handleDeleteSavedScenario(sc.id, e)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          opacity: 0.75,
                          padding: '0 2px',
                        }}
                      >
                        ✕
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="ra-container" style={{ marginTop: '2rem' }}>
        {/* Top Two-Column Grid: Left (Inputs) + Right (Snapshot, 5/10-Yr Cards, What-If) */}
        <div className="ra-main-grid">
          {/* Left Column: Unit Schedule & Acquisition/OpEx/Exit Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <DynamicUnitSchedule
              propertyAddress={inputs.propertyAddress}
              onAddressChange={(propertyAddress) => {
                setActivePreset('custom');
                handlePatchInputs({ propertyAddress });
              }}
              unitCount={inputs.unitCount}
              onUnitCountChange={handleUnitCountChange}
              units={inputs.units}
              onUnitChange={handleUnitChange}
              totalMonthlyRent={summary.totalMonthlyRent}
              onClearProperty={clearPropertyOptions}
            />

            <InputControlPanel
              inputs={inputs}
              onChange={handlePatchInputs}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
            />

            <WhatIfModules
              inputs={inputs}
              onChange={handlePatchInputs}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
            />
          </div>

          {/* Right Column: Summary KPI Cards, Initial Monthly PITIA, AI Analysis, and Advisor Callout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SummaryKpiCards
              inputs={inputs}
              summary={summary}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
              onOpenMath={(metric) => setActiveMathMetric(metric)}
              featuredDeal={activeFeaturedDeal}
            />

            <AiInvestmentAnalysis
              inputs={inputs}
              summary={summary}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
            />
          </div>
        </div>

        {/* Full-Width Advisor Callout Banner */}
        <div
          className="ra-card no-print"
          style={{
            marginTop: '1.75rem',
            width: '100%',
            background: 'linear-gradient(135deg, #060A2D 0%, #0F172A 100%)',
            border: '2px solid #EFB51E',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ flex: '1 1 540px' }}>
            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#EFB51E',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Explore Financing Scenarios with Insider Mortgage
            </div>
            <h3
              style={{
                margin: '0.3rem 0 0.45rem',
                fontSize: 'clamp(1.2rem, 2vw, 1.45rem)',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              The right financing can change the investment.
            </h3>
            <p
              style={{
                margin: '0 0 0.9rem',
                fontSize: '0.88rem',
                color: '#CBD5E1',
                lineHeight: 1.55,
                maxWidth: '720px',
              }}
            >
              Real estate investors have different financing needs depending on the property,
              ownership structure, income documentation, and investment strategy.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '0.4rem 1.5rem',
                fontSize: '0.85rem',
                color: '#F1F5F9',
              }}
            >
              {[
                'Conventional investment property financing',
                'DSCR loans',
                'Bank statement programs for self-employed investors',
                'Financing for 2–4 unit properties',
                'Cash-out refinancing for existing rental properties',
                'ADU and value-add financing opportunities',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#EFB51E', fontWeight: 800 }}>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: '0 1 300px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.84rem', color: '#E2E8F0', lineHeight: 1.5 }}>
              {stateInfo.isRakeshOnly ? (
                <>
                  Speak directly with <strong style={{ color: '#FFFFFF' }}>Rakesh Jain</strong>{' '}
                  ({stateInfo.rakeshLicense} · NMLS #240594) at Insider Mortgage
                </>
              ) : (
                <>
                  Speak directly with <strong style={{ color: '#FFFFFF' }}>David Sider</strong>{' '}
                  (NMLS #254108) &amp; <strong style={{ color: '#FFFFFF' }}>Rakesh Jain</strong>{' '}
                  (NMLS #240594 / CA DRE #01336748) at Insider Mortgage
                </>
              )}
              <div style={{ marginTop: '0.35rem', fontSize: '0.98rem', fontWeight: 800, color: '#EFB51E' }}>
                (858) 848-5653
              </div>
            </div>
            {mode === 'public' && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '0.7rem 1.25rem',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: '#EFB51E',
                  color: '#060A2D',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                Request Custom Loan Quote →
              </button>
            )}
          </div>
        </div>

        {/* Full-Width Bottom Section: 10-Year Pro-Forma Table (No Right-Side Cutoff) */}
        <div style={{ marginTop: '1.75rem', width: '100%' }}>
          <ProFormaTable
            inputs={inputs}
            summary={summary}
            isLockedPublic={isLockedPublic}
            onRequestUnlock={() => setIsModalOpen(true)}
            onPrintReport={handlePrintReport}
            onOpenMath={(metric) => setActiveMathMetric(metric)}
          />
        </div>
      </div>

      {/* Live Step-by-Step Math Receipt Modal (7 Metrics) */}
      <MathReceiptModal
        activeMetric={activeMathMetric}
        onSelectMetric={(metric) => setActiveMathMetric(metric)}
        onClose={() => setActiveMathMetric(null)}
        inputs={inputs}
        summary={summary}
      />

      {/* Side-by-Side 2-4 Property Comparison Modal */}
      <CompareScenariosModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        availableScenarios={availableCompareScenarios}
        initialSelectedIds={initialCompareSelectedIds}
        onLoadScenario={handleLoadComparedScenario}
      />

      {/* Lead Capture Modal (Public Mode) */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUnlocked={() => {
          setPublicUnlocked(true);
          setIsModalOpen(false);
        }}
        inputs={inputs}
        summary={summary}
      />
      </div>
    </div>
  );
}
