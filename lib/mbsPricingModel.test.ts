import { describe, it, expect } from 'vitest';
import mbsPricingModel from '../functions-mbs/lib/mbsPricingModel.js';

const {
  DEFAULT_CALIBRATION,
  getSifmaHolidays,
  getSifmaEarlyCloseDates,
  isClassARollWindow,
  getBondMarketStatus,
  computeEffectiveDuration,
  computeCouponUpdate,
  buildLiveQuotesUpdate,
  updateCalibrationLog,
  validateEodCloses,
} = mbsPricingModel;

describe('mbsPricingModel', () => {
  describe('5Y / 7Y / 10Y key-rate weighting', () => {
    it('moves UMBS 7.0% more on a 5Y-led selloff than when only 10Y moves', () => {
      const benchmarks10YOnly = {
        us5y: { last: 4.10, prevClose: 4.10 },
        us7y: { last: 4.20, prevClose: 4.20 },
        us10y: { last: 4.40, prevClose: 4.30 }, // +10bp 10Y only
        mtba: null,
      };
      const benchmarks5YLed = {
        us5y: { last: 4.20, prevClose: 4.10 }, // +10bp 5Y only
        us7y: { last: 4.20, prevClose: 4.20 },
        us10y: { last: 4.30, prevClose: 4.30 },
        mtba: null,
      };

      const res70On10Y = computeCouponUpdate({
        couponId: 'umbs-70',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: benchmarks10YOnly,
        isEquityMarketOpen: false,
        calibration: DEFAULT_CALIBRATION,
      });

      const res70On5Y = computeCouponUpdate({
        couponId: 'umbs-70',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: benchmarks5YLed,
        isEquityMarketOpen: false,
        calibration: DEFAULT_CALIBRATION,
      });

      const drop10Y = 100.0 - res70On10Y.last;
      const drop5Y = 100.0 - res70On5Y.last;
      expect(drop5Y).toBeGreaterThan(drop10Y * 4);
    });
  });

  describe('Price-aware effective duration & negative convexity', () => {
    it('compresses effective duration above par and extends below par', () => {
      const cfg = DEFAULT_CALIBRATION.coupons['umbs-65'];
      const durAtPar = computeEffectiveDuration(100.0, cfg);
      const durAbovePar = computeEffectiveDuration(104.0, cfg);
      const durBelowPar = computeEffectiveDuration(96.0, cfg);

      expect(durAbovePar).toBeLessThan(durAtPar);
      expect(durBelowPar).toBeGreaterThan(durAtPar);
    });

    it('produces larger price loss on a +50bp yield selloff than gain on a -50bp rally', () => {
      const selloff = {
        us5y: { last: 4.5, prevClose: 4.0 },
        us7y: { last: 4.5, prevClose: 4.0 },
        us10y: { last: 4.5, prevClose: 4.0 },
        mtba: null,
      };
      const rally = {
        us5y: { last: 3.5, prevClose: 4.0 },
        us7y: { last: 3.5, prevClose: 4.0 },
        us10y: { last: 3.5, prevClose: 4.0 },
        mtba: null,
      };

      const downRes = computeCouponUpdate({
        couponId: 'umbs-60',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: selloff,
        isEquityMarketOpen: false,
        calibration: DEFAULT_CALIBRATION,
      });
      const upRes = computeCouponUpdate({
        couponId: 'umbs-60',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: rally,
        isEquityMarketOpen: false,
        calibration: DEFAULT_CALIBRATION,
      });

      const lossPts = 100.0 - downRes.last;
      const gainPts = upRes.last - 100.0;
      expect(lossPts).toBeGreaterThan(gainPts);
    });
  });

  describe('MTBA residual basis adjustment', () => {
    const flatRatesWithStrongMtba = {
      us5y: { last: 4.1, prevClose: 4.1 },
      us7y: { last: 4.2, prevClose: 4.2 },
      us10y: { last: 4.3, prevClose: 4.3 },
      mtba: { last: 50.5, prevClose: 50.0 }, // +1.0% vs flat Treasuries
    };

    it('applies MTBA residual basis only when NYSE equity hours are open', () => {
      const duringEquity = computeCouponUpdate({
        couponId: 'umbs-60',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: flatRatesWithStrongMtba,
        isEquityMarketOpen: true,
        calibration: DEFAULT_CALIBRATION,
      });
      const outsideEquity = computeCouponUpdate({
        couponId: 'umbs-60',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: flatRatesWithStrongMtba,
        isEquityMarketOpen: false,
        calibration: DEFAULT_CALIBRATION,
      });

      expect(duringEquity.mtbaUsed).toBe(true);
      expect(duringEquity.last).toBeGreaterThan(100.0);
      expect(outsideEquity.mtbaUsed).toBe(false);
      expect(outsideEquity.last).toBe(100.0);
    });

    it('clamps basis adjustment at ±0.35 pts and ignores >4% ETF outlier prints', () => {
      const largeNormalMtba = {
        us5y: { last: 4.1, prevClose: 4.1 },
        us7y: { last: 4.2, prevClose: 4.2 },
        us10y: { last: 4.3, prevClose: 4.3 },
        mtba: { last: 51.8, prevClose: 50.0 }, // +3.6% (within 4%, hits 0.35 clamp)
      };
      const clampedRes = computeCouponUpdate({
        couponId: 'umbs-60',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: largeNormalMtba,
        isEquityMarketOpen: true,
        calibration: DEFAULT_CALIBRATION,
      });
      expect(clampedRes.last).toBeLessThanOrEqual(100.35);
      expect(clampedRes.basisBp).toBe(35);

      const outlierMtba = {
        ...largeNormalMtba,
        mtba: { last: 53.0, prevClose: 50.0 }, // +6.0% outlier -> ignored
      };
      const outlierRes = computeCouponUpdate({
        couponId: 'umbs-60',
        openPrice: 100.0,
        existingHigh: 100.0,
        existingLow: 100.0,
        isNewTradingDay: true,
        benchmarks: outlierMtba,
        isEquityMarketOpen: true,
        calibration: DEFAULT_CALIBRATION,
      });
      expect(outlierRes.mtbaUsed).toBe(false);
      expect(outlierRes.last).toBe(100.0);
    });
  });

  describe('Daily reset, lock auto-release, and anchor priority', () => {
    // Wed 2026-11-25 11:00 AM ET (16:00 UTC) -> Bond Market Open
    const openTime = new Date('2026-11-25T16:00:00Z');
    const benchmarks = {
      us5y: { last: 4.15, prevClose: 4.15, high: 4.16, low: 4.14 },
      us7y: { last: 4.25, prevClose: 4.25, high: 4.26, low: 4.24 },
      us10y: { last: 4.35, prevClose: 4.35, high: 4.36, low: 4.34 },
      mtba: { last: 50.0, prevClose: 50.0, high: 50.0, low: 50.0 },
    };

    it('resets open/high/low cleanly with no +0.03 artificial padding and auto-releases stale manualLock', () => {
      const priorDayDoc = {
        tradingDate: '2026-11-24',
        manualLock: true,
        manualLockDate: '2026-11-24',
        instruments: [
          { id: 'umbs-65', open: 101.0, last: 101.42, high: 101.99, low: 100.50 },
          { id: 'umbs-70', open: 102.5, last: 102.88, high: 103.50, low: 102.10 },
          { id: 'umbs-60', open: 99.1, last: 99.75, high: 100.25, low: 98.90 },
          { id: 'us-10yr', open: 4.3, last: 4.32, high: 4.4, low: 4.25 },
        ],
      };

      const { skippedMarketClosed, doc } = buildLiveQuotesUpdate({
        existingDoc: priorDayDoc,
        benchmarks,
        now: openTime,
      });

      expect(skippedMarketClosed).toBe(false);
      expect(doc.manualLock).toBe(false);
      expect(doc.tradingDate).toBe('2026-11-25');
      expect(doc.anchorSource).toBe('Prior Day Close');

      const umbs60 = doc.instruments.find((i) => i.id === 'umbs-60');
      expect(umbs60.open).toBe(99.75);
      expect(umbs60.last).toBe(99.75);
      // No artificial +0.03 / -0.03 padding
      expect(umbs60.high).toBe(99.75);
      expect(umbs60.low).toBe(99.75);
    });

    it('prioritizes same-day deskAnchor over pendingNextOpen and prior close', () => {
      const docWithAnchors = {
        tradingDate: '2026-11-24',
        deskAnchor: {
          tradingDate: '2026-11-25',
          prices: { 'umbs-60': 99.90, 'umbs-65': 101.60, 'umbs-70': 103.10 },
        },
        pendingNextOpen: {
          source: 'FINRA TRACE EOD',
          prices: { 'umbs-60': 99.50, 'umbs-65': 101.20, 'umbs-70': 102.80 },
        },
        instruments: [
          { id: 'umbs-65', open: 101.0, last: 101.10, high: 101.10, low: 101.0 },
          { id: 'umbs-70', open: 102.5, last: 102.60, high: 102.60, low: 102.5 },
          { id: 'umbs-60', open: 99.1, last: 99.20, high: 99.20, low: 99.1 },
          { id: 'us-10yr', open: 4.3, last: 4.32, high: 4.4, low: 4.25 },
        ],
      };

      const { doc } = buildLiveQuotesUpdate({
        existingDoc: docWithAnchors,
        benchmarks,
        now: openTime,
      });

      expect(doc.anchorSource).toBe('Desk Anchor');
      expect(doc.instruments.find((i) => i.id === 'umbs-60').open).toBe(99.90);
      expect(doc.pendingNextOpen).toBeNull();
    });

    it('uses pendingNextOpen on a new trading day when no deskAnchor exists', () => {
      const docWithPending = {
        tradingDate: '2026-11-24',
        pendingNextOpen: {
          source: 'FINRA TRACE EOD',
          prices: { 'umbs-60': 99.55, 'umbs-65': 101.25, 'umbs-70': 102.85 },
        },
        instruments: [
          { id: 'umbs-65', open: 101.0, last: 101.10, high: 101.10, low: 101.0 },
          { id: 'umbs-70', open: 102.5, last: 102.60, high: 102.60, low: 102.5 },
          { id: 'umbs-60', open: 99.1, last: 99.20, high: 99.20, low: 99.1 },
          { id: 'us-10yr', open: 4.3, last: 4.32, high: 4.4, low: 4.25 },
        ],
      };

      const { doc } = buildLiveQuotesUpdate({
        existingDoc: docWithPending,
        benchmarks,
        now: openTime,
      });

      expect(doc.anchorSource).toBe('FINRA TRACE EOD');
      expect(doc.instruments.find((i) => i.id === 'umbs-65').open).toBe(101.25);
    });
  });

  describe('SIFMA bond calendar & Class A roll detection', () => {
    it('identifies key SIFMA bond holidays including Good Friday, Columbus Day, Veterans Day, Thanksgiving, and observed Christmas', () => {
      const h2026 = getSifmaHolidays(2026);
      expect(h2026.get('2026-04-03')).toBe('Good Friday');
      expect(h2026.get('2026-10-12')).toBe('Columbus Day');
      expect(h2026.get('2026-11-11')).toBe('Veterans Day');
      expect(h2026.get('2026-11-26')).toBe('Thanksgiving Day');
      expect(h2026.get('2026-12-25')).toBe('Christmas Day');

      // July 4, 2026 is Saturday -> observed Friday July 3, 2026
      expect(h2026.get('2026-07-03')).toBe('Independence Day');

      // Christmas 2027 falls on Saturday -> observed Friday Dec 24, 2027
      const h2027 = getSifmaHolidays(2027);
      expect(h2027.get('2027-12-24')).toBe('Christmas Day');
    });

    it('treats Columbus Day / Veterans Day as bond holiday while equity market remains open', () => {
      // Veterans Day 2026-11-11 11:00 AM ET (16:00 UTC)
      const veteransStatus = getBondMarketStatus(new Date('2026-11-11T16:00:00Z'));
      expect(veteransStatus.status).toBe('holiday');
      expect(veteransStatus.statusLabel).toContain('Veterans Day');
      expect(veteransStatus.isEquityMarketOpen).toBe(true);
    });

    it('handles 2:00 PM ET early close on the day after Thanksgiving', () => {
      const early2026 = getSifmaEarlyCloseDates(2026);
      expect(early2026.has('2026-11-27')).toBe(true);

      // 1:30 PM ET on day after Thanksgiving (18:30 UTC) -> open (early close)
      const openEarly = getBondMarketStatus(new Date('2026-11-27T18:30:00Z'));
      expect(openEarly.status).toBe('open');
      expect(openEarly.isEarlyClose).toBe(true);

      // 2:30 PM ET on day after Thanksgiving (19:30 UTC) -> after-hours
      const closedEarly = getBondMarketStatus(new Date('2026-11-27T19:30:00Z'));
      expect(closedEarly.status).toBe('after-hours');
    });

    it('detects monthly Class A UMBS TBA roll window', () => {
      // 2026-11-12 is Class A settlement (Nov 11 Veterans Day skipped -> Nov 9 is T-2)
      const inRoll = isClassARollWindow('2026-11-12');
      const notifyDay = isClassARollWindow('2026-11-09');
      const normalDay = isClassARollWindow('2026-11-25');

      expect(inRoll.isRollWindow).toBe(true);
      expect(notifyDay.isRollWindow).toBe(true);
      expect(normalDay.isRollWindow).toBe(false);
    });
  });

  describe('Calibration log & EOD validation', () => {
    it('maintains rolling 20-day MAE (bp) correctly', () => {
      let log = null;
      for (let d = 1; d <= 22; d++) {
        const dayStr = `2026-10-${String(d).padStart(2, '0')}`;
        // Days 1-2 have huge 100bp errors that drop out of the latest 20-day window;
        // Days 3-22 have consistent 4bp, 6bp, 2bp errors (avg = 4.0bp)
        const offset60 = d <= 2 ? 1.0 : 0.04;
        const offset65 = d <= 2 ? 1.0 : -0.06;
        const offset70 = d <= 2 ? 1.0 : 0.02;

        log = updateCalibrationLog(log, {
          tradingDate: dayStr,
          modeledCloses: {
            'umbs-60': 100.0 + offset60,
            'umbs-65': 101.0 + offset65,
            'umbs-70': 102.0 + offset70,
          },
          actualCloses: {
            'umbs-60': 100.0,
            'umbs-65': 101.0,
            'umbs-70': 102.0,
          },
          source: 'FINRA TRACE EOD',
        });
      }

      expect(log.sampleDays).toBe(20);
      expect(log.entries.length).toBe(22);
      expect(log.entries[0].tradingDate).toBe('2026-10-22');
      expect(log.maeBp['umbs-60']).toBe(4.0);
      expect(log.maeBp['umbs-65']).toBe(6.0);
      expect(log.maeBp['umbs-70']).toBe(2.0);
      expect(log.maeBp.overall).toBe(4.0);
    });

    it('validates EOD closes for range and coupon ordering', () => {
      expect(
        validateEodCloses({ 'umbs-60': 99.5, 'umbs-65': 101.2, 'umbs-70': 102.7 })
      ).toBe(true);
      expect(
        validateEodCloses({ 'umbs-60': 102.0, 'umbs-65': 101.0 }) // inverted coupons
      ).toBe(false);
      expect(validateEodCloses({ 'umbs-60': 15.0, 'umbs-65': 101.0 })).toBe(false);
    });
  });
});
