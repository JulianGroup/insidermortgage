"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './SelfEmployed.css';
import primeRateData from '../data/primeRateData.json';
import RelatedInsights from '../components/blog/RelatedInsights';

function parseLocalDate(isoDate) {
  if (!isoDate) return new Date();
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLongDate(isoDate) {
  if (!isoDate) return '';
  return parseLocalDate(isoDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortMonthYear(isoDate) {
  if (!isoDate) return '';
  return parseLocalDate(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

const PrimeTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        padding: '0.75rem 1rem',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        boxShadow: '0 8px 20px rgba(6, 10, 45, 0.12)',
      }}
    >
      <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600, marginBottom: '0.2rem' }}>
        {pt.tooltipLabel}
      </div>
      <div style={{ fontSize: '1.1rem', color: '#060A2D', fontWeight: 800 }}>
        U.S. Prime Rate: {Number(pt.rate).toFixed(2)}%
      </div>
    </div>
  );
};

export default function PrimeRateHistory() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    currentPrimeRate,
    currentEffectiveDate,
    fedFundsTargetLower,
    fedFundsTargetUpper,
    lastFomcMeeting,
    fomcSchedule = [],
    changes = [],
  } = primeRateData;

  // Dynamically determine next scheduled FOMC vote date based on visitor's calendar date
  const nextFomcDate = useMemo(() => {
    const now = new Date();
    const todayIso = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return fomcSchedule.find((d) => d >= todayIso) || null;
  }, [fomcSchedule]);

  // Build chronological 10-year step series for chart (oldest -> today)
  const stepChartData = useMemo(() => {
    if (!changes.length) return [];
    const asc = [...changes].reverse();
    const oldest = asc[0];
    const startYear = parseLocalDate(oldest.date).getFullYear();
    const tenYearStartIso = `${startYear}-01-01`;

    const points = [
      {
        dateIso: tenYearStartIso,
        timestamp: parseLocalDate(tenYearStartIso).getTime(),
        rate: oldest.previousRate ?? oldest.rate,
        tooltipLabel: `Prior to ${formatLongDate(oldest.date)}`,
      },
      ...asc.map((item) => ({
        dateIso: item.date,
        timestamp: parseLocalDate(item.date).getTime(),
        rate: item.rate,
        tooltipLabel: `Effective ${formatLongDate(item.date)}`,
      })),
    ];

    const now = new Date();
    const todayIso = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');

    if (todayIso > asc[asc.length - 1].date) {
      points.push({
        dateIso: todayIso,
        timestamp: parseLocalDate(todayIso).getTime(),
        rate: currentPrimeRate,
        tooltipLabel: `Current (${formatLongDate(todayIso)})`,
      });
    }

    return points;
  }, [changes, currentPrimeRate]);

  // Year ticks for clean X-axis labels
  const yearTicks = useMemo(() => {
    if (!stepChartData.length) return [];
    const minYear = new Date(stepChartData[0].timestamp).getFullYear();
    const maxYear = new Date(stepChartData[stepChartData.length - 1].timestamp).getFullYear();
    const ticks = [];
    for (let y = minYear; y <= maxYear; y++) {
      const ts = new Date(y, 0, 1).getTime();
      if (ts >= stepChartData[0].timestamp && ts <= stepChartData[stepChartData.length - 1].timestamp) {
        ticks.push(ts);
      }
    }
    return ticks;
  }, [stepChartData]);

  return (
    <main style={{ backgroundColor: 'var(--bg-color)', minHeight: '80vh' }}>
      {/* HERO SECTION */}
      <section
        className="se-hero animate-fade-in"
        style={{
          padding: '5.5rem 1rem 3.75rem 1rem',
          background:
            'linear-gradient(135deg, rgba(6, 10, 45, 0.97) 0%, rgba(12, 24, 74, 0.94) 100%)',
          color: '#FFFFFF',
        }}
      >
        <div className="container" style={{ maxWidth: '960px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.95rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(239, 181, 30, 0.16)',
              border: '1px solid rgba(239, 181, 30, 0.45)',
              color: '#FCD34D',
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            Federal Reserve H.15 &bull; Wall Street Journal Benchmark
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.1rem)',
              marginBottom: '1rem',
              lineHeight: 1.18,
              color: '#FFFFFF',
            }}
          >
            U.S. Prime Rate History (Last 10 Years)
          </h1>

          <p
            style={{
              fontSize: '1.18rem',
              maxWidth: '720px',
              margin: '0 auto',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.65,
            }}
          >
            Track the current U.S. Prime Rate, Federal Open Market Committee (FOMC) rate decisions,
            and every Prime Rate change over the past decade—the base index used to price Home Equity
            Lines of Credit (HELOCs).
          </p>
        </div>
      </section>

      {/* CURRENT PRIME RATE & FOMC STATUS BANNER */}
      <section style={{ padding: '2.5rem 1rem 1rem 1rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(6, 10, 45, 0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Top KPI Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div
                style={{
                  padding: '2rem 1.75rem',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%)',
                  borderRight: '1px solid #F1F5F9',
                }}
              >
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#92400E',
                    marginBottom: '0.4rem',
                  }}
                >
                  Current U.S. Prime Rate
                </div>
                <div
                  style={{
                    fontSize: '3.25rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1.05,
                    marginBottom: '0.45rem',
                  }}
                >
                  {Number(currentPrimeRate).toFixed(2)}%
                </div>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                  Effective since {formatLongDate(currentEffectiveDate)}
                </div>
              </div>

              <div
                style={{
                  padding: '2rem 1.75rem',
                  textAlign: 'center',
                  borderRight: '1px solid #F1F5F9',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748B',
                    marginBottom: '0.45rem',
                  }}
                >
                  Fed Funds Target Range
                </div>
                <div
                  style={{
                    fontSize: '1.95rem',
                    fontWeight: 800,
                    color: '#0468E9',
                    lineHeight: 1.2,
                    marginBottom: '0.4rem',
                  }}
                >
                  {Number(fedFundsTargetLower).toFixed(2)}% &ndash;{' '}
                  {Number(fedFundsTargetUpper).toFixed(2)}%
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Prime = Fed Funds Upper Limit + 3.00%
                </div>
              </div>

              <div
                style={{
                  padding: '2rem 1.75rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748B',
                    marginBottom: '0.45rem',
                  }}
                >
                  Next FOMC Rate Decision
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--primary)',
                    lineHeight: 1.25,
                    marginBottom: '0.4rem',
                  }}
                >
                  {nextFomcDate ? formatLongDate(nextFomcDate) : 'TBA'}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Auto-checked the day after FOMC votes
                </div>
              </div>
            </div>

            {/* Latest FOMC Vote Summary Strip */}
            {lastFomcMeeting && (
              <div
                style={{
                  padding: '1.35rem 1.75rem',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.03rem',
                    color: '#1E293B',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: '#060A2D' }}>
                    Latest FOMC Decision ({formatLongDate(lastFomcMeeting.date)}):
                  </strong>{' '}
                  {lastFomcMeeting.summary}
                </p>
                {nextFomcDate && (
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569' }}>
                    The next scheduled FOMC meeting and vote on short-term interest rates is{' '}
                    <strong>{formatLongDate(nextFomcDate)}</strong>.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 10-YEAR PRIME RATE HISTORY TABLE (NEWEST ON TOP -> OLDEST ON BOTTOM) */}
      <section style={{ padding: '2rem 1rem 2.5rem 1rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid rgba(6, 10, 45, 0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.75rem 2rem 1.25rem 2rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: '0 0 0.35rem 0',
                    color: 'var(--primary)',
                    fontSize: '1.55rem',
                  }}
                >
                  10-Year U.S. Prime Rate Changes
                </h2>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B' }}>
                  Listed from most recent rate change on top to oldest on bottom ({changes.length}{' '}
                  changes over the last 10 years).
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#475569',
                  backgroundColor: '#F1F5F9',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                }}
              >
                Newest &rarr; Oldest
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#060A2D',
                      color: '#FFFFFF',
                    }}
                  >
                    <th
                      style={{
                        padding: '1rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Date of Change
                    </th>
                    <th
                      style={{
                        padding: '1rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        textAlign: 'right',
                      }}
                    >
                      New Prime Rate (%)
                    </th>
                    <th
                      style={{
                        padding: '1rem 1.5rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        textAlign: 'right',
                      }}
                    >
                      Rate Move
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((row, idx) => {
                    const isCurrent = idx === 0;
                    const isIncrease = row.change > 0;
                    const changeSign = row.change > 0 ? '+' : '';

                    return (
                      <tr
                        key={row.date}
                        style={{
                          backgroundColor: isCurrent
                            ? '#FFFBEB'
                            : idx % 2 === 0
                            ? '#FFFFFF'
                            : '#F8FAFC',
                          borderBottom: isCurrent
                            ? '2px solid #F59E0B'
                            : '1px solid #E2E8F0',
                        }}
                      >
                        <td
                          style={{
                            padding: isCurrent ? '1.25rem 1.5rem' : '0.95rem 1.5rem',
                            fontWeight: isCurrent ? 800 : 600,
                            color: '#060A2D',
                            fontSize: isCurrent ? '1.08rem' : '1rem',
                          }}
                        >
                          <div>{formatLongDate(row.date)}</div>
                          {isCurrent && (
                            <div
                              style={{
                                display: 'inline-block',
                                marginTop: '0.3rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: '#92400E',
                                backgroundColor: '#FEF3C7',
                                border: '1px solid #FCD34D',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '999px',
                              }}
                            >
                              Current U.S. Prime Rate
                            </div>
                          )}
                        </td>

                        <td
                          style={{
                            padding: isCurrent ? '1.25rem 1.5rem' : '0.95rem 1.5rem',
                            textAlign: 'right',
                            fontWeight: 800,
                            fontSize: isCurrent ? '1.45rem' : '1.08rem',
                            color: isCurrent ? '#B45309' : '#060A2D',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {Number(row.rate).toFixed(2)}%
                        </td>

                        <td
                          style={{
                            padding: isCurrent ? '1.25rem 1.5rem' : '0.95rem 1.5rem',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.22rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.86rem',
                              fontWeight: 700,
                              backgroundColor: isIncrease
                                ? 'rgba(220, 38, 38, 0.08)'
                                : 'rgba(22, 163, 74, 0.1)',
                              color: isIncrease ? '#B91C1C' : '#15803D',
                            }}
                          >
                            {changeSign}
                            {Number(row.change).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                fontSize: '0.86rem',
                color: '#64748B',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span>
                Source: Federal Reserve Board H.15 Selected Interest Rates (FRED Series:{' '}
                <code>DPRIME</code>, <code>DFEDTARU</code>, <code>DFEDTARL</code>).
              </span>
              <span>
                Dates reflect the official effective date (typically one business day after the FOMC
                vote).
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 10-YEAR STEP CHART */}
      <section style={{ padding: '0.5rem 1rem 3rem 1rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid rgba(6, 10, 45, 0.08)',
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: '0 0 0.35rem 0', color: 'var(--primary)', fontSize: '1.45rem' }}>
                10-Year Prime Rate Trajectory
              </h2>
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748B' }}>
                Visualizing the full cycle from {formatShortMonthYear(stepChartData[0]?.dateIso)}{' '}
                through today ({Number(currentPrimeRate).toFixed(2)}%).
              </p>
            </div>

            <div style={{ height: '300px', width: '100%' }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stepChartData}
                    margin={{ top: 10, right: 20, bottom: 5, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="primeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0468E9" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#0468E9" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="timestamp"
                      type="number"
                      scale="time"
                      domain={['dataMin', 'dataMax']}
                      ticks={yearTicks}
                      tickFormatter={(ts) => new Date(ts).getFullYear().toString()}
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <YAxis
                      domain={[2.5, 9.25]}
                      tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
                      stroke="#64748B"
                      fontSize={12}
                      width={48}
                    />
                    <Tooltip content={<PrimeTooltip />} />
                    <Area
                      type="stepAfter"
                      dataKey="rate"
                      stroke="#0468E9"
                      strokeWidth={3}
                      fill="url(#primeFill)"
                      isAnimationActive={false}
                      activeDot={{ r: 6, fill: '#060A2D', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* EDUCATIONAL BREAKDOWN: HOW PRIME IMPACTS HELOCs VS FIXED MORTGAGES */}
      <section className="section" style={{ backgroundColor: '#FFFFFF', padding: '4rem 1rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <h2
            style={{
              color: 'var(--primary)',
              marginBottom: '2rem',
              textAlign: 'center',
              fontSize: '1.85rem',
            }}
          >
            How the U.S. Prime Rate Impacts Homeowners
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                borderTop: '4px solid var(--accent)',
              }}
            >
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.85rem', fontSize: '1.25rem' }}>
                HELOCs Move Dollar-for-Dollar with Prime
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                Virtually all traditional and credit union Home Equity Lines of Credit calculate
                your variable rate as <strong>Prime Rate + Margin</strong>. Whenever the FOMC raises
                or cuts the Federal Funds target range by 0.25%, the U.S. Prime Rate moves by the
                exact same 0.25%—adjusting most active HELOCs within one to two billing cycles.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '2rem',
                borderRadius: 'var(--radius-lg)',
                borderTop: '4px solid #0468E9',
              }}
            >
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.85rem', fontSize: '1.25rem' }}>
                30-Year Fixed Mortgages Track Bonds, Not Prime
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                Contrary to popular headlines, 30-year fixed mortgage rates do <em>not</em> move
                automatically with FOMC votes. Fixed mortgages follow long-term{' '}
                <Link
                  href="/geek-out/mbs-rate-watch"
                  style={{ color: '#0468E9', fontWeight: 600 }}
                >
                  Mortgage-Backed Securities (MBS) &amp; 10-Year Treasury yields
                </Link>
                , which often price in expected Fed moves weeks ahead of time.
              </p>
            </div>
          </div>

          {/* HELOC Strategy CTA Banner */}
          <div
            style={{
              marginTop: '2.5rem',
              padding: '2.25rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ maxWidth: '580px' }}>
              <h3 style={{ color: '#FFFFFF', margin: '0 0 0.5rem 0', fontSize: '1.35rem' }}>
                Comparing a Bank HELOC, Credit Union HELOC, or Blended Rate?
              </h3>
              <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.65 }}>
                Test how a Prime-indexed HELOC blends with your low first-mortgage rate, or ask us
                to compare standalone HELOC margins, rate floors, and 55+ equity line options.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link
                href="/geek-out/weighted-average"
                className="btn"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#060A2D',
                  fontWeight: 700,
                  padding: '0.85rem 1.35rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                Blended Rate Calculator
              </Link>
              <Link
                href="/#contact"
                className="btn"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontWeight: 700,
                  padding: '0.85rem 1.35rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
              >
                Request HELOC Review &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <RelatedInsights
        calculatorId="calc-prime-rate"
        title="HELOC & Prime Rate Strategy Guides"
        subtitle="How Prime + Margin pricing, rate floors, and draw periods dictate your true cost of borrowing."
        background="#F8FAFC"
      />
    </main>
  );
}
