'use strict';

// CommonJS copy of pure Tradeweb US10Y 5-minute bar session helpers for Firebase Cloud Functions
// (keeps `functions/` completely self-contained with zero imports outside `functions/`).

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

function formatPtClock(ms) {
  return (
    new Intl.DateTimeFormat('en-US', {
      timeZone: PT_TZ,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(ms)) + ' PT'
  );
}

function toCnbcDateParam(dateObj) {
  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function fetchUs10YrDailyFactsFromCnbc(lookbackDays = 45) {
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

function computeDailyFactsFromBars(rawBars, nowMs = Date.now()) {
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
    if (bars.length < 3) continue;

    const openBar = bars[0];
    const openingYield = Number(openBar.open.toFixed(3));

    const exact1230Bar = bars.find((b) => b.minutesOfDay === CLOSE_MIN);
    const lastBar = bars[bars.length - 1];
    const closingYield = Number(
      (exact1230Bar ? exact1230Bar.open : lastBar.close).toFixed(3)
    );

    const sessionBars = bars.filter((b) => b.minutesOfDay < CLOSE_MIN);
    const evalBars = sessionBars.length > 0 ? sessionBars : bars;

    let highBar = evalBars[0];
    let lowBar = evalBars[0];
    for (const b of evalBars) {
      if (b.high > highBar.high) highBar = b;
      if (b.low < lowBar.low) lowBar = b;
    }

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
      dailyChangeBp: null,
      intradayRangeBp,
      isLiveSession,
    });
  }

  return attachDailyChangesAndSortDesc(rows);
}

function mergeAndFinalizeDailyLog(existingRows = [], freshRows = []) {
  const byDate = new Map();
  for (const r of existingRows) {
    if (r && r.date) byDate.set(r.date, { ...r });
  }
  for (const r of freshRows) {
    if (r && r.date) byDate.set(r.date, { ...r });
  }
  return attachDailyChangesAndSortDesc(Array.from(byDate.values()));
}

function attachDailyChangesAndSortDesc(rows) {
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
  return asc.reverse();
}

module.exports = {
  fetchUs10YrDailyFactsFromCnbc,
  computeDailyFactsFromBars,
  mergeAndFinalizeDailyLog,
  attachDailyChangesAndSortDesc,
};
