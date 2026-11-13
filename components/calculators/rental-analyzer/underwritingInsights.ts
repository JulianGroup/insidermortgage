import {
  UnderwriteInputs,
  UnderwriteSummary,
  computeMortgagePmt,
  runUnderwriteModel,
} from '../../../lib/financial-engine';

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const fmt = (n: number) => currencyFmt.format(Math.round(n));

export interface LeverItem {
  label: string;
  value: string;
  note: string;
}

export interface StressScenario {
  label: string;
  appreciationPct: number;
  totalProfit: number;
  irrPct: number | null;
}

export interface UnderwritingInsights {
  /** Rounded (as displayed) DSCR = Gross Rent / PITIA */
  dscr: number;
  totalMonthlyPitia: number;
  breakEvenYear: number | null;
  /** Sum of all negative annual cash flows across the 10-year hold (positive number) */
  cumulativeCarry: number;
  /** Number of years with negative cash flow */
  negativeYears: number;
  verdictHeadline: string;
  verdictText: string;
  levers: LeverItem[];
  profitSources: {
    appreciation: number;
    principalPaydown: number;
    cashFlow: number;
    frictionCosts: number; // selling costs + make-ready (negative)
    appreciationSharePct: number; // share of gross gains
  };
  stress: StressScenario[];
}

function safeIrr(irr: number): number | null {
  if (!Number.isFinite(irr) || irr < -99 || irr > 500) return null;
  return irr;
}

/** Year-1 cash flow of the deal as purchased (no refi / ADU what-ifs). */
function baseYear1CashFlow(inputs: UnderwriteInputs, overrides: Partial<UnderwriteInputs> = {}) {
  return runUnderwriteModel({
    ...inputs,
    refiEnabled: false,
    aduEnabled: false,
    ...overrides,
  }).year1CashFlow;
}

export function computeUnderwritingInsights(
  inputs: UnderwriteInputs,
  summary: UnderwriteSummary
): UnderwritingInsights {
  const price = inputs.purchasePrice || 0;
  const rent = summary.totalMonthlyRent;
  const hoa = inputs.monthlyHoa || 0;
  const term = inputs.loanTermYears || 30;

  // --- PITIA & DSCR (rounded to what is displayed, so text never contradicts the number) ---
  const monthlyPi = summary.monthlyPmt;
  const monthlyTaxIns = (price * (inputs.propertyTaxRate + inputs.insuranceRate)) / 12;
  const totalMonthlyPitia = monthlyPi + monthlyTaxIns + hoa;
  const rawDscr = totalMonthlyPitia > 0 ? rent / totalMonthlyPitia : 0;
  const dscr = Math.round(rawDscr * 100) / 100;

  // --- Holding cost ---
  const breakEvenRow = summary.schedule.find((r) => r.netCashFlow >= 0);
  const breakEvenYear = breakEvenRow ? breakEvenRow.year : null;
  const negativeRows = summary.schedule.filter((r) => r.netCashFlow < 0);
  const cumulativeCarry = negativeRows.reduce((acc, r) => acc - r.netCashFlow, 0);

  // --- Profit sources over 10 years ---
  const val10 = summary.tenYear.propertyValue;
  const baseAsset = val10 / Math.pow(1 + inputs.annualAppreciation, 10);
  const appreciation = val10 - baseAsset;
  const principalPaydown = Math.max(0, summary.loanAmount - summary.tenYear.remainingBalance);
  const cashFlow = summary.tenYear.cumulativeCashFlow;
  const frictionCosts = summary.tenYear.totalProfit - (appreciation + principalPaydown + cashFlow);
  const grossGains = Math.max(0, appreciation) + principalPaydown + Math.max(0, cashFlow);
  const appreciationSharePct = grossGains > 0 ? (Math.max(0, appreciation) / grossGains) * 100 : 0;

  // --- Stress test on appreciation ---
  const stressRates = [0.02, 0];
  const stress: StressScenario[] = [
    {
      label: `${(inputs.annualAppreciation * 100).toFixed(1)}% (base case)`,
      appreciationPct: inputs.annualAppreciation * 100,
      totalProfit: summary.tenYear.totalProfit,
      irrPct: safeIrr(summary.tenYear.irrPct),
    },
    ...stressRates
      .filter((r) => r < inputs.annualAppreciation)
      .map((r) => {
        const sim = runUnderwriteModel({ ...inputs, annualAppreciation: r });
        return {
          label: `${(r * 100).toFixed(1)}% appreciation`,
          appreciationPct: r * 100,
          totalProfit: sim.tenYear.totalProfit,
          irrPct: safeIrr(sim.tenYear.irrPct),
        };
      }),
  ];
  const zeroCase = stress.find((s) => s.appreciationPct === 0);

  // --- Levers: what it would take ---
  const levers: LeverItem[] = [];
  const cfNow = baseYear1CashFlow(inputs);
  const egiFactor = 12 * (1 - inputs.vacancyRate) * (1 - inputs.propMgmtRate);

  // Break-even rent (Year 1 cash flow = $0). Cash flow is linear in rent.
  if (egiFactor > 0) {
    const breakEvenRent = rent - cfNow / egiFactor;
    const gap = breakEvenRent - rent;
    levers.push({
      label: 'Break-even rent',
      value: `${fmt(breakEvenRent)}/mo`,
      note:
        gap > 0
          ? `${fmt(gap)}/mo (${((gap / Math.max(rent, 1)) * 100).toFixed(0)}%) above current rent`
          : `Current rent clears break-even by ${fmt(-gap)}/mo`,
    });
  }

  // Max purchase price for DSCR targets. PITIA is linear in price.
  const pmtFactor = computeMortgagePmt(1, inputs.interestRate, term);
  const k = (1 - inputs.downPaymentPct) * pmtFactor + (inputs.propertyTaxRate + inputs.insuranceRate) / 12;
  const maxPriceFor = (target: number) => (k > 0 ? (rent / target - hoa) / k : 0);
  [1.0, 1.25].forEach((target) => {
    const maxPrice = maxPriceFor(target);
    if (maxPrice <= 0) {
      levers.push({
        label: `Max price for ${target.toFixed(2)}x DSCR`,
        value: 'Not achievable',
        note: 'HOA alone exceeds the rent-supported payment',
      });
      return;
    }
    const diff = price - maxPrice;
    levers.push({
      label: `Max price for ${target.toFixed(2)}x DSCR`,
      value: fmt(maxPrice),
      note:
        diff > 0
          ? `${fmt(diff)} (${((diff / Math.max(price, 1)) * 100).toFixed(1)}%) below list`
          : `Current price is ${fmt(-diff)} under this limit`,
    });
  });

  // Down payment needed for 1.00x DSCR at the current price.
  if (price > 0 && pmtFactor > 0) {
    const loanPctNeeded = (rent - hoa - monthlyTaxIns) / (pmtFactor * price);
    const dpNeeded = 1 - loanPctNeeded;
    if (rawDscr >= 1.0) {
      levers.push({
        label: 'Down payment for 1.00x DSCR',
        value: 'Already met',
        note: `${Math.round(inputs.downPaymentPct * 100)}% down covers PITIA`,
      });
    } else if (dpNeeded >= 1) {
      levers.push({
        label: 'Down payment for 1.00x DSCR',
        value: 'Not achievable',
        note: 'Taxes, insurance and HOA exceed rent even with no loan',
      });
    } else {
      levers.push({
        label: 'Down payment for 1.00x DSCR',
        value: `${(dpNeeded * 100).toFixed(1)}% down`,
        note: `${fmt(dpNeeded * price)} vs. ${fmt(inputs.downPaymentPct * price)} today`,
      });
    }
  }

  // Interest rate needed for $0 Year-1 cash flow (binary search).
  if (cfNow < 0) {
    const cfAtZero = baseYear1CashFlow(inputs, { interestRate: 0.0001 });
    if (cfAtZero < 0) {
      levers.push({
        label: 'Rate for $0 cash flow',
        value: 'Not achievable',
        note: 'Negative even at a near-0% rate',
      });
    } else {
      let lo = 0.0001;
      let hi = inputs.interestRate;
      for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (baseYear1CashFlow(inputs, { interestRate: mid }) >= 0) lo = mid;
        else hi = mid;
      }
      levers.push({
        label: 'Rate for $0 cash flow',
        value: `${(lo * 100).toFixed(2)}%`,
        note: `vs. ${(inputs.interestRate * 100).toFixed(2)}% today`,
      });
    }
  } else {
    levers.push({
      label: 'Rate for $0 cash flow',
      value: 'Already met',
      note: `Positive at ${(inputs.interestRate * 100).toFixed(2)}%`,
    });
  }

  // --- Verdict ---
  const monthlyCf = summary.year1CashFlow / 12;
  let verdictHeadline: string;
  let verdictText: string;

  if (monthlyCf >= 0) {
    verdictHeadline = 'Income-supported hold';
    verdictText =
      `Rent covers PITIA, vacancy, maintenance and management from Year 1 (${fmt(monthlyCf)}/mo). ` +
      `Appreciation is upside, not a requirement` +
      (zeroCase ? ` — even at 0% appreciation the 10-year result is ${fmt(zeroCase.totalProfit)}.` : '.');
  } else if (breakEvenYear) {
    verdictHeadline = `Plan to fund ~${fmt(cumulativeCarry)} of negative cash flow`;
    verdictText =
      `Cash flow is negative for ${negativeRows.length} year${negativeRows.length === 1 ? '' : 's'} and turns positive in Year ${breakEvenYear}. ` +
      `${appreciationSharePct.toFixed(0)}% of projected gains come from appreciation. ` +
      `Suited to an equity-growth investor with reserves to carry the shortfall; not suited to an income-focused buyer.`;
  } else {
    verdictHeadline = `Never breaks even — ~${fmt(cumulativeCarry)} carried over 10 years`;
    verdictText =
      `Cash flow stays negative through Year 10. ` +
      `${appreciationSharePct.toFixed(0)}% of projected gains come from appreciation, so the outcome depends on the sale price. ` +
      `Works only with a lower price, more down, or a value-add plan.`;
  }

  if (monthlyCf < 0 && zeroCase && zeroCase.totalProfit < 0) {
    verdictText += ` At 0% appreciation the 10-year result is a ${fmt(Math.abs(zeroCase.totalProfit))} loss.`;
  }

  return {
    dscr,
    totalMonthlyPitia,
    breakEvenYear,
    cumulativeCarry,
    negativeYears: negativeRows.length,
    verdictHeadline,
    verdictText,
    levers,
    profitSources: {
      appreciation,
      principalPaydown,
      cashFlow,
      frictionCosts,
      appreciationSharePct,
    },
    stress,
  };
}
