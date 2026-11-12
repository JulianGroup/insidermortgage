const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export interface DealClassification {
  badgeText: string;
  badgeColor: string;
  badgeBg: string;
}

export interface DealClassificationParams {
  purchasePrice: number;
  totalMonthlyRent: number;
  monthlyCf: number;
  dscr: number;
  totalMonthlyPitia: number;
  tenYearIrrPct: number;
  breakEvenYear?: number | null;
}

export function getDealClassification(params: DealClassificationParams): DealClassification {
  const {
    purchasePrice,
    totalMonthlyRent,
    monthlyCf,
    dscr,
    tenYearIrrPct,
    breakEvenYear,
  } = params;

  if (purchasePrice === 0 || totalMonthlyRent === 0) {
    return {
      badgeText: 'Awaiting Property Inputs',
      badgeColor: '#64748B',
      badgeBg: '#F1F5F9',
    };
  }

  // 1. Cash-Flow Positive Scenarios
  if (monthlyCf >= 0) {
    if (dscr >= 1.25) {
      return {
        badgeText: `Cash-Flow Positive · Strong DSCR (${dscr.toFixed(2)}x)`,
        badgeColor: '#15803D',
        badgeBg: '#DCFCE7',
      };
    }
    return {
      badgeText: `Cash-Flow Positive · Self-Sustaining Hold`,
      badgeColor: '#16A34A',
      badgeBg: '#F0FDF4',
    };
  }

  // 2. Negative Cash Flow Scenarios (Appreciation / Yield-Constrained)
  if (tenYearIrrPct < 5.0) {
    return {
      badgeText: `Capital-Intensive / High Negative Carry (${currencyFmt.format(Math.round(monthlyCf))}/mo)`,
      badgeColor: '#DC2626',
      badgeBg: '#FEE2E2',
    };
  }

  if (breakEvenYear && breakEvenYear <= 5) {
    return {
      badgeText: `Appreciation-Driven · Break-Even Yr ${breakEvenYear} (${dscr.toFixed(2)}x DSCR)`,
      badgeColor: '#0468E9',
      badgeBg: '#EFF6FF',
    };
  }

  // Default negative cash flow / appreciation dependent
  return {
    badgeText: `Appreciation-Dependent / Negative Cash Flow (${currencyFmt.format(Math.round(monthlyCf))}/mo)`,
    badgeColor: '#B45309',
    badgeBg: '#FEF3C7',
  };
}
