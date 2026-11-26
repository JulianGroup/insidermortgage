"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import AdminGuard from './AdminGuard';
import { useAdminAuth } from './AuthContext';
import { db, functions } from '../lib/firebase';

const DEFAULT_DRAFT = [
  { id: 'umbs-65', title: 'UMBS 30YR 6.5', type: 'mbs', open: 101.53, last: 101.53, high: 101.53, low: 101.53 },
  { id: 'umbs-70', title: 'UMBS 30YR 7.0', type: 'mbs', open: 103.03, last: 103.03, high: 103.03, low: 103.03 },
  { id: 'umbs-60', title: 'UMBS 30YR 6.0', type: 'mbs', open: 99.58, last: 99.58, high: 99.58, low: 99.58 },
  { id: 'us-10yr', title: 'US 10-year T-Note', type: 'yield', open: 4.25, last: 4.25, high: 4.25, low: 4.25 },
];

function getTodayEtDate() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const map = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  return `${map.year}-${map.month}-${map.day}`;
}

function MbsDeskContent() {
  const { profile } = useAdminAuth();
  const [liveDoc, setLiveDoc] = useState(null);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [calibrationLog, setCalibrationLog] = useState(null);
  const [calibrationConfig, setCalibrationConfig] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logCalibrationOnAnchor, setLogCalibrationOnAnchor] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadCalibrationDocs = useCallback(async () => {
    try {
      const [logSnap, cfgSnap] = await Promise.all([
        getDoc(doc(db, 'marketWatch', 'calibrationLog')),
        getDoc(doc(db, 'marketWatch', 'calibrationConfig')),
      ]);
      if (logSnap.exists()) setCalibrationLog(logSnap.data());
      if (cfgSnap.exists()) setCalibrationConfig(cfgSnap.data());
    } catch (err) {
      console.warn('Calibration metadata read warning:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'marketWatch', 'liveQuotes'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLiveDoc(data);
          if (Array.isArray(data.instruments) && data.instruments.length > 0) {
            setDraft(data.instruments);
          }
        }
      },
      (err) => {
        setStatusMsg({ type: 'error', text: `Firestore subscription error: ${err.message}` });
      }
    );
    loadCalibrationDocs();
    return () => unsubscribe();
  }, [loadCalibrationDocs]);

  const handleFieldChange = (id, field, value) => {
    setDraft((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const fn = httpsCallable(functions, 'syncMbsNow');
      const res = await fn();
      setStatusMsg({
        type: 'success',
        text: `Server sync completed (${res.data?.marketStatusLabel || 'Updated'}) at ${new Date(
          res.data?.updatedAt || Date.now()
        ).toLocaleTimeString()}.`,
      });
      await loadCalibrationDocs();
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Server sync failed: ${err.message}` });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveMorningAnchor = async () => {
    setSaving(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const todayEt = getTodayEtDate();
      const nowIso = new Date().toISOString();
      const anchorPrices = {};

      const nextInstruments = draft.map((item) => {
        if (item.type !== 'mbs') {
          return {
            ...item,
            open: Number(parseFloat(item.open) || 0),
            last: Number(parseFloat(item.last) || 0),
            high: Number(parseFloat(item.high) || 0),
            low: Number(parseFloat(item.low) || 0),
          };
        }
        const anchorOpen = Number(Number(parseFloat(item.open) || 0).toFixed(2));
        anchorPrices[item.id] = anchorOpen;
        return {
          ...item,
          open: anchorOpen,
          last: anchorOpen,
          high: anchorOpen,
          low: anchorOpen,
          pricingType: 'modeled',
        };
      });

      await setDoc(
        doc(db, 'marketWatch', 'liveQuotes'),
        {
          instruments: nextInstruments,
          tradingDate: todayEt,
          anchorDate: todayEt,
          anchorSource: 'Desk Anchor',
          manualLock: false,
          manualLockDate: null,
          sourceLabel: 'Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)',
          updatedAt: nowIso,
          deskAnchor: {
            tradingDate: todayEt,
            setBy: profile.email,
            setAt: nowIso,
            prices: anchorPrices,
          },
        },
        { merge: true }
      );

      if (logCalibrationOnAnchor && Array.isArray(liveDoc?.instruments)) {
        const modeledCloses = {};
        for (const inst of liveDoc.instruments) {
          if (inst.type === 'mbs' && Number.isFinite(Number(inst.last))) {
            modeledCloses[inst.id] = Number(inst.last);
          }
        }
        const logDate = liveDoc?.tradingDate || todayEt;
        const existingEntries = Array.isArray(calibrationLog?.entries)
          ? calibrationLog.entries
          : [];
        const byDate = new Map(existingEntries.map((e) => [e.tradingDate, e]));
        const errorsBp = {};
        for (const id of ['umbs-60', 'umbs-65', 'umbs-70']) {
          if (Number.isFinite(modeledCloses[id]) && Number.isFinite(anchorPrices[id])) {
            errorsBp[id] = Math.round((modeledCloses[id] - anchorPrices[id]) * 100);
          }
        }
        byDate.set(logDate, {
          tradingDate: logDate,
          source: `Desk Anchor (${profile.email})`,
          modeledCloses,
          actualCloses: anchorPrices,
          errorsBp,
          recordedAt: nowIso,
        });
        const entries = Array.from(byDate.values())
          .sort((a, b) => b.tradingDate.localeCompare(a.tradingDate))
          .slice(0, 60);
        const window20 = entries.slice(0, 20);
        const maeBp = {};
        let totalAbs = 0;
        let totalCount = 0;
        for (const id of ['umbs-60', 'umbs-65', 'umbs-70']) {
          let sumAbs = 0;
          let count = 0;
          for (const e of window20) {
            if (typeof e?.errorsBp?.[id] === 'number') {
              sumAbs += Math.abs(e.errorsBp[id]);
              count += 1;
              totalAbs += Math.abs(e.errorsBp[id]);
              totalCount += 1;
            }
          }
          maeBp[id] = count > 0 ? Number((sumAbs / count).toFixed(1)) : null;
        }
        maeBp.overall = totalCount > 0 ? Number((totalAbs / totalCount).toFixed(1)) : null;

        const updatedLog = {
          updatedAt: nowIso,
          sampleDays: window20.length,
          maeBp,
          entries,
        };
        await setDoc(doc(db, 'marketWatch', 'calibrationLog'), updatedLog);
        setCalibrationLog(updatedLog);
      }

      // Immediately run server intraday model from the new morning anchor
      try {
        const fn = httpsCallable(functions, 'syncMbsNow');
        await fn();
      } catch (syncErr) {
        console.warn('Anchor saved, follow-up sync skipped:', syncErr.message);
      }

      setStatusMsg({
        type: 'success',
        text: `Saved morning Desk Anchor for ${todayEt} and resumed intraday modeling.`,
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Failed to save anchor: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleLockDeskPrices = async () => {
    setSaving(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const todayEt = getTodayEtDate();
      const nowIso = new Date().toISOString();
      const sanitized = draft.map((item) => ({
        ...item,
        open: Number(parseFloat(item.open) || 0),
        last: Number(parseFloat(item.last) || 0),
        high: Number(parseFloat(item.high) || 0),
        low: Number(parseFloat(item.low) || 0),
        pricingType: 'desk',
      }));

      await setDoc(
        doc(db, 'marketWatch', 'liveQuotes'),
        {
          instruments: sanitized,
          tradingDate: todayEt,
          anchorDate: todayEt,
          anchorSource: 'Desk Coupon Override',
          manualLock: true,
          manualLockDate: todayEt,
          sourceLabel: 'Desk Coupon Override (Locked Today)',
          updatedAt: nowIso,
        },
        { merge: true }
      );

      setStatusMsg({
        type: 'success',
        text: `Locked exact Desk Override prices for ${todayEt}. Auto-releases next trading morning.`,
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Failed to lock prices: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleReleaseLock = async () => {
    setSaving(true);
    setStatusMsg({ type: '', text: '' });
    try {
      await setDoc(
        doc(db, 'marketWatch', 'liveQuotes'),
        {
          manualLock: false,
          manualLockDate: null,
          sourceLabel: 'Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)',
        },
        { merge: true }
      );
      const fn = httpsCallable(functions, 'syncMbsNow');
      await fn();
      setStatusMsg({
        type: 'success',
        text: 'Released desk lock and refreshed modeled UMBS quotes from server.',
      });
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Failed to release lock: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const telemetry = liveDoc?.modelTelemetry || null;
  const isLocked = Boolean(liveDoc?.manualLock);

  return (
    <div className="container" style={{ maxWidth: '1100px', padding: '2rem 0 4rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <Link href="/admin/" style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>
            &larr; Back to Admin Portal
          </Link>
          <h1 style={{ margin: '0.35rem 0 0.25rem', color: 'var(--primary)' }}>
            MBS Rate Watch Desk
          </h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem' }}>
            Signed in as {profile?.name} ({profile?.email}) &bull;{' '}
            <Link href="/geek-out/mbs-rate-watch/" style={{ color: '#0369A1', fontWeight: 600 }}>
              View Public Board &rarr;
            </Link>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSyncNow}
          disabled={syncing}
          style={{ minWidth: '180px' }}
        >
          {syncing ? 'Syncing Server...' : '↻ Sync Now (Server)'}
        </button>
      </div>

      {statusMsg.text && (
        <div
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            backgroundColor: statusMsg.type === 'error' ? '#FEE2E2' : '#DCFCE7',
            color: statusMsg.type === 'error' ? '#991B1B' : '#166534',
            border: `1px solid ${statusMsg.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Live Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={cardBox}>
          <div style={metaLabel}>MARKET STATUS</div>
          <div style={metaVal}>{liveDoc?.marketStatusLabel || 'Not initialized'}</div>
        </div>
        <div style={cardBox}>
          <div style={metaLabel}>TRADING DATE / ANCHOR</div>
          <div style={metaVal}>
            {liveDoc?.tradingDate || '—'} • {liveDoc?.anchorSource || '—'}
          </div>
        </div>
        <div style={cardBox}>
          <div style={metaLabel}>MODE / OVERRIDE</div>
          <div style={metaVal}>
            {isLocked ? `Locked (${liveDoc?.manualLockDate || 'Today'})` : 'Server Intraday Model'}
          </div>
        </div>
        <div style={cardBox}>
          <div style={metaLabel}>LAST UPDATED</div>
          <div style={metaVal}>
            {liveDoc?.updatedAt ? new Date(liveDoc.updatedAt).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      {/* Desk Anchor & Manual Override Form */}
      <section style={{ ...panelStyle, marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#061A33' }}>
              Morning Desk Anchor &amp; Manual Override
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: '#64748B' }}>
              Enter your lender/TBA screen opening prices in <strong>Open</strong> to anchor
              today&apos;s automated intraday moves, or lock exact <strong>Open / Last / High / Low</strong>{' '}
              values for the day.
            </p>
          </div>
          {isLocked && (
            <button
              type="button"
              className="btn"
              onClick={handleReleaseLock}
              disabled={saving}
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}
            >
              Release Lock &amp; Resume Model
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {draft.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(160px, 1.3fr) repeat(4, minmax(85px, 1fr))',
                gap: '0.75rem',
                alignItems: 'center',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {item.type === 'yield' ? 'Yield (%)' : 'Price (pts)'} •{' '}
                  {item.pricingType || (item.type === 'yield' ? 'live' : 'modeled')}
                </div>
              </div>
              {['open', 'last', 'high', 'low'].map((field) => (
                <label
                  key={field}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#64748B',
                    textTransform: 'uppercase',
                  }}
                >
                  {field}
                  <input
                    type="number"
                    step={item.type === 'yield' ? '0.001' : '0.01'}
                    value={item[field] ?? ''}
                    onChange={(e) => handleFieldChange(item.id, field, e.target.value)}
                    style={{
                      marginTop: '0.25rem',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                </label>
              ))}
            </div>
          ))}
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            fontSize: '0.86rem',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={logCalibrationOnAnchor}
            onChange={(e) => setLogCalibrationOnAnchor(e.target.checked)}
          />
          Record entered Open prices as prior-close benchmark in the 20-day calibration error log
        </label>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginTop: '1.1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveMorningAnchor}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Morning Anchor (Model Active)'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleLockDeskPrices}
            disabled={saving}
            style={{ backgroundColor: '#0F172A', color: '#F2C230' }}
          >
            Lock Exact Desk Prices (Today)
          </button>
        </div>
      </section>

      {/* Model Telemetry */}
      <section style={{ ...panelStyle, marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.15rem', color: '#061A33' }}>
          Server Model Telemetry (5Y / 7Y / 10Y Key-Rate &amp; MTBA)
        </h2>
        {!telemetry ? (
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            No model telemetry recorded yet. Click &ldquo;Sync Now (Server)&rdquo; or wait for
            the next scheduled tick.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <div style={cardBox}>
              <div style={metaLabel}>US 5Y / 7Y / 10Y</div>
              <div style={metaVal}>
                {telemetry.us5y ?? '—'}% / {telemetry.us7y ?? '—'}% / {telemetry.us10y ?? '—'}%
              </div>
            </div>
            <div style={cardBox}>
              <div style={metaLabel}>MTBA BASIS ADJ (6.0)</div>
              <div style={metaVal}>
                {telemetry.mtbaBasisActive
                  ? `${telemetry.mtbaBasisBp > 0 ? '+' : ''}${telemetry.mtbaBasisBp || 0} bp`
                  : 'Off (Outside NYSE Hrs)'}
              </div>
            </div>
            <div style={cardBox}>
              <div style={metaLabel}>EFFECTIVE DURATIONS</div>
              <div style={metaVal}>
                6.0: {telemetry.coupons?.['umbs-60']?.effectiveDuration ?? '—'} | 6.5:{' '}
                {telemetry.coupons?.['umbs-65']?.effectiveDuration ?? '—'} | 7.0:{' '}
                {telemetry.coupons?.['umbs-70']?.effectiveDuration ?? '—'}
              </div>
            </div>
            <div style={cardBox}>
              <div style={metaLabel}>CLASS A ROLL WINDOW</div>
              <div style={metaVal}>{telemetry.isRollWindow ? 'Active Roll Window' : 'Normal'}</div>
            </div>
          </div>
        )}
        {calibrationConfig && (
          <p style={{ margin: '0.85rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>
            Custom Firestore calibration override active (`marketWatch/calibrationConfig`).
          </p>
        )}
      </section>

      {/* 20-Day Calibration Error Log */}
      <section style={panelStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#061A33' }}>
            20-Day Model Calibration Error Log
          </h2>
          {calibrationLog?.maeBp && (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
              <span style={maeBadge}>6.0 MAE: {calibrationLog.maeBp['umbs-60'] ?? '—'} bp</span>
              <span style={maeBadge}>6.5 MAE: {calibrationLog.maeBp['umbs-65'] ?? '—'} bp</span>
              <span style={maeBadge}>7.0 MAE: {calibrationLog.maeBp['umbs-70'] ?? '—'} bp</span>
              <span style={{ ...maeBadge, backgroundColor: '#061A33', color: '#F2C230' }}>
                Overall ({calibrationLog.sampleDays || 0}d): {calibrationLog.maeBp.overall ?? '—'} bp
              </span>
            </div>
          )}
        </div>

        {!calibrationLog?.entries?.length ? (
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>
            No calibration comparison entries yet. Entries are logged automatically when EOD
            benchmark closes run or when you log actual prices while setting a morning anchor.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #CBD5E1', textAlign: 'left', color: '#475569' }}>
                  <th style={{ padding: '0.5rem' }}>Date</th>
                  <th style={{ padding: '0.5rem' }}>Source</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>6.0 Error</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>6.5 Error</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>7.0 Error</th>
                </tr>
              </thead>
              <tbody>
                {calibrationLog.entries.slice(0, 20).map((entry) => (
                  <tr key={entry.tradingDate} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.5rem', fontWeight: 700 }}>{entry.tradingDate}</td>
                    <td style={{ padding: '0.5rem', color: '#475569' }}>{entry.source}</td>
                    {['umbs-60', 'umbs-65', 'umbs-70'].map((id) => {
                      const err = entry.errorsBp?.[id];
                      const display =
                        typeof err === 'number' ? `${err > 0 ? '+' : ''}${err} bp` : '—';
                      return (
                        <td
                          key={id}
                          style={{
                            padding: '0.5rem',
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color:
                              typeof err !== 'number'
                                ? '#94A3B8'
                                : Math.abs(err) <= 5
                                ? '#15803D'
                                : '#B45309',
                          }}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const panelStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-md)',
  border: '1px solid #E2E8F0',
};

const cardBox = {
  backgroundColor: '#FFFFFF',
  borderRadius: '10px',
  padding: '0.9rem 1rem',
  border: '1px solid #E2E8F0',
};

const metaLabel = {
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.8px',
  color: '#64748B',
  marginBottom: '0.25rem',
};

const metaVal = {
  fontSize: '0.9rem',
  fontWeight: 700,
  color: '#0F172A',
};

const maeBadge = {
  backgroundColor: '#F1F5F9',
  color: '#0F172A',
  padding: '0.25rem 0.65rem',
  borderRadius: '999px',
  fontWeight: 700,
  fontFamily: 'monospace',
};

export default function AdminMbsDesk() {
  return (
    <AdminGuard moduleId="mbs-desk">
      <MbsDeskContent />
    </AdminGuard>
  );
}
