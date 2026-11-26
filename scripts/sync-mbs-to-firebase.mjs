// Local CLI helper & dry-run diagnostic for the server-side UMBS 30YR pricing engine.
// Usage:
//   node scripts/sync-mbs-to-firebase.mjs --dry-run
//   node scripts/sync-mbs-to-firebase.mjs   (requires Firestore write auth / token or Admin SDK in Cloud Functions)

import mbsPricingModel from '../functions-mbs/lib/mbsPricingModel.js';

const { fetchCnbcBenchmarks, buildLiveQuotesUpdate, getBondMarketStatus } = mbsPricingModel;

const FS_DOC_URL =
  'https://firestore.googleapis.com/v1/projects/imc-website-2026/databases/(default)/documents/marketWatch/liveQuotes';

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

function toFsValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFsValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = toFsValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  const forceOutsideHours = process.argv.includes('--force') || isDryRun;

  let existingDoc = null;
  try {
    const existingRes = await fetch(FS_DOC_URL);
    if (existingRes.ok) {
      const json = await existingRes.json();
      existingDoc = fromFsValue({ mapValue: { fields: json.fields || {} } });
    }
  } catch (err) {
    console.warn('Could not read existing Firestore liveQuotes:', err.message);
  }

  const now = new Date();
  const market = getBondMarketStatus(now);
  const benchmarks = await fetchCnbcBenchmarks();
  const result = buildLiveQuotesUpdate({
    existingDoc,
    benchmarks,
    now,
    forceUpdateOutsideHours: forceOutsideHours,
  });

  console.log('Market Status:', JSON.stringify(market, null, 2));
  console.log('CNBC Benchmarks:', JSON.stringify(benchmarks, null, 2));
  console.log('Model Telemetry:', JSON.stringify(result.doc.modelTelemetry, null, 2));
  console.log('Computed Instruments:', JSON.stringify(result.doc.instruments, null, 2));

  if (isDryRun) {
    console.log('--dry-run enabled: skipping Firestore write.');
    return;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.FIREBASE_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${process.env.FIREBASE_AUTH_TOKEN}`;
  }

  const fsRes = await fetch(FS_DOC_URL, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: toFsValue(result.doc).mapValue.fields }),
  });

  if (!fsRes.ok) {
    const errText = await fsRes.text();
    throw new Error(
      `Firestore PATCH failed (${fsRes.status}). Note: marketWatch writes require owner auth or Cloud Function syncMbsLiveQuotes/syncMbsNow. Details: ${errText}`
    );
  }
  console.log('Successfully updated Firestore liveQuotes!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
