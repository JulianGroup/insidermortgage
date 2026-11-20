// Utilities for building and merging the US 10-Year T-Note (Tradeweb US10Y)
// Daily Trading Session Log (5:00 AM Pacific open through 12:30 PM Pacific reference close).

const PT_TZ = 'America/Los_Angeles';

function formatPtParts(ms) {
  const d = new Date(ms);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const map = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }

  let hour = parseInt(map.hour, 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(map.minute, 10);

  return {
    dateKey: `${map.year}-${map.month}-${map.day}`,
    weekday: map.weekday,
    hour,
    minute,
    minutesOfDay: hour * 60 + minute,
  };
}

export function formatPtClock(ms) {
  return (
    new Intl.DateTimeFormat('en-US', {
      timeZone: PT_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(ms)) + ' PT'
  );
}

export function formatTradingDate(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return dateKey || '—';
  const [y, m, d] = dateKey.split('-').map(Number);
  const utcMidday = new Date(Date.UTC(y, m - 1, d, 18, 0, 0));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(utcMidday);
}

function toCnbcDateParam(dateObj) {
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Fetches 5-minute Tradeweb US10Y bars from CNBC (CORS-enabled) for the past `lookbackDays`
 * and computes daily session facts for 5:00 AM PT -> 12:30 PM PT.
 */
export async function fetchUs10YrDailyFactsFromCnbc(lookbackDays = 40) {
  const now = new Date();
  const start = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
  const startParam = `${toCnbcDateParam(start)}000000`;
  const endParam = `${toCnbcDateParam(new Date(now.getTime() + 24 * 60 * 60 * 1000))}235959`;

  const url = `https://ts-api.cnbc.com/harmony/app/bars/US10Y/5M/${startParam}/${endParam}/adjusted/EST5EDT.json`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`CNBC US10Y bars HTTP ${res.status}`);
  }

  const json = await res.json();
  const rawBars = json?.barData?.priceBars || [];
  return computeDailyFactsFromBars(rawBars, now.getTime());
}

/**
 * Groups 5-minute bars by Pacific trading date and computes the 10 daily metrics.
 * Session window: 5:00 AM PT (300 min) through 12:30 PM PT (750 min).
 */
export function computeDailyFactsFromBars(rawBars, nowMs = Date.now()) {
  const OPEN_MIN = 5 * 60; // 5:00 AM PT
  const CLOSE_MIN = 12 * 60 + 30; // 12:30 PM PT
  const nowPt = formatPtParts(nowMs);

  const byDate = new Map();

  for (const bar of rawBars) {
    const ms = Number(bar.tradeTimeinMills);
    if (!Number.isFinite(ms)) continue;

    const open = parseFloat(bar.open);
    const high = parseFloat(bar.high);
    const low = parseFloat(bar.low);
    const close = parseFloat(bar.close);
    if ([open, high, low, close].some((v) => !Number.isFinite(v))) continue;

    const pt = formatPtParts(ms);
    if (pt.weekday === 'Sat' || pt.weekday === 'Sun') continue;

    // Keep bars inside the 5:00 AM PT - 12:30 PM PT reference session
    if (pt.minutesOfDay < OPEN_MIN || pt.minutesOfDay > CLOSE_MIN) continue;

    if (!byDate.has(pt.dateKey)) {
      byDate.set(pt.dateKey, []);
    }
    byDate.get(pt.dateKey).push({
      ms,
      minutesOfDay: pt.minutesOfDay,
      open,
      high,
      low,
      close,
    });
  }

  const sortedDates = Array.from(byDate.keys()).sort();
  const rows = [];

  for (const dateKey of sortedDates) {
    const bars = byDate.get(dateKey).sort((a, b) => a.ms - b.ms);
    if (bars.length < 3) continue; // skip holiday / empty session

    const openBar = bars[0];
    const openingYield = Number(openBar.open.toFixed(3));

    // Close snapshot at 12:30 PM PT: if a bar starts exactly at 12:30 PT, its open is the 12:30 snapshot;
    // otherwise use the close of the last bar <= 12:30 PT (e.g. 12:25 PT bar closes at 12:30 PT).
    const exact1230Bar = bars.find((b) => b.minutesOfDay === CLOSE_MIN);
    const lastBar = bars[bars.length - 1];
    const closingYield = Number(
      (exact1230Bar ? exact1230Bar.open : lastBar.close).toFixed(3)
    );

    // Intraday high & low across the session (exclude the 12:30-12:35 bar's post-12:30 range if exact 12:30 exists)
    const sessionBars = bars.filter((b) => b.minutesOfDay < CLOSE_MIN);
    const evalBars = sessionBars.length > 0 ? sessionBars : bars;

    let highBar = evalBars[0];
    let lowBar = evalBars[0];
    for (const b of evalBars) {
      if (b.high > highBar.high) highBar = b;
      if (b.low < lowBar.low) lowBar = b;
    }

    // Also include the 12:30 snapshot itself in high/low checks if it set a new extreme
    let intradayHigh = Number(highBar.high.toFixed(3));
    let timeOfHigh = formatPtClock(highBar.ms);
    if (closingYield > intradayHigh) {
      intradayHigh = closingYield;
      timeOfHigh = exact1230Bar ? '12:30 PM PT' : formatPtClock(lastBar.ms);
    }

    let intradayLow = Number(lowBar.low.toFixed(3));
    let timeOfLow = formatPtClock(lowBar.ms);
    if (closingYield < intradayLow) {
      intradayLow = closingYield;
      timeOfLow = exact1230Bar ? '12:30 PM PT' : formatPtClock(lastBar.ms);
    }

    // Filter out bond-market holidays where the feed is completely flat all session
    if (
      intradayHigh === intradayLow &&
      openingYield === closingYield &&
      dateKey !== nowPt.dateKey
    ) {
      continue;
    }

    const isLiveSession =
      dateKey === nowPt.dateKey && nowPt.minutesOfDay < CLOSE_MIN;

    const openToCloseBp = Number(((closingYield - openingYield) * 100).toFixed(1));
    const intradayRangeBp = Number(((intradayHigh - intradayLow) * 100).toFixed(1));

    rows.push({
      date: dateKey,
      openingYield,
      intradayHigh,
      timeOfHigh,
      intradayLow,
      timeOfLow,
      closingYield,
      openToCloseBp,
      dailyChangeBp: null, // populated after merging full chronological history
      intradayRangeBp,
      isLiveSession,
    });
  }

  return attachDailyChangesAndSortDesc(rows);
}

/**
 * Merges historical Firestore rows with fresh CNBC rows (fresh rows win for overlapping dates),
 * computes `dailyChangeBp` vs previous trading day's close across the full timeline,
 * and returns rows sorted most-recent-date first.
 */
export function mergeAndFinalizeDailyLog(existingRows = [], freshRows = []) {
  const byDate = new Map();
  for (const r of existingRows) {
    if (r && r.date) byDate.set(r.date, { ...r });
  }
  for (const r of freshRows) {
    if (r && r.date) byDate.set(r.date, { ...r });
  }
  return attachDailyChangesAndSortDesc(Array.from(byDate.values()));
}

export function attachDailyChangesAndSortDesc(rows) {
  const asc = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 0; i < asc.length; i++) {
    if (i === 0) {
      asc[i] = { ...asc[i], dailyChangeBp: null };
    } else {
      const prevClose = asc[i - 1].closingYield;
      const diffBp = Number(((asc[i].closingYield - prevClose) * 100).toFixed(1));
      asc[i] = { ...asc[i], dailyChangeBp: diffBp };
    }
  }
  return asc.reverse(); // Most recent date on top
}

export function formatBp(val) {
  if (val === null || val === undefined || !Number.isFinite(val)) return '—';
  const sign = val > 0 ? '+' : val < 0 ? '−' : '';
  return `${sign}${Math.abs(val).toFixed(1)} bp`;
}

export function buildUs10YrDailyLogCsv(rows) {
  const headers = [
    'Date',
    'Opening Yield (5:00 AM PT)',
    'Intraday High',
    'Time of High',
    'Intraday Low',
    'Time of Low',
    'Closing Yield (12:30 PM PT)',
    'Open-to-Close Change (bp)',
    'Daily Change vs Prev Close (bp)',
    'Intraday Range (bp)',
  ];
  const escapeCsv = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escapeCsv).join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.date,
        `${r.openingYield.toFixed(3)}%`,
        `${r.intradayHigh.toFixed(3)}%`,
        r.timeOfHigh,
        `${r.intradayLow.toFixed(3)}%`,
        r.timeOfLow,
        `${r.closingYield.toFixed(3)}%${r.isLiveSession ? ' (Live)' : ''}`,
        r.openToCloseBp > 0 ? `+${r.openToCloseBp.toFixed(1)}` : r.openToCloseBp.toFixed(1),
        r.dailyChangeBp === null
          ? ''
          : r.dailyChangeBp > 0
          ? `+${r.dailyChangeBp.toFixed(1)}`
          : r.dailyChangeBp.toFixed(1),
        r.intradayRangeBp.toFixed(1),
      ]
        .map(escapeCsv)
        .join(',')
    );
  }
  return lines.join('\n');
}
