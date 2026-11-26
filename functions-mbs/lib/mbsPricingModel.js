'use strict';

/**
 * Pure server-side UMBS 30-Year pricing engine, SIFMA bond market calendar,
 * Class A TBA roll window detector, CNBC multi-tenor benchmark fetcher,
 * EOD anchor fetcher, and rolling 20-day calibration tracker.
 *
 * Zero external dependencies — safe to deploy in Firebase Functions and
 * import directly in Vitest unit tests.
 */

const ET_TZ = 'America/New_York';

const DEFAULT_CALIBRATION = {
  beta: 0.90,
  mtbaBasisWeight: 0.45,
  mtbaRefDuration: 4.8,
  mtbaKeyWeights: {
    us5y: 0.35,
    us7y: 0.35,
    us10y: 0.30,
  },
  maxBasisAdjustmentPts: 0.35,
  coupons: {
    'umbs-60': {
      baseDuration: 5.5,
      convexityYearsSq: -140,
      priceDurationSlope: -0.18,
      minDuration: 3.0,
      maxDuration: 7.2,
      keyWeights: { us5y: 0.25, us7y: 0.35, us10y: 0.40 },
      basisScale: 1.0,
    },
    'umbs-65': {
      baseDuration: 4.5,
      convexityYearsSq: -160,
      priceDurationSlope: -0.22,
      minDuration: 2.4,
      maxDuration: 6.2,
      keyWeights: { us5y: 0.40, us7y: 0.40, us10y: 0.20 },
      basisScale: 0.85,
    },
    'umbs-70': {
      baseDuration: 3.5,
      convexityYearsSq: -180,
      priceDurationSlope: -0.25,
      minDuration: 1.8,
      maxDuration: 5.2,
      keyWeights: { us5y: 0.60, us7y: 0.30, us10y: 0.10 },
      basisScale: 0.68,
    },
  },
};

const DEFAULT_INSTRUMENTS = [
  {
    id: 'umbs-65',
    title: 'UMBS 30YR 6.5',
    subtitle: '30-Year 6.5% Coupon',
    type: 'mbs',
    open: 101.53,
    last: 101.53,
    high: 101.53,
    low: 101.53,
    pricingType: 'modeled',
    tooltip:
      'Uniform Mortgage-Backed Security 30-Year 6.5% Coupon. Rising bond prices (+bp) generally push mortgage interest rates lower.',
  },
  {
    id: 'umbs-70',
    title: 'UMBS 30YR 7.0',
    subtitle: '30-Year 7.0% Coupon',
    type: 'mbs',
    open: 103.03,
    last: 103.03,
    high: 103.03,
    low: 103.03,
    pricingType: 'modeled',
    tooltip:
      'Uniform Mortgage-Backed Security 30-Year 7.0% Coupon. Premium coupon with lower duration sensitivity; higher price (+bp) is favorable for mortgage rates.',
  },
  {
    id: 'umbs-60',
    title: 'UMBS 30YR 6.0',
    subtitle: '30-Year 6.0% Coupon',
    type: 'mbs',
    open: 99.58,
    last: 99.58,
    high: 99.58,
    low: 99.58,
    pricingType: 'modeled',
    tooltip:
      'Uniform Mortgage-Backed Security 30-Year 6.0% Coupon. Core benchmark for 30-year fixed conventional mortgage pricing.',
  },
  {
    id: 'us-10yr',
    title: 'US 10-year T-Note',
    subtitle: '10-Year Treasury Yield',
    type: 'yield',
    open: 4.25,
    last: 4.25,
    high: 4.25,
    low: 4.25,
    pricingType: 'live',
    tooltip:
      'U.S. 10-Year Treasury Note Yield (Tradeweb US10Y). A falling yield (-%) is typically favorable for mortgage interest rates.',
  },
];

// 30-Year UMBS Class A Monthly Settlement Dates (2026–2027)
// On Class A notification (T-2 business days) and settlement day, front-month TBA rolls to the next month.
const CLASS_A_SETTLEMENT_DATES = [
  // 2026
  '2026-01-13', '2026-02-11', '2026-03-11', '2026-04-13',
  '2026-05-13', '2026-06-11', '2026-07-13', '2026-08-12',
  '2026-09-14', '2026-10-14', '2026-11-12', '2026-12-10',
  // 2027
  '2027-01-13', '2027-02-10', '2027-03-10', '2027-04-12',
  '2027-05-12', '2027-06-10', '2027-07-13', '2027-08-11',
  '2027-09-13', '2027-10-13', '2027-11-10', '2027-12-13',
];

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function round2(val) {
  return Number(Number(val).toFixed(2));
}

function round3(val) {
  return Number(Number(val).toFixed(3));
}

function finiteOr(val, fallback) {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

function mergeKeyWeights(base, override) {
  if (!override || typeof override !== 'object') return { ...base };
  return {
    us5y: finiteOr(override.us5y, base.us5y),
    us7y: finiteOr(override.us7y, base.us7y),
    us10y: finiteOr(override.us10y, base.us10y),
  };
}

/**
 * Safely merges optional Firestore `marketWatch/calibrationConfig` fields over DEFAULT_CALIBRATION.
 */
function mergeCalibration(override) {
  const base = DEFAULT_CALIBRATION;
  if (!override || typeof override !== 'object') {
    return JSON.parse(JSON.stringify(base));
  }

  const coupons = {};
  for (const id of Object.keys(base.coupons)) {
    const b = base.coupons[id];
    const o = override.coupons && typeof override.coupons === 'object' ? override.coupons[id] : null;
    coupons[id] = {
      baseDuration: finiteOr(o?.baseDuration, b.baseDuration),
      convexityYearsSq: finiteOr(o?.convexityYearsSq, b.convexityYearsSq),
      priceDurationSlope: finiteOr(o?.priceDurationSlope, b.priceDurationSlope),
      minDuration: finiteOr(o?.minDuration, b.minDuration),
      maxDuration: finiteOr(o?.maxDuration, b.maxDuration),
      keyWeights: mergeKeyWeights(b.keyWeights, o?.keyWeights),
      basisScale: finiteOr(o?.basisScale, b.basisScale),
    };
  }

  return {
    beta: finiteOr(override.beta, base.beta),
    mtbaBasisWeight: finiteOr(override.mtbaBasisWeight, base.mtbaBasisWeight),
    mtbaRefDuration: finiteOr(override.mtbaRefDuration, base.mtbaRefDuration),
    mtbaKeyWeights: mergeKeyWeights(base.mtbaKeyWeights, override.mtbaKeyWeights),
    maxBasisAdjustmentPts: finiteOr(override.maxBasisAdjustmentPts, base.maxBasisAdjustmentPts),
    coupons,
  };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatYmd(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function addDaysUtc(year, month, day, deltaDays) {
  const d = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    dow: d.getUTCDay(), // 0 Sun .. 6 Sat
  };
}

/**
 * Computes observed fixed-date U.S. holiday: Sat -> Fri, Sun -> Mon.
 */
function observedFixedHoliday(year, month, day) {
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  if (dow === 6) return addDaysUtc(year, month, day, -1);
  if (dow === 0) return addDaysUtc(year, month, day, 1);
  return { year, month, day, dow };
}

/**
 * Computes nth weekday of month (weekday: 0=Sun..6=Sat, n>=1).
 */
function nthWeekdayOfMonth(year, month, weekday, n) {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - firstDow + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return { year, month, day };
}

/**
 * Computes last weekday of month (weekday: 0=Sun..6=Sat).
 */
function lastWeekdayOfMonth(year, month, weekday) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDow = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  const offset = (lastDow - weekday + 7) % 7;
  return { year, month, day: lastDay - offset };
}

/**
 * Meeus/Jones/Butcher Gregorian Easter Sunday algorithm -> returns Good Friday (Easter - 2 days).
 */
function computeGoodFriday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return addDaysUtc(year, month, day, -2);
}

/**
 * Returns Map<YYYY-MM-DD, holidayName> for all 12 SIFMA U.S. bond market holidays in `year`.
 */
function getSifmaHolidays(year) {
  const map = new Map();
  const add = (dt, name) => {
    map.set(formatYmd(dt.year, dt.month, dt.day), name);
  };

  // 1. New Year's Day (Jan 1) + check next year's Jan 1 if it falls on Sat (observed Dec 31 of `year`)
  add(observedFixedHoliday(year, 1, 1), "New Year's Day");
  const nextJan1 = observedFixedHoliday(year + 1, 1, 1);
  if (nextJan1.year === year) {
    add(nextJan1, "New Year's Day (Observed)");
  }

  // 2. MLK Day (3rd Mon in Jan)
  add(nthWeekdayOfMonth(year, 1, 1, 3), 'Martin Luther King Jr. Day');
  // 3. Presidents' Day (3rd Mon in Feb)
  add(nthWeekdayOfMonth(year, 2, 1, 3), "Presidents' Day");
  // 4. Good Friday
  add(computeGoodFriday(year), 'Good Friday');
  // 5. Memorial Day (last Mon in May)
  add(lastWeekdayOfMonth(year, 5, 1), 'Memorial Day');
  // 6. Juneteenth (June 19)
  add(observedFixedHoliday(year, 6, 19), 'Juneteenth');
  // 7. Independence Day (July 4)
  add(observedFixedHoliday(year, 7, 4), 'Independence Day');
  // 8. Labor Day (1st Mon in Sep)
  add(nthWeekdayOfMonth(year, 9, 1, 1), 'Labor Day');
  // 9. Columbus Day (2nd Mon in Oct) - Bond Market Closed, Equity Market Open
  add(nthWeekdayOfMonth(year, 10, 1, 2), 'Columbus Day');
  // 10. Veterans Day (Nov 11) - Bond Market Closed, Equity Market Open
  add(observedFixedHoliday(year, 11, 11), 'Veterans Day');
  // 11. Thanksgiving Day (4th Thu in Nov)
  add(nthWeekdayOfMonth(year, 11, 4, 4), 'Thanksgiving Day');
  // 12. Christmas Day (Dec 25)
  add(observedFixedHoliday(year, 12, 25), 'Christmas Day');

  return map;
}

/**
 * NYSE holidays (excludes Columbus Day and Veterans Day).
 */
function getNyseHolidays(year) {
  const sifma = getSifmaHolidays(year);
  const nyse = new Map();
  for (const [k, v] of sifma.entries()) {
    if (v === 'Columbus Day' || v === 'Veterans Day') continue;
    nyse.set(k, v);
  }
  return nyse;
}

/**
 * Returns Map<YYYY-MM-DD, label> for SIFMA 2:00 PM ET early-close trading days.
 */
function getSifmaEarlyCloseDates(year) {
  const map = new Map();
  const holidays = getSifmaHolidays(year);

  const isWeekdayNotHoliday = (y, m, d) => {
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    if (dow === 0 || dow === 6) return false;
    return !holidays.has(formatYmd(y, m, d));
  };

  // Friday before Memorial Day
  const mem = lastWeekdayOfMonth(year, 5, 1);
  const friBeforeMem = addDaysUtc(mem.year, mem.month, mem.day, -3);
  if (isWeekdayNotHoliday(friBeforeMem.year, friBeforeMem.month, friBeforeMem.day)) {
    map.set(formatYmd(friBeforeMem.year, friBeforeMem.month, friBeforeMem.day), 'Early Close (2:00 PM ET)');
  }

  // July 3 (if weekday and not holiday)
  if (isWeekdayNotHoliday(year, 7, 3)) {
    map.set(formatYmd(year, 7, 3), 'Early Close (2:00 PM ET)');
  }

  // Day after Thanksgiving (Friday)
  const thanks = nthWeekdayOfMonth(year, 11, 4, 4);
  const dayAfterThanks = addDaysUtc(thanks.year, thanks.month, thanks.day, 1);
  if (isWeekdayNotHoliday(dayAfterThanks.year, dayAfterThanks.month, dayAfterThanks.day)) {
    map.set(formatYmd(dayAfterThanks.year, dayAfterThanks.month, dayAfterThanks.day), 'Early Close (2:00 PM ET)');
  }

  // Christmas Eve (Dec 24 if weekday and not observed holiday)
  if (isWeekdayNotHoliday(year, 12, 24)) {
    map.set(formatYmd(year, 12, 24), 'Early Close (2:00 PM ET)');
  }

  // New Year's Eve (Dec 31 if weekday and not observed holiday)
  if (isWeekdayNotHoliday(year, 12, 31)) {
    map.set(formatYmd(year, 12, 31), 'Early Close (2:00 PM ET)');
  }

  return map;
}

/**
 * Parses a Date into America/New_York calendar and clock parts.
 */
function getEtParts(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ET_TZ,
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
  const year = parseInt(map.year, 10);
  const month = parseInt(map.month, 10);
  const day = parseInt(map.day, 10);

  return {
    year,
    month,
    day,
    weekday: map.weekday,
    hour,
    minute,
    minutesOfDay: hour * 60 + minute,
    tradingDate: `${map.year}-${map.month}-${map.day}`,
  };
}

/**
 * Checks whether `tradingDate` ('YYYY-MM-DD') falls inside the monthly 30-Year UMBS
 * Class A notification/settlement roll window (T-2 business days through settlement day).
 */
function isClassARollWindow(tradingDate) {
  if (!tradingDate || !/^\d{4}-\d{2}-\d{2}$/.test(tradingDate)) {
    return { isRollWindow: false, rollNote: null };
  }

  const [y, m, d] = tradingDate.split('-').map(Number);
  const holidays = getSifmaHolidays(y);

  const stepBusinessDaysBack = (startStr, count) => {
    const [sy, sm, sd] = startStr.split('-').map(Number);
    let cur = { year: sy, month: sm, day: sd };
    let remaining = count;
    while (remaining > 0) {
      cur = addDaysUtc(cur.year, cur.month, cur.day, -1);
      const dow = new Date(Date.UTC(cur.year, cur.month - 1, cur.day)).getUTCDay();
      const str = formatYmd(cur.year, cur.month, cur.day);
      if (dow !== 0 && dow !== 6 && !holidays.has(str)) {
        remaining -= 1;
      }
    }
    return formatYmd(cur.year, cur.month, cur.day);
  };

  for (const settleDate of CLASS_A_SETTLEMENT_DATES) {
    if (!settleDate.startsWith(`${y}-${pad2(m)}-`)) continue;
    const notifyDate = stepBusinessDaysBack(settleDate, 2);
    if (tradingDate >= notifyDate && tradingDate <= settleDate) {
      return {
        isRollWindow: true,
        rollNote:
          tradingDate === notifyDate
            ? `Monthly Class A TBA Roll Notification Day (Settles ${settleDate}) — front-month coupon roll may reflect delivery-month price drop unrelated to retail rates.`
            : `Monthly Class A TBA Roll Window (Settles ${settleDate}) — coupon pricing transitions between delivery months.`,
      };
    }
  }

  // Generic fallback for years beyond 2027: weekdays 9–14 are typical Class A roll week
  if (y > 2027 && d >= 9 && d <= 14) {
    return {
      isRollWindow: true,
      rollNote: 'Monthly Class A TBA Roll Window — delivery-month transition may create technical price dips.',
    };
  }

  return { isRollWindow: false, rollNote: null };
}

/**
 * Evaluates current U.S. bond market & equity market trading status in America/New_York.
 */
function getBondMarketStatus(date = new Date()) {
  const et = getEtParts(date);
  const holidays = getSifmaHolidays(et.year);
  const nyseHolidays = getNyseHolidays(et.year);
  const earlyCloseDates = getSifmaEarlyCloseDates(et.year);
  const { isRollWindow, rollNote } = isClassARollWindow(et.tradingDate);

  const isWeekend = et.weekday === 'Sat' || et.weekday === 'Sun';
  const holidayName = holidays.get(et.tradingDate) || null;
  const isEarlyClose = earlyCloseDates.has(et.tradingDate);

  if (isWeekend) {
    return {
      tradingDate: et.tradingDate,
      status: 'after-hours',
      statusLabel: 'Weekend • Prior Close',
      isEarlyClose: false,
      isEquityMarketOpen: false,
      isRollWindow,
      rollNote,
    };
  }

  if (holidayName) {
    const nyseClosed = nyseHolidays.has(et.tradingDate);
    const isEquityMarketOpen =
      !nyseClosed && et.minutesOfDay >= 9 * 60 + 30 && et.minutesOfDay < 16 * 60;
    return {
      tradingDate: et.tradingDate,
      status: 'holiday',
      statusLabel: `SIFMA Bond Holiday (${holidayName})`,
      isEarlyClose: false,
      isEquityMarketOpen,
      isRollWindow,
      rollNote,
    };
  }

  const bondOpenMin = 8 * 60; // 8:00 AM ET
  const bondCloseMin = isEarlyClose ? 14 * 60 : 17 * 60; // 2:00 PM or 5:00 PM ET
  const bondOpen = et.minutesOfDay >= bondOpenMin && et.minutesOfDay < bondCloseMin;

  const eqOpenMin = 9 * 60 + 30; // 9:30 AM ET
  const eqCloseMin = isEarlyClose ? 13 * 60 : 16 * 60; // 1:00 PM or 4:00 PM ET
  const isEquityMarketOpen =
    !nyseHolidays.has(et.tradingDate) &&
    et.minutesOfDay >= eqOpenMin &&
    et.minutesOfDay < eqCloseMin;

  const status = bondOpen ? 'open' : 'after-hours';
  let statusLabel = bondOpen
    ? isEarlyClose
      ? 'Bond Market Open (2 PM ET Early Close)'
      : 'Bond Market Open'
    : 'After Hours • Prior Close';

  return {
    tradingDate: et.tradingDate,
    status,
    statusLabel,
    isEarlyClose,
    isEquityMarketOpen,
    isRollWindow,
    rollNote,
  };
}

/**
 * Parses a single CNBC FormattedQuote entry into { last, prevClose, high, low }.
 */
function parseCnbcQuote(q) {
  if (!q || q.last === undefined || q.last === null) return null;
  const cleanNum = (v) => {
    if (v === undefined || v === null || v === '') return NaN;
    return parseFloat(String(v).replace(/[%$,]/g, '').trim());
  };

  const last = cleanNum(q.last);
  if (!Number.isFinite(last)) return null;

  const prevRaw = cleanNum(q.previous_day_closing);
  const openRaw = cleanNum(q.open);
  const prevClose = Number.isFinite(prevRaw)
    ? prevRaw
    : Number.isFinite(openRaw)
    ? openRaw
    : last;

  const highRaw = cleanNum(q.high);
  const lowRaw = cleanNum(q.low);
  const high = Number.isFinite(highRaw) ? highRaw : Math.max(last, prevClose);
  const low = Number.isFinite(lowRaw) ? lowRaw : Math.min(last, prevClose);

  return { last, prevClose, high, low };
}

/**
 * Fetches live US5Y, US7Y, US10Y, and MTBA quotes from CNBC Tradeweb REST API in one call.
 */
async function fetchCnbcBenchmarks(fetchImpl = fetch) {
  const url =
    'https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=US5Y%7CUS7Y%7CUS10Y%7CMTBA&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let res;
  try {
    res = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new Error(`CNBC benchmark HTTP ${res.status}`);
  }

  const json = await res.json();
  const list = json?.FormattedQuoteResult?.FormattedQuote || [];
  const bySymbol = new Map();
  for (const q of list) {
    if (q && q.symbol) {
      bySymbol.set(q.symbol.toUpperCase(), parseCnbcQuote(q));
    }
  }

  const us10y = bySymbol.get('US10Y') || null;
  if (!us10y) {
    throw new Error('CNBC response missing required US10Y quote');
  }

  return {
    us5y: bySymbol.get('US5Y') || null,
    us7y: bySymbol.get('US7Y') || null,
    us10y,
    mtba: bySymbol.get('MTBA') || null,
  };
}

/**
 * Price-aware effective duration: compresses above par (refi incentive) and extends below par.
 */
function computeEffectiveDuration(openPrice, couponCfg) {
  const raw = couponCfg.baseDuration + couponCfg.priceDurationSlope * (openPrice - 100);
  return clamp(raw, couponCfg.minDuration, couponCfg.maxDuration);
}

/**
 * Computes intraday modeled price, true intraday high/low, effective duration, and MTBA basis bps
 * for a single UMBS 30-Year coupon.
 */
function computeCouponUpdate({
  couponId,
  openPrice,
  existingHigh,
  existingLow,
  isNewTradingDay,
  benchmarks,
  isEquityMarketOpen,
  calibration,
}) {
  const cal = calibration || DEFAULT_CALIBRATION;
  const couponCfg = cal.coupons[couponId];
  if (!couponCfg) {
    throw new Error(`Unknown couponId: ${couponId}`);
  }

  const us10y = benchmarks?.us10y;
  if (!us10y || !Number.isFinite(us10y.last) || !Number.isFinite(us10y.prevClose)) {
    throw new Error('Missing valid us10y benchmark');
  }

  const dy10 = (us10y.last - us10y.prevClose) / 100;
  const dy5 =
    benchmarks.us5y && Number.isFinite(benchmarks.us5y.last) && Number.isFinite(benchmarks.us5y.prevClose)
      ? (benchmarks.us5y.last - benchmarks.us5y.prevClose) / 100
      : dy10;
  const dy7 =
    benchmarks.us7y && Number.isFinite(benchmarks.us7y.last) && Number.isFinite(benchmarks.us7y.prevClose)
      ? (benchmarks.us7y.last - benchmarks.us7y.prevClose) / 100
      : dy10;

  const w = couponCfg.keyWeights;
  const dyWeighted = w.us5y * dy5 + w.us7y * dy7 + w.us10y * dy10;

  const dEff = computeEffectiveDuration(openPrice, couponCfg);
  const fracTreasuryMove =
    -dEff * dyWeighted * cal.beta +
    0.5 * couponCfg.convexityYearsSq * dyWeighted * dyWeighted;

  let basisPts = 0;
  let mtbaUsed = false;

  const mtba = benchmarks.mtba;
  if (
    isEquityMarketOpen &&
    mtba &&
    Number.isFinite(mtba.last) &&
    Number.isFinite(mtba.prevClose) &&
    mtba.prevClose > 0
  ) {
    const mtbaPctMove = (mtba.last - mtba.prevClose) / mtba.prevClose;
    // Ignore stale/outlier ETF prints (>4% intraday move)
    if (Math.abs(mtbaPctMove) <= 0.04) {
      const mw = cal.mtbaKeyWeights;
      const mtbaDy = mw.us5y * dy5 + mw.us7y * dy7 + mw.us10y * dy10;
      const mtbaExpectedPct = -cal.mtbaRefDuration * mtbaDy * cal.beta;
      const mtbaResidualPct = mtbaPctMove - mtbaExpectedPct;

      basisPts = clamp(
        mtbaResidualPct * cal.mtbaBasisWeight * couponCfg.basisScale * openPrice,
        -cal.maxBasisAdjustmentPts,
        cal.maxBasisAdjustmentPts
      );
      mtbaUsed = true;
    }
  }

  const last = round2(openPrice + fracTreasuryMove * openPrice + basisPts);

  let high;
  let low;
  if (isNewTradingDay) {
    high = round2(Math.max(openPrice, last));
    low = round2(Math.min(openPrice, last));
  } else {
    const prevHigh = Number.isFinite(existingHigh) ? existingHigh : openPrice;
    const prevLow = Number.isFinite(existingLow) ? existingLow : openPrice;
    high = round2(Math.max(prevHigh, openPrice, last));
    low = round2(Math.min(prevLow, openPrice, last));
  }

  return {
    open: round2(openPrice),
    last,
    high,
    low,
    effectiveDuration: Number(dEff.toFixed(2)),
    basisBp: Math.round(basisPts * 100),
    mtbaUsed,
  };
}

function normalizeExistingInstruments(existingInstruments) {
  const byId = new Map();
  if (Array.isArray(existingInstruments)) {
    for (const item of existingInstruments) {
      if (!item || !item.id) continue;
      const id = item.id === 'umbs-55' ? 'umbs-70' : item.id;
      byId.set(id, item);
    }
  }
  return DEFAULT_INSTRUMENTS.map((def) => {
    const existing = byId.get(def.id);
    return existing ? { ...def, ...existing, id: def.id } : { ...def };
  });
}

/**
 * Builds the next Firestore `marketWatch/liveQuotes` document state from existing state,
 * live benchmarks, SIFMA market status, daily reset rules, and desk/EOD anchors.
 */
function buildLiveQuotesUpdate({
  existingDoc = null,
  benchmarks,
  now = new Date(),
  calibrationOverride = null,
  forceUpdateOutsideHours = false,
}) {
  const market = getBondMarketStatus(now);
  const cal = mergeCalibration(calibrationOverride);
  const baseInstruments = normalizeExistingInstruments(existingDoc?.instruments);
  const isNewTradingDay = !existingDoc?.tradingDate || existingDoc.tradingDate !== market.tradingDate;
  const nowIso = (now instanceof Date ? now : new Date(now)).toISOString();

  // Preserve existing prices outside market hours unless explicitly forced (e.g. manual admin sync)
  if (market.status !== 'open' && !forceUpdateOutsideHours) {
    const unchanged = {
      ...(existingDoc || {}),
      instruments: baseInstruments,
      tradingDate: existingDoc?.tradingDate || market.tradingDate,
      marketStatus: market.status,
      marketStatusLabel: market.statusLabel,
      statusCheckedAt: nowIso,
      updatedAt: existingDoc?.updatedAt || nowIso,
      anchorDate: existingDoc?.anchorDate || existingDoc?.tradingDate || market.tradingDate,
      anchorSource: existingDoc?.anchorSource || 'Prior Day Close',
      manualLock: Boolean(existingDoc?.manualLock),
      manualLockDate: existingDoc?.manualLockDate || null,
      sourceLabel:
        existingDoc?.sourceLabel ||
        'Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)',
      modelTelemetry: {
        ...(existingDoc?.modelTelemetry || {}),
        isRollWindow: market.isRollWindow,
        rollNote: market.rollNote,
        isEarlyClose: market.isEarlyClose,
        isEquityMarketOpen: market.isEquityMarketOpen,
      },
    };
    return { skippedMarketClosed: true, doc: unchanged };
  }

  // Auto-release stale prior-day manual lock on a new trading day
  let manualLock = Boolean(existingDoc?.manualLock);
  let manualLockDate = existingDoc?.manualLockDate || null;
  if (isNewTradingDay && manualLock && manualLockDate !== market.tradingDate) {
    manualLock = false;
    manualLockDate = null;
  }

  const hasTodayDeskAnchor = existingDoc?.deskAnchor?.tradingDate === market.tradingDate;
  const pendingNextOpen = existingDoc?.pendingNextOpen || null;

  let anchorSource = existingDoc?.anchorSource || 'Prior Day Close';
  let anchorDate = existingDoc?.anchorDate || market.tradingDate;

  if (isNewTradingDay) {
    anchorDate = market.tradingDate;
    if (hasTodayDeskAnchor) {
      anchorSource = 'Desk Anchor';
    } else if (pendingNextOpen?.prices) {
      anchorSource = pendingNextOpen.source || 'EOD Benchmark Close';
    } else if (existingDoc && Array.isArray(existingDoc.instruments)) {
      anchorSource = 'Prior Day Close';
    } else {
      anchorSource = 'Initial Seed';
    }
  } else if (hasTodayDeskAnchor && existingDoc?.anchorSource !== 'Desk Anchor') {
    anchorSource = 'Desk Anchor';
  }

  const couponTelemetry = {};
  let anyMtbaUsed = false;
  let lastBasisBp = 0;

  const nextInstruments = baseInstruments.map((item) => {
    if (item.id === 'us-10yr') {
      if (manualLock) {
        return { ...item, pricingType: 'desk' };
      }
      const us10y = benchmarks.us10y;
      return {
        ...item,
        open: round3(us10y.prevClose),
        last: round3(us10y.last),
        high: round3(us10y.high),
        low: round3(us10y.low),
        pricingType: 'live',
      };
    }

    // UMBS 30YR coupons
    if (manualLock) {
      return {
        ...item,
        pricingType: 'desk',
      };
    }

    // Resolve opening price
    let openPrice = Number(item.open);
    if (hasTodayDeskAnchor && Number.isFinite(Number(existingDoc.deskAnchor.prices?.[item.id]))) {
      openPrice = Number(existingDoc.deskAnchor.prices[item.id]);
    } else if (isNewTradingDay) {
      if (pendingNextOpen?.prices && Number.isFinite(Number(pendingNextOpen.prices[item.id]))) {
        openPrice = Number(pendingNextOpen.prices[item.id]);
      } else if (existingDoc && Array.isArray(existingDoc.instruments) && Number.isFinite(Number(item.last))) {
        openPrice = Number(item.last);
      }
    }

    const res = computeCouponUpdate({
      couponId: item.id,
      openPrice,
      existingHigh: item.high,
      existingLow: item.low,
      isNewTradingDay: isNewTradingDay || (hasTodayDeskAnchor && existingDoc?.anchorSource !== 'Desk Anchor'),
      benchmarks,
      isEquityMarketOpen: market.isEquityMarketOpen,
      calibration: cal,
    });

    couponTelemetry[item.id] = {
      effectiveDuration: res.effectiveDuration,
      basisBp: res.basisBp,
    };
    if (res.mtbaUsed) anyMtbaUsed = true;
    if (item.id === 'umbs-60') lastBasisBp = res.basisBp;

    return {
      ...item,
      open: res.open,
      last: res.last,
      high: res.high,
      low: res.low,
      pricingType: 'modeled',
    };
  });

  const sourceLabel = manualLock
    ? 'Desk Coupon Override (Locked Today)'
    : 'Tradeweb Live US10Y • Modeled Intraday UMBS (5Y/7Y/10Y + MTBA)';

  const outDoc = {
    instruments: nextInstruments,
    tradingDate: market.tradingDate,
    marketStatus: market.status,
    marketStatusLabel: market.statusLabel,
    updatedAt: nowIso,
    statusCheckedAt: nowIso,
    anchorDate,
    anchorSource,
    manualLock,
    manualLockDate,
    sourceLabel,
    deskAnchor: hasTodayDeskAnchor ? existingDoc.deskAnchor : null,
    pendingNextOpen: isNewTradingDay ? null : pendingNextOpen,
    modelTelemetry: {
      us5y: benchmarks.us5y ? round3(benchmarks.us5y.last) : null,
      us7y: benchmarks.us7y ? round3(benchmarks.us7y.last) : null,
      us10y: round3(benchmarks.us10y.last),
      mtbaLast: benchmarks.mtba ? round2(benchmarks.mtba.last) : null,
      mtbaBasisActive: anyMtbaUsed,
      mtbaBasisBp: lastBasisBp,
      isEquityMarketOpen: market.isEquityMarketOpen,
      isEarlyClose: market.isEarlyClose,
      isRollWindow: market.isRollWindow,
      rollNote: market.rollNote,
      coupons: couponTelemetry,
    },
  };

  return { skippedMarketClosed: false, doc: outDoc };
}

/**
 * Appends/replaces a trading date entry in the rolling 60-day calibration log
 * and recomputes rolling 20-day Mean Absolute Error (MAE in bp) per coupon.
 */
function updateCalibrationLog(existingLog = null, { tradingDate, modeledCloses, actualCloses, source }) {
  const existingEntries = Array.isArray(existingLog?.entries) ? existingLog.entries : [];
  const byDate = new Map();
  for (const entry of existingEntries) {
    if (entry && entry.tradingDate) {
      byDate.set(entry.tradingDate, entry);
    }
  }

  const coupons = ['umbs-60', 'umbs-65', 'umbs-70'];
  const errorsBp = {};
  for (const id of coupons) {
    const mod = modeledCloses?.[id];
    const act = actualCloses?.[id];
    if (Number.isFinite(mod) && Number.isFinite(act)) {
      errorsBp[id] = Math.round((mod - act) * 100);
    }
  }

  byDate.set(tradingDate, {
    tradingDate,
    source: source || 'EOD Benchmark',
    modeledCloses: modeledCloses || {},
    actualCloses: actualCloses || {},
    errorsBp,
    recordedAt: new Date().toISOString(),
  });

  // Sort newest first, keep rolling 60 trading days
  const entries = Array.from(byDate.values())
    .sort((a, b) => b.tradingDate.localeCompare(a.tradingDate))
    .slice(0, 60);

  // Rolling 20-day MAE (bp)
  const window20 = entries.slice(0, 20);
  const maeBp = {};
  let totalAbs = 0;
  let totalCount = 0;

  for (const id of coupons) {
    let sumAbs = 0;
    let count = 0;
    for (const e of window20) {
      const err = e?.errorsBp?.[id];
      if (typeof err === 'number' && Number.isFinite(err)) {
        sumAbs += Math.abs(err);
        count += 1;
        totalAbs += Math.abs(err);
        totalCount += 1;
      }
    }
    maeBp[id] = count > 0 ? Number((sumAbs / count).toFixed(1)) : null;
  }
  maeBp.overall = totalCount > 0 ? Number((totalAbs / totalCount).toFixed(1)) : null;

  return {
    updatedAt: new Date().toISOString(),
    sampleDays: window20.length,
    maeBp,
    entries,
  };
}

/**
 * Validates candidate EOD coupon closes before trusting them as next-day anchors.
 * Requires finite numbers inside [80, 120] and sensible coupon price ordering.
 */
function validateEodCloses(closes) {
  if (!closes || typeof closes !== 'object') return false;
  const p60 = closes['umbs-60'];
  const p65 = closes['umbs-65'];
  const p70 = closes['umbs-70'];

  if (!Number.isFinite(p60) || !Number.isFinite(p65)) return false;
  if (p60 < 80 || p60 > 120 || p65 < 80 || p65 > 120) return false;
  if (p65 <= p60) return false;

  if (p70 !== undefined && p70 !== null) {
    if (!Number.isFinite(p70) || p70 < 80 || p70 > 120 || p70 <= p65) return false;
  }
  return true;
}

/**
 * Best-effort EOD close anchor fetcher.
 * If `finraToken` is supplied (via FINRA_API_TOKEN secret), queries FINRA TRACE Agency Pass-Thru
 * TBA pricing first; otherwise returns null safely (never returns hardcoded fake prices).
 */
async function fetchEodAnchorCloses({ fetchImpl = fetch, finraToken = null } = {}) {
  if (finraToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetchImpl(
        'https://api.finra.org/data/group/fixedIncomeMarket/name/agencyPassThruTbaPricing',
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${finraToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            limit: 50,
            compareFilters: [
              { compareType: 'EQUAL', fieldName: 'amortizationTerm', fieldValue: '30YR' },
            ],
          }),
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const closes = {};
          for (const row of rows) {
            const coupon = parseFloat(row.couponRate || row.coupon);
            const price = parseFloat(row.lastSalePrice || row.closePrice || row.price);
            if (coupon === 6.0 && Number.isFinite(price)) closes['umbs-60'] = round2(price);
            if (coupon === 6.5 && Number.isFinite(price)) closes['umbs-65'] = round2(price);
            if (coupon === 7.0 && Number.isFinite(price)) closes['umbs-70'] = round2(price);
          }
          if (validateEodCloses(closes)) {
            return {
              source: 'FINRA TRACE EOD',
              closes,
            };
          }
        }
      }
    } catch (err) {
      console.warn('FINRA TRACE EOD fetch warning:', err.message);
    }
  }

  return null;
}

module.exports = {
  ET_TZ,
  DEFAULT_CALIBRATION,
  DEFAULT_INSTRUMENTS,
  CLASS_A_SETTLEMENT_DATES,
  mergeCalibration,
  getEtParts,
  getSifmaHolidays,
  getNyseHolidays,
  getSifmaEarlyCloseDates,
  isClassARollWindow,
  getBondMarketStatus,
  parseCnbcQuote,
  fetchCnbcBenchmarks,
  computeEffectiveDuration,
  computeCouponUpdate,
  buildLiveQuotesUpdate,
  updateCalibrationLog,
  validateEodCloses,
  fetchEodAnchorCloses,
};
