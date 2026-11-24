export type TaxStateCode = 'CA' | 'WA' | 'UT' | 'AZ' | 'FL';
export type FilingStatus = 'Single' | 'MFJ' | 'HOH';

export interface TaxSavingsInputs {
  purchasePrice: number;
  downPaymentPct: number; // decimal, e.g. 0.10 for 10%
  interestRate: number; // decimal, e.g. 0.0625 for 6.25%
  loanTermYears: 15 | 30;
  propertyTaxRate: number; // decimal, e.g. 0.012 for 1.20%
  monthlyHoa: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  state: TaxStateCode;
  filingStatus: FilingStatus;
  dependents: number;
  w2Wages: number;
  w2StateTaxPaid: number;
  annualCharity: number;
  monthsInTaxYear?: number; // 1..12, defaults to 12 (full calendar year)
}

export interface TaxSavingsResult {
  monthsInTaxYear: number;
  loanAmount: number;
  downPaymentAmount: number;
  monthlyPi: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  grossMonthlyPitia: number;
  year1Interest: number;
  annualPropertyTax: number;
  effectiveStateTaxPaid: number;

  // Federal breakdown
  deductiblePmi: number;
  fedStandardDeduction: number;
  fedNonItemizerCharity: number;
  fedCharityFloor: number;
  fedItemizedCharity: number;
  fedSaltCap: number;
  fedSaltBuyer: number;
  fedSaltRenter: number;
  fedDeductibleMortgageInterest: number;
  fedItemizedBuyer: number;
  fedRenterDeduction: number;
  fedBuyerDeduction: number;
  fedBuyerItemizes: boolean;
  fedTaxRenter: number;
  fedTaxBuyer: number;
  fedTaxSavingsAnnual: number;
  fedTaxSavingsMonthly: number;

  // State breakdown
  stateLabel: string;
  stateStandardDeduction: number;
  stateRenterDeduction: number;
  stateBuyerDeduction: number;
  stateBuyerItemizes: boolean;
  stateTaxSavingsAnnual: number;
  stateTaxSavingsMonthly: number;
  stateExplanationNote: string;

  // Totals
  annualTaxSavings: number;
  monthlyTaxSavings: number;
  netMonthlyCashFlow: number;
}

export const STATE_TAX_DEFAULTS: Record<
  TaxStateCode,
  { name: string; defaultPropTaxRate: number; hasWageTax: boolean }
> = {
  CA: { name: 'California (CA)', defaultPropTaxRate: 0.012, hasWageTax: true },
  WA: { name: 'Washington (WA)', defaultPropTaxRate: 0.0095, hasWageTax: false },
  UT: { name: 'Utah (UT)', defaultPropTaxRate: 0.0055, hasWageTax: true },
  AZ: { name: 'Arizona (AZ)', defaultPropTaxRate: 0.006, hasWageTax: true },
  FL: { name: 'Florida (FL)', defaultPropTaxRate: 0.0095, hasWageTax: false },
};

interface TaxBracket {
  upTo: number;
  rate: number;
}

const FED_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  Single: [
    { upTo: 12400, rate: 0.1 },
    { upTo: 50400, rate: 0.12 },
    { upTo: 105700, rate: 0.22 },
    { upTo: 201775, rate: 0.24 },
    { upTo: 256225, rate: 0.32 },
    { upTo: 640600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  MFJ: [
    { upTo: 24800, rate: 0.1 },
    { upTo: 100800, rate: 0.12 },
    { upTo: 211400, rate: 0.22 },
    { upTo: 403550, rate: 0.24 },
    { upTo: 512450, rate: 0.32 },
    { upTo: 768700, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
  HOH: [
    { upTo: 17700, rate: 0.1 },
    { upTo: 67450, rate: 0.12 },
    { upTo: 105700, rate: 0.22 },
    { upTo: 201750, rate: 0.24 },
    { upTo: 256200, rate: 0.32 },
    { upTo: 640600, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ],
};

const CA_SINGLE_BRACKETS_2026: TaxBracket[] = [
  { upTo: 11456, rate: 0.01 },
  { upTo: 27157, rate: 0.02 },
  { upTo: 42861, rate: 0.04 },
  { upTo: 59498, rate: 0.06 },
  { upTo: 75197, rate: 0.08 },
  { upTo: 384109, rate: 0.093 },
  { upTo: 460927, rate: 0.103 },
  { upTo: 768213, rate: 0.113 },
  { upTo: Infinity, rate: 0.123 },
];

const CA_HOH_BRACKETS_2026: TaxBracket[] = [
  { upTo: 22927, rate: 0.01 },
  { upTo: 54317, rate: 0.02 },
  { upTo: 70018, rate: 0.04 },
  { upTo: 86655, rate: 0.06 },
  { upTo: 102356, rate: 0.08 },
  { upTo: 522228, rate: 0.093 },
  { upTo: 626675, rate: 0.103 },
  { upTo: 1044456, rate: 0.113 },
  { upTo: Infinity, rate: 0.123 },
];

function computeProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  const income = Math.max(0, taxableIncome);
  let tax = 0;
  let prevCap = 0;
  for (const b of brackets) {
    if (income <= prevCap) break;
    const taxableInBracket = Math.min(income, b.upTo) - prevCap;
    if (taxableInBracket > 0) {
      tax += taxableInBracket * b.rate;
    }
    prevCap = b.upTo;
  }
  return tax;
}

export function progressiveFedTax2026(taxableIncome: number, status: FilingStatus): number {
  return computeProgressiveTax(taxableIncome, FED_BRACKETS_2026[status]);
}

export function progressiveCaTax2026(taxableIncome: number, status: FilingStatus): number {
  const income = Math.max(0, taxableIncome);
  let brackets: TaxBracket[];
  if (status === 'HOH') {
    brackets = CA_HOH_BRACKETS_2026;
  } else if (status === 'MFJ') {
    brackets = CA_SINGLE_BRACKETS_2026.map((b) => ({
      upTo: b.upTo === Infinity ? Infinity : b.upTo * 2,
      rate: b.rate,
    }));
  } else {
    brackets = CA_SINGLE_BRACKETS_2026;
  }
  const baseTax = computeProgressiveTax(income, brackets);
  const mhsaSurtax = income > 1000000 ? (income - 1000000) * 0.01 : 0;
  return baseTax + mhsaSurtax;
}

export function estimateStateWageTax2026(
  w2Wages: number,
  state: TaxStateCode,
  status: FilingStatus,
  dependents = 0
): number {
  const wages = Math.max(0, w2Wages || 0);
  if (state === 'WA' || state === 'FL') return 0;

  if (state === 'CA') {
    const caStdDed = status === 'Single' ? 5900 : 11800;
    return Math.round(progressiveCaTax2026(Math.max(0, wages - caStdDed), status));
  }

  const fedStdDed = status === 'MFJ' ? 32200 : status === 'HOH' ? 24150 : 16100;

  if (state === 'UT') {
    const deps = Math.max(0, Math.floor(dependents || 0));
    const phaseoutThreshold =
      status === 'MFJ' ? 37392 : status === 'HOH' ? 28045 : 18696;
    const maxUtahTax = 0.0445 * wages;
    const phaseoutPenalty = 0.013 * Math.max(0, wages - phaseoutThreshold);
    const ttcRenter = Math.min(
      maxUtahTax,
      Math.max(0, 0.06 * (fedStdDed + 2167 * deps) - phaseoutPenalty)
    );
    return Math.round(Math.max(0, maxUtahTax - ttcRenter));
  }

  // Arizona (AZ): 2.50% flat tax conforming to 2026 Federal Standard Deduction
  return Math.round(0.025 * Math.max(0, wages - fedStdDed));
}

export function estimateMonthlyPmi(purchasePrice: number, downPaymentPct: number): number {
  if (purchasePrice <= 0 || downPaymentPct >= 0.2) return 0;
  const loanAmt = purchasePrice * (1 - Math.max(0, downPaymentPct));
  // Standard ~0.40% annual PMI estimate for good-credit first-time buyer with 10% down
  return Math.round((loanAmt * 0.004) / 12);
}

export function calculateTaxSavings2026(inputs: TaxSavingsInputs): TaxSavingsResult {
  const monthsInTaxYear = Math.max(1, Math.min(12, Math.round(inputs.monthsInTaxYear ?? 12)));
  const price = Math.max(0, inputs.purchasePrice || 0);
  const downPct = Math.max(0, Math.min(1, inputs.downPaymentPct || 0));
  const downPaymentAmount = price * downPct;
  const loanAmount = Math.max(0, price - downPaymentAmount);

  const annualRate = Math.max(0, inputs.interestRate || 0);
  const monthlyRate = annualRate / 12;
  const totalMonths = (inputs.loanTermYears || 30) * 12;

  let monthlyPi = 0;
  if (loanAmount > 0 && totalMonths > 0) {
    if (monthlyRate === 0) {
      monthlyPi = loanAmount / totalMonths;
    } else {
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPi = (loanAmount * (monthlyRate * factor)) / (factor - 1);
    }
  }

  // Exact interest summed across months owned in tax year (1..monthsInTaxYear)
  let year1Interest = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    let remainingBalance = loanAmount;
    for (let m = 1; m <= monthsInTaxYear; m++) {
      const interestThisMonth = remainingBalance * monthlyRate;
      const principalThisMonth = Math.max(0, monthlyPi - interestThisMonth);
      year1Interest += interestThisMonth;
      remainingBalance = Math.max(0, remainingBalance - principalThisMonth);
    }
  }

  const propTaxRate = Math.max(0, inputs.propertyTaxRate || 0);
  const monthlyPropertyTax = (price * propTaxRate) / 12;
  const annualPropertyTax = monthlyPropertyTax * monthsInTaxYear;
  const monthlyInsurance = Math.max(0, inputs.monthlyInsurance || 0);
  const monthlyHoa = Math.max(0, inputs.monthlyHoa || 0);
  const monthlyPmi = Math.max(0, inputs.monthlyPmi || 0);

  const grossMonthlyPitia =
    monthlyPi + monthlyPropertyTax + monthlyInsurance + monthlyHoa + monthlyPmi;

  const w2Wages = Math.max(0, inputs.w2Wages || 0);
  const charity = Math.max(0, inputs.annualCharity || 0);
  const deps = Math.max(0, Math.floor(inputs.dependents || 0));
  const status = inputs.filingStatus;

  const effectiveStateTaxPaid =
    inputs.state === 'WA' || inputs.state === 'FL'
      ? 0
      : Math.max(0, inputs.w2StateTaxPaid || 0);

  // --- 2026 Federal Calculation ---
  const deductiblePmi =
    monthlyPmi *
    monthsInTaxYear *
    Math.max(0, Math.min(1, 1 - Math.ceil(Math.max(0, w2Wages - 100000) / 1000) / 10));

  const fedStandardDeduction =
    status === 'MFJ' ? 32200 : status === 'HOH' ? 24150 : 16100;

  // 2026 Federal Charitable Rules:
  // - Non-itemizers: up to $1,000 ($2,000 MFJ) above-the-line charitable deduction
  // - Itemizers (Schedule A): 0.5% of AGI floor on charitable contributions
  const fedNonItemizerCharityCap = status === 'MFJ' ? 2000 : 1000;
  const fedNonItemizerCharity = Math.min(charity, fedNonItemizerCharityCap);
  const fedCharityFloor = 0.005 * w2Wages;
  const fedItemizedCharity = Math.max(0, charity - fedCharityFloor);
  const fedStdTotal = fedStandardDeduction + fedNonItemizerCharity;

  const fedSaltCap = Math.max(10000, 40400 - 0.3 * Math.max(0, w2Wages - 505000));
  const fedSaltBuyer = Math.min(fedSaltCap, effectiveStateTaxPaid + annualPropertyTax);
  const fedSaltRenter = Math.min(fedSaltCap, effectiveStateTaxPaid);

  const fedDeductibleMortgageInterest =
    loanAmount > 0 ? (Math.min(loanAmount, 750000) / loanAmount) * year1Interest : 0;

  const fedItemizedRenter = fedSaltRenter + fedItemizedCharity;
  const fedItemizedBuyer =
    fedDeductibleMortgageInterest + deductiblePmi + fedSaltBuyer + fedItemizedCharity;

  const fedRenterDeduction = Math.max(fedStdTotal, fedItemizedRenter);
  const fedBuyerDeduction = Math.max(fedStdTotal, fedItemizedBuyer);
  const fedBuyerItemizes = fedItemizedBuyer > fedStdTotal;

  const fedTaxRenter = progressiveFedTax2026(Math.max(0, w2Wages - fedRenterDeduction), status);
  const fedTaxBuyer = progressiveFedTax2026(Math.max(0, w2Wages - fedBuyerDeduction), status);
  const fedTaxSavingsAnnual = Math.max(0, fedTaxRenter - fedTaxBuyer);
  const fedTaxSavingsMonthly = fedTaxSavingsAnnual / monthsInTaxYear;

  // --- 2026 State Calculation ---
  let stateStandardDeduction = 0;
  let stateRenterDeduction = 0;
  let stateBuyerDeduction = 0;
  let stateBuyerItemizes = false;
  let stateTaxSavingsAnnual = 0;
  let stateExplanationNote = '';

  if (inputs.state === 'CA') {
    stateStandardDeduction = status === 'Single' ? 5900 : 11800;
    const caMortgageInterest =
      loanAmount > 0 ? (Math.min(loanAmount, 1000000) / loanAmount) * year1Interest : 0;
    const caItemized = caMortgageInterest + annualPropertyTax + charity;
    stateRenterDeduction = Math.max(stateStandardDeduction, charity);
    stateBuyerDeduction = Math.max(stateStandardDeduction, caItemized);
    stateBuyerItemizes = caItemized > stateStandardDeduction;

    const caTaxRenter = progressiveCaTax2026(Math.max(0, w2Wages - stateRenterDeduction), status);
    const caTaxBuyer = progressiveCaTax2026(Math.max(0, w2Wages - stateBuyerDeduction), status);
    stateTaxSavingsAnnual = Math.max(0, caTaxRenter - caTaxBuyer);
    stateExplanationNote =
      'California allows mortgage interest up to $1M loan balance and full property tax deductibility with no SALT cap.';
  } else if (inputs.state === 'UT') {
    stateStandardDeduction = fedStandardDeduction;
    const utahPropTaxDed = Math.min(fedSaltCap, annualPropertyTax);
    const fedDedExStateRenter = Math.max(fedStandardDeduction, charity);
    const fedDedExStateBuyer = Math.max(
      fedStandardDeduction,
      fedDeductibleMortgageInterest + deductiblePmi + utahPropTaxDed + charity
    );
    stateRenterDeduction = fedDedExStateRenter;
    stateBuyerDeduction = fedDedExStateBuyer;
    stateBuyerItemizes = fedDedExStateBuyer > fedStandardDeduction;

    const phaseoutThreshold =
      status === 'MFJ' ? 37392 : status === 'HOH' ? 28045 : 18696;
    const maxUtahTax = 0.0445 * w2Wages;
    const phaseoutPenalty = 0.013 * Math.max(0, w2Wages - phaseoutThreshold);

    const ttcRenter = Math.min(
      maxUtahTax,
      Math.max(0, 0.06 * (fedDedExStateRenter + 2167 * deps) - phaseoutPenalty)
    );
    const ttcBuyer = Math.min(
      maxUtahTax,
      Math.max(0, 0.06 * (fedDedExStateBuyer + 2167 * deps) - phaseoutPenalty)
    );
    stateTaxSavingsAnnual = Math.max(0, ttcBuyer - ttcRenter);
    stateExplanationNote =
      'Utah taxes income at a flat 4.45% and provides a 6% Taxpayer Tax Credit based on federal deductions (excluding state income tax) subject to income phase-out.';
  } else if (inputs.state === 'AZ') {
    stateStandardDeduction = fedStandardDeduction;
    const azPropTaxDed = Math.min(fedSaltCap, annualPropertyTax);
    stateRenterDeduction = Math.max(fedStandardDeduction, charity);
    const azItemizedBuyer =
      fedDeductibleMortgageInterest + deductiblePmi + azPropTaxDed + charity;
    stateBuyerDeduction = Math.max(fedStandardDeduction, azItemizedBuyer);
    stateBuyerItemizes = azItemizedBuyer > fedStandardDeduction;

    const azTaxRenter = 0.025 * Math.max(0, w2Wages - stateRenterDeduction);
    const azTaxBuyer = 0.025 * Math.max(0, w2Wages - stateBuyerDeduction);
    stateTaxSavingsAnnual = Math.max(0, azTaxRenter - azTaxBuyer);
    stateExplanationNote =
      'Arizona taxes income at a flat 2.50% and conforms to 2026 Federal deductions (excluding state income taxes paid).';
  } else {
    stateTaxSavingsAnnual = 0;
    stateExplanationNote = `No state wage income tax in ${inputs.state}.`;
  }

  const stateTaxSavingsMonthly = stateTaxSavingsAnnual / monthsInTaxYear;
  const annualTaxSavings = fedTaxSavingsAnnual + stateTaxSavingsAnnual;
  const monthlyTaxSavings = annualTaxSavings / monthsInTaxYear;
  const netMonthlyCashFlow = grossMonthlyPitia - monthlyTaxSavings;

  return {
    monthsInTaxYear,
    loanAmount,
    downPaymentAmount,
    monthlyPi,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPmi,
    monthlyHoa,
    grossMonthlyPitia,
    year1Interest,
    annualPropertyTax,
    effectiveStateTaxPaid,
    deductiblePmi,
    fedStandardDeduction,
    fedNonItemizerCharity,
    fedCharityFloor,
    fedItemizedCharity,
    fedSaltCap,
    fedSaltBuyer,
    fedSaltRenter,
    fedDeductibleMortgageInterest,
    fedItemizedBuyer,
    fedRenterDeduction,
    fedBuyerDeduction,
    fedBuyerItemizes,
    fedTaxRenter,
    fedTaxBuyer,
    fedTaxSavingsAnnual,
    fedTaxSavingsMonthly,
    stateLabel: STATE_TAX_DEFAULTS[inputs.state].name,
    stateStandardDeduction,
    stateRenterDeduction,
    stateBuyerDeduction,
    stateBuyerItemizes,
    stateTaxSavingsAnnual,
    stateTaxSavingsMonthly,
    stateExplanationNote,
    annualTaxSavings,
    monthlyTaxSavings,
    netMonthlyCashFlow,
  };
}
