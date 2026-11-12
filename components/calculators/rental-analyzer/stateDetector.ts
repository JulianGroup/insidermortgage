export interface StateContactInfo {
  isRakeshOnly: boolean;
  stateCode: 'AZ' | 'CA' | 'FL' | 'UT' | 'WA' | 'OTHER';
  stateName: string;
  rakeshLicense: string;
  c2License: string;
}

/**
 * Detects whether the property address belongs to Utah, Washington State, Florida, or Arizona.
 * If in any of these 4 states, only Rakesh Jain's contact info is used (David Sider is only licensed in CA).
 * Otherwise (e.g. California or default), both David Sider and Rakesh Jain are included.
 */
export function detectPropertyState(address: string): StateContactInfo {
  if (!address || !address.trim()) {
    return {
      isRakeshOnly: false,
      stateCode: 'CA',
      stateName: 'California',
      rakeshLicense: 'CA DRE #01336748',
      c2License: 'CA DRE #01821025',
    };
  }

  const raw = address.trim();
  const segments = raw.split(',').map((s) => s.trim());
  const lastSegment = segments[segments.length - 1] || '';
  const secondLastSegment = segments.length > 1 ? segments[segments.length - 2] : '';
  const searchTail = `${secondLastSegment} ${lastSegment}`.trim();

  const testTailOrFull = (regexTail: RegExp, regexFull: RegExp) => {
    return regexTail.test(searchTail) || regexFull.test(raw);
  };

  // Utah
  if (
    testTailOrFull(
      /\b(utah|ut)\b/i,
      /,\s*(utah|ut)\b/i
    )
  ) {
    return {
      isRakeshOnly: true,
      stateCode: 'UT',
      stateName: 'Utah',
      rakeshLicense: 'UDRE #13917645',
      c2License: 'UDRE #13748829',
    };
  }

  // Washington State (handles Washington, Washingston typo, WA, avoiding Washington St / Ave)
  if (
    testTailOrFull(
      /\b(washington|washingston|wa)\b(?!\s*(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|way|ct|court|lane|ln)\b)/i,
      /,\s*(washington|washingston|wa)\b(?!\s*(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|way|ct|court|lane|ln)\b)/i
    )
  ) {
    return {
      isRakeshOnly: true,
      stateCode: 'WA',
      stateName: 'Washington',
      rakeshLicense: 'WA MLO-240594',
      c2License: 'WA MB135622',
    };
  }

  // Florida
  if (
    testTailOrFull(
      /\b(florida|fl)\b(?!\s*(floor|fl)\b)/i,
      /,\s*(florida|fl)\b(?!\s*(floor|fl)\b)/i
    )
  ) {
    return {
      isRakeshOnly: true,
      stateCode: 'FL',
      stateName: 'Florida',
      rakeshLicense: 'FL Lic #LO121680',
      c2License: 'FL MLD2635',
    };
  }

  // Arizona
  if (
    testTailOrFull(
      /\b(arizona|az)\b/i,
      /,\s*(arizona|az)\b/i
    )
  ) {
    return {
      isRakeshOnly: true,
      stateCode: 'AZ',
      stateName: 'Arizona',
      rakeshLicense: 'AZ Lic #1050797',
      c2License: 'AZ BK-2009362',
    };
  }

  // California
  if (
    testTailOrFull(
      /\b(california|ca)\b/i,
      /,\s*(california|ca)\b/i
    )
  ) {
    return {
      isRakeshOnly: false,
      stateCode: 'CA',
      stateName: 'California',
      rakeshLicense: 'CA DRE #01336748',
      c2License: 'CA DRE #01821025',
    };
  }

  // Default fallback: California (David & Rakesh)
  return {
    isRakeshOnly: false,
    stateCode: 'CA',
    stateName: 'California',
    rakeshLicense: 'CA DRE #01336748',
    c2License: 'CA DRE #01821025',
  };
}

/**
 * Extracts clean street address from a full address string (e.g. "535 Tam O Shanter Dr, San Marcos, CA 92069" -> "535 Tam O Shanter Dr")
 */
export function extractStreetAddress(address: string): string {
  if (!address || !address.trim()) return 'Rental Property';
  const first = address.split(',')[0].trim();
  // Strip characters illegal in Windows / macOS file names
  const clean = first.replace(/[/\\?%*:|"<>]/g, '').trim();
  return clean || 'Rental Property';
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getFormattedDateForFilename(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Formats the exact required PDF file name:
 * "Insider Mortgage - Street Addresss - YYYY-MM-DD"
 */
export function getRentalReportPdfFileName(address: string, date = new Date()): string {
  const street = extractStreetAddress(address);
  const dateStr = getFormattedDateForFilename(date);
  return `Insider Mortgage - ${street} - ${dateStr}`;
}
