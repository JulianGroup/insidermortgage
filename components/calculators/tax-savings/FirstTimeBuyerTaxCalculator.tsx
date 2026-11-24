'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { NumericFormat } from 'react-number-format';
import {
  calculateTaxSavings2026,
  estimateMonthlyPmi,
  estimateStateWageTax2026,
  FilingStatus,
  STATE_TAX_DEFAULTS,
  TaxSavingsInputs,
  TaxStateCode,
} from '../../../lib/tax-savings-engine';
import EmailTaxScenarioModal from './EmailTaxScenarioModal';
import './tax-savings.css';

interface W2Entry {
  id: string;
  employer: string;
  box1Wages: number;
  box17StateTax: number;
}

interface SavedTaxScenario {
  id: string;
  name: string;
  savedAt: string;
  inputs: TaxSavingsInputs;
  w2Entries?: W2Entry[];
  horizonMode: 'full' | 'closing';
  closingMonth: number;
  pmiManuallyEdited?: boolean;
  stateTaxManuallyEdited?: boolean;
}

const STORAGE_KEY_SAVED_SCENARIOS = 'im_ftb_tax_saved_scenarios_v1';

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const INITIAL_CA_EST_TAX = estimateStateWageTax2026(150000, 'CA', 'Single', 0);

const INITIAL_W2_ENTRIES: W2Entry[] = [
  {
    id: 'w2-1',
    employer: '',
    box1Wages: 150000,
    box17StateTax: INITIAL_CA_EST_TAX,
  },
];

function syncW2StateTax(
  entries: W2Entry[],
  state: TaxStateCode,
  status: FilingStatus,
  dependents: number,
  manuallyEdited: boolean
): W2Entry[] {
  if (state === 'WA' || state === 'FL') {
    return entries.map((e) => ({ ...e, box17StateTax: 0 }));
  }
  if (manuallyEdited) {
    return entries;
  }
  const totalWages = entries.reduce((sum, e) => sum + Math.max(0, e.box1Wages || 0), 0);
  if (totalWages <= 0) {
    return entries.map((e) => ({ ...e, box17StateTax: 0 }));
  }
  const totalEst = estimateStateWageTax2026(totalWages, state, status, dependents);
  const rawShares = entries.map((e) => {
    const w = Math.max(0, e.box1Wages || 0);
    return w > 0 ? Math.floor((totalEst * w) / totalWages) : 0;
  });
  const allocatedSum = rawShares.reduce((sum, v) => sum + v, 0);
  const remainder = totalEst - allocatedSum;
  const firstWageIdx = entries.findIndex((e) => Math.max(0, e.box1Wages || 0) > 0);
  return entries.map((e, idx) => ({
    ...e,
    box17StateTax: idx === firstWageIdx ? rawShares[idx] + remainder : rawShares[idx],
  }));
}

function normalizeLoadedW2Entries(
  savedEntries: unknown,
  mergedInputs: TaxSavingsInputs
): W2Entry[] {
  if (Array.isArray(savedEntries) && savedEntries.length > 0) {
    return savedEntries.map((item, idx) => {
      const rec = (item && typeof item === 'object' ? item : {}) as Partial<W2Entry>;
      return {
        id: typeof rec.id === 'string' && rec.id ? rec.id : `w2-${idx + 1}`,
        employer: typeof rec.employer === 'string' ? rec.employer : '',
        box1Wages: Math.max(0, Number(rec.box1Wages) || 0),
        box17StateTax: Math.max(0, Number(rec.box17StateTax) || 0),
      };
    });
  }
  const base: W2Entry[] = [
    {
      id: 'w2-1',
      employer: '',
      box1Wages: Math.max(0, mergedInputs.w2Wages || 0),
      box17StateTax: Math.max(0, mergedInputs.w2StateTaxPaid || 0),
    },
  ];
  if (mergedInputs.filingStatus === 'MFJ') {
    base.push({ id: 'w2-2', employer: '', box1Wages: 0, box17StateTax: 0 });
  }
  return base;
}

const INITIAL_INPUTS: TaxSavingsInputs = {
  purchasePrice: 750000,
  downPaymentPct: 0.1,
  interestRate: 0,
  loanTermYears: 30,
  propertyTaxRate: 0.012,
  monthlyHoa: 300,
  monthlyInsurance: 150,
  monthlyPmi: 225,
  state: 'CA',
  filingStatus: 'Single',
  dependents: 0,
  w2Wages: 150000,
  w2StateTaxPaid: INITIAL_CA_EST_TAX,
  annualCharity: 1000,
};

const STATE_OPTIONS: TaxStateCode[] = ['CA', 'WA', 'UT', 'AZ', 'FL'];

const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: 'Single', label: 'Single' },
  { value: 'MFJ', label: 'Married Filing Jointly' },
  { value: 'HOH', label: 'Head of Household' },
];

const CLOSING_MONTH_OPTIONS: Array<{ month: number; name: string; monthsOwned: number }> = [
  { month: 1, name: 'January', monthsOwned: 12 },
  { month: 2, name: 'February', monthsOwned: 11 },
  { month: 3, name: 'March', monthsOwned: 10 },
  { month: 4, name: 'April', monthsOwned: 9 },
  { month: 5, name: 'May', monthsOwned: 8 },
  { month: 6, name: 'June', monthsOwned: 7 },
  { month: 7, name: 'July', monthsOwned: 6 },
  { month: 8, name: 'August', monthsOwned: 5 },
  { month: 9, name: 'September', monthsOwned: 4 },
  { month: 10, name: 'October', monthsOwned: 3 },
  { month: 11, name: 'November', monthsOwned: 2 },
  { month: 12, name: 'December', monthsOwned: 1 },
];

export default function FirstTimeBuyerTaxCalculator() {
  const [inputs, setInputs] = useState<TaxSavingsInputs>(INITIAL_INPUTS);
  const [w2Entries, setW2Entries] = useState<W2Entry[]>(INITIAL_W2_ENTRIES);
  const [downMode, setDownMode] = useState<'pct' | 'dollar'>('pct');
  const [horizonMode, setHorizonMode] = useState<'full' | 'closing'>('full');
  const [closingMonth, setClosingMonth] = useState<number>(7);
  const [pmiManuallyEdited, setPmiManuallyEdited] = useState(false);
  const [stateTaxManuallyEdited, setStateTaxManuallyEdited] = useState(false);
  const [showMathDrawer, setShowMathDrawer] = useState(false);
  const [showWagesTooltip, setShowWagesTooltip] = useState(false);

  // Scenario save & share state
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState<SavedTaxScenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Load saved scenarios and optional ?s= shared scenario URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedRaw = window.localStorage.getItem(STORAGE_KEY_SAVED_SCENARIOS);
      if (savedRaw) {
        const parsedList = JSON.parse(savedRaw);
        if (Array.isArray(parsedList)) {
          setSavedScenarios(parsedList);
        }
      }
    } catch {
      // ignore storage errors
    }

    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get('s');
      if (encoded) {
        const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        const rawStr = window.atob(padded);
        const decodedJson = decodeURIComponent(escape(rawStr));
        const parsed = JSON.parse(decodedJson);
        if (parsed && typeof parsed === 'object' && parsed.inputs) {
          const mergedInputs: TaxSavingsInputs = {
            ...INITIAL_INPUTS,
            ...parsed.inputs,
          };
          const loadedEntries = normalizeLoadedW2Entries(parsed.w2Entries, mergedInputs);
          const totalWages = loadedEntries.reduce(
            (sum, e) => sum + Math.max(0, e.box1Wages || 0),
            0
          );
          const totalStateTax =
            mergedInputs.state === 'WA' || mergedInputs.state === 'FL'
              ? 0
              : loadedEntries.reduce((sum, e) => sum + Math.max(0, e.box17StateTax || 0), 0);
          setW2Entries(loadedEntries);
          setInputs({
            ...mergedInputs,
            w2Wages: totalWages,
            w2StateTaxPaid: totalStateTax,
          });
          if (parsed.horizonMode === 'closing' || parsed.horizonMode === 'full') {
            setHorizonMode(parsed.horizonMode);
          }
          if (
            typeof parsed.closingMonth === 'number' &&
            parsed.closingMonth >= 1 &&
            parsed.closingMonth <= 12
          ) {
            setClosingMonth(parsed.closingMonth);
          }
          if (typeof parsed.name === 'string') {
            setScenarioName(parsed.name);
          }
          setPmiManuallyEdited(Boolean(parsed.pmiManuallyEdited));
          const autoEst = estimateStateWageTax2026(
            totalWages,
            mergedInputs.state,
            mergedInputs.filingStatus,
            mergedInputs.dependents
          );
          setStateTaxManuallyEdited(
            typeof parsed.stateTaxManuallyEdited === 'boolean'
              ? parsed.stateTaxManuallyEdited
              : mergedInputs.state !== 'WA' &&
                  mergedInputs.state !== 'FL' &&
                  Math.abs(totalStateTax - autoEst) > 2
          );
        }
      }
    } catch {
      // ignore malformed URL parameter
    }
  }, []);

  const monthsInTaxYear = horizonMode === 'full' ? 12 : Math.max(1, Math.min(12, 13 - closingMonth));

  const effectiveInputs = useMemo<TaxSavingsInputs>(
    () => ({
      ...inputs,
      monthsInTaxYear,
    }),
    [inputs, monthsInTaxYear]
  );

  const result = useMemo(
    () => calculateTaxSavings2026(effectiveInputs),
    [effectiveInputs]
  );

  const fullYearResult = useMemo(
    () =>
      horizonMode === 'closing'
        ? calculateTaxSavings2026({ ...inputs, monthsInTaxYear: 12 })
        : result,
    [horizonMode, inputs, result]
  );

  const hasInterestRate = inputs.interestRate > 0;
  const isNoWageTaxState = inputs.state === 'WA' || inputs.state === 'FL';
  const downPaymentDollars = Math.round(inputs.purchasePrice * inputs.downPaymentPct);
  const downPaymentPctDisplay = Number((inputs.downPaymentPct * 100).toFixed(2));
  const selectedClosingMonthInfo =
    CLOSING_MONTH_OPTIONS.find((m) => m.month === closingMonth) || CLOSING_MONTH_OPTIONS[6];
  const horizonLabel =
    horizonMode === 'full'
      ? 'First Full Calendar Year (12 Mos)'
      : `${selectedClosingMonthInfo.name}–Dec (${monthsInTaxYear} ${
          monthsInTaxYear === 1 ? 'Mo' : 'Mos'
        })`;

  const updatePurchasePrice = (nextPrice: number) => {
    const safePrice = Math.max(0, nextPrice);
    setInputs((prev) => {
      const nextPmi = pmiManuallyEdited
        ? prev.monthlyPmi
        : estimateMonthlyPmi(safePrice, prev.downPaymentPct);
      return {
        ...prev,
        purchasePrice: safePrice,
        monthlyPmi: prev.downPaymentPct >= 0.2 ? 0 : nextPmi,
      };
    });
  };

  const updateDownPaymentPct = (pctWhole: number) => {
    const clampedPct = Math.max(0, Math.min(100, pctWhole)) / 100;
    setInputs((prev) => {
      const nextPmi =
        clampedPct >= 0.2
          ? 0
          : pmiManuallyEdited
          ? prev.monthlyPmi
          : estimateMonthlyPmi(prev.purchasePrice, clampedPct);
      return {
        ...prev,
        downPaymentPct: clampedPct,
        monthlyPmi: nextPmi,
      };
    });
  };

  const updateDownPaymentDollars = (dollars: number) => {
    const safeDollars = Math.max(0, dollars);
    setInputs((prev) => {
      const nextPct =
        prev.purchasePrice > 0 ? Math.min(1, safeDollars / prev.purchasePrice) : 0;
      const nextPmi =
        nextPct >= 0.2
          ? 0
          : pmiManuallyEdited
          ? prev.monthlyPmi
          : estimateMonthlyPmi(prev.purchasePrice, nextPct);
      return {
        ...prev,
        downPaymentPct: nextPct,
        monthlyPmi: nextPmi,
      };
    });
  };

  const applyW2AndTaxUpdate = (
    nextEntries: W2Entry[],
    patch: Partial<TaxSavingsInputs> = {},
    manualOverride?: boolean
  ) => {
    const nextState = patch.state ?? inputs.state;
    const nextStatus = patch.filingStatus ?? inputs.filingStatus;
    const nextDependents = patch.dependents ?? inputs.dependents;
    const isManual = manualOverride ?? stateTaxManuallyEdited;

    const syncedEntries = syncW2StateTax(
      nextEntries,
      nextState,
      nextStatus,
      nextDependents,
      isManual
    );
    const totalWages = syncedEntries.reduce(
      (sum, e) => sum + Math.max(0, e.box1Wages || 0),
      0
    );
    const totalStateTax =
      nextState === 'WA' || nextState === 'FL'
        ? 0
        : syncedEntries.reduce((sum, e) => sum + Math.max(0, e.box17StateTax || 0), 0);

    setW2Entries(syncedEntries);
    setInputs((prev) => ({
      ...prev,
      ...patch,
      w2Wages: totalWages,
      w2StateTaxPaid: totalStateTax,
    }));
  };

  const handleStateChange = (nextState: TaxStateCode) => {
    const cfg = STATE_TAX_DEFAULTS[nextState];
    applyW2AndTaxUpdate(w2Entries, {
      state: nextState,
      propertyTaxRate: cfg.defaultPropTaxRate,
    });
  };

  const handleFilingStatusChange = (nextStatus: FilingStatus) => {
    let nextEntries = w2Entries;
    if (nextStatus === 'MFJ' && w2Entries.length < 2) {
      const nextId = w2Entries.some((e) => e.id === 'w2-2') ? `w2-${Date.now()}` : 'w2-2';
      nextEntries = [
        ...w2Entries,
        { id: nextId, employer: '', box1Wages: 0, box17StateTax: 0 },
      ];
    } else if (
      nextStatus !== 'MFJ' &&
      w2Entries.length === 2 &&
      !w2Entries[1].employer.trim() &&
      w2Entries[1].box1Wages === 0 &&
      w2Entries[1].box17StateTax === 0
    ) {
      nextEntries = w2Entries.slice(0, 1);
    }
    applyW2AndTaxUpdate(nextEntries, { filingStatus: nextStatus });
  };

  const handleUpdateW2Entry = (id: string, patch: Partial<W2Entry>) => {
    const isBox17Edit = patch.box17StateTax !== undefined;
    if (isBox17Edit) {
      setStateTaxManuallyEdited(true);
    }
    const nextEntries = w2Entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    applyW2AndTaxUpdate(nextEntries, {}, isBox17Edit ? true : undefined);
  };

  const handleAddW2Entry = () => {
    if (w2Entries.length >= 6) return;
    const nextEntries = [
      ...w2Entries,
      { id: `w2-${Date.now()}`, employer: '', box1Wages: 0, box17StateTax: 0 },
    ];
    applyW2AndTaxUpdate(nextEntries);
  };

  const handleRemoveW2Entry = (id: string) => {
    if (w2Entries.length <= 1) return;
    const nextEntries = w2Entries.filter((e) => e.id !== id);
    applyW2AndTaxUpdate(nextEntries);
  };

  const handleResetStateTaxEstimate = () => {
    setStateTaxManuallyEdited(false);
    applyW2AndTaxUpdate(w2Entries, {}, false);
  };

  const handleReset = () => {
    setInputs(INITIAL_INPUTS);
    setW2Entries(INITIAL_W2_ENTRIES);
    setDownMode('pct');
    setHorizonMode('full');
    setClosingMonth(7);
    setPmiManuallyEdited(false);
    setStateTaxManuallyEdited(false);
    setActiveScenarioId(null);
  };

  const buildShareUrl = (): string => {
    const publicBase = 'https://insidermortgage.com/geek-out/first-time-buyer-tax-savings/';
    if (typeof window === 'undefined') return publicBase;
    try {
      const payload = {
        name: scenarioName.trim(),
        inputs,
        w2Entries,
        horizonMode,
        closingMonth,
        pmiManuallyEdited,
        stateTaxManuallyEdited,
      };
      const utf8Bytes = unescape(encodeURIComponent(JSON.stringify(payload)));
      const b64url = window
        .btoa(utf8Bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const pathname = window.location.pathname.endsWith('/')
        ? window.location.pathname
        : `${window.location.pathname}/`;
      return `${window.location.origin}${pathname}?s=${b64url}`;
    } catch {
      return window.location.href;
    }
  };

  const handleSaveScenario = () => {
    if (typeof window === 'undefined') return;
    let resolvedName = scenarioName.trim();
    if (!resolvedName) {
      let n = 1;
      while (savedScenarios.some((s) => s.name === `Scenario ${n}`)) {
        n += 1;
      }
      resolvedName = `Scenario ${n}`;
      setScenarioName(resolvedName);
    }
    const id =
      resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `scenario-${Date.now()}`;
    const entry: SavedTaxScenario = {
      id,
      name: resolvedName,
      savedAt: new Date().toISOString(),
      inputs,
      w2Entries,
      horizonMode,
      closingMonth,
      pmiManuallyEdited,
      stateTaxManuallyEdited,
    };
    const nextList = [entry, ...savedScenarios.filter((s) => s.id !== id)].slice(0, 15);
    setSavedScenarios(nextList);
    setActiveScenarioId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY_SAVED_SCENARIOS, JSON.stringify(nextList));
    } catch {
      // ignore storage quota errors
    }
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2200);
  };

  const handleLoadSavedScenario = (sc: SavedTaxScenario) => {
    const merged: TaxSavingsInputs = {
      ...INITIAL_INPUTS,
      ...sc.inputs,
    };
    const loadedEntries = normalizeLoadedW2Entries(sc.w2Entries, merged);
    const totalWages = loadedEntries.reduce(
      (sum, e) => sum + Math.max(0, e.box1Wages || 0),
      0
    );
    const totalStateTax =
      merged.state === 'WA' || merged.state === 'FL'
        ? 0
        : loadedEntries.reduce((sum, e) => sum + Math.max(0, e.box17StateTax || 0), 0);
    setW2Entries(loadedEntries);
    setInputs({
      ...merged,
      w2Wages: totalWages,
      w2StateTaxPaid: totalStateTax,
    });
    setHorizonMode(sc.horizonMode === 'closing' ? 'closing' : 'full');
    setClosingMonth(
      typeof sc.closingMonth === 'number' && sc.closingMonth >= 1 && sc.closingMonth <= 12
        ? sc.closingMonth
        : 7
    );
    setPmiManuallyEdited(Boolean(sc.pmiManuallyEdited));
    const autoEst = estimateStateWageTax2026(
      totalWages,
      merged.state,
      merged.filingStatus,
      merged.dependents
    );
    setStateTaxManuallyEdited(
      typeof sc.stateTaxManuallyEdited === 'boolean'
        ? sc.stateTaxManuallyEdited
        : merged.state !== 'WA' &&
            merged.state !== 'FL' &&
            Math.abs(totalStateTax - autoEst) > 2
    );
    setScenarioName(sc.name || '');
    setActiveScenarioId(sc.id);
  };

  const handleDeleteSavedScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextList = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(nextList);
    if (activeScenarioId === id) {
      setActiveScenarioId(null);
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY_SAVED_SCENARIOS, JSON.stringify(nextList));
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
      // ignore clipboard errors
    }
  };

  // Stacked bar proportions (relative to Gross Monthly PITIA)
  const grossBarBase = Math.max(1, result.grossMonthlyPitia);
  const piSharePct = hasInterestRate ? (result.monthlyPi / grossBarBase) * 100 : 0;
  const propTaxSharePct = hasInterestRate ? (result.monthlyPropertyTax / grossBarBase) * 100 : 0;
  const otherHousingMonthly =
    result.monthlyInsurance + result.monthlyPmi + result.monthlyHoa;
  const otherSharePct = hasInterestRate ? (otherHousingMonthly / grossBarBase) * 100 : 0;
  const taxSavingsPctOfGross = Math.min(
    100,
    (result.monthlyTaxSavings / grossBarBase) * 100
  );

  const periodTaxSavingsSuffix = monthsInTaxYear === 12 ? '/yr' : ` (${monthsInTaxYear} mos)`;

  return (
    <div className="ftb-tax-root" style={{ paddingBottom: '4rem' }}>
      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #060A2D 0%, #0C1764 100%)',
          color: '#FFFFFF',
          padding: '2.75rem 0 2.35rem',
          borderBottom: '4px solid #EFB51E',
        }}
      >
        <div className="ftb-container">
          <div style={{ maxWidth: '860px' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '0.28rem 0.85rem',
                borderRadius: '999px',
                backgroundColor: 'rgba(239, 181, 30, 0.16)',
                border: '1px solid rgba(239, 181, 30, 0.42)',
                color: '#EFB51E',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              Insider Mortgage · 2026 Tax Year Model
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.65rem, 3.1vw, 2.45rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: '0 0 0.55rem',
                lineHeight: 1.15,
              }}
            >
              <span style={{ display: 'block' }}>First-Time Home Buyer Tax Savings</span>
              <span
                style={{
                  display: 'block',
                  color: '#EFB51E',
                  fontSize: 'clamp(1.25rem, 2.3vw, 1.75rem)',
                  marginTop: '0.2rem',
                }}
              >
                RENT vs OWN Calculator
              </span>
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '0.98rem',
                color: 'rgba(255, 255, 255, 0.86)',
                lineHeight: 1.55,
              }}
            >
              See how 2026 Federal and State homeowner tax deductions reduce your true after-tax
              monthly housing cost compared to renting — tailored for California, Washington,
              Utah, Arizona, and Florida buyers.
            </p>
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 181, 30, 0.14)',
                border: '1px solid rgba(239, 181, 30, 0.45)',
                color: '#FEF3C7',
                fontSize: '0.84rem',
                fontWeight: 600,
                lineHeight: 1.45,
              }}
            >
              Please consult a qualified CPA or tax professional to confirm how these 2026 tax
              rules apply to your individual tax return.
            </div>
          </div>
        </div>
      </section>

      {/* Scenario Save & Share Bar */}
      <div className="ftb-container" style={{ marginTop: '1.35rem' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '0.9rem 1.15rem',
            boxShadow: '0 4px 14px rgba(6, 10, 45, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.65rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flex: '1 1 320px',
                flexWrap: 'wrap',
              }}
            >
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Scenario name (e.g., Oak St Condo @ 6.25%)"
                aria-label="Scenario name"
                style={{
                  flex: '1 1 220px',
                  maxWidth: '300px',
                  padding: '0.45rem 0.72rem',
                  fontSize: '0.84rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                }}
              />
              <button
                type="button"
                onClick={handleSaveScenario}
                title="Save this scenario privately on your device"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: saveFeedback ? '#15803D' : '#166534',
                  border: '1px solid #15803D',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {saveFeedback ? '✓ Saved!' : '💾 Save Scenario'}
              </button>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                title="Email this tax savings scenario to yourself, your CPA, or Team Insider"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#060A2D',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                ✉️ Email Scenario
              </button>
              <button
                type="button"
                onClick={handleCopyShareLink}
                title="Copy shareable link to this exact scenario"
                style={{
                  padding: '0.45rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: copyFeedback ? '#FFFFFF' : '#060A2D',
                  backgroundColor: copyFeedback ? '#0468E9' : '#FFFFFF',
                  border: copyFeedback ? '1px solid #0468E9' : '1px solid #CBD5E1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                {copyFeedback ? '✓ Link Copied!' : '🔗 Copy Link'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.42rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#334155',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ↺ Reset Defaults
            </button>
          </div>

          {savedScenarios.length > 0 && (
            <div
              style={{
                marginTop: '0.75rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.45rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#060A2D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginRight: '0.2rem',
                }}
              >
                Saved on Device:
              </span>
              {savedScenarios.map((sc) => {
                const isActive = activeScenarioId === sc.id;
                return (
                  <div
                    key={sc.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleLoadSavedScenario(sc)}
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
                      padding: '0.28rem 0.65rem',
                      borderRadius: '999px',
                      border: isActive ? '1px solid #060A2D' : '1px solid #CBD5E1',
                      backgroundColor: isActive ? '#060A2D' : '#F8FAFC',
                      color: isActive ? '#EFB51E' : '#0F172A',
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
                        fontSize: '0.72rem',
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

      {/* Main Split Workspace */}
      <div className="ftb-container" style={{ marginTop: '1.25rem' }}>
        <div className="ftb-split-grid">
          {/* LEFT COLUMN: Instructions + 2-Step Interactive Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Getting Started Instructions */}
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderLeft: '4px solid #060A2D',
                borderRadius: '12px',
                padding: '0.9rem 1.1rem',
                color: '#0F172A',
                fontSize: '0.88rem',
                lineHeight: 1.5,
              }}
            >
              <div
                style={{
                  fontSize: '0.73rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#0468E9',
                  marginBottom: '0.25rem',
                }}
              >
                How to Use This Calculator
              </div>
              <p style={{ margin: 0 }}>
                Enter your expected purchase price, down payment, and interest rate in Step 1. For
                Step 2, have your prior-year W-2 handy so you can enter Box 1 (Wages) and Box 17
                (State Income Tax Paid). You can save your progress at any time and come back later.
              </p>
            </div>

            {/* Step 1: Home & Loan Details */}
            <div className="ftb-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1.1rem',
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
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}
                  >
                    1
                  </span>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#060A2D', margin: 0 }}>
                    Home &amp; Loan Details
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                {/* Purchase Price */}
                <div>
                  <label className="ftb-label" htmlFor="ftb-purchase-price">
                    <span>Purchase Price</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      Loan: {currencyFmt.format(Math.round(result.loanAmount))}
                    </span>
                  </label>
                  <NumericFormat
                    id="ftb-purchase-price"
                    className="ftb-input"
                    value={inputs.purchasePrice}
                    thousandSeparator=","
                    prefix="$"
                    decimalScale={0}
                    allowNegative={false}
                    onValueChange={(vals) => updatePurchasePrice(vals.floatValue ?? 0)}
                  />
                </div>

                {/* Down Payment ($ or % toggle) */}
                <div>
                  <div className="ftb-label">
                    <label htmlFor="ftb-down-payment">Down Payment</label>
                    <div className="ftb-segment-group" role="group" aria-label="Down payment mode">
                      <button
                        type="button"
                        className={`ftb-segment-btn ${downMode === 'pct' ? 'active' : ''}`}
                        onClick={() => setDownMode('pct')}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        className={`ftb-segment-btn ${downMode === 'dollar' ? 'active' : ''}`}
                        onClick={() => setDownMode('dollar')}
                      >
                        $
                      </button>
                    </div>
                  </div>
                  {downMode === 'pct' ? (
                    <NumericFormat
                      id="ftb-down-payment"
                      className="ftb-input"
                      value={downPaymentPctDisplay}
                      suffix="%"
                      decimalScale={2}
                      allowNegative={false}
                      onValueChange={(vals) => updateDownPaymentPct(vals.floatValue ?? 0)}
                    />
                  ) : (
                    <NumericFormat
                      id="ftb-down-payment"
                      className="ftb-input"
                      value={downPaymentDollars}
                      thousandSeparator=","
                      prefix="$"
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={(vals) => updateDownPaymentDollars(vals.floatValue ?? 0)}
                    />
                  )}
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.28rem' }}>
                    {downMode === 'pct'
                      ? `${currencyFmt.format(downPaymentDollars)} down (${(
                          100 - downPaymentPctDisplay
                        ).toFixed(1)}% LTV)`
                      : `${downPaymentPctDisplay.toFixed(1)}% down (${(
                          100 - downPaymentPctDisplay
                        ).toFixed(1)}% LTV)`}
                  </div>
                </div>

                {/* Interest Rate & Loan Term */}
                <div className="ftb-two-col">
                  <div>
                    <label className="ftb-label" htmlFor="ftb-interest-rate">
                      <span>Interest Rate (%)</span>
                      {!hasInterestRate && (
                        <span style={{ fontSize: '0.71rem', color: '#D97706', fontWeight: 700 }}>
                          Required
                        </span>
                      )}
                    </label>
                    <NumericFormat
                      id="ftb-interest-rate"
                      className="ftb-input"
                      value={
                        inputs.interestRate > 0
                          ? Number((inputs.interestRate * 100).toFixed(3))
                          : ''
                      }
                      placeholder="Enter rate (e.g. 6.25%)"
                      suffix="%"
                      decimalScale={3}
                      allowNegative={false}
                      style={
                        !hasInterestRate
                          ? {
                              borderColor: '#D97706',
                              backgroundColor: '#FFFBEB',
                              boxShadow: '0 0 0 3px rgba(239, 181, 30, 0.22)',
                            }
                          : undefined
                      }
                      onValueChange={(vals) =>
                        setInputs((prev) => ({
                          ...prev,
                          interestRate: Math.max(0, Math.min(25, vals.floatValue ?? 0)) / 100,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <div className="ftb-label">Loan Term</div>
                    <div
                      className="ftb-segment-group"
                      style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr' }}
                    >
                      {([30, 15] as const).map((term) => (
                        <button
                          key={term}
                          type="button"
                          className={`ftb-segment-btn ${
                            inputs.loanTermYears === term ? 'active' : ''
                          }`}
                          style={{ padding: '0.58rem 0.5rem' }}
                          onClick={() =>
                            setInputs((prev) => ({ ...prev, loanTermYears: term }))
                          }
                        >
                          {term}-Yr Fixed
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Property Tax Rate & HOA */}
                <div className="ftb-two-col">
                  <div>
                    <label className="ftb-label" htmlFor="ftb-prop-tax-rate">
                      <span>Annual Property Tax Rate</span>
                      <span style={{ fontSize: '0.72rem', color: '#0468E9', fontWeight: 600 }}>
                        {currencyFmt.format(Math.round(result.monthlyPropertyTax))}/mo
                      </span>
                    </label>
                    <NumericFormat
                      id="ftb-prop-tax-rate"
                      className="ftb-input"
                      value={Number((inputs.propertyTaxRate * 100).toFixed(2))}
                      suffix="%"
                      decimalScale={2}
                      allowNegative={false}
                      onValueChange={(vals) =>
                        setInputs((prev) => ({
                          ...prev,
                          propertyTaxRate: Math.max(0, Math.min(10, vals.floatValue ?? 0)) / 100,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="ftb-label" htmlFor="ftb-hoa">
                      Monthly HOA Fee
                    </label>
                    <NumericFormat
                      id="ftb-hoa"
                      className="ftb-input"
                      value={inputs.monthlyHoa}
                      thousandSeparator=","
                      prefix="$"
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={(vals) =>
                        setInputs((prev) => ({ ...prev, monthlyHoa: vals.floatValue ?? 0 }))
                      }
                    />
                  </div>
                </div>

                {/* Homeowners Insurance & Monthly PMI */}
                <div className="ftb-two-col">
                  <div>
                    <label className="ftb-label" htmlFor="ftb-insurance">
                      Monthly Homeowners Insurance
                    </label>
                    <NumericFormat
                      id="ftb-insurance"
                      className="ftb-input"
                      value={inputs.monthlyInsurance}
                      thousandSeparator=","
                      prefix="$"
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={(vals) =>
                        setInputs((prev) => ({
                          ...prev,
                          monthlyInsurance: vals.floatValue ?? 0,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="ftb-label" htmlFor="ftb-pmi">
                      <span>Monthly PMI</span>
                      {inputs.downPaymentPct >= 0.2 ? (
                        <span style={{ fontSize: '0.71rem', color: '#15803D', fontWeight: 700 }}>
                          Waived (20%+ down)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.71rem', color: '#64748B', fontWeight: 600 }}>
                          Editable
                        </span>
                      )}
                    </label>
                    <NumericFormat
                      id="ftb-pmi"
                      className="ftb-input"
                      value={inputs.monthlyPmi}
                      thousandSeparator=","
                      prefix="$"
                      decimalScale={0}
                      allowNegative={false}
                      onValueChange={(vals) => {
                        setPmiManuallyEdited(true);
                        setInputs((prev) => ({ ...prev, monthlyPmi: vals.floatValue ?? 0 }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Your Tax Profile (2026 Rules) */}
            <div className="ftb-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  marginBottom: '1.1rem',
                }}
              >
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
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}
                >
                  2
                </span>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#060A2D', margin: 0 }}>
                    Your Tax Profile (2026 Rules)
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Used to compare your Renter baseline against 2026 Homeowner deductions
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                {/* Analysis Period: Full Year vs Expected Closing Month */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '0.85rem',
                  }}
                >
                  <div className="ftb-label">
                    <span>Tax Year Analysis Horizon</span>
                    <span style={{ fontSize: '0.72rem', color: '#0468E9', fontWeight: 700 }}>
                      {monthsInTaxYear} {monthsInTaxYear === 1 ? 'Month' : 'Months'} Owned
                    </span>
                  </div>
                  <div
                    className="ftb-segment-group"
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                    }}
                  >
                    <button
                      type="button"
                      className={`ftb-segment-btn ${horizonMode === 'full' ? 'active' : ''}`}
                      onClick={() => setHorizonMode('full')}
                    >
                      Full Calendar Year (12 Mos)
                    </button>
                    <button
                      type="button"
                      className={`ftb-segment-btn ${horizonMode === 'closing' ? 'active' : ''}`}
                      onClick={() => setHorizonMode('closing')}
                    >
                      Expected Closing Month
                    </button>
                  </div>
                  {horizonMode === 'closing' && (
                    <div style={{ marginTop: '0.6rem' }}>
                      <label
                        htmlFor="ftb-closing-month"
                        style={{
                          display: 'block',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: '#334155',
                          marginBottom: '0.28rem',
                        }}
                      >
                        First Payment / Ownership Start Month in Tax Year
                      </label>
                      <select
                        id="ftb-closing-month"
                        className="ftb-input"
                        value={closingMonth}
                        onChange={(e) => setClosingMonth(Number(e.target.value))}
                      >
                        {CLOSING_MONTH_OPTIONS.map((m) => (
                          <option key={m.month} value={m.month}>
                            {m.name} ({m.monthsOwned} {m.monthsOwned === 1 ? 'month' : 'months'} in
                            tax year)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Property State & Dependents */}
                <div className="ftb-two-col">
                  <div>
                    <label className="ftb-label" htmlFor="ftb-state">
                      Property State
                    </label>
                    <select
                      id="ftb-state"
                      className="ftb-input"
                      value={inputs.state}
                      onChange={(e) => handleStateChange(e.target.value as TaxStateCode)}
                    >
                      {STATE_OPTIONS.map((code) => (
                        <option key={code} value={code}>
                          {STATE_TAX_DEFAULTS[code].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="ftb-label" htmlFor="ftb-dependents">
                      Number of Dependents
                    </label>
                    <input
                      id="ftb-dependents"
                      type="number"
                      min={0}
                      max={15}
                      className="ftb-input"
                      value={inputs.dependents}
                      onChange={(e) =>
                        applyW2AndTaxUpdate(w2Entries, {
                          dependents: Math.max(0, parseInt(e.target.value || '0', 10) || 0),
                        })
                      }
                    />
                  </div>
                </div>

                {/* Filing Status */}
                <div>
                  <div className="ftb-label">Filing Status</div>
                  <div
                    className="ftb-segment-group"
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    }}
                  >
                    {FILING_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`ftb-segment-btn ${
                          inputs.filingStatus === opt.value ? 'active' : ''
                        }`}
                        style={{ padding: '0.55rem 0.4rem', fontSize: '0.78rem' }}
                        onClick={() => handleFilingStatusChange(opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prior-Year W-2 Boxes (Supports Separate W-2s for Married Filing Jointly or Multiple Jobs) */}
                <div>
                  <div className="ftb-label" style={{ marginBottom: '0.45rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>Prior-Year W-2 Income &amp; State Tax</span>
                      <button
                        type="button"
                        onClick={() => setShowWagesTooltip((v) => !v)}
                        aria-label="What is W-2 Box 1 Wages?"
                        title="Found in Box 1 of your W-2; already accounts for pre-tax 401(k)/HSA deductions."
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1px solid #94A3B8',
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                        }}
                      >
                        ?
                      </button>
                    </span>
                    {w2Entries.length < 6 && (
                      <button
                        type="button"
                        onClick={handleAddW2Entry}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#0468E9',
                          cursor: 'pointer',
                        }}
                      >
                        + Add Another W-2
                      </button>
                    )}
                  </div>

                  {showWagesTooltip && (
                    <div
                      style={{
                        marginBottom: '0.55rem',
                        padding: '0.5rem 0.7rem',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#1E3A8A',
                        fontSize: '0.76rem',
                        lineHeight: 1.4,
                      }}
                    >
                      <strong>Box 1</strong> shows taxable wages after pre-tax 401(k)/HSA
                      deductions. <strong>Box 17</strong> reflects state income tax withheld from
                      wages and serves as a convenient estimate of state tax paid (adjust if you
                      make estimated payments or expect a refund).
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {w2Entries.map((entry, idx) => {
                      const cardHeading =
                        inputs.filingStatus === 'MFJ' && idx === 0
                          ? 'Spouse 1 — Prior-Year W-2'
                          : inputs.filingStatus === 'MFJ' && idx === 1
                          ? 'Spouse 2 — Prior-Year W-2'
                          : w2Entries.length === 1
                          ? 'Prior-Year W-2'
                          : `W-2 #${idx + 1}`;
                      const canRemove =
                        w2Entries.length > 1 && (inputs.filingStatus !== 'MFJ' || w2Entries.length > 2);

                      return (
                        <div
                          key={entry.id}
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.6rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                color: '#060A2D',
                              }}
                            >
                              {cardHeading}
                            </span>
                            {canRemove && (
                              <button
                                type="button"
                                onClick={() => handleRemoveW2Entry(entry.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#B91C1C',
                                  cursor: 'pointer',
                                }}
                              >
                                ✕ Remove
                              </button>
                            )}
                          </div>

                          <div>
                            <label
                              className="ftb-label"
                              htmlFor={`ftb-w2-employer-${entry.id}`}
                              style={{ fontSize: '0.78rem' }}
                            >
                              Employer
                            </label>
                            <input
                              id={`ftb-w2-employer-${entry.id}`}
                              type="text"
                              className="ftb-input"
                              placeholder="Employer name (optional)"
                              value={entry.employer}
                              onChange={(e) =>
                                handleUpdateW2Entry(entry.id, { employer: e.target.value })
                              }
                            />
                          </div>

                          <div className="ftb-two-col">
                            <div>
                              <label
                                className="ftb-label"
                                htmlFor={`ftb-w2-box1-${entry.id}`}
                                style={{ fontSize: '0.78rem' }}
                              >
                                Box 1 on Prior Year W-2
                              </label>
                              <NumericFormat
                                id={`ftb-w2-box1-${entry.id}`}
                                className="ftb-input"
                                value={entry.box1Wages}
                                thousandSeparator=","
                                prefix="$"
                                decimalScale={0}
                                allowNegative={false}
                                onValueChange={(vals) =>
                                  handleUpdateW2Entry(entry.id, {
                                    box1Wages: vals.floatValue ?? 0,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label
                                className="ftb-label"
                                htmlFor={`ftb-w2-box17-${entry.id}`}
                                style={{ fontSize: '0.78rem' }}
                              >
                                <span>Box 17 on Prior Year W-2</span>
                                {!isNoWageTaxState && !stateTaxManuallyEdited && (
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      color: '#0468E9',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Auto-est.
                                  </span>
                                )}
                              </label>
                              <NumericFormat
                                id={`ftb-w2-box17-${entry.id}`}
                                className="ftb-input"
                                disabled={isNoWageTaxState}
                                value={isNoWageTaxState ? 0 : entry.box17StateTax}
                                thousandSeparator=","
                                prefix="$"
                                decimalScale={0}
                                allowNegative={false}
                                onValueChange={(vals) =>
                                  handleUpdateW2Entry(entry.id, {
                                    box17StateTax: vals.floatValue ?? 0,
                                  })
                                }
                              />
                              {isNoWageTaxState && (
                                <div
                                  style={{
                                    fontSize: '0.71rem',
                                    color: '#0468E9',
                                    fontWeight: 600,
                                    marginTop: '0.24rem',
                                  }}
                                >
                                  No state wage income tax in WA/FL
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(w2Entries.length > 1 || (!isNoWageTaxState && stateTaxManuallyEdited)) && (
                    <div
                      style={{
                        marginTop: '0.45rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        color: '#334155',
                      }}
                    >
                      {w2Entries.length > 1 && (
                        <span>
                          Combined W-2 Box 1: <strong>{currencyFmt.format(inputs.w2Wages)}</strong>{' '}
                          · Combined W-2 Box 17:{' '}
                          <strong>
                            {currencyFmt.format(isNoWageTaxState ? 0 : inputs.w2StateTaxPaid)}
                          </strong>
                        </span>
                      )}
                      {!isNoWageTaxState && stateTaxManuallyEdited && (
                        <button
                          type="button"
                          onClick={handleResetStateTaxEstimate}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            fontSize: '0.73rem',
                            fontWeight: 700,
                            color: '#0468E9',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Reset Box 17 to auto-estimate
                        </button>
                      )}
                    </div>
                  )}

                  {!isNoWageTaxState && (
                    <div
                      style={{
                        marginTop: '0.4rem',
                        fontSize: '0.73rem',
                        color: '#64748B',
                        lineHeight: 1.4,
                      }}
                    >
                      Note: W-2 Box 17 reflects state tax withheld from wages and is used as an
                      estimate of state income tax paid — adjust if you make estimated payments or
                      expect a large state refund.
                    </div>
                  )}
                </div>

                {/* Annual Charitable Donations */}
                <div>
                  <label className="ftb-label" htmlFor="ftb-charity">
                    Annual Charitable Donations
                  </label>
                  <NumericFormat
                    id="ftb-charity"
                    className="ftb-input"
                    value={inputs.annualCharity}
                    thousandSeparator=","
                    prefix="$"
                    decimalScale={0}
                    allowNegative={false}
                    onValueChange={(vals) =>
                      setInputs((prev) => ({
                        ...prev,
                        annualCharity: vals.floatValue ?? 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Live Results Card */}
          <div className="ftb-sticky-col">
            <div className="ftb-card-navy">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.85rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#EFB51E',
                  }}
                >
                  2026 Estimate · {inputs.state} · {horizonLabel}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#CBD5E1',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                  }}
                >
                  {inputs.filingStatus === 'MFJ'
                    ? 'Married Filing Jointly'
                    : inputs.filingStatus === 'HOH'
                    ? 'Head of Household'
                    : 'Single'}
                </span>
              </div>

              {!hasInterestRate && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 181, 30, 0.16)',
                    border: '1px solid #EFB51E',
                    color: '#FEF3C7',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    lineHeight: 1.45,
                  }}
                >
                  Enter an Interest Rate in Step 1 to calculate your monthly mortgage payment and
                  2026 tax savings.
                </div>
              )}

              {/* Hero Comparison: Net vs Gross */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
                  gap: '0.85rem',
                  alignItems: 'stretch',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(239, 181, 30, 0.5)',
                    borderRadius: '14px',
                    padding: '0.95rem 1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1' }}>
                    Net Monthly Cash Outflow
                  </div>
                  <div style={{ fontSize: '0.69rem', color: '#94A3B8', marginBottom: '0.2rem' }}>
                    (After-Tax PITIA)
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(1.65rem, 2.8vw, 2.2rem)',
                      fontWeight: 900,
                      color: '#EFB51E',
                      lineHeight: 1.1,
                    }}
                  >
                    {hasInterestRate
                      ? currencyFmt.format(Math.round(result.netMonthlyCashFlow))
                      : '—'}
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FDE68A' }}>
                      /mo
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    borderRadius: '14px',
                    padding: '0.95rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1' }}>
                    Gross Monthly PITIA
                  </div>
                  <div style={{ fontSize: '0.69rem', color: '#94A3B8', marginBottom: '0.2rem' }}>
                    (Before Tax Savings)
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(1.3rem, 2.2vw, 1.65rem)',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      lineHeight: 1.15,
                    }}
                  >
                    {hasInterestRate
                      ? currencyFmt.format(Math.round(result.grossMonthlyPitia))
                      : '—'}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                      /mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Tax Savings Highlight Badge */}
              <div
                style={{
                  backgroundColor:
                    hasInterestRate && result.annualTaxSavings > 0
                      ? 'rgba(34, 197, 94, 0.18)'
                      : 'rgba(255, 255, 255, 0.08)',
                  border:
                    hasInterestRate && result.annualTaxSavings > 0
                      ? '1px solid rgba(74, 222, 128, 0.55)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.65rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    color:
                      hasInterestRate && result.annualTaxSavings > 0 ? '#4ADE80' : '#E2E8F0',
                  }}
                >
                  {hasInterestRate
                    ? `+${currencyFmt.format(Math.round(result.monthlyTaxSavings))}/mo (${currencyFmt.format(
                        Math.round(result.annualTaxSavings)
                      )}${periodTaxSavingsSuffix}) Estimated Tax Savings`
                    : 'Enter interest rate above to calculate tax savings'}
                </span>
                {hasInterestRate &&
                  result.grossMonthlyPitia > 0 &&
                  result.annualTaxSavings > 0 && (
                    <span
                      style={{
                        fontSize: '0.73rem',
                        fontWeight: 800,
                        backgroundColor: '#15803D',
                        color: '#FFFFFF',
                        padding: '0.18rem 0.55rem',
                        borderRadius: '999px',
                      }}
                    >
                      {taxSavingsPctOfGross.toFixed(1)}% Payment Offset
                    </span>
                  )}
              </div>

              {/* W-4 / Tax Filing Realization Note */}
              <div
                style={{
                  fontSize: '0.76rem',
                  color: '#CBD5E1',
                  lineHeight: 1.45,
                  marginBottom: '0.9rem',
                }}
              >
                Tax savings are realized when filing tax returns or by updating your W-4
                withholding.
              </div>

              {/* Standard Deduction Verdict Callout */}
              {hasInterestRate && result.annualTaxSavings <= 0 && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.85rem 0.95rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.16)',
                    border: '1px solid #F59E0B',
                    color: '#FEF3C7',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Standard Deduction Applies:</strong> You are better off taking the
                  Standard Deduction, which means there are no tax benefits with buying this house
                  during this period.
                </div>
              )}

              {hasInterestRate &&
                !result.fedBuyerItemizes &&
                result.stateTaxSavingsAnnual > 0 && (
                  <div
                    style={{
                      marginBottom: '1rem',
                      padding: '0.75rem 0.95rem',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.18)',
                      border: '1px solid rgba(147, 197, 253, 0.55)',
                      color: '#DBEAFE',
                      fontSize: '0.8rem',
                      lineHeight: 1.45,
                    }}
                  >
                    <strong>Federal Standard Deduction Applies:</strong> You are better off taking
                    the Federal Standard Deduction ($0 Federal tax savings), while still receiving{' '}
                    <strong>
                      {currencyFmt.format(Math.round(result.stateTaxSavingsAnnual))}
                    </strong>{' '}
                    in {inputs.state} state tax savings.
                  </div>
                )}

              {/* Full Calendar Year Comparison Line when Closing Month mode is active */}
              {hasInterestRate && horizonMode === 'closing' && (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    fontSize: '0.78rem',
                    color: '#E2E8F0',
                    lineHeight: 1.45,
                  }}
                >
                  <strong>First Full Calendar Year (12 Mos):</strong> +
                  {currencyFmt.format(Math.round(fullYearResult.monthlyTaxSavings))}/mo (
                  {currencyFmt.format(Math.round(fullYearResult.annualTaxSavings))}/yr) tax savings{' '}
                  →{' '}
                  <strong style={{ color: '#EFB51E' }}>
                    {currencyFmt.format(Math.round(fullYearResult.netMonthlyCashFlow))}/mo net
                  </strong>
                </div>
              )}

              {/* Visual Stacked Bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.73rem',
                    color: '#CBD5E1',
                    marginBottom: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <span>Gross Monthly Payment Breakdown</span>
                  <span>
                    {hasInterestRate
                      ? `${currencyFmt.format(Math.round(result.grossMonthlyPitia))}/mo`
                      : '—/mo'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    height: '12px',
                    width: '100%',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                  }}
                >
                  <div
                    style={{ width: `${piSharePct}%`, backgroundColor: '#3B82F6' }}
                    title={`Principal & Interest: ${currencyFmt.format(Math.round(result.monthlyPi))}/mo`}
                  />
                  <div
                    style={{ width: `${propTaxSharePct}%`, backgroundColor: '#EFB51E' }}
                    title={`Property Taxes: ${currencyFmt.format(Math.round(result.monthlyPropertyTax))}/mo`}
                  />
                  <div
                    style={{ width: `${otherSharePct}%`, backgroundColor: '#94A3B8' }}
                    title={`Insurance + PMI + HOA: ${currencyFmt.format(Math.round(otherHousingMonthly))}/mo`}
                  />
                </div>
              </div>

              {/* Line-by-Line Breakdown */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.52rem',
                  fontSize: '0.86rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#E2E8F0' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                    Principal &amp; Interest (P&amp;I)
                  </span>
                  <strong style={{ color: '#FFFFFF' }}>
                    {hasInterestRate ? `${currencyFmt.format(Math.round(result.monthlyPi))}/mo` : '—/mo'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#E2E8F0' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#EFB51E' }} />
                    Property Taxes ({(inputs.propertyTaxRate * 100).toFixed(2)}%)
                  </span>
                  <strong style={{ color: '#FFFFFF' }}>
                    {currencyFmt.format(Math.round(result.monthlyPropertyTax))}/mo
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: '#E2E8F0' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
                    Insurance + PMI + HOA
                  </span>
                  <strong style={{ color: '#FFFFFF' }}>
                    {currencyFmt.format(Math.round(otherHousingMonthly))}/mo
                  </strong>
                </div>

                <div
                  style={{
                    borderTop: '1px dashed rgba(255,255,255,0.2)',
                    margin: '0.2rem 0',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#86EFAC', fontWeight: 600 }}>
                    Minus: Federal Income Tax Savings
                  </span>
                  <strong style={{ color: hasInterestRate && result.fedTaxSavingsMonthly > 0 ? '#4ADE80' : '#94A3B8' }}>
                    {hasInterestRate
                      ? `-${currencyFmt.format(Math.round(result.fedTaxSavingsMonthly))}/mo`
                      : '—/mo'}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ color: '#86EFAC', fontWeight: 600 }}>
                      Minus: {inputs.state} State Income Tax Savings
                    </div>
                    {isNoWageTaxState && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        $0/mo — No state income tax in {inputs.state}
                      </div>
                    )}
                    {inputs.state === 'UT' && (
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Utah 6% Taxpayer Tax Credit impact
                      </div>
                    )}
                  </div>
                  <strong
                    style={{
                      color:
                        hasInterestRate && result.stateTaxSavingsMonthly > 0
                          ? '#4ADE80'
                          : '#94A3B8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {!hasInterestRate
                      ? '—/mo'
                      : isNoWageTaxState
                      ? '$0/mo'
                      : `-${currencyFmt.format(Math.round(result.stateTaxSavingsMonthly))}/mo`}
                  </strong>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(239, 181, 30, 0.45)',
                    marginTop: '0.25rem',
                    paddingTop: '0.6rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.96rem',
                  }}
                >
                  <strong style={{ color: '#FFFFFF' }}>Net Monthly Cash Outflow</strong>
                  <strong style={{ color: '#EFB51E', fontSize: '1.1rem' }}>
                    {hasInterestRate
                      ? `${currencyFmt.format(Math.round(result.netMonthlyCashFlow))}/mo`
                      : '—/mo'}
                  </strong>
                </div>
              </div>

              {/* Expandable "How Your 2026 Tax Savings Are Calculated" Drawer */}
              <div style={{ marginTop: '1.1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMathDrawer((v) => !v)}
                  aria-expanded={showMathDrawer}
                  style={{
                    width: '100%',
                    padding: '0.62rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>How Your 2026 Tax Savings Are Calculated</span>
                  <span style={{ color: '#EFB51E', fontWeight: 900 }}>
                    {showMathDrawer ? '▲ Hide' : '▼ Show Math'}
                  </span>
                </button>

                {showMathDrawer && (
                  <div
                    style={{
                      marginTop: '0.7rem',
                      padding: '0.95rem',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.8rem',
                      lineHeight: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    {/* Federal Comparison */}
                    <div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#0468E9',
                          letterSpacing: '0.04em',
                          marginBottom: '0.35rem',
                        }}
                      >
                        2026 Federal Tax Comparison ({monthsInTaxYear}{' '}
                        {monthsInTaxYear === 1 ? 'Month' : 'Months'})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.22rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>
                            Months 1–{monthsInTaxYear} Mortgage Interest (capped at $750k loan):
                          </span>
                          <strong>
                            {currencyFmt.format(Math.round(result.fedDeductibleMortgageInterest))}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>
                            Deductible PMI (phases out $100k–$110k):
                          </span>
                          <strong>{currencyFmt.format(Math.round(result.deductiblePmi))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>
                            Federal SALT (capped at {currencyFmt.format(Math.round(result.fedSaltCap))}):
                          </span>
                          <strong>{currencyFmt.format(Math.round(result.fedSaltBuyer))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>
                            Deductible Charity (after 0.5% AGI floor):
                          </span>
                          <strong>{currencyFmt.format(Math.round(result.fedItemizedCharity))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>
                            {result.fedNonItemizerCharity > 0 &&
                            result.fedSaltRenter + result.fedItemizedCharity <=
                              result.fedStandardDeduction + result.fedNonItemizerCharity
                              ? 'Renter Baseline Deduction (Std + non-itemizer charity):'
                              : 'Renter Baseline Deduction:'}
                          </span>
                          <strong>{currencyFmt.format(Math.round(result.fedRenterDeduction))}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#475569' }}>
                            Homeowner Deduction ({result.fedBuyerItemizes ? 'Itemized' : 'Standard'}):
                          </span>
                          <strong>{currencyFmt.format(Math.round(result.fedBuyerDeduction))}</strong>
                        </div>
                        {(() => {
                          const fedIncremental = Math.max(
                            0,
                            result.fedBuyerDeduction - result.fedRenterDeduction
                          );
                          const effRatePct =
                            fedIncremental > 0 && result.fedTaxSavingsAnnual > 0
                              ? (result.fedTaxSavingsAnnual / fedIncremental) * 100
                              : 0;
                          return (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#060A2D', fontWeight: 600 }}>
                                  Incremental Deduction from Owning:
                                </span>
                                <strong style={{ color: '#0468E9' }}>
                                  +{currencyFmt.format(Math.round(fedIncremental))}
                                </strong>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  borderTop: '1px dashed #CBD5E1',
                                  paddingTop: '0.25rem',
                                  marginTop: '0.15rem',
                                  color: '#15803D',
                                }}
                              >
                                <strong>
                                  Federal Tax Savings ({monthsInTaxYear} mos
                                  {effRatePct > 0 ? ` · ~${effRatePct.toFixed(1)}% eff. rate` : ''}):
                                </strong>
                                <strong>
                                  {currencyFmt.format(Math.round(result.fedTaxSavingsAnnual))} (
                                  {currencyFmt.format(Math.round(result.fedTaxSavingsMonthly))}/mo)
                                </strong>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* State Comparison */}
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.7rem' }}>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          color: '#0468E9',
                          letterSpacing: '0.04em',
                          marginBottom: '0.35rem',
                        }}
                      >
                        2026 {result.stateLabel} Comparison
                      </div>
                      {isNoWageTaxState ? (
                        <div style={{ color: '#475569' }}>
                          {result.stateExplanationNote} State tax savings are <strong>$0/yr</strong>.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.22rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#475569' }}>State Renter Baseline Deduction:</span>
                            <strong>
                              {currencyFmt.format(Math.round(result.stateRenterDeduction))}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#475569' }}>
                              State Homeowner Deduction (
                              {result.stateBuyerItemizes ? 'Itemized' : 'Standard'}):
                            </span>
                            <strong>
                              {currencyFmt.format(Math.round(result.stateBuyerDeduction))}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#060A2D', fontWeight: 600 }}>
                              Incremental State Deduction from Owning:
                            </span>
                            <strong style={{ color: '#0468E9' }}>
                              +
                              {currencyFmt.format(
                                Math.round(
                                  Math.max(
                                    0,
                                    result.stateBuyerDeduction - result.stateRenterDeduction
                                  )
                                )
                              )}
                            </strong>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.15rem' }}>
                            {result.stateExplanationNote}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              borderTop: '1px dashed #CBD5E1',
                              paddingTop: '0.25rem',
                              marginTop: '0.15rem',
                              color: '#15803D',
                            }}
                          >
                            <strong>
                              {inputs.state} Tax Savings ({monthsInTaxYear} mos):
                            </strong>
                            <strong>
                              {currencyFmt.format(Math.round(result.stateTaxSavingsAnnual))} (
                              {currencyFmt.format(Math.round(result.stateTaxSavingsMonthly))}/mo)
                            </strong>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Card: Want a Custom Scenario or Pre-Approval? */}
            <div
              className="ftb-card"
              style={{
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#0468E9',
                  marginBottom: '0.25rem',
                }}
              >
                Team Insider · C2 Financial Corp
              </div>
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.1rem', fontWeight: 800, color: '#060A2D' }}>
                Want a Custom Scenario or Pre-Approval?
              </h3>
              <p style={{ margin: '0 0 0.85rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                Speak directly with <strong>Rakesh Jain</strong> &amp; <strong>David Sider</strong>{' '}
                to compare real-time rates, low-down-payment options, and customized monthly
                payments for your target home.
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  href="/pre-approval/"
                  style={{
                    display: 'inline-block',
                    padding: '0.6rem 1.15rem',
                    borderRadius: '999px',
                    backgroundColor: '#060A2D',
                    color: '#EFB51E',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                  }}
                >
                  Start Pre-Approval →
                </Link>
                <a
                  href="tel:8588485653"
                  style={{
                    display: 'inline-block',
                    padding: '0.58rem 1rem',
                    borderRadius: '999px',
                    backgroundColor: '#FFFFFF',
                    color: '#060A2D',
                    border: '1px solid #CBD5E1',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textDecoration: 'none',
                  }}
                >
                  📞 (858) 848-5653
                </a>
                <a
                  href="mailto:dsrj@insidermtg.com?subject=First-Time%20Buyer%20Tax%20Savings%20Scenario"
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#0468E9',
                    textDecoration: 'underline',
                  }}
                >
                  dsrj@insidermtg.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION A: Factors & Methodology Used in This Calculator */}
        <section style={{ marginTop: '2.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#0468E9',
              }}
            >
              Transparency &amp; Tax Modeling
            </div>
            <h2 style={{ margin: '0.2rem 0 0', fontSize: '1.35rem', fontWeight: 800, color: '#060A2D' }}>
              Factors &amp; Methodology Used in This Calculator
            </h2>
          </div>

          <div className="ftb-method-grid">
            {/* Card 1: Housing & Loan Outflow Factors */}
            <div className="ftb-card">
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.02rem', fontWeight: 800, color: '#060A2D' }}>
                1. Housing &amp; Loan Outflow Factors (Gross PITIA)
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.15rem',
                  fontSize: '0.86rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                }}
              >
                <li>
                  <strong>Loan Amount &amp; Front-Loaded Amortized Interest:</strong> Standard
                  fixed-rate mortgages are front-loaded with interest. This calculator sums exact
                  month-by-month interest across your selected ownership window (12 months for a
                  full calendar year, or your remaining months after closing).
                </li>
                <li>
                  <strong>Property Taxes &amp; Local Assessments:</strong> Calculated as Purchase
                  Price × Annual Property Tax Rate (defaulting to typical county averages by state:
                  CA 1.20%, WA 0.95%, UT 0.55%, AZ 0.60%, FL 0.95%, fully editable for Mello-Roos or
                  local assessments).
                </li>
                <li>
                  <strong>HOA Dues &amp; Homeowners Insurance:</strong> Included in Gross Monthly
                  PITIA for accurate cash-flow budgeting, and treated as non-deductible personal
                  housing expenses.
                </li>
                <li>
                  <strong>2026 PMI Deductibility:</strong> Private Mortgage Insurance (for down
                  payments under 20%) is deductible under 2026 rules for borrowers with AGI under
                  $100,000, phasing out linearly by 10% per $1,000 (or fraction thereof) between
                  $100,000 and $110,000.
                </li>
              </ul>
            </div>

            {/* Card 2: 2026 Income Tax Savings Factors */}
            <div className="ftb-card">
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.02rem', fontWeight: 800, color: '#060A2D' }}>
                2. 2026 Income Tax Savings Factors (Incremental Benefit Over Renting)
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '1.15rem',
                  fontSize: '0.86rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                }}
              >
                <li>
                  <strong>2026 Federal Standard Deduction &amp; Progressive Brackets:</strong>{' '}
                  Compares your renter baseline against 2026 Standard Deductions ($16,100 Single,
                  $24,150 Head of Household, $32,200 Married Filing Jointly) so only the{' '}
                  <em>incremental</em> tax benefit over renting is counted.
                </li>
                <li>
                  <strong>$750,000 Federal Mortgage Interest Cap &amp; $40,400 SALT Cap:</strong>{' '}
                  Federal mortgage interest is prorated up to $750,000 in acquisition debt. State
                  and local taxes (state income tax + property tax) are capped at $40,400 for MAGI
                  under $505,000, phasing down progressively by 30% above $505,000 until reaching a
                  $10,000 floor at approximately $606,333 MAGI.
                </li>
                <li>
                  <strong>Prior-Year W-2 Box 1, Box 17 &amp; 2026 Charitable Rules:</strong> Box 1
                  wages reflect taxable pay after pre-tax 401(k)/HSA deductions. Box 17 reports
                  state wage withholding and serves as an editable starting estimate for state
                  income tax paid when computing your SALT baseline. Under 2026 Federal charitable
                  rules, non-itemizers can deduct up to $1,000 ($2,000 Married Filing Jointly)
                  above the line on top of the Standard Deduction, while Schedule A itemizers are
                  subject to a 0.5% of AGI floor on charitable contributions.
                </li>
                <li>
                  <strong>State-Specific 2026 Rules:</strong> <strong>CA</strong> runs separately
                  from the Federal SALT cap, using progressive 1%–12.3% brackets (+1% over $1M) with
                  exact Single, HOH, and MFJ schedules, $5,900/$11,800 standard deduction, and a
                  $1M mortgage interest cap (subject to California itemizing rules).{' '}
                  <strong>UT</strong> uses a 4.45% flat tax with its 6% Taxpayer Tax Credit (subject
                  to income phase-out). <strong>AZ</strong> uses a 2.50% flat tax conforming to
                  federal deductions (excluding state income tax). <strong>WA &amp; FL</strong> have
                  0% state wage income tax (optional federal state sales-tax elections are excluded
                  to keep estimates conservative).
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION B: Important Disclaimers & Licensing Disclosures */}
        <section style={{ marginTop: '1.75rem' }}>
          <div
            style={{
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '14px',
              padding: '1.25rem 1.4rem',
              color: '#475569',
              fontSize: '0.8rem',
              lineHeight: 1.6,
            }}
          >
            <h3
              style={{
                margin: '0 0 0.65rem',
                fontSize: '0.88rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#334155',
              }}
            >
              Important Disclaimers &amp; Licensing Disclosures
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ margin: 0 }}>
                <strong>1. Not Tax or Legal Advice:</strong> This calculator provides an
                educational, self-help estimate only and does not constitute tax, legal, or
                accounting advice. Consult a qualified CPA or tax advisor regarding your individual
                Schedule A deductions, Alternative Minimum Tax (AMT), partial-year Year 1 home
                ownership, age 65+ additional deductions, California high-income itemized deduction
                phase-downs, optional sales-tax elections, or other personal tax circumstances.
              </p>
              <p style={{ margin: 0 }}>
                <strong>2. Realizing Monthly Cash-Flow Savings:</strong> Tax savings are realized
                when filing tax returns or by updating your W-4 withholding with your employer after
                closing.
              </p>
              <p style={{ margin: 0 }}>
                <strong>3. Not a Commitment to Lend:</strong> Interest rates, PMI estimates, and
                monthly payment figures are for illustrative purposes only and do not represent a
                loan offer, rate lock, or commitment to lend. All loans are subject to credit,
                income, asset, and property underwriting approval.
              </p>
              <p style={{ margin: 0 }}>
                <strong>4. Licensing &amp; Equal Housing Disclosure:</strong> Insider Mortgage
                (Team Insider) operates under C2 Financial Corporation (NMLS #135622 | CA DRE
                #01821025), an Equal Housing Opportunity Mortgage Broker/Lender. Rakesh Jain (CA
                DRE #01336748 | NMLS #240594) and David Sider (NMLS #254108) — Licensed in CA, WA,
                UT, AZ, and FL. Verify licensing at{' '}
                <a
                  href="https://www.nmlsconsumeraccess.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#0468E9', textDecoration: 'underline' }}
                >
                  nmlsconsumeraccess.org
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Email Scenario Modal */}
      <EmailTaxScenarioModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        scenarioName={scenarioName}
        inputs={effectiveInputs}
        result={result}
        horizonLabel={horizonLabel}
        buildShareUrl={buildShareUrl}
      />
    </div>
  );
}
