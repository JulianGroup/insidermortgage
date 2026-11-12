export interface UnitInput {
  id: string;              // "unit-1", "unit-2", etc.
  label: string;           // "Unit 1", "Unit 2", "Rear Cottage"
  subAddress?: string;     // optional "Apt A"
  monthlyRent: number;     // e.g. 2600
}

export interface UnderwriteInputs {
  propertyAddress: string;
  unitCount: 1 | 2 | 3 | 4;
  units: UnitInput[];
  purchasePrice: number;
  downPaymentPct: number;    // default 0.25
  interestRate: number;      // default 0.075
  loanTermYears: number;     // default 30
  makeReadyCost: number;     // default 10000
  vacancyRate: number;       // default 0.03
  propMgmtRate: number;      // default 0.05
  propertyTaxRate: number;   // default 0.0125
  insuranceRate: number;     // default 0.0035
  monthlyHoa: number;        // default 0
  monthlyMaintenance?: number; // default 200 ($/mo budget for repairs/turnover)
  propertyTaxGrowthRate?: number; // default 0.02 (2% annual tax escalation)
  insuranceGrowthRate?: number;   // default 0.05 (5% annual insurance escalation)
  annualRentGrowth: number;  // default 0.03
  annualAppreciation: number;// default 0.04
  sellingCostPct: number;    // default 0.05

  // What-If: Future Refinance
  refiEnabled?: boolean;
  refiYear?: number;         // e.g. Year 3
  refiNewRate?: number;      // e.g. 0.065
  refiReset30?: boolean;     // true = 30-yr reset, false = remaining term

  // What-If: ADU Project
  aduEnabled?: boolean;
  aduCount?: 1 | 2;          // 1 or 2 detached ADUs (multi-family CA ADU law)
  aduCost?: number;          // e.g. 200000 (per ADU or total when aduCount=1)
  aduRentMonthly?: number;   // e.g. 2200 (per ADU or total when aduCount=1)
  aduConstructionMonths?: number; // e.g. 6
  aduMainRentDiscountPct?: number; // 0.25 (discount) or 1.0 (vacant)
}

export interface YearProForma {
  year: number;
  monthlyGrossRent: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  noi: number;
  annualDebtService: number;
  netCashFlow: number;
  propertyValue: number;
  remainingBalance: number;
}

export interface HorizonReturns {
  propertyValue: number;
  sellingCosts: number;
  remainingBalance: number;
  netSaleProceeds: number;
  cumulativeCashFlow: number;
  totalProfit: number;
  totalRoiPct: number;
  irrPct: number;
}

export interface UnderwriteSummary {
  totalMonthlyRent: number;
  initialCashInvested: number;
  loanAmount: number;
  monthlyPmt: number;
  year1Noi: number;
  year1CashFlow: number;
  fiveYear: HorizonReturns;
  tenYear: HorizonReturns;
  schedule: YearProForma[];
}

export function computeMortgagePmt(principal: number, annualRate: number, termYears: number): number {
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 12;
  const n = termYears * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calculateIRR(cashFlows: number[], guess = 0.07): number {
  const maxIterations = 1000;
  const tolerance = 1e-7;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const denom = Math.pow(1 + rate, t);
      npv += cashFlows[t] / denom;
      dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    const newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < tolerance) return newRate * 100;
    rate = newRate;
  }
  return rate * 100;
}

export function runUnderwriteModel(inputs: UnderwriteInputs): UnderwriteSummary {
  const totalBaseMonthlyRent = inputs.units.reduce(
    (sum, unit) => sum + (Number(unit.monthlyRent) || 0),
    0
  );

  const aduMultiplier = inputs.unitCount > 1 && inputs.aduCount === 2 ? 2 : 1;
  const effectiveAduCost = inputs.aduEnabled ? (inputs.aduCost || 0) * aduMultiplier : 0;
  const effectiveAduMonthlyRent = inputs.aduEnabled ? (inputs.aduRentMonthly || 0) * aduMultiplier : 0;

  const downPayment = inputs.purchasePrice * inputs.downPaymentPct;
  const initialLoan = inputs.purchasePrice - downPayment;
  let totalCashInvested = downPayment + inputs.makeReadyCost;

  if (inputs.aduEnabled && effectiveAduCost) {
    totalCashInvested += effectiveAduCost;
  }

  let currentLoanBalance = initialLoan;
  let currentPmt = computeMortgagePmt(initialLoan, inputs.interestRate, inputs.loanTermYears);
  let currentMonthlyRate = inputs.interestRate / 12;

  const baseAssetValue = inputs.aduEnabled
    ? inputs.purchasePrice + effectiveAduCost
    : inputs.purchasePrice;
  let currentAssetVal = baseAssetValue;
  let currentMonthlyBaseRent = totalBaseMonthlyRent;

  const taxGrowth = inputs.propertyTaxGrowthRate ?? 0.02;
  const insuranceGrowth = inputs.insuranceGrowthRate ?? 0.05;
  const baseTaxes =
    (inputs.purchasePrice + (inputs.aduEnabled ? effectiveAduCost : 0)) *
    inputs.propertyTaxRate;
  const baseInsurance =
    (inputs.purchasePrice + (inputs.aduEnabled ? effectiveAduCost : 0)) *
    inputs.insuranceRate;
  const baseMaintenance = (inputs.monthlyMaintenance ?? 0) * 12;

  const schedule: YearProForma[] = [];
  const cashFlowStream: number[] = [-totalCashInvested];

  for (let yr = 1; yr <= 10; yr++) {
    currentAssetVal = currentAssetVal * (1 + inputs.annualAppreciation);

    // Refinance evaluation at refiYear
    if (inputs.refiEnabled && yr === (inputs.refiYear || 3) + 1 && inputs.refiNewRate) {
      const termMonths = inputs.refiReset30
        ? 360
        : 360 - ((inputs.refiYear || 3) * 12);
      currentMonthlyRate = inputs.refiNewRate / 12;
      currentPmt =
        currentLoanBalance *
        ((currentMonthlyRate * Math.pow(1 + currentMonthlyRate, termMonths)) /
          (Math.pow(1 + currentMonthlyRate, termMonths) - 1));
    }

    if (yr > 1) {
      currentMonthlyBaseRent = currentMonthlyBaseRent * (1 + inputs.annualRentGrowth);
    }

    let annualGrossRent = 0;
    if (inputs.aduEnabled && yr === 1) {
      const constrMonths = inputs.aduConstructionMonths ?? 6;
      const discount = inputs.aduMainRentDiscountPct ?? 0.25;
      const activeMonths = 12 - constrMonths;
      const baseRentYr1 =
        totalBaseMonthlyRent * (1 - discount) * constrMonths +
        totalBaseMonthlyRent * activeMonths;
      const aduRentYr1 = effectiveAduMonthlyRent * activeMonths;
      annualGrossRent = baseRentYr1 + aduRentYr1;
    } else if (inputs.aduEnabled && yr > 1) {
      const aduCompoundedRent =
        effectiveAduMonthlyRent * Math.pow(1 + inputs.annualRentGrowth, yr - 1);
      annualGrossRent = (currentMonthlyBaseRent + aduCompoundedRent) * 12;
    } else {
      annualGrossRent = currentMonthlyBaseRent * 12;
    }

    const egi = annualGrossRent * (1 - inputs.vacancyRate);
    const taxes = baseTaxes * Math.pow(1 + taxGrowth, yr - 1);
    const insurance = baseInsurance * Math.pow(1 + insuranceGrowth, yr - 1);
    const maintenance = baseMaintenance * Math.pow(1 + inputs.annualRentGrowth, yr - 1);
    const mgmt = egi * inputs.propMgmtRate;
    const hoa = inputs.monthlyHoa * 12;
    const opex = taxes + insurance + mgmt + hoa + maintenance;
    const noi = egi - opex;

    for (let m = 0; m < 12; m++) {
      const intPmt = currentLoanBalance * currentMonthlyRate;
      const prPmt = currentPmt - intPmt;
      currentLoanBalance -= prPmt;
    }

    const annualDebtService = currentPmt * 12;
    const netCashFlow = noi - annualDebtService;

    schedule.push({
      year: yr,
      monthlyGrossRent: annualGrossRent / 12,
      effectiveGrossIncome: egi,
      operatingExpenses: opex,
      noi,
      annualDebtService,
      netCashFlow,
      propertyValue: currentAssetVal,
      remainingBalance: currentLoanBalance,
    });

    cashFlowStream.push(netCashFlow);
  }

  // 5-Year Horizon
  const val5 = schedule[4].propertyValue;
  const sellCost5 = val5 * inputs.sellingCostPct;
  const netProc5 = val5 - sellCost5 - schedule[4].remainingBalance;
  const cumCf5 = schedule.slice(0, 5).reduce((acc, row) => acc + row.netCashFlow, 0);
  const profit5 = netProc5 + cumCf5 - totalCashInvested;
  const irrFlows5 = [...cashFlowStream.slice(0, 5), schedule[4].netCashFlow + netProc5];
  const irr5 = calculateIRR(irrFlows5);

  // 10-Year Horizon
  const val10 = schedule[9].propertyValue;
  const sellCost10 = val10 * inputs.sellingCostPct;
  const netProc10 = val10 - sellCost10 - schedule[9].remainingBalance;
  const cumCf10 = schedule.reduce((acc, row) => acc + row.netCashFlow, 0);
  const profit10 = netProc10 + cumCf10 - totalCashInvested;
  const irrFlows10 = [...cashFlowStream.slice(0, 10), schedule[9].netCashFlow + netProc10];
  const irr10 = calculateIRR(irrFlows10);

  return {
    totalMonthlyRent: totalBaseMonthlyRent,
    initialCashInvested: totalCashInvested,
    loanAmount: initialLoan,
    monthlyPmt: computeMortgagePmt(initialLoan, inputs.interestRate, inputs.loanTermYears),
    year1Noi: schedule[0].noi,
    year1CashFlow: schedule[0].netCashFlow,
    fiveYear: {
      propertyValue: val5,
      sellingCosts: sellCost5,
      remainingBalance: schedule[4].remainingBalance,
      netSaleProceeds: netProc5,
      cumulativeCashFlow: cumCf5,
      totalProfit: profit5,
      totalRoiPct: (profit5 / totalCashInvested) * 100,
      irrPct: irr5,
    },
    tenYear: {
      propertyValue: val10,
      sellingCosts: sellCost10,
      remainingBalance: schedule[9].remainingBalance,
      netSaleProceeds: netProc10,
      cumulativeCashFlow: cumCf10,
      totalProfit: profit10,
      totalRoiPct: (profit10 / totalCashInvested) * 100,
      irrPct: irr10,
    },
    schedule,
  };
}
