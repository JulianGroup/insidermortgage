"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  fetchUs10YrDailyFactsFromCnbc,
  mergeAndFinalizeDailyLog,
  formatTradingDate,
  formatBp,
  buildUs10YrDailyLogCsv,
} from '../lib/us10yrDailyLog';

const FIRESTORE_COLLECTION = 'marketWatch';
const FIRESTORE_LOG_DOC = 'us10yrDailyLog';

export default function Us10YrDailyLogModal({ isOpen, onClose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const loadDailyLog = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    let existingRows = [];
    const logRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_LOG_DOC);

    // 1. Read persisted archive from Firestore for instant display & long-term history
    try {
      const snap = await getDoc(logRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.rows) && data.rows.length > 0) {
          existingRows = data.rows;
          setRows(existingRows);
          if (data.updatedAt) {
            setLastSyncedAt(new Date(data.updatedAt));
          }
        }
      }
    } catch (err) {
      console.warn('Firestore daily log read warning:', err);
    }

    // 2. Fetch live/recent 5-minute Tradeweb US10Y bars from CNBC and merge in memory
    // (Scheduled server-side persistence to Firestore runs via Cloud Function syncUs10YrDailyLog)
    try {
      const freshRows = await fetchUs10YrDailyFactsFromCnbc(45);
      if (freshRows.length > 0) {
        const merged = mergeAndFinalizeDailyLog(existingRows, freshRows);
        setRows(merged);
        const nowIso = new Date().toISOString();
        setLastSyncedAt(new Date(nowIso));
      }
    } catch (err) {
      console.warn('CNBC US10Y 5m bar fetch warning:', err);
      if (existingRows.length === 0) {
        setError('Unable to load US 10-Year T-Note session log right now. Please try refreshing.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    loadDailyLog(false);
  }, [isOpen, loadDailyLog]);

  // Escape key & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    if (!rows.length) return;
    const csv = buildUs10YrDailyLogCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `us-10yr-tnote-daily-log-${rows[0]?.date || 'export'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bpColorClass = (val) => {
    if (val === null || val === undefined || val === 0) return 'tlog-bp-flat';
    // For 10Y Treasury yield: falling yield (-bp) is favorable for mortgage rates (green); rising (+bp) pressures rates (red)
    return val < 0 ? 'tlog-bp-favorable' : 'tlog-bp-pressure';
  };

  return (
    <div
      className="tlog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tlog-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="tlog-modal">
        {/* Header */}
        <div className="tlog-header">
          <div>
            <div className="tlog-kicker">TRADEWEB US10Y • REFERENCE SESSION LOG</div>
            <h2 id="tlog-modal-title" className="tlog-title">
              US 10-Year T-Note — Daily Trading Facts
            </h2>
            <p className="tlog-subtitle">
              5:00 AM Pacific open through 12:30 PM Pacific reference close &bull; Most recent trading date on top
            </p>
          </div>

          <div className="tlog-header-actions">
            <button
              type="button"
              className="tlog-btn tlog-btn-ghost"
              onClick={() => loadDailyLog(true)}
              disabled={refreshing || loading}
            >
              {refreshing ? 'Refreshing...' : '↻ Refresh'}
            </button>
            <button
              type="button"
              className="tlog-btn tlog-btn-gold"
              onClick={handleExportCsv}
              disabled={!rows.length}
            >
              ⬇ Export CSV
            </button>
            <button
              type="button"
              className="tlog-close-btn"
              onClick={onClose}
              aria-label="Close US 10-Year T-Note Daily Log"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Meta / Legend Strip */}
        <div className="tlog-meta-strip">
          <div className="tlog-meta-left">
            <span className="tlog-count-pill">
              {rows.length} Trading {rows.length === 1 ? 'Day' : 'Days'} Logged
            </span>
            {lastSyncedAt && (
              <span className="tlog-synced-text">
                Synced{' '}
                {lastSyncedAt.toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <div className="tlog-legend">
            <span className="tlog-legend-item">
              <span className="tlog-dot tlog-dot-green" />
              −bp Yield Fell (Helps Rates)
            </span>
            <span className="tlog-legend-item">
              <span className="tlog-dot tlog-dot-red" />
              +bp Yield Rose (Pressures Rates)
            </span>
          </div>
        </div>

        {/* Table Body */}
        <div className="tlog-table-wrap">
          {loading && rows.length === 0 ? (
            <div className="tlog-state-box">Loading US 10-Year T-Note daily session history...</div>
          ) : error && rows.length === 0 ? (
            <div className="tlog-state-box tlog-state-error">{error}</div>
          ) : (
            <table className="tlog-table">
              <thead>
                <tr>
                  <th className="tlog-col-date">
                    Date
                    <span className="tlog-th-sub">Trading date</span>
                  </th>
                  <th>
                    Opening Yield
                    <span className="tlog-th-sub">5:00 AM Pacific</span>
                  </th>
                  <th>
                    Intraday High
                    <span className="tlog-th-sub">Session high</span>
                  </th>
                  <th>
                    Time of High
                    <span className="tlog-th-sub">Pacific time</span>
                  </th>
                  <th>
                    Intraday Low
                    <span className="tlog-th-sub">Session low</span>
                  </th>
                  <th>
                    Time of Low
                    <span className="tlog-th-sub">Pacific time</span>
                  </th>
                  <th>
                    Closing Yield
                    <span className="tlog-th-sub">12:30 PM PT</span>
                  </th>
                  <th>
                    Open-to-Close
                    <span className="tlog-th-sub">Change (bp)</span>
                  </th>
                  <th>
                    Daily Change
                    <span className="tlog-th-sub">vs. Prev Close</span>
                  </th>
                  <th>
                    Intraday Range
                    <span className="tlog-th-sub">High − Low (bp)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.date} className={r.isLiveSession ? 'tlog-row-live' : ''}>
                    <td className="tlog-cell-date">
                      <span>{formatTradingDate(r.date)}</span>
                      {r.isLiveSession && <span className="tlog-live-badge">LIVE</span>}
                    </td>
                    <td className="tlog-num">{r.openingYield.toFixed(3)}%</td>
                    <td className="tlog-num tlog-high">{r.intradayHigh.toFixed(3)}%</td>
                    <td className="tlog-time">{r.timeOfHigh}</td>
                    <td className="tlog-num tlog-low">{r.intradayLow.toFixed(3)}%</td>
                    <td className="tlog-time">{r.timeOfLow}</td>
                    <td className="tlog-num tlog-close">
                      {r.closingYield.toFixed(3)}%
                    </td>
                    <td className={`tlog-num tlog-bp ${bpColorClass(r.openToCloseBp)}`}>
                      {formatBp(r.openToCloseBp)}
                    </td>
                    <td className={`tlog-num tlog-bp ${bpColorClass(r.dailyChangeBp)}`}>
                      {formatBp(r.dailyChangeBp)}
                    </td>
                    <td className="tlog-num tlog-range">
                      {r.intradayRangeBp.toFixed(1)} bp
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer note */}
        <div className="tlog-footer">
          Derived from 5-minute Tradeweb US10Y intraday yield snapshots (1 basis point = 0.01% yield).
          Reference session spans 5:00 AM PT open to 12:30 PM PT close on active U.S. bond trading days.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tlog-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(3, 16, 34, 0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
        }

        .tlog-modal {
          width: min(1240px, 96vw);
          max-height: 88vh;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 30px 70px rgba(3, 16, 34, 0.45);
          border: 1px solid rgba(15, 23, 42, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .tlog-header {
          background: linear-gradient(135deg, #061A33 0%, #0E2F59 100%);
          color: #FFFFFF;
          padding: 1.35rem 1.6rem;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          border-bottom: 2px solid #F2C230;
        }

        .tlog-kicker {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 1.1px;
          color: #F2C230;
          margin-bottom: 0.25rem;
        }

        .tlog-title {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.45rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 0.25rem 0;
          line-height: 1.2;
        }

        .tlog-subtitle {
          margin: 0;
          font-size: 0.85rem;
          color: rgba(241, 245, 249, 0.82);
        }

        .tlog-header-actions {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          flex-wrap: wrap;
        }

        .tlog-btn {
          padding: 0.48rem 0.9rem;
          border-radius: 9px;
          font-family: inherit;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tlog-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .tlog-btn-ghost {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.24);
        }

        .tlog-btn-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .tlog-btn-gold {
          background: #F2C230;
          color: #061A33;
          border: 1px solid #F2C230;
        }

        .tlog-btn-gold:hover:not(:disabled) {
          background: #FAD152;
        }

        .tlog-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tlog-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .tlog-meta-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 0.7rem 1.6rem;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          font-size: 0.8rem;
        }

        .tlog-meta-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .tlog-count-pill {
          background: #061A33;
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 0.2rem 0.65rem;
          border-radius: 999px;
        }

        .tlog-synced-text {
          color: #64748B;
          font-weight: 500;
        }

        .tlog-legend {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          color: #475569;
          font-weight: 600;
          font-size: 0.76rem;
        }

        .tlog-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .tlog-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .tlog-dot-green {
          background: #15803D;
        }

        .tlog-dot-red {
          background: #DC2626;
        }

        .tlog-table-wrap {
          flex: 1;
          overflow: auto;
          background: #FFFFFF;
        }

        .tlog-state-box {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #475569;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .tlog-state-error {
          color: #DC2626;
        }

        .tlog-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          min-width: 980px;
        }

        .tlog-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #F1F5F9;
          color: #0F172A;
          font-weight: 700;
          text-align: right;
          padding: 0.75rem 0.85rem;
          border-bottom: 2px solid #CBD5E1;
          white-space: nowrap;
          line-height: 1.25;
        }

        .tlog-table thead th.tlog-col-date {
          text-align: left;
          padding-left: 1.4rem;
        }

        .tlog-th-sub {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748B;
          margin-top: 0.15rem;
        }

        .tlog-table tbody tr {
          border-bottom: 1px solid #EEF2F7;
          transition: background 0.12s ease;
        }

        .tlog-table tbody tr:nth-child(even) {
          background: #FAFBFD;
        }

        .tlog-table tbody tr:hover {
          background: #EFF6FF;
        }

        .tlog-row-live {
          background: #FEFCE8 !important;
        }

        .tlog-table tbody td {
          padding: 0.68rem 0.85rem;
          white-space: nowrap;
        }

        .tlog-cell-date {
          text-align: left;
          padding-left: 1.4rem !important;
          font-weight: 700;
          color: #0F172A;
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .tlog-live-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 0.12rem 0.42rem;
          border-radius: 4px;
          background: #F2C230;
          color: #061A33;
        }

        .tlog-num {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          color: #1E293B;
        }

        .tlog-time {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-variant-numeric: tabular-nums;
          font-size: 0.78rem;
          color: #64748B;
        }

        .tlog-close {
          font-weight: 700;
          color: #061A33;
        }

        .tlog-bp {
          font-weight: 700;
        }

        .tlog-bp-favorable {
          color: #15803D;
        }

        .tlog-bp-pressure {
          color: #DC2626;
        }

        .tlog-bp-flat {
          color: #64748B;
        }

        .tlog-range {
          color: #334155;
        }

        .tlog-footer {
          padding: 0.75rem 1.6rem;
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          font-size: 0.76rem;
          color: #64748B;
        }
      ` }} />
    </div>
  );
}
