const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const {
  getBondMarketStatus,
  fetchCnbcBenchmarks,
  buildLiveQuotesUpdate,
  fetchEodAnchorCloses,
  updateCalibrationLog,
} = require('./lib/mbsPricingModel');
const {
  fetchUs10YrDailyFactsFromCnbc,
  mergeAndFinalizeDailyLog,
} = require('./lib/us10yrDailyLog');

initializeApp();
const db = getFirestore();

const OWNER_EMAILS = new Set([
  'rakeshjain100@gmail.com',
  'rjain@insidermtg.com',
  'davidsider@gmail.com',
  'dsider@insidermtg.com',
]);

exports.syncMbsLiveQuotes = onSchedule(
  {
    schedule: '*/3 8-17 * * 1-5',
    timeZone: 'America/New_York',
    region: 'us-central1',
    timeoutSeconds: 30,
  },
  async () => {
    const now = new Date();
    const liveRef = db.collection('marketWatch').doc('liveQuotes');
    const calRef = db.collection('marketWatch').doc('calibrationConfig');

    const [liveSnap, calSnap] = await Promise.all([liveRef.get(), calRef.get()]);
    const existingDoc = liveSnap.exists ? liveSnap.data() : null;
    const calibrationOverride = calSnap.exists ? calSnap.data() : null;

    const market = getBondMarketStatus(now);
    if (market.status !== 'open') {
      const statusChanged =
        existingDoc?.marketStatus !== market.status ||
        existingDoc?.marketStatusLabel !== market.statusLabel ||
        existingDoc?.modelTelemetry?.isRollWindow !== market.isRollWindow;

      if (statusChanged && existingDoc) {
        await liveRef.set(
          {
            marketStatus: market.status,
            marketStatusLabel: market.statusLabel,
            statusCheckedAt: now.toISOString(),
            modelTelemetry: {
              ...(existingDoc.modelTelemetry || {}),
              isRollWindow: market.isRollWindow,
              rollNote: market.rollNote,
              isEarlyClose: market.isEarlyClose,
              isEquityMarketOpen: market.isEquityMarketOpen,
            },
          },
          { merge: true }
        );
      }
      return;
    }

    const benchmarks = await fetchCnbcBenchmarks();
    const result = buildLiveQuotesUpdate({
      existingDoc,
      benchmarks,
      now,
      calibrationOverride,
      forceUpdateOutsideHours: false,
    });

    await liveRef.set(result.doc);
  }
);

exports.syncMbsEodAnchor = onSchedule(
  {
    schedule: '15 17 * * 1-5',
    timeZone: 'America/New_York',
    region: 'us-central1',
    timeoutSeconds: 60,
  },
  async () => {
    const now = new Date();
    const market = getBondMarketStatus(now);
    if (market.status === 'holiday') {
      return;
    }

    const liveRef = db.collection('marketWatch').doc('liveQuotes');
    const logRef = db.collection('marketWatch').doc('calibrationLog');

    const [liveSnap, logSnap] = await Promise.all([liveRef.get(), logRef.get()]);
    const existingDoc = liveSnap.exists ? liveSnap.data() : null;
    const existingLog = logSnap.exists ? logSnap.data() : null;

    const modeledCloses = {};
    for (const inst of existingDoc?.instruments || []) {
      if (inst && inst.type === 'mbs' && Number.isFinite(Number(inst.last))) {
        modeledCloses[inst.id] = Number(inst.last);
      }
    }

    const eodResult = await fetchEodAnchorCloses({
      finraToken: process.env.FINRA_API_TOKEN || null,
    });

    const livePatch = {
      marketStatus: 'after-hours',
      marketStatusLabel: 'After Hours • Prior Close',
      statusCheckedAt: now.toISOString(),
    };

    if (eodResult?.closes) {
      const updatedLog = updateCalibrationLog(existingLog, {
        tradingDate: existingDoc?.tradingDate || market.tradingDate,
        modeledCloses,
        actualCloses: eodResult.closes,
        source: eodResult.source,
      });
      await logRef.set(updatedLog);

      livePatch.pendingNextOpen = {
        fromDate: existingDoc?.tradingDate || market.tradingDate,
        source: eodResult.source,
        prices: eodResult.closes,
      };
    }

    await liveRef.set(livePatch, { merge: true });
  }
);

exports.syncUs10YrDailyLog = onSchedule(
  {
    schedule: '35 12 * * 1-5',
    timeZone: 'America/Los_Angeles',
    region: 'us-central1',
    timeoutSeconds: 60,
  },
  async () => {
    const logRef = db.collection('marketWatch').doc('us10yrDailyLog');
    const snap = await logRef.get();
    const existingRows = snap.exists && Array.isArray(snap.data()?.rows) ? snap.data().rows : [];

    const freshRows = await fetchUs10YrDailyFactsFromCnbc(45);
    if (!freshRows.length) return;

    const merged = mergeAndFinalizeDailyLog(existingRows, freshRows);
    await logRef.set(
      {
        updatedAt: new Date().toISOString(),
        source: 'Tradeweb US10Y (5m Intraday Bars)',
        sessionWindow: '5:00 AM – 12:30 PM Pacific',
        rows: merged,
      },
      { merge: true }
    );
  }
);

exports.syncMbsNow = onCall(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    if (!request.auth || !request.auth.token?.email_verified) {
      throw new HttpsError('unauthenticated', 'Verified sign-in is required.');
    }

    const email = (request.auth.token.email || '').toLowerCase();
    if (!OWNER_EMAILS.has(email)) {
      throw new HttpsError(
        'permission-denied',
        'Only owners (Rakesh or David) may trigger a live MBS sync.'
      );
    }

    const now = new Date();
    const liveRef = db.collection('marketWatch').doc('liveQuotes');
    const calRef = db.collection('marketWatch').doc('calibrationConfig');

    const [liveSnap, calSnap] = await Promise.all([liveRef.get(), calRef.get()]);
    const existingDoc = liveSnap.exists ? liveSnap.data() : null;
    const calibrationOverride = calSnap.exists ? calSnap.data() : null;

    const benchmarks = await fetchCnbcBenchmarks();
    const result = buildLiveQuotesUpdate({
      existingDoc,
      benchmarks,
      now,
      calibrationOverride,
      forceUpdateOutsideHours: true,
    });

    await liveRef.set(result.doc);

    return {
      ok: true,
      triggeredBy: email,
      updatedAt: result.doc.updatedAt,
      tradingDate: result.doc.tradingDate,
      marketStatusLabel: result.doc.marketStatusLabel,
      instruments: result.doc.instruments,
    };
  }
);
