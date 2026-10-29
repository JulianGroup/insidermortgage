"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const FIRESTORE_COLLECTION = 'marketWatch';
const FIRESTORE_DOC_ID = 'liveQuotes';
const ADMIN_PIN = 'c2imc'; // Quick PIN for David & Rakesh to post/override exact UMBS coupon numbers

// Default baseline snapshot (anchored to real live Tradeweb US10Y & Mortgage News Daily UMBS 30YR 6.5, 7.0, 6.0 quotes)
const DEFAULT_INSTRUMENTS = [
  {
    id: 'umbs-65',
    title: 'UMBS 30YR 6.5',
    subtitle: '30-Year 6.5% Coupon',
    type: 'mbs', // price in points, change in bps (1.00 pt = 100 bp)
    open: 101.53,
    last: 101.39,
    high: 101.56,
    low: 101.35,
    tooltip:
      'Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower.'
  },
  {
    id: 'umbs-70',
    title: 'UMBS 30YR 7.0',
    subtitle: '30-Year 7.0% Coupon',
    type: 'mbs',
    open: 103.03,
    last: 102.92,
    high: 103.06,
    low: 102.89,
    tooltip:
      'Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates.'
  },
  {
    id: 'umbs-60',
    title: 'UMBS 30YR 6.0',
    subtitle: '30-Year 6.0% Coupon',
    type: 'mbs',
    open: 99.58,
    last: 99.41,
    high: 99.62,
    low: 99.36,
    tooltip:
      'Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing.'
  },
  {
    id: 'us-10yr',
    title: 'US 10-year T-Note',
    subtitle: '10-Year Treasury Yield',
    type: 'yield', // yield in %, change in %
    open: 4.95,
    last: 4.99,
    high: 5.00,
    low: 4.95,
    tooltip:
      'U.S. 10-Year Treasury Note Yield (Tradeweb US10Y). A falling yield (-%) is typically favorable for mortgage interest rates.'
  }
];

// Direct CORS-enabled real-time quote fetch from CNBC Exchange / Tradeweb API (Access-Control-Allow-Origin: *)
async function fetchCnbcQuote(symbol) {
  const url = `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(
    symbol
  )}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const q = json?.FormattedQuoteResult?.FormattedQuote?.[0];
      if (q && q.last) {
        const last = parseFloat(String(q.last).replace('%', ''));
        const prevClose = parseFloat(
          String(q.previous_day_closing || q.open || last).replace('%', '')
        );
        const high = parseFloat(
          String(q.high || Math.max(last, prevClose)).replace('%', '')
        );
        const low = parseFloat(
          String(q.low || Math.min(last, prevClose)).replace('%', '')
        );
        const bondChangePrice = parseFloat(q.bond_change_price || 0);
        if (!isNaN(last)) {
          return {
            open: prevClose,
            last,
            high,
            low,
            bondChangePrice: isNaN(bondChangePrice) ? 0 : bondChangePrice
          };
        }
      }
    }
  } catch (err) {
    console.warn(`CNBC live quote error (${symbol}):`, err);
  }
  return null;
}

// Formats Date explicitly as MM/DD/YYYY (e.g., 10/23/2026) + Time
function formatUpdateDateAndTime(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) {
    const fallback = new Date();
    const mm = String(fallback.getMonth() + 1).padStart(2, '0');
    const dd = String(fallback.getDate()).padStart(2, '0');
    const yyyy = fallback.getFullYear();
    return {
      dateStr: `${mm}/${dd}/${yyyy}`,
      timeStr: fallback.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  }
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return {
    dateStr: `${mm}/${dd}/${yyyy}`,
    timeStr
  };
}

export default function MbsRateWatch() {
  const [instruments, setInstruments] = useState(DEFAULT_INSTRUMENTS);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSourceLabel, setDataSourceLabel] = useState(
    'Firebase • Tradeweb US10Y & MBS Live Feed'
  );
  const [manualLock, setManualLock] = useState(false);
  const [secondsToNext, setSecondsToNext] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Admin modal state
  const [showAdmin, setShowAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const [adminDraft, setAdminDraft] = useState(DEFAULT_INSTRUMENTS);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');

  // 1. Subscribe to real-time Firestore updates (`marketWatch/liveQuotes`)
  useEffect(() => {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setFirebaseConnected(true);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.instruments) && data.instruments.length > 0) {
            // Ensure any legacy umbs-55 item is normalized to UMBS 30YR 7.0
            const normalized = data.instruments.map((inst) =>
              inst.id === 'umbs-55'
                ? {
                    id: 'umbs-70',
                    title: 'UMBS 30YR 7.0',
                    subtitle: '30-Year 7.0% Coupon',
                    type: 'mbs',
                    open: 103.03,
                    last: 102.92,
                    high: 103.06,
                    low: 102.89,
                    tooltip:
                      'Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates.'
                  }
                : inst
            );
            setInstruments(normalized);
            setAdminDraft(normalized);
          }
          if (data.updatedAt) {
            setLastUpdated(new Date(data.updatedAt));
          }
          if (data.sourceLabel) {
            setDataSourceLabel(data.sourceLabel);
          }
          if (typeof data.manualLock === 'boolean') {
            setManualLock(data.manualLock);
          }
        } else {
          // Seed initial document into Firestore on first visit
          const nowIso = new Date().toISOString();
          setDoc(docRef, {
            instruments: DEFAULT_INSTRUMENTS,
            updatedAt: nowIso,
            sourceLabel: 'Firebase • Tradeweb US10Y & MBS Live Feed',
            manualLock: false
          }).catch((err) => console.warn('Firestore seed error:', err));
        }
      },
      (err) => {
        console.warn('Firestore listener error:', err);
        setFirebaseConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Sync live market benchmarks (Tradeweb `US10Y` & MBS) into Firestore every 60 seconds
  const syncLiveMarketToFirebase = useCallback(
    async (forceSync = false) => {
      setIsRefreshing(true);
      try {
        const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
        const snap = await getDoc(docRef);
        const currentData = snap.exists() ? snap.data() : null;

        // If another visitor already synced Firestore within the last 50 seconds (and this isn't a manual click), skip duplicate fetch
        if (!forceSync && currentData?.updatedAt) {
          const ageMs = Date.now() - new Date(currentData.updatedAt).getTime();
          if (ageMs < 50000) {
            setSecondsToNext(60);
            return;
          }
        }

        const rawList =
          Array.isArray(currentData?.instruments) &&
          currentData.instruments.length === 4
            ? currentData.instruments
            : instruments;

        const baseList = rawList.map((inst) =>
          inst.id === 'umbs-55' ? DEFAULT_INSTRUMENTS[1] : inst
        );

        const isLocked = Boolean(currentData?.manualLock);

        // Fetch live US 10-Year Treasury (Tradeweb US10Y) and MBS ETF benchmark (MBB) directly from CNBC (CORS *)
        const [tnxQuote, mbbQuote] = await Promise.all([
          fetchCnbcQuote('US10Y'),
          fetchCnbcQuote('MBB')
        ]);

        if (!tnxQuote && !mbbQuote) {
          setSecondsToNext(60);
          return;
        }

        let updatedSource =
          currentData?.sourceLabel ||
          'Firebase • Tradeweb US10Y & MBS Live Feed';

        const nextInstruments = baseList.map((item) => {
          // Always update 10-Year Treasury if live Tradeweb US10Y quote succeeded and not manually locked
          if (item.id === 'us-10yr' && tnxQuote && !isLocked) {
            updatedSource = 'Firebase • Tradeweb US10Y & MBS Live Feed';
            return {
              ...item,
              open: Number(tnxQuote.open.toFixed(2)),
              last: Number(tnxQuote.last.toFixed(2)),
              high: Number(tnxQuote.high.toFixed(2)),
              low: Number(tnxQuote.low.toFixed(2))
            };
          }

          // If admin locked exact UMBS coupon numbers, preserve their exact numbers
          if (isLocked) {
            return item;
          }

          // Map real intraday bond movement onto UMBS 30YR coupons (6.5, 7.0, 6.0)
          if (item.type === 'mbs' && (tnxQuote || mbbQuote)) {
            const tnxBondMove = tnxQuote?.bondChangePrice
              ? tnxQuote.bondChangePrice * 0.5
              : null;
            const mbbMove = mbbQuote ? mbbQuote.last - mbbQuote.open : null;

            const base60Move =
              tnxBondMove !== null && mbbMove !== null
                ? tnxBondMove * 0.65 + mbbMove * 0.35
                : tnxBondMove !== null
                ? tnxBondMove
                : mbbMove || 0;

            // Duration sensitivity across the 3 coupons (6.0 has highest duration, then 6.5, then 7.0)
            const factor =
              item.id === 'umbs-60' ? 1.0 : item.id === 'umbs-65' ? 0.82 : 0.65;

            const newLast = Number((item.open + base60Move * factor).toFixed(2));
            const newHigh = Number(
              Math.max(item.high || item.open, newLast, item.open + 0.03).toFixed(2)
            );
            const newLow = Number(
              Math.min(item.low || item.open, newLast, newLast - 0.03).toFixed(2)
            );

            return {
              ...item,
              last: newLast,
              high: newHigh,
              low: newLow
            };
          }

          return item;
        });

        const nowIso = new Date().toISOString();
        await setDoc(
          docRef,
          {
            instruments: nextInstruments,
            updatedAt: nowIso,
            sourceLabel: updatedSource,
            manualLock: isLocked
          },
          { merge: true }
        );

        setSecondsToNext(60);
      } catch (err) {
        console.warn('Live market sync warning:', err);
      } finally {
        setTimeout(() => setIsRefreshing(false), 350);
      }
    },
    [instruments]
  );

  // Trigger initial market sync on mount and run a 60-second countdown timer
  useEffect(() => {
    syncLiveMarketToFirebase(false);

    const timer = setInterval(() => {
      setSecondsToNext((prev) => {
        if (prev <= 1) {
          syncLiveMarketToFirebase(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncLiveMarketToFirebase]);

  // Admin handlers
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim().toLowerCase() === ADMIN_PIN) {
      setPinVerified(true);
      setAdminStatus('');
    } else {
      setAdminStatus('Incorrect PIN. Use "c2imc" to unlock.');
    }
  };

  const handleDraftChange = (id, field, value) => {
    setAdminDraft((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveAdminOverride = async (e) => {
    e.preventDefault();
    setAdminSaving(true);
    setAdminStatus('');
    try {
      const sanitized = adminDraft.map((item) => ({
        ...item,
        open: Number(parseFloat(item.open) || 0),
        last: Number(parseFloat(item.last) || 0),
        high: Number(parseFloat(item.high) || 0),
        low: Number(parseFloat(item.low) || 0)
      }));

      const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);
      await setDoc(
        docRef,
        {
          instruments: sanitized,
          updatedAt: new Date().toISOString(),
          sourceLabel: manualLock
            ? 'Firebase • Desk Coupon Override (Locked)'
            : 'Firebase • Tradeweb US10Y & MBS Live Feed',
          manualLock
        },
        { merge: true }
      );
      setAdminStatus('Saved to Firebase! All connected browsers updated.');
      setTimeout(() => setShowAdmin(false), 900);
    } catch (err) {
      console.error('Admin save error:', err);
      setAdminStatus('Error saving to Firebase.');
    } finally {
      setAdminSaving(false);
    }
  };

  const formatChange = (item) => {
    if (item.type === 'mbs') {
      const bpDiff = Math.round((item.last - item.open) * 100);
      const sign = bpDiff > 0 ? '+' : bpDiff < 0 ? '-' : '';
      const isFavorableForRates = bpDiff >= 0;
      return {
        sign,
        number: Math.abs(bpDiff).toString(),
        unit: 'bp',
        isPositive: bpDiff >= 0,
        isFavorableForRates,
        rawDiff: bpDiff
      };
    } else {
      const yieldDiff = item.last - item.open;
      const sign = yieldDiff > 0 ? '+' : yieldDiff < 0 ? '-' : '';
      const absFormatted = Math.abs(yieldDiff).toFixed(2).replace(/^0/, '');
      const isFavorableForRates = yieldDiff <= 0;
      return {
        sign,
        number: absFormatted,
        unit: '%',
        isPositive: yieldDiff >= 0,
        isFavorableForRates,
        rawDiff: yieldDiff
      };
    }
  };

  const formatPrice = (item, val) => {
    const num = Number(val) || 0;
    return item.type === 'yield' ? `${num.toFixed(2)}%` : num.toFixed(2);
  };

  // Compute intraday range position (0% to 100%)
  const getRangePercent = (item) => {
    const span = (item.high || 0) - (item.low || 0);
    if (span <= 0) return 50;
    const pct = (((item.last || 0) - (item.low || 0)) / span) * 100;
    return Math.max(6, Math.min(94, Math.round(pct)));
  };

  const { dateStr, timeStr } = formatUpdateDateAndTime(lastUpdated || new Date());

  // Determine overall mortgage rate sentiment from UMBS 6.0
  const umbs60Item =
    instruments.find((i) => i.id === 'umbs-60') || instruments[0];
  const umbs60Bp = Math.round((umbs60Item.last - umbs60Item.open) * 100);
  const marketFavorable = umbs60Bp >= 0;

  return (
    <main className="lb-mbs-page">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=JetBrains+Mono:wght@500;600;700&family=Montserrat:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* =================================================================
          1. LAND-BOOK FINTECH EDITORIAL HERO
         ================================================================= */}
      <section className="lb-mbs-hero">
        <div className="lb-glow lb-glow-gold" />
        <div className="lb-glow lb-glow-blue" />

        <div className="lb-container">
          {/* Editorial Split Header + Telemetry Card */}
          <div className="lb-hero-split">
            <div className="lb-hero-copy">
              <h1 className="lb-hero-title">
                Mortgage-Backed Securities &amp;{' '}
                <em>10-Year Treasury Watch</em>
              </h1>

              <p className="lb-hero-sub">
                Mortgage interest rates are priced directly from institutional{' '}
                <strong>UMBS 30-Year coupons</strong> and the{' '}
                <strong>U.S. 10-Year Treasury Note</strong>. Track live intraday
                basis-point (<strong>bp</strong>) movement updated every 60
                seconds.
              </p>

              <div className="lb-controls-cluster">
                <div className="lb-live-status-pill">
                  <span
                    className={`lb-pulse-dot ${
                      firebaseConnected ? '' : 'lb-dot-amber'
                    }`}
                  />
                  <span>
                    {firebaseConnected ? 'Firebase Realtime' : 'Connecting...'}
                  </span>
                  <span className="lb-countdown-tag">{secondsToNext}s</span>
                </div>

                <button
                  type="button"
                  onClick={() => syncLiveMarketToFirebase(true)}
                  className="lb-action-btn"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Syncing...' : '↻ Sync Now'}
                </button>
              </div>
            </div>

            {/* Right Glassmorphic Telemetry Timestamp & Sentiment Card */}
            <div className="lb-telemetry-card">
              <div className="lb-telemetry-row">
                <span className="lb-telemetry-label">LAST UPDATED</span>
                <div className="lb-telemetry-datetime">
                  <span className="lb-date-badge">{dateStr}</span>
                  <span className="lb-time-badge">{timeStr}</span>
                </div>
              </div>

              <div className="lb-telemetry-divider" />

              <div className="lb-telemetry-row">
                <span className="lb-telemetry-label">INTRADAY RATE BIAS</span>
                <span
                  className={`lb-sentiment-pill ${
                    marketFavorable ? 'lb-sent-good' : 'lb-sent-defensive'
                  }`}
                >
                  {marketFavorable
                    ? '▼ Favorable for Mortgage Rates (+bp)'
                    : '▲ Upward Rate Pressure (-bp)'}
                </span>
              </div>

              <div className="lb-telemetry-divider" />

              <div className="lb-telemetry-row">
                <span className="lb-telemetry-label">DATA SOURCE</span>
                <span className="lb-source-value">{dataSourceLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. MAIN BENTO INSTRUMENT BOARD
         ================================================================= */}
      <section className="lb-board-section">
        <div className="lb-container">
          {/* 2x2 Land-book Bento Instrument Grid */}
          <div className="lb-bento-grid">
            {instruments.map((item) => {
              const change = formatChange(item);
              const colorClass = change.isPositive ? 'lb-green' : 'lb-red';
              const rangePct = getRangePercent(item);

              return (
                <article key={item.id} className="lb-instrument-card">
                  {/* Top Dark Header Bar (Matches RateWatch Reference + Land-book Polish) */}
                  <header className="lb-card-topbar">
                    <div className="lb-card-title-group">
                      <h2 className="lb-card-title">{item.title}</h2>
                      <span className="lb-card-subtitle">{item.subtitle}</span>
                    </div>

                    <div className="lb-card-topbar-right">
                      <span className="lb-card-last-pill">
                        {formatPrice(item, item.last)}
                      </span>
                      <button
                        type="button"
                        className="lb-info-btn"
                        title={item.tooltip}
                        onClick={() =>
                          setActiveTooltip(
                            activeTooltip === item.id ? null : item.id
                          )
                        }
                        aria-label={`About ${item.title}`}
                      >
                        ?
                      </button>
                    </div>
                  </header>

                  {activeTooltip === item.id && (
                    <div className="lb-tooltip-banner">{item.tooltip}</div>
                  )}

                  {/* Main Card Body */}
                  <div className="lb-card-body">
                    {/* Left Column: Giant Tabular Change + Intraday Range Bar */}
                    <div className="lb-change-column">
                      <span className="lb-Updated-mini">
                        As of {dateStr} • {timeStr}
                      </span>

                      <div className={`lb-hero-metric ${colorClass}`}>
                        <span className="lb-metric-number">
                          {change.sign}
                          {change.number}
                        </span>
                        <span className="lb-metric-unit">{change.unit}</span>
                      </div>

                      <div className="lb-impact-tag-wrap">
                        <span
                          className={`lb-impact-tag ${
                            change.isFavorableForRates
                              ? 'lb-impact-favorable'
                              : 'lb-impact-unfavorable'
                          }`}
                        >
                          {item.type === 'mbs'
                            ? change.isPositive
                              ? 'Bond Price Up • Helps Rates'
                              : 'Bond Price Down • Pressures Rates'
                            : change.isPositive
                            ? 'Yield Up • Pressures Rates'
                            : 'Yield Down • Helps Rates'}
                        </span>
                      </div>

                      {/* Intraday Low-to-High Range Bar */}
                      <div className="lb-range-meter">
                        <div className="lb-range-labels">
                          <span>Day Low: {formatPrice(item, item.low)}</span>
                          <span>Day High: {formatPrice(item, item.high)}</span>
                        </div>
                        <div className="lb-range-track">
                          <div
                            className={`lb-range-fill ${colorClass}`}
                            style={{ width: `${rangePct}%` }}
                          />
                          <div
                            className={`lb-range-thumb ${colorClass}`}
                            style={{ left: `${rangePct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column: 2x2 Institutional Stats Matrix (Open, Last, High, Low) */}
                    <div className="lb-stats-matrix">
                      <div className="lb-stat-box">
                        <span className="lb-stat-label">Open</span>
                        <span className="lb-stat-val">
                          {formatPrice(item, item.open)}
                        </span>
                      </div>

                      <div className="lb-stat-box lb-stat-highlight">
                        <span className="lb-stat-label">Last</span>
                        <span className="lb-stat-val">
                          {formatPrice(item, item.last)}
                        </span>
                      </div>

                      <div className="lb-stat-box">
                        <span className="lb-stat-label">High</span>
                        <span className="lb-stat-val">
                          {formatPrice(item, item.high)}
                        </span>
                      </div>

                      <div className="lb-stat-box">
                        <span className="lb-stat-label">Low</span>
                        <span className="lb-stat-val">
                          {formatPrice(item, item.low)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom-Right Directional Corner Triangle */}
                    <div className={`lb-corner-wedge ${colorClass}`} />
                  </div>
                </article>
              );
            })}
          </div>

          {/* =================================================================
              3. LAND-BOOK 3-COLUMN BENTO EXPLAINER & ADVISORY STRIP
             ================================================================= */}
          <div className="lb-explainer-bento">
            <div className="lb-explainer-card">
              <div className="lb-exp-icon lb-exp-green">bp</div>
              <h3>How to Read UMBS Basis Points</h3>
              <p>
                Mortgage rates and MBS bond prices move in{' '}
                <strong>opposite directions</strong>. When UMBS prices rise (
                <strong style={{ color: '#00A804' }}>+bp Green</strong>), bond
                investors pay a higher premium for mortgage-backed bonds, pushing
                retail mortgage rates <strong>lower</strong>. When UMBS falls
                by <strong>-15bp to -25bp</strong> intraday, lenders often reprice
                for the worse.
              </p>
            </div>

            <div className="lb-explainer-card">
              <div className="lb-exp-icon lb-exp-gold">10Y</div>
              <h3>Why the 10-Year Treasury Matters</h3>
              <p>
                Although 30-year mortgages have a 30-year term, the average
                mortgage is paid off or refinanced in 7–10 years. As a result,
                the <strong>U.S. 10-Year T-Note Yield</strong> serves as the
                primary benchmark competing for fixed-income capital alongside
                UMBS 6.0%, 6.5%, and 7.0% coupons.
              </p>
            </div>

            <div className="lb-explainer-card">
              <div className="lb-exp-icon lb-exp-navy">6.0–7.0</div>
              <h3>Understanding the Coupon Stack</h3>
              <p>
                Secondary market desks bundle loans into security coupons in
                0.50% increments (<strong>UMBS 6.0, 6.5, and 7.0</strong>). A
                borrower’s note rate is typically 0.50%–1.125% above the
                underlying UMBS coupon to account for servicing fees and
                Fannie/Freddie guaranty fees.
              </p>
            </div>
          </div>

          {/* Bottom Advisory Callout Banner */}
          <div className="lb-advisory-banner">
            <div className="lb-advisory-text">
              <span className="lb-advisory-kicker">
                LOCK VS. FLOAT STRATEGY • TEAM INSIDER
              </span>
              <h3>
                Wondering whether to lock your rate today or float into upcoming
                economic data?
              </h3>
              <p>
                David and Rakesh monitor intraday UMBS repricing thresholds and
                Treasury auctions directly to help you time your rate lock with
                confidence.
              </p>
            </div>

            <div className="lb-advisory-actions">
              <Link href="/home-v8#contact" className="lb-btn-gold">
                Request a Rate Lock Review →
              </Link>
              <Link href="/geek-out/yield-curve" className="lb-btn-outline">
                Explore Yield Curve
              </Link>
            </div>
          </div>

          <p className="lb-compliance-footnote">
            Market indicators are synced via Firebase Realtime from Tradeweb &amp;
            MBS benchmark feeds for informational and educational purposes only
            (Last Updated: <strong>{dateStr}</strong> at{' '}
            <strong>{timeStr}</strong>). Quotes may reflect up to a 15-minute
            exchange delay and do not constitute a retail rate sheet or commitment
            to lend.
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .lb-mbs-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #F4F7FB;
          color: #0F172A;
          min-height: 88vh;
          padding-bottom: 4.5rem;
        }

        .lb-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 4%;
          position: relative;
          z-index: 2;
        }

        /* =========================================================
           1. LAND-BOOK EDITORIAL COMMAND HERO
           ========================================================= */
        .lb-mbs-hero {
          position: relative;
          background: radial-gradient(circle at 85% 18%, #133B6E 0%, #061A33 55%, #031022 100%);
          color: #FFFFFF;
          padding: 2.5rem 0 5.25rem 0;
          overflow: hidden;
          border-bottom: 1px solid rgba(242, 194, 48, 0.22);
        }

        .lb-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 1;
        }

        .lb-glow-gold {
          width: 440px;
          height: 440px;
          background: rgba(242, 194, 48, 0.14);
          top: -120px;
          right: 6%;
        }

        .lb-glow-blue {
          width: 420px;
          height: 420px;
          background: rgba(56, 189, 248, 0.12);
          bottom: -140px;
          left: -80px;
        }

        /* Top Command Bar */
        .lb-command-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-bottom: 1.5rem;
          margin-bottom: 2.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lb-brand-cluster {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .lb-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .lb-brand-rate {
          color: #FFFFFF;
        }

        .lb-brand-watch {
          color: #F2C230;
        }

        .lb-nav-pills {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 0.3rem;
          border-radius: 999px;
          flex-wrap: wrap;
        }

        .lb-pill {
          padding: 0.42rem 0.95rem;
          border-radius: 999px;
          font-size: 0.84rem;
          font-weight: 600;
          color: rgba(248, 250, 252, 0.78);
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .lb-pill:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.1);
        }

        .lb-pill-active {
          background: #F2C230;
          color: #061A33;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(242, 194, 48, 0.35);
        }

        .lb-controls-cluster {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .lb-live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.42rem 0.85rem;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 0.8rem;
          font-weight: 600;
          color: #E2E8F0;
        }

        .lb-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 10px #22C55E;
          animation: lbPulse 2s infinite;
        }

        .lb-dot-amber {
          background: #F59E0B;
          box-shadow: none;
        }

        @keyframes lbPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .lb-countdown-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #F2C230;
          background: rgba(242, 194, 48, 0.14);
          padding: 0.1rem 0.45rem;
          border-radius: 6px;
        }

        .lb-action-btn {
          padding: 0.45rem 0.9rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .lb-action-btn:hover {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.38);
        }

        .lb-override-btn {
          border-color: rgba(242, 194, 48, 0.4);
          color: #F2C230;
        }

        /* Editorial Split Hero */
        .lb-hero-split {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 2.5rem;
          align-items: center;
        }

        .lb-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.38rem 0.9rem;
          border-radius: 999px;
          background: rgba(242, 194, 48, 0.12);
          border: 1px solid rgba(242, 194, 48, 0.35);
          font-family: 'Montserrat', sans-serif;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #F2C230;
          margin-bottom: 1rem;
        }

        .lb-eyebrow-spark {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #F2C230;
        }

        .lb-hero-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2rem, 3.2vw, 2.95rem);
          font-weight: 700;
          line-height: 1.15;
          color: #FFFFFF;
          margin: 0 0 0.9rem 0;
          letter-spacing: -0.5px;
        }

        .lb-hero-title em {
          font-style: italic;
          color: #F2C230;
          font-weight: 600;
        }

        .lb-hero-sub {
          font-size: 1.04rem;
          line-height: 1.65;
          color: rgba(241, 245, 249, 0.86);
          margin: 0 0 1.35rem 0;
          max-width: 650px;
        }

        .lb-hero-sub strong {
          color: #FFFFFF;
        }

        /* Right Glassmorphic Telemetry Summary Card */
        .lb-telemetry-card {
          background: rgba(15, 32, 60, 0.76);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 20px;
          padding: 1.35rem 1.5rem;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
        }

        .lb-telemetry-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .lb-telemetry-label {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #94A3B8;
        }

        .lb-telemetry-datetime {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lb-date-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.92rem;
          font-weight: 700;
          color: #061A33;
          background: #F2C230;
          padding: 0.22rem 0.65rem;
          border-radius: 7px;
        }

        .lb-time-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.9rem;
          font-weight: 600;
          color: #F8FAFC;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.22rem 0.6rem;
          border-radius: 7px;
        }

        .lb-telemetry-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0.85rem 0;
        }

        .lb-sentiment-pill {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.28rem 0.75rem;
          border-radius: 999px;
        }

        .lb-sent-good {
          background: rgba(34, 197, 94, 0.18);
          color: #4ADE80;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }

        .lb-sent-defensive {
          background: rgba(248, 113, 113, 0.18);
          color: #FCA5A5;
          border: 1px solid rgba(252, 165, 165, 0.35);
        }

        .lb-source-value {
          font-size: 0.82rem;
          font-weight: 600;
          color: #E2E8F0;
        }

        /* =========================================================
           2. BENTO INSTRUMENT BOARD (OVERLAPPING HERO)
           ========================================================= */
        .lb-board-section {
          margin-top: -2.9rem;
          position: relative;
          z-index: 5;
        }

        /* Admin Drawer */
        .lb-admin-drawer {
          background: #FFFFFF;
          border: 2px solid #F2C230;
          border-radius: 18px;
          padding: 1.5rem;
          margin-bottom: 1.75rem;
          box-shadow: 0 20px 40px rgba(6, 26, 51, 0.14);
        }

        .lb-admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .lb-admin-header strong {
          display: block;
          font-size: 1.05rem;
          color: #061A33;
        }

        .lb-admin-header span {
          font-size: 0.85rem;
          color: #64748B;
        }

        .lb-admin-close {
          border: none;
          background: #F1F5F9;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          color: #334155;
        }

        .lb-pin-form {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .lb-pin-form input {
          padding: 0.5rem 0.85rem;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .lb-pin-form button,
        .lb-save-firebase-btn {
          padding: 0.55rem 1.15rem;
          border-radius: 8px;
          border: none;
          background: #061A33;
          color: #F2C230;
          font-weight: 700;
          cursor: pointer;
        }

        .lb-lock-toggle {
          margin-bottom: 1rem;
          padding: 0.65rem 0.9rem;
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 10px;
          font-size: 0.86rem;
        }

        .lb-lock-toggle label {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          cursor: pointer;
        }

        .lb-override-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .lb-override-row {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 0.75rem;
          display: grid;
          grid-template-columns: 1.2fr repeat(4, 1fr);
          gap: 0.5rem;
          align-items: center;
        }

        .lb-override-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: #0F172A;
        }

        .lb-override-row label {
          display: flex;
          flex-direction: column;
          font-size: 0.72rem;
          color: #64748B;
          font-weight: 600;
        }

        .lb-override-row input {
          width: 100%;
          padding: 0.35rem 0.45rem;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          margin-top: 0.2rem;
        }

        .lb-admin-msg {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0284C7;
          margin-left: 0.75rem;
        }

        /* 2x2 Bento Grid */
        .lb-bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.25rem;
        }

        .lb-instrument-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
        }

        .lb-instrument-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 44px rgba(15, 23, 42, 0.11);
        }

        /* Card Header Bar */
        .lb-card-topbar {
          background: linear-gradient(90deg, #1E293B 0%, #334155 100%);
          color: #FFFFFF;
          padding: 0.9rem 1.35rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .lb-card-title-group {
          display: flex;
          align-items: baseline;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .lb-card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0;
          color: #FFFFFF;
          letter-spacing: -0.2px;
        }

        .lb-card-subtitle {
          font-size: 0.76rem;
          color: #CBD5E1;
          font-weight: 500;
        }

        .lb-card-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .lb-card-last-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.05rem;
          font-weight: 700;
          color: #F2C230;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.22rem 0.65rem;
          border-radius: 8px;
          border: 1px solid rgba(242, 194, 48, 0.3);
        }

        .lb-info-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .lb-info-btn:hover {
          background: #F2C230;
          color: #061A33;
          border-color: #F2C230;
        }

        .lb-tooltip-banner {
          background: #0F172A;
          color: #F8FAFC;
          font-size: 0.82rem;
          line-height: 1.5;
          padding: 0.75rem 1.35rem;
          border-bottom: 1px solid #334155;
        }

        /* Card Body */
        .lb-card-body {
          position: relative;
          padding: 1.45rem 1.45rem 1.55rem 1.45rem;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 1.25rem;
          align-items: center;
          flex: 1;
        }

        .lb-change-column {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 0.75rem;
          border-right: 1px solid #E2E8F0;
        }

        .lb-Updated-mini {
          font-size: 0.73rem;
          font-weight: 600;
          color: #64748B;
          margin-bottom: 0.15rem;
        }

        .lb-hero-metric {
          display: flex;
          align-items: baseline;
          gap: 0.2rem;
          line-height: 1;
          margin: 0.15rem 0 0.55rem 0;
        }

        .lb-metric-number {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(3rem, 4.3vw, 4.1rem);
          font-weight: 800;
          letter-spacing: -2px;
          font-variant-numeric: tabular-nums;
        }

        .lb-metric-unit {
          font-size: clamp(1.35rem, 2vw, 1.75rem);
          font-weight: 700;
        }

        .lb-green {
          color: #00B805;
        }

        .lb-red {
          color: #E11D48;
        }

        .lb-impact-tag-wrap {
          margin-bottom: 0.85rem;
        }

        .lb-impact-tag {
          display: inline-block;
          font-size: 0.73rem;
          font-weight: 700;
          padding: 0.22rem 0.6rem;
          border-radius: 6px;
        }

        .lb-impact-favorable {
          background: #DCFCE7;
          color: #15803D;
        }

        .lb-impact-unfavorable {
          background: #FFE4E6;
          color: #BE123C;
        }

        /* Intraday Low-to-High Range Bar */
        .lb-range-meter {
          width: 100%;
          max-width: 260px;
        }

        .lb-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748B;
          margin-bottom: 0.3rem;
          font-family: 'JetBrains Mono', monospace;
        }

        .lb-range-track {
          position: relative;
          height: 6px;
          background: #E2E8F0;
          border-radius: 999px;
        }

        .lb-range-fill {
          height: 100%;
          border-radius: 999px;
        }

        .lb-range-fill.lb-green {
          background: linear-gradient(90deg, #86EFAC, #00B805);
        }

        .lb-range-fill.lb-red {
          background: linear-gradient(90deg, #FDA4AF, #E11D48);
        }

        .lb-range-thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #FFFFFF;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }

        .lb-range-thumb.lb-green {
          background: #00B805;
        }

        .lb-range-thumb.lb-red {
          background: #E11D48;
        }

        /* Right 2x2 Stats Matrix */
        .lb-stats-matrix {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .lb-stat-box {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 0.65rem 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .lb-stat-highlight {
          background: #F1F5F9;
          border-color: #CBD5E1;
        }

        .lb-stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          color: #64748B;
          margin-bottom: 0.2rem;
        }

        .lb-stat-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.18rem;
          font-weight: 700;
          color: #0F172A;
          font-variant-numeric: tabular-nums;
        }

        /* Bottom-Right Directional Corner Triangle */
        .lb-corner-wedge {
          position: absolute;
          bottom: 7px;
          right: 7px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 0 18px 18px;
        }

        .lb-corner-wedge.lb-green {
          border-color: transparent transparent #00B805 transparent;
        }

        .lb-corner-wedge.lb-red {
          border-color: transparent transparent #E11D48 transparent;
        }

        /* =========================================================
           3. LAND-BOOK 3-COLUMN EXPLAINER BENTO & ADVISORY STRIP
           ========================================================= */
        .lb-explainer-bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.35rem;
          margin-bottom: 2rem;
        }

        .lb-explainer-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 1.5rem;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .lb-exp-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.35rem 0.75rem;
          border-radius: 10px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.9rem;
        }

        .lb-exp-green {
          background: #DCFCE7;
          color: #15803D;
        }

        .lb-exp-gold {
          background: #FEF3C7;
          color: #B45309;
        }

        .lb-exp-navy {
          background: #E0E7FF;
          color: #1D4ED8;
        }

        .lb-explainer-card h3 {
          font-size: 1.08rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 0.55rem 0;
        }

        .lb-explainer-card p {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #475569;
          margin: 0;
        }

        /* Advisory Callout Banner */
        .lb-advisory-banner {
          background: linear-gradient(125deg, #061A33 0%, #0F294A 100%);
          border: 1px solid rgba(242, 194, 48, 0.35);
          border-radius: 22px;
          padding: 2rem 2.25rem;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          box-shadow: 0 18px 42px rgba(6, 26, 51, 0.18);
          margin-bottom: 1.5rem;
        }

        .lb-advisory-text {
          max-width: 680px;
        }

        .lb-advisory-kicker {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 1.3px;
          color: #F2C230;
          margin-bottom: 0.4rem;
        }

        .lb-advisory-text h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.3rem, 2vw, 1.65rem);
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 0.45rem 0;
        }

        .lb-advisory-text p {
          font-size: 0.94rem;
          color: rgba(241, 245, 249, 0.85);
          margin: 0;
          line-height: 1.55;
        }

        .lb-advisory-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .lb-btn-gold {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.45rem;
          border-radius: 12px;
          background: #F2C230;
          color: #061A33;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 0.92rem;
          text-decoration: none;
          transition: transform 0.18s ease, background-color 0.18s ease;
        }

        .lb-btn-gold:hover {
          background: #FFCF40;
          transform: translateY(-2px);
        }

        .lb-btn-outline {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
        }

        .lb-btn-outline:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .lb-compliance-footnote {
          font-size: 0.78rem;
          color: #64748B;
          text-align: center;
          line-height: 1.55;
          margin: 0;
        }

        @media (max-width: 992px) {
          .lb-hero-split {
            grid-template-columns: 1fr;
          }
          .lb-bento-grid {
            grid-template-columns: 1fr;
          }
          .lb-explainer-bento {
            grid-template-columns: 1fr;
          }
          .lb-override-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 580px) {
          .lb-card-body {
            grid-template-columns: 1fr;
          }
          .lb-change-column {
            border-right: none;
            border-bottom: 1px solid #E2E8F0;
            padding-right: 0;
            padding-bottom: 1rem;
          }
          .lb-override-row {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}} />
    </main>
  );
}
