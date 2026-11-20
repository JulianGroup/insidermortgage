// Syncs the US 10-Year T-Note (Tradeweb US10Y) Daily Session Log (5:00 AM PT -> 12:30 PM PT)
// into Cloud Firestore: projects/imc-website-2026/databases/(default)/documents/marketWatch/us10yrDailyLog
// Merges with any existing logged dates so historical trading days accumulate indefinitely.

import {
  fetchUs10YrDailyFactsFromCnbc,
  mergeAndFinalizeDailyLog,
} from '../src/lib/us10yrDailyLog.js';

const FS_DOC_URL =
  'https://firestore.googleapis.com/v1/projects/imc-website-2026/databases/(default)/documents/marketWatch/us10yrDailyLog';

function fromFsValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('integerValue' in v) return Number(v.integerValue);
  if ('booleanValue' in v) return Boolean(v.booleanValue);
  if ('nullValue' in v) return null;
  if ('mapValue' in v) {
    const out = {};
    for (const [k, val] of Object.entries(v.mapValue.fields || {})) {
      out[k] = fromFsValue(val);
    }
    return out;
  }
  if ('arrayValue' in v) {
    return (v.arrayValue.values || []).map(fromFsValue);
  }
  return null;
}

function toFsRow(r) {
  return {
    mapValue: {
      fields: {
        date: { stringValue: String(r.date) },
        openingYield: { doubleValue: Number(r.openingYield) },
        intradayHigh: { doubleValue: Number(r.intradayHigh) },
        timeOfHigh: { stringValue: String(r.timeOfHigh) },
        intradayLow: { doubleValue: Number(r.intradayLow) },
        timeOfLow: { stringValue: String(r.timeOfLow) },
        closingYield: { doubleValue: Number(r.closingYield) },
        openToCloseBp: { doubleValue: Number(r.openToCloseBp) },
        dailyChangeBp:
          r.dailyChangeBp === null || r.dailyChangeBp === undefined
            ? { nullValue: null }
            : { doubleValue: Number(r.dailyChangeBp) },
        intradayRangeBp: { doubleValue: Number(r.intradayRangeBp) },
        isLiveSession: { booleanValue: Boolean(r.isLiveSession) },
      },
    },
  };
}

async function run() {
  let existingRows = [];
  try {
    const getRes = await fetch(FS_DOC_URL);
    if (getRes.ok) {
      const fsJson = await getRes.json();
      const parsed = fromFsValue(fsJson?.fields?.rows);
      if (Array.isArray(parsed)) {
        existingRows = parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read existing Firestore daily log (starting fresh):', err.message);
  }

  const freshRows = await fetchUs10YrDailyFactsFromCnbc(45);
  const merged = mergeAndFinalizeDailyLog(existingRows, freshRows);

  const payload = {
    fields: {
      updatedAt: { stringValue: new Date().toISOString() },
      source: { stringValue: 'Tradeweb US10Y (5m Intraday Bars)' },
      sessionWindow: { stringValue: '5:00 AM – 12:30 PM Pacific' },
      rows: {
        arrayValue: {
          values: merged.map(toFsRow),
        },
      },
    },
  };

  const patchRes = await fetch(FS_DOC_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!patchRes.ok) {
    throw new Error(`Firestore PATCH failed: ${patchRes.status} ${await patchRes.text()}`);
  }

  console.log(
    `Synced ${merged.length} trading days to Firestore marketWatch/us10yrDailyLog (latest: ${merged[0]?.date || 'none'}).`
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
