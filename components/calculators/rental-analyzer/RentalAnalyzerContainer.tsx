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
import RentalAnalyzerPrintReport from './RentalAnalyzerPrintReport';
import { getRentalReportPdfFileName, detectPropertyState } from './stateDetector';
import './rental-analyzer.css';

export interface RentalAnalyzerContainerProps {
  mode?: 'public' | 'admin';
}

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
  aduConstructionMonths: 6,
  aduMainRentDiscountPct: 0.25,
};

export default function RentalAnalyzerContainer({
  mode = 'public',
}: RentalAnalyzerContainerProps) {
  const [activePreset, setActivePreset] = useState<
    'tam-o-shanter' | 'crawford' | 'fourplex' | 'custom'
  >('tam-o-shanter');
  const [unitCache, setUnitCache] = useState<UnitInput[]>(DEFAULT_UNITS_CACHE);
  const [inputs, setInputs] = useState<UnderwriteInputs>(INITIAL_DUPLEX_INPUTS);
  const [publicUnlocked, setPublicUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMathMetric, setActiveMathMetric] = useState<MathMetricKey | null>(null);

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

  const loadPreset = (preset: 'tam-o-shanter' | 'crawford' | 'fourplex') => {
    setActivePreset(preset);
    if (preset === 'crawford') {
      const crawfordCache: UnitInput[] = [
        { id: 'unit-1', label: 'Single Family Home', monthlyRent: 4600 },
        unitCache[1],
        unitCache[2],
        unitCache[3],
      ];
      setUnitCache(crawfordCache);
      setInputs({
        ...INITIAL_DUPLEX_INPUTS,
        propertyAddress: '6234 Crawford St, San Diego, CA 92120',
        unitCount: 1,
        units: crawfordCache.slice(0, 1),
        purchasePrice: 989000,
        makeReadyCost: 10000,
        monthlyMaintenance: 150,
      });
    } else if (preset === 'tam-o-shanter') {
      const tamCache: UnitInput[] = [
        { id: 'unit-1', label: 'Unit 1 (Primary)', monthlyRent: 2600 },
        { id: 'unit-2', label: 'Unit 2 (Attached)', monthlyRent: 2200 },
        unitCache[2],
        unitCache[3],
      ];
      setUnitCache(tamCache);
      setInputs({
        ...INITIAL_DUPLEX_INPUTS,
        propertyAddress: '535 Tam O Shanter Dr, San Marcos, CA 92069',
        unitCount: 2,
        units: tamCache.slice(0, 2),
        purchasePrice: 880000,
        makeReadyCost: 50000,
        monthlyMaintenance: 200,
      });
    } else {
      const fourplexCache: UnitInput[] = [
        { id: 'unit-1', label: 'Unit 1 (2 Bed / 2 Bath)', monthlyRent: 2650 },
        { id: 'unit-2', label: 'Unit 2 (2 Bed / 1 Bath)', monthlyRent: 2400 },
        { id: 'unit-3', label: 'Unit 3 (2 Bed / 1 Bath)', monthlyRent: 2400 },
        { id: 'unit-4', label: 'Unit 4 (1 Bed / 1 Bath)', monthlyRent: 2050 },
      ];
      setUnitCache(fourplexCache);
      setInputs({
        ...INITIAL_DUPLEX_INPUTS,
        propertyAddress: 'Normal Heights Fourplex, San Diego, CA 92116',
        unitCount: 4,
        units: fourplexCache,
        purchasePrice: 1450000,
        makeReadyCost: 25000,
        monthlyMaintenance: 400,
      });
    }
  };

  const summary = useMemo(() => runUnderwriteModel(inputs), [inputs]);
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
      document.title = savedTitle || 'Insider Mortgage | 1–4 Unit Rental Property & ADU Investment Analyzer';
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
              1–4 Unit Rental Property &amp; ADU Investment Analyzer
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '0.98rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.55,
              }}
            >
              Underwrite Single-Family, Duplex, Triplex, and Fourplex acquisitions with dynamic
              unit-level rent schedules, 5-year &amp; 10-year Newton-Raphson IRR, future refinance
              scenarios, and California ADU value-add projections.
            </p>
          </div>

          {/* Quick-Load Scenario Presets + Clear Property Button */}
          <div className="no-print">
            <div
              style={{
                fontSize: '0.73rem',
                fontWeight: 700,
                color: '#CBD5E1',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.45rem',
              }}
            >
              Quick-Load Property Benchmark or Enter Your Own:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => loadPreset('crawford')}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.28)',
                  backgroundColor:
                    activePreset === 'crawford' ? '#EFB51E' : 'rgba(255,255,255,0.1)',
                  color: activePreset === 'crawford' ? '#060A2D' : '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Case A: 6234 Crawford (1-Unit)
              </button>

              <button
                type="button"
                onClick={() => loadPreset('tam-o-shanter')}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.28)',
                  backgroundColor:
                    activePreset === 'tam-o-shanter' ? '#EFB51E' : 'rgba(255,255,255,0.1)',
                  color: activePreset === 'tam-o-shanter' ? '#060A2D' : '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Case B: 535 Tam O Shanter (Duplex)
              </button>

              <button
                type="button"
                onClick={() => loadPreset('fourplex')}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.28)',
                  backgroundColor:
                    activePreset === 'fourplex' ? '#EFB51E' : 'rgba(255,255,255,0.1)',
                  color: activePreset === 'fourplex' ? '#060A2D' : '#FFFFFF',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                4-Unit Fourplex Sample
              </button>

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
                  marginLeft: 'auto',
                }}
              >
                🖨 Save PDF Report (2 Pages)
              </button>
            </div>
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
          </div>

          {/* Right Column: Summary KPI Cards, What-If Modules, and Advisor Callout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <SummaryKpiCards
              inputs={inputs}
              summary={summary}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
              onOpenMath={(metric) => setActiveMathMetric(metric)}
            />

            <WhatIfModules
              inputs={inputs}
              onChange={handlePatchInputs}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
            />

            <AiInvestmentAnalysis
              inputs={inputs}
              summary={summary}
              isLockedPublic={isLockedPublic}
              onRequestUnlock={() => setIsModalOpen(true)}
            />

            {/* Advisor Callout Banner */}
            <div
              className="ra-card no-print"
              style={{
                background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
                border: '1px solid #BFDBFE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0468E9', textTransform: 'uppercase' }}>
                  Custom 1–4 Unit &amp; ADU Financing
                </div>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.05rem', color: '#060A2D' }}>
                  Need DSCR, Conventional Multi-Unit, or ADU Construction Financing?
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569' }}>
                  {stateInfo.isRakeshOnly ? (
                    <>
                      Speak directly with <strong>Rakesh Jain</strong> ({stateInfo.rakeshLicense} · NMLS #240594) at
                      Insider Mortgage · <strong>(858) 848-5653</strong>
                    </>
                  ) : (
                    <>
                      Speak directly with <strong>David Sider</strong> (NMLS #254108) &amp;{' '}
                      <strong>Rakesh Jain</strong> (NMLS #240594 / CA DRE #01336748) at
                      Insider Mortgage · <strong>(858) 848-5653</strong>
                    </>
                  )}
                </p>
              </div>
              {mode === 'public' && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#060A2D',
                    color: '#EFB51E',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Request Custom Loan Quote →
                </button>
              )}
            </div>
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
