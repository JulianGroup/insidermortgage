import { describe, it, expect } from 'vitest';
import {
  detectPropertyState,
  extractStreetAddress,
  getFormattedDateForFilename,
  getRentalReportPdfFileName,
} from './stateDetector';

describe('Rental Analyzer State Detector & Filename Formatter', () => {
  it('detects California properties (David & Rakesh)', () => {
    const res1 = detectPropertyState('535 Tam O Shanter Dr, San Marcos, CA 92069');
    expect(res1.isRakeshOnly).toBe(false);
    expect(res1.stateCode).toBe('CA');

    const res2 = detectPropertyState('6234 Crawford St, San Diego, California 92120');
    expect(res2.isRakeshOnly).toBe(false);
    expect(res2.stateCode).toBe('CA');

    // Edge case: street name has "Washington", but state is CA
    const res3 = detectPropertyState('123 Washington St, San Diego, CA 92103');
    expect(res3.isRakeshOnly).toBe(false);
    expect(res3.stateCode).toBe('CA');
  });

  it('detects Utah properties (Rakesh Only)', () => {
    const res1 = detectPropertyState('100 South Main St, Salt Lake City, UT 84101');
    expect(res1.isRakeshOnly).toBe(true);
    expect(res1.stateCode).toBe('UT');
    expect(res1.rakeshLicense).toBe('UDRE #13917645');

    const res2 = detectPropertyState('250 East 100 South, Provo, Utah');
    expect(res2.isRakeshOnly).toBe(true);
    expect(res2.stateCode).toBe('UT');
  });

  it('detects Washington State properties (Rakesh Only)', () => {
    const res1 = detectPropertyState('789 Pine St, Seattle, WA 98101');
    expect(res1.isRakeshOnly).toBe(true);
    expect(res1.stateCode).toBe('WA');
    expect(res1.rakeshLicense).toBe('WA MLO-240594');

    const res2 = detectPropertyState('1200 4th Ave, Seattle, Washington');
    expect(res2.isRakeshOnly).toBe(true);
    expect(res2.stateCode).toBe('WA');

    // Handles user typo "Washingston State"
    const res3 = detectPropertyState('500 Olympic Way, Tacoma, Washingston State 98402');
    expect(res3.isRakeshOnly).toBe(true);
    expect(res3.stateCode).toBe('WA');
  });

  it('detects Florida properties (Rakesh Only)', () => {
    const res1 = detectPropertyState('456 Ocean Dr, Miami, FL 33139');
    expect(res1.isRakeshOnly).toBe(true);
    expect(res1.stateCode).toBe('FL');
    expect(res1.rakeshLicense).toBe('FL Lic #LO121680');

    const res2 = detectPropertyState('100 Biscayne Blvd, Miami, Florida');
    expect(res2.isRakeshOnly).toBe(true);
    expect(res2.stateCode).toBe('FL');
  });

  it('detects Arizona properties (Rakesh Only)', () => {
    const res1 = detectPropertyState('101 Desert Ridge, Phoenix, AZ 85001');
    expect(res1.isRakeshOnly).toBe(true);
    expect(res1.stateCode).toBe('AZ');
    expect(res1.rakeshLicense).toBe('AZ Lic #1050797');

    const res2 = detectPropertyState('500 Camelback Rd, Scottsdale, Arizona 85251');
    expect(res2.isRakeshOnly).toBe(true);
    expect(res2.stateCode).toBe('AZ');
  });

  it('defaults to California (David & Rakesh) when address is empty or unspecified', () => {
    const res = detectPropertyState('');
    expect(res.isRakeshOnly).toBe(false);
    expect(res.stateCode).toBe('CA');
  });

  it('extracts street address properly', () => {
    expect(extractStreetAddress('535 Tam O Shanter Dr, San Marcos, CA 92069')).toBe(
      '535 Tam O Shanter Dr'
    );
    expect(extractStreetAddress('6234 Crawford St, San Diego, CA 92120')).toBe(
      '6234 Crawford St'
    );
    expect(extractStreetAddress('Normal Heights Fourplex, San Diego, CA 92116')).toBe(
      'Normal Heights Fourplex'
    );
    expect(extractStreetAddress('123 Main St')).toBe('123 Main St');
    expect(extractStreetAddress('')).toBe('Rental Property');
  });

  it('formats the PDF filename as "Insider Mortgage - Street Address - YYYY-MM-DD"', () => {
    const testDate = new Date('2026-11-11T12:00:00Z');
    const dateStr = getFormattedDateForFilename(testDate);
    expect(dateStr).toBe('2026-11-11');

    const fileName = getRentalReportPdfFileName(
      '535 Tam O Shanter Dr, San Marcos, CA 92069',
      testDate
    );
    expect(fileName).toBe('Insider Mortgage - 535 Tam O Shanter Dr - 2026-11-11');

    const fileName2 = getRentalReportPdfFileName(
      '6234 Crawford St, San Diego, CA 92120',
      testDate
    );
    expect(fileName2).toBe('Insider Mortgage - 6234 Crawford St - 2026-11-11');
  });
});
