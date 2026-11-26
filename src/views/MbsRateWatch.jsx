"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RelatedInsights from '../components/blog/RelatedInsights';
import Us10YrDailyLogModal from '../components/Us10YrDailyLogModal';

const FIRESTORE_COLLECTION = 'marketWatch';
const FIRESTORE_DOC_ID = 'liveQuotes';
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes during open market hours

const DEFAULT_TOOLTIPS = {
  'umbs-65':
    'Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower.',
  'umbs-70':
    'Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates.',
  'umbs-60':
    'Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing.',
  'us-10yr':
    'U.S. 10-Year Treasury Note Yield (Tradeweb US10Y). A falling yield (-%) is typically favorable for mortgage interest rates.',
};

// Formats Date explicitly as MM/DD/YYYY (e.g., 10/23/2026) + Time
function formatUpdateDateAndTime(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) {
    return { dateStr: '—', timeStr: '—' };
  }
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return {
    dateStr: `${mm}/${dd}/${yyyy}`,
    timeStr,
  };
}

function formatYmdToUsDate(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [yyyy, mm, dd] = ymd.split('-');
  return `${mm}/${dd}/${yyyy}`;
}

function normalizeInstruments(rawList, manualLock) {
  if (!Array.isArray(rawList) || rawList.length === 0) return [];
  return rawList.map((inst) => {
    const isLegacy55 = inst.id === 'umbs-55';
    const id = isLegacy55 ? 'umbs-70' : inst.id;
    const defaultPricingType =
      id === 'us-10yr'
        ? manualLock
          ? 'desk'
          : 'live'
        : manualLock
        ? 'desk'
        : 'modeled';

    if (isLegacy55) {
      return {
        ...inst,
        id: 'umbs-70',
        title: 'UMBS 30YR 7.0',
        subtitle: '30-Year 7.0% Coupon',
        type: 'mbs',
        pricingType: inst.pricingType || defaultPricingType,
        tooltip: DEFAULT_TOOLTIPS['umbs-70'],
      };
    }

    return {
      ...inst,
      pricingType: inst.pricingType || defaultPricingType,
      tooltip: inst.tooltip || DEFAULT_TOOLTIPS[id] || '',
    };
  });
}

export default function MbsRateWatch() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataSourceLabel, setDataSourceLabel] = useState(
    'Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)'
  );
  const [marketStatus, setMarketStatus] = useState('after-hours');
  const [marketStatusLabel, setMarketStatusLabel] = useState('Connecting...');
  const [anchorDate, setAnchorDate] = useState(null);
  const [anchorSource, setAnchorSource] = useState('Prior Day Close');
  const [modelTelemetry, setModelTelemetry] = useState(null);
  const [manualLock, setManualLock] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [showUs10YrLog, setShowUs10YrLog] = useState(false);

  // Local 30s tick for freshness indicator only (zero network requests)
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  // Read-only subscription to Firestore (`marketWatch/liveQuotes`)
  useEffect(() => {
    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOC_ID);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setFirebaseConnected(true);
        setLoading(false);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const locked = Boolean(data.manualLock);
          setManualLock(locked);

          const normalized = normalizeInstruments(data.instruments, locked);
          if (normalized.length > 0) {
            setInstruments(normalized);
            setFeedError('');
          } else {
            setInstruments([]);
            setFeedError('Market feed initialized without active instruments. Check back shortly.');
          }

          if (data.updatedAt) {
            const parsedDate = new Date(data.updatedAt);
            setLastUpdated(isNaN(parsedDate.getTime()) ? null : parsedDate);
          } else {
            setLastUpdated(null);
          }

          setDataSourceLabel(
            data.sourceLabel ||
              'Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)'
          );
          setMarketStatus(data.marketStatus || 'after-hours');
          setMarketStatusLabel(
            data.marketStatusLabel ||
              (data.marketStatus === 'open'
                ? 'Bond Market Open'
                : 'After Hours • Prior Close')
          );
          setAnchorDate(data.anchorDate || data.tradingDate || null);
          setAnchorSource(data.anchorSource || 'Prior Day Close');
          setModelTelemetry(data.modelTelemetry || null);
        } else {
          setInstruments([]);
          setFeedError(
            'Live market feed has not been populated yet. Quotes appear automatically once the scheduled feed runs.'
          );
        }
      },
      (err) => {
        console.warn('Firestore read-only listener error:', err);
        setFirebaseConnected(false);
        setLoading(false);
        setFeedError(
          'Unable to connect to the live market feed right now. Please refresh in a moment.'
        );
      }
    );

    return () => unsubscribe();
  }, []);

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
        rawDiff: bpDiff,
      };
    }
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
      rawDiff: yieldDiff,
    };
  };

  const formatPrice = (item, val) => {
    const num = Number(val) || 0;
    return item.type === 'yield' ? `${num.toFixed(2)}%` : num.toFixed(2);
  };

  const getRangePercent = (item) => {
    const span = (item.high || 0) - (item.low || 0);
    if (span <= 0) return 50;
    const pct = (((item.last || 0) - (item.low || 0)) / span) * 100;
    return Math.max(6, Math.min(94, Math.round(pct)));
  };

  const { dateStr, timeStr } = formatUpdateDateAndTime(lastUpdated);

  const isStaleDuringOpen =
    marketStatus === 'open' &&
    lastUpdated instanceof Date &&
    !isNaN(lastUpdated.getTime()) &&
    nowMs - lastUpdated.getTime() > STALE_THRESHOLD_MS;

  let pillDotClass = 'lb-dot-slate';
  let pillLabel = marketStatusLabel;
  if (!firebaseConnected && loading) {
    pillDotClass = 'lb-dot-amber';
    pillLabel = 'Connecting...';
  } else if (!firebaseConnected) {
    pillDotClass = 'lb-dot-amber';
    pillLabel = 'Disconnected';
  } else if (isStaleDuringOpen) {
    pillDotClass = 'lb-dot-amber';
    pillLabel = 'Feed Delayed';
  } else if (marketStatus === 'open') {
    pillDotClass = '';
    pillLabel = marketStatusLabel || 'Bond Market Open';
  } else if (marketStatus === 'holiday') {
    pillDotClass = 'lb-dot-amber';
    pillLabel = marketStatusLabel || 'SIFMA Bond Holiday';
  }

  // Determine overall mortgage rate sentiment from UMBS 6.0
  const umbs60Item = instruments.find((i) => i.id === 'umbs-60') || instruments[0];
  const umbs60Bp = umbs60Item
    ? Math.round((umbs60Item.last - umbs60Item.open) * 100)
    : 0;
  const marketFavorable = umbs60Bp >= 0;

  const formattedAnchorDate = formatYmdToUsDate(anchorDate);
  const anchorCaption = formattedAnchorDate
    ? `Anchored to ${anchorSource} • ${formattedAnchorDate}`
    : `Anchored to ${anchorSource}`;

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
          <div className="lb-hero-split">
            <div className="lb-hero-copy">
              <h1 className="lb-hero-title">
                Mortgage-Backed Securities &amp;{' '}
                <em>10-Year Treasury Watch</em>
              </h1>

              <p className="lb-hero-sub">
                Track live <strong>Tradeweb U.S. 10-Year Treasury</strong> yields
                alongside intraday <strong>UMBS 30-Year (6.0%, 6.5%, 7.0%)</strong>{' '}
                pricing modeled from 5Y/7Y/10Y key-rate moves and{' '}
                <strong>MTBA</strong> MBS spread action, anchored daily to
                prior closing levels.
              </p>

              <div className="lb-controls-cluster">
                <div className="lb-live-status-pill">
                  <span className={`lb-pulse-dot ${pillDotClass}`} />
                  <span>{pillLabel}</span>
                  {firebaseConnected && marketStatus === 'open' && !isStaleDuringOpen && (
                    <span className="lb-countdown-tag">Server 3m Sync</span>
                  )}
                </div>

                {modelTelemetry?.isRollWindow && (
                  <div
                    className="lb-roll-pill"
                    title={
                      modelTelemetry.rollNote ||
                      'Monthly Class A UMBS TBA delivery-month roll window'
                    }
                  >
                    <span>⇄ Class A TBA Roll Window</span>
                  </div>
                )}

                {manualLock && (
                  <div className="lb-desk-lock-pill">
                    <span>Desk Override Active</span>
                  </div>
                )}
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
                    instruments.length === 0
                      ? 'lb-sent-neutral'
                      : marketFavorable
                      ? 'lb-sent-good'
                      : 'lb-sent-defensive'
                  }`}
                >
                  {instruments.length === 0
                    ? 'Awaiting Market Snapshot'
                    : marketFavorable
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
          {modelTelemetry?.isRollWindow && modelTelemetry?.rollNote && (
            <div className="lb-roll-banner" role="status">
              <strong>TBA Roll Notice:</strong> {modelTelemetry.rollNote}
            </div>
          )}

          {loading ? (
            <div className="lb-state-banner">
              <div className="lb-state-spinner" />
              <div>
                <strong>Connecting to live market watch...</strong>
                <p>Loading latest Tradeweb Treasury &amp; UMBS benchmark quotes.</p>
              </div>
            </div>
          ) : feedError || instruments.length === 0 ? (
            <div className="lb-state-banner lb-state-warning" role="alert">
              <div>
                <strong>Market Feed Temporarily Unavailable</strong>
                <p>
                  {feedError ||
                    'Live benchmark quotes are unavailable at the moment. Please check back shortly.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="lb-bento-grid">
              {instruments.map((item) => {
                const change = formatChange(item);
                const colorClass = change.isPositive ? 'lb-green' : 'lb-red';
                const rangePct = getRangePercent(item);
                const isUs10Yr = item.id === 'us-10yr';
                const pricingType =
                  item.pricingType ||
                  (isUs10Yr ? 'live' : manualLock ? 'desk' : 'modeled');

                const pricingBadgeText =
                  pricingType === 'live'
                    ? 'Live Benchmark'
                    : pricingType === 'desk'
                    ? 'Desk Override'
                    : 'Intraday Model';

                const pricingBadgeClass =
                  pricingType === 'live'
                    ? 'lb-badge-live'
                    : pricingType === 'desk'
                    ? 'lb-badge-desk'
                    : 'lb-badge-modeled';

                return (
                  <article
                    key={item.id}
                    className={`lb-instrument-card${
                      isUs10Yr ? ' lb-instrument-card-clickable' : ''
                    }`}
                    onClick={isUs10Yr ? () => setShowUs10YrLog(true) : undefined}
                    onKeyDown={
                      isUs10Yr
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setShowUs10YrLog(true);
                            }
                          }
                        : undefined
                    }
                    role={isUs10Yr ? 'button' : undefined}
                    tabIndex={isUs10Yr ? 0 : undefined}
                    title={
                      isUs10Yr
                        ? 'Click to view US 10-Year T-Note Daily Session Log'
                        : undefined
                    }
                  >
                    {/* Top Dark Header Bar */}
                    <header className="lb-card-topbar">
                      <div className="lb-card-title-group">
                        <h2 className="lb-card-title">{item.title}</h2>
                        <span className="lb-card-subtitle">{item.subtitle}</span>
                        <span className={`lb-pricing-badge ${pricingBadgeClass}`}>
                          {pricingBadgeText}
                        </span>
                      </div>

                      <div className="lb-card-topbar-right">
                        <span className="lb-card-last-pill">
                          {formatPrice(item, item.last)}
                        </span>
                        <button
                          type="button"
                          className="lb-info-btn"
                          title={item.tooltip}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTooltip(
                              activeTooltip === item.id ? null : item.id
                            );
                          }}
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
                        {!isUs10Yr && (
                          <span className="lb-anchor-mini">{anchorCaption}</span>
                        )}

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

                      {/* Right Column: 2x2 Institutional Stats Matrix */}
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

                    {isUs10Yr && (
                      <div className="lb-card-log-footer">
                        <span>Daily Trading Session Log (5:00 AM – 12:30 PM PT)</span>
                        <span className="lb-card-log-cta">View Table →</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

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
              <Link href="/#contact" className="lb-btn-gold">
                Request a Rate Lock Review →
              </Link>
              <Link href="/geek-out/yield-curve" className="lb-btn-outline">
                Explore Yield Curve
              </Link>
            </div>
          </div>

          <p className="lb-compliance-footnote">
            US 10-Year T-Note reflects live Tradeweb benchmark quotes. UMBS 30YR
            6.0%, 6.5%, and 7.0% prices reflect server-side intraday models
            driven by 5Y/7Y/10Y Treasury key-rate duration, negative convexity,
            and live MTBA MBS spread movements anchored to prior closes (or desk
            overrides when active). Last Updated: <strong>{dateStr}</strong> at{' '}
            <strong>{timeStr}</strong>. Educational &amp; informational use only;
            does not constitute a retail rate sheet or commitment to lend.
          </p>
        </div>
      </section>

      <RelatedInsights
        calculatorId="calc-mbs"
        title="Lock vs. Float & Loan Estimate Strategy Breakdowns"
        subtitle="How MBS pricing, points, and lender credits work in practice."
        background="#FFFFFF"
      />

      <Us10YrDailyLogModal
        isOpen={showUs10YrLog}
        onClose={() => setShowUs10YrLog(false)}
      />

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

        .lb-roll-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: rgba(242, 194, 48, 0.14);
          border: 1px solid rgba(242, 194, 48, 0.4);
          font-size: 0.78rem;
          font-weight: 700;
          color: #F2C230;
          cursor: help;
        }

        .lb-desk-lock-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: rgba(56, 189, 248, 0.16);
          border: 1px solid rgba(56, 189, 248, 0.4);
          font-size: 0.78rem;
          font-weight: 700;
          color: #BAE6FD;
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
          animation: none;
        }

        .lb-dot-slate {
          background: #94A3B8;
          box-shadow: none;
          animation: none;
        }

        @keyframes lbPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .lb-countdown-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #F2C230;
          background: rgba(242, 194, 48, 0.14);
          padding: 0.1rem 0.45rem;
          border-radius: 6px;
        }

        /* Editorial Split Hero */
        .lb-hero-split {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 2.5rem;
          align-items: center;
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

        .lb-sent-neutral {
          background: rgba(148, 163, 184, 0.18);
          color: #CBD5E1;
          border: 1px solid rgba(148, 163, 184, 0.35);
        }

        .lb-source-value {
          font-size: 0.8rem;
          font-weight: 600;
          color: #E2E8F0;
          text-align: right;
        }

        /* =========================================================
           2. BENTO INSTRUMENT BOARD (OVERLAPPING HERO)
           ========================================================= */
        .lb-board-section {
          margin-top: -2.9rem;
          position: relative;
          z-index: 5;
        }

        .lb-roll-banner {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-left: 4px solid #F2C230;
          color: #78350F;
          border-radius: 12px;
          padding: 0.8rem 1.15rem;
          font-size: 0.86rem;
          line-height: 1.5;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        }

        .lb-state-banner {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 2.25rem 1.75rem;
          margin-bottom: 2.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
        }

        .lb-state-banner strong {
          display: block;
          font-size: 1.05rem;
          color: #061A33;
          margin-bottom: 0.25rem;
        }

        .lb-state-banner p {
          margin: 0;
          font-size: 0.92rem;
          color: #475569;
        }

        .lb-state-warning {
          border-color: #FDE68A;
          background: #FFFBEB;
        }

        .lb-state-warning strong {
          color: #92400E;
        }

        .lb-state-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #E2E8F0;
          border-top-color: #061A33;
          border-radius: 50%;
          animation: lbSpin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes lbSpin {
          to { transform: rotate(360deg); }
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

        .lb-instrument-card-clickable {
          cursor: pointer;
          border-color: #CBD5E1;
        }

        .lb-instrument-card-clickable:hover,
        .lb-instrument-card-clickable:focus-visible {
          border-color: #F2C230;
          box-shadow: 0 22px 46px rgba(6, 26, 51, 0.16);
          outline: none;
        }

        .lb-card-log-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.6rem 1.35rem;
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
        }

        .lb-card-log-cta {
          color: #061A33;
          font-weight: 700;
          white-space: nowrap;
        }

        .lb-instrument-card-clickable:hover .lb-card-log-footer {
          background: #FFFBEB;
          border-top-color: #FDE68A;
          color: #061A33;
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
          align-items: center;
          gap: 0.55rem;
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

        .lb-pricing-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          padding: 0.16rem 0.5rem;
          border-radius: 999px;
          white-space: nowrap;
        }

        .lb-badge-live {
          background: rgba(34, 197, 94, 0.18);
          color: #86EFAC;
          border: 1px solid rgba(74, 222, 128, 0.35);
        }

        .lb-badge-modeled {
          background: rgba(242, 194, 48, 0.15);
          color: #FDE68A;
          border: 1px solid rgba(242, 194, 48, 0.35);
        }

        .lb-badge-desk {
          background: rgba(56, 189, 248, 0.18);
          color: #BAE6FD;
          border: 1px solid rgba(56, 189, 248, 0.4);
        }

        .lb-card-topbar-right {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-shrink: 0;
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
          margin-bottom: 0.1rem;
        }

        .lb-anchor-mini {
          font-size: 0.7rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.25rem;
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
        }
      ` }} />
    </main>
  );
}
