/**
 * Automated U.S. Prime Rate & FOMC Target Range Updater
 *
 * Pulls free official Federal Reserve series from St. Louis Fed (FRED):
 *   - DPRIME   : Bank Prime Loan Rate (identical to Wall Street Journal Prime Rate)
 *   - DFEDTARU : Federal Funds Target Range - Upper Limit
 *   - DFEDTARL : Federal Funds Target Range - Lower Limit
 *
 * Uses FRED_API_KEY when present (GitHub Actions), and automatically falls back
 * to FRED's keyless public CSV endpoint if run locally without an API key.
 *
 * Note on FOMC timing:
 *   FOMC votes occur on Wednesday afternoon (2:00 PM ET). DFEDTARU/DFEDTARL update
 *   Thursday morning (the day after FOMC votes), and Prime Rate = DFEDTARU + 3.00%.
 *   By checking both DPRIME and DFEDTARU, this script captures new Prime Rate changes
 *   immediately on Thursday morning as well as confirming against H.15 DPRIME.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'src', 'data', 'primeRateData.json');
const API_KEY = process.env.FRED_API_KEY || '';

async function fetchFredSeries(seriesId, startDate) {
  if (API_KEY) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&observation_start=${startDate}&api_key=${API_KEY}&file_type=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FRED API ${seriesId} failed: ${res.status}`);
    const json = await res.json();
    return (json.observations || [])
      .filter((o) => o.value !== '.' && !Number.isNaN(parseFloat(o.value)))
      .map((o) => ({ date: o.date, value: parseFloat(o.value) }));
  }

  // Keyless public CSV fallback
  const csvUrl = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&cosd=${startDate}`;
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error(`FRED CSV ${seriesId} failed: ${res.status}`);
  const text = await res.text();
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, valStr] = line.split(',');
      const value = parseFloat(valStr);
      return { date, value };
    })
    .filter((o) => o.date && !Number.isNaN(o.value));
}

function formatPct(num) {
  return Number(num).toFixed(2);
}

async function updatePrimeRateData() {
  const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  // Pull 11 years of observations so we know the prior rate before the 10-year cutoff
  const now = new Date();
  const elevenYearsAgo = new Date(now.getFullYear() - 11, now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate())
    .toISOString()
    .slice(0, 10);

  console.log(`Fetching FRED DPRIME, DFEDTARU, DFEDTARL since ${elevenYearsAgo}...`);
  const [dprimeObs, upperObs, lowerObs] = await Promise.all([
    fetchFredSeries('DPRIME', elevenYearsAgo),
    fetchFredSeries('DFEDTARU', elevenYearsAgo),
    fetchFredSeries('DFEDTARL', elevenYearsAgo),
  ]);

  if (!dprimeObs.length || !upperObs.length || !lowerObs.length) {
    throw new Error('Incomplete FRED series response; aborting update.');
  }

  // Extract every date where DPRIME changed
  const allChangesAsc = [];
  let prevRate = dprimeObs[0].value;

  for (let i = 1; i < dprimeObs.length; i++) {
    const curr = dprimeObs[i];
    if (Math.abs(curr.value - prevRate) >= 0.001) {
      allChangesAsc.push({
        date: curr.date,
        rate: Number(curr.value.toFixed(2)),
        previousRate: Number(prevRate.toFixed(2)),
        change: Number((curr.value - prevRate).toFixed(2)),
      });
      prevRate = curr.value;
    }
  }

  // Day-after-FOMC fast check: DFEDTARU updates Thursday morning before Friday's H.15 DPRIME release
  const latestUpper = upperObs[upperObs.length - 1];
  const latestLower = lowerObs[lowerObs.length - 1];
  const impliedPrime = Number((latestUpper.value + 3.0).toFixed(2));
  const lastRecordedChange = allChangesAsc[allChangesAsc.length - 1];

  if (
    lastRecordedChange &&
    latestUpper.date > lastRecordedChange.date &&
    Math.abs(impliedPrime - lastRecordedChange.rate) >= 0.001
  ) {
    allChangesAsc.push({
      date: latestUpper.date,
      rate: impliedPrime,
      previousRate: lastRecordedChange.rate,
      change: Number((impliedPrime - lastRecordedChange.rate).toFixed(2)),
    });
  }

  // Filter strictly to the rolling 10-year window, sorted most recent on top -> oldest on bottom
  const tenYearChangesDesc = allChangesAsc
    .filter((c) => c.date >= tenYearsAgo)
    .reverse();

  const latestChange = tenYearChangesDesc[0] || lastRecordedChange;
  const currentPrimeRate = latestChange ? latestChange.rate : impliedPrime;
  const currentEffectiveDate = latestChange ? latestChange.date : latestUpper.date;

  // Determine the most recent completed FOMC meeting date from schedule
  const todayStr = now.toISOString().slice(0, 10);
  const schedule = existing.fomcSchedule || [];
  const pastMeetings = schedule.filter((d) => d <= todayStr);
  const lastFomcDate =
    pastMeetings.length > 0 ? pastMeetings[pastMeetings.length - 1] : existing.lastFomcMeeting?.date;

  // Check if the latest rate change happened within 5 days of the last FOMC meeting
  let action = 'maintained';
  let summary = `The FOMC voted to keep the target range for the federal funds rate at ${formatPct(
    latestLower.value
  )}% – ${formatPct(latestUpper.value)}%. Therefore, the U.S. Prime Rate continues at ${formatPct(
    currentPrimeRate
  )}%.`;

  if (lastFomcDate && latestChange) {
    const diffDays =
      (new Date(latestChange.date) - new Date(lastFomcDate)) / (1000 * 60 * 60 * 24);
    if (diffDays >= -1 && diffDays <= 5) {
      if (latestChange.change > 0) {
        action = 'raised';
        summary = `The FOMC voted to raise the target range for the federal funds rate to ${formatPct(
          latestLower.value
        )}% – ${formatPct(latestUpper.value)}%, increasing the U.S. Prime Rate by +${formatPct(
          latestChange.change
        )}% to ${formatPct(currentPrimeRate)}%.`;
      } else if (latestChange.change < 0) {
        action = 'lowered';
        summary = `The FOMC voted to lower the target range for the federal funds rate to ${formatPct(
          latestLower.value
        )}% – ${formatPct(latestUpper.value)}%, reducing the U.S. Prime Rate by ${formatPct(
          latestChange.change
        )}% to ${formatPct(currentPrimeRate)}%.`;
      }
    }
  }

  const updatedPayload = {
    lastChecked: todayStr,
    currentPrimeRate,
    currentEffectiveDate,
    fedFundsTargetLower: Number(latestLower.value.toFixed(2)),
    fedFundsTargetUpper: Number(latestUpper.value.toFixed(2)),
    lastFomcMeeting: {
      date: lastFomcDate,
      action,
      summary,
    },
    fomcSchedule: schedule,
    changes: tenYearChangesDesc,
  };

  // Only rewrite file if meaningful data (rate, FOMC meeting, or 10-year table) actually changed
  const compareKey = (obj) =>
    JSON.stringify({
      currentPrimeRate: obj.currentPrimeRate,
      currentEffectiveDate: obj.currentEffectiveDate,
      fedFundsTargetLower: obj.fedFundsTargetLower,
      fedFundsTargetUpper: obj.fedFundsTargetUpper,
      lastFomcMeeting: obj.lastFomcMeeting,
      changes: obj.changes,
    });

  if (compareKey(existing) === compareKey(updatedPayload)) {
    console.log(
      `No Prime Rate or FOMC status change detected (Current Prime: ${formatPct(
        currentPrimeRate
      )}%).`
    );
    return;
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(updatedPayload, null, 2) + '\n');
  console.log(
    `Updated src/data/primeRateData.json! Current Prime: ${formatPct(
      currentPrimeRate
    )}% (${tenYearChangesDesc.length} changes in last 10 years).`
  );
}

updatePrimeRateData().catch((err) => {
  console.error(err);
  process.exit(1);
});
