import { describe, it, expect } from 'vitest';
import {
  calculateTaxSavings2026,
  estimateStateWageTax2026,
  progressiveFedTax2026,
  progressiveCaTax2026,
  TaxSavingsInputs,
} from './tax-savings-engine';

const DEFAULT_CA_INPUTS: TaxSavingsInputs = {
  purchasePrice: 750000,
  downPaymentPct: 0.1,
  interestRate: 0.0625,
  loanTermYears: 30,
  propertyTaxRate: 0.012,
  monthlyHoa: 300,
  monthlyInsurance: 150,
  monthlyPmi: 225,
  state: 'CA',
  filingStatus: 'Single',
  dependents: 0,
  w2Wages: 150000,
  w2StateTaxPaid: 9500,
  annualCharity: 1000,
};

describe('2026 Tax Savings Engine', () => {
  it('computes accurate default CA scenario (Gross PITIA, Fed + CA tax savings, Net Outflow)', () => {
    const res = calculateTaxSavings2026(DEFAULT_CA_INPUTS);

    expect(res.loanAmount).toBe(675000);
    expect(Math.round(res.monthlyPi)).toBe(4156);
    expect(Math.round(res.monthlyPropertyTax)).toBe(750);
    expect(Math.round(res.grossMonthlyPitia)).toBe(5581);

    // Year 1 interest on $675k @ 6.25% 30-yr is ~$41,964
    expect(res.year1Interest).toBeGreaterThan(41900);
    expect(res.year1Interest).toBeLessThan(42100);

    // PMI phases out completely above $110k wages
    expect(res.deductiblePmi).toBe(0);

    // Federal & CA savings should both be positive and significant
    expect(res.fedBuyerItemizes).toBe(true);
    expect(res.stateBuyerItemizes).toBe(true);
    expect(res.fedTaxSavingsAnnual).toBeGreaterThan(9000);
    expect(res.stateTaxSavingsAnnual).toBeGreaterThan(3500);
    expect(res.netMonthlyCashFlow).toBeCloseTo(
      res.grossMonthlyPitia - res.monthlyTaxSavings,
      2
    );
  });

  it('applies 2026 PMI phase-out between $100,000 and $110,000 W-2 wages', () => {
    const under100k = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, w2Wages: 95000 });
    expect(under100k.deductiblePmi).toBe(225 * 12);

    const mid104500 = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, w2Wages: 104500 });
    // ceil(4500 / 1000) = 5 -> 50% deductible
    expect(mid104500.deductiblePmi).toBeCloseTo(225 * 12 * 0.5, 2);

    const over110k = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, w2Wages: 110000 });
    expect(over110k.deductiblePmi).toBe(0);
  });

  it('enforces $750k Federal vs $1M CA mortgage interest caps', () => {
    const jumbo = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      purchasePrice: 1250000,
      downPaymentPct: 0.2, // $1,000,000 loan
      monthlyPmi: 0,
      w2Wages: 300000,
    });
    expect(jumbo.loanAmount).toBe(1000000);
    expect(jumbo.fedDeductibleMortgageInterest).toBeCloseTo(jumbo.year1Interest * 0.75, 2);
  });

  it('sets state tax savings and effective state wage tax to $0 for WA and FL', () => {
    const wa = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      state: 'WA',
      w2StateTaxPaid: 9500,
    });
    expect(wa.effectiveStateTaxPaid).toBe(0);
    expect(wa.stateTaxSavingsAnnual).toBe(0);

    const fl = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      state: 'FL',
      w2StateTaxPaid: 9500,
    });
    expect(fl.effectiveStateTaxPaid).toBe(0);
    expect(fl.stateTaxSavingsAnnual).toBe(0);
  });

  it('computes Arizona 2.50% flat tax savings conforming to federal deductions ex-state-tax', () => {
    const az = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      state: 'AZ',
      propertyTaxRate: 0.006,
      w2StateTaxPaid: 3500,
    });
    // Expected incremental deduction = (FedMortInt + PropTax + Charity) - 16100
    const expectedIncremental =
      az.fedDeductibleMortgageInterest + az.annualPropertyTax + 1000 - 16100;
    expect(az.stateTaxSavingsAnnual).toBeCloseTo(expectedIncremental * 0.025, 2);
  });

  it('enforces Arizona $10,000 state SALT cap on high-value AZ homes', () => {
    const azHighValue = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      state: 'AZ',
      purchasePrice: 2500000,
      downPaymentPct: 0.2,
      monthlyPmi: 0,
      propertyTaxRate: 0.006, // $15,000/yr property tax -> capped at $10,000 for AZ
      w2Wages: 300000,
      w2StateTaxPaid: 7000,
    });
    expect(azHighValue.annualPropertyTax).toBe(15000);
    // AZ itemized buyer = fedDeductibleMortgageInterest + $10,000 (AZ SALT cap) + $1,000 charity
    const expectedAzDeduction = azHighValue.fedDeductibleMortgageInterest + 10000 + 1000;
    expect(azHighValue.stateBuyerDeduction).toBeCloseTo(expectedAzDeduction, 2);
    expect(azHighValue.stateTaxSavingsAnnual).toBeCloseTo((expectedAzDeduction - 16100) * 0.025, 2);
  });

  it('computes Utah 6% Taxpayer Tax Credit savings with income phase-out', () => {
    const ut = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      state: 'UT',
      propertyTaxRate: 0.0055,
      w2Wages: 120000,
      w2StateTaxPaid: 5000,
      dependents: 2,
    });
    expect(ut.stateTaxSavingsAnnual).toBeGreaterThan(0);
  });

  it('phases down Federal SALT cap from $40,400 toward $10,000 above $505,000 MAGI', () => {
    const underCap = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, w2Wages: 500000 });
    expect(underCap.fedSaltCap).toBe(40400);

    const midPhase = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, w2Wages: 555000 });
    expect(midPhase.fedSaltCap).toBeCloseTo(40400 - 0.3 * 50000, 2);

    const floorCap = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, w2Wages: 700000 });
    expect(floorCap.fedSaltCap).toBe(10000);
  });

  it('matches 2026 progressive Federal and CA bracket math', () => {
    expect(progressiveFedTax2026(12400, 'Single')).toBeCloseTo(1240, 2);
    expect(progressiveFedTax2026(24800, 'MFJ')).toBeCloseTo(2480, 2);
    expect(progressiveCaTax2026(11456, 'Single')).toBeCloseTo(114.56, 2);
    // CA 1% MHSA surtax over $1M
    const at1M = progressiveCaTax2026(1000000, 'Single');
    const at1_1M = progressiveCaTax2026(1100000, 'Single');
    expect(at1_1M - at1M).toBeCloseTo(100000 * 0.133, 2);
  });

  it('uses exact 2026 California HOH brackets rather than Single brackets', () => {
    expect(progressiveCaTax2026(22927, 'HOH')).toBeCloseTo(229.27, 2);
    // At $60k taxable income, HOH has wider 1%/2%/4% brackets than Single, so tax is lower
    expect(progressiveCaTax2026(60000, 'HOH')).toBeLessThan(progressiveCaTax2026(60000, 'Single'));
  });

  it('scales mortgage interest, property tax, and PMI by monthsInTaxYear for partial-year closings', () => {
    const fullYear = calculateTaxSavings2026(DEFAULT_CA_INPUTS);
    const halfYear = calculateTaxSavings2026({ ...DEFAULT_CA_INPUTS, monthsInTaxYear: 6 });

    expect(halfYear.monthsInTaxYear).toBe(6);
    expect(halfYear.annualPropertyTax).toBeCloseTo(fullYear.annualPropertyTax / 2, 2);
    // Interest is slightly more than half in months 1-6 vs 1-12 because principal hasn't amortized as much,
    // and definitely strictly less than fullYear.year1Interest
    expect(halfYear.year1Interest).toBeGreaterThan(fullYear.year1Interest * 0.49);
    expect(halfYear.year1Interest).toBeLessThan(fullYear.year1Interest * 0.51);
    expect(halfYear.fedTaxSavingsMonthly).toBeCloseTo(halfYear.fedTaxSavingsAnnual / 6, 4);
    expect(halfYear.monthlyTaxSavings).toBeCloseTo(halfYear.annualTaxSavings / 6, 4);
  });

  it('estimates W-2 Box 17 state wage tax across CA, UT, AZ, WA, and FL', () => {
    expect(estimateStateWageTax2026(150000, 'WA', 'Single')).toBe(0);
    expect(estimateStateWageTax2026(150000, 'FL', 'MFJ')).toBe(0);

    // AZ: 2.5% * (150000 - 16100) = 3347.5 -> 3348
    expect(estimateStateWageTax2026(150000, 'AZ', 'Single')).toBe(3348);

    // CA Single $150k wages -> substantial progressive state tax
    const caEst = estimateStateWageTax2026(150000, 'CA', 'Single');
    expect(caEst).toBeGreaterThan(8000);
    expect(caEst).toBeLessThan(11000);

    // UT Single $120k with 1 dependent vs 0 dependents (taxpayer tax credit lowers tax)
    const ut0 = estimateStateWageTax2026(120000, 'UT', 'Single', 0);
    const ut1 = estimateStateWageTax2026(120000, 'UT', 'Single', 1);
    expect(ut0).toBeGreaterThan(0);
    expect(ut1).toBeLessThanOrEqual(ut0);
  });

  it('applies 2026 Federal non-itemizer charity caps ($1k Single/HOH, $2k MFJ) and 0.5% AGI itemizer floor', () => {
    // On $150k wages: 0.5% floor = $750.
    // With $500 charity (<= $750 floor): non-itemizer gets $500, itemizer gets $0 charity.
    const lowCharitySingle = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      w2Wages: 150000,
      annualCharity: 500,
    });
    expect(lowCharitySingle.fedCharityFloor).toBe(750);
    expect(lowCharitySingle.fedNonItemizerCharity).toBe(500);
    expect(lowCharitySingle.fedItemizedCharity).toBe(0);
    expect(lowCharitySingle.fedRenterDeduction).toBe(16100 + 500);

    // With $3,000 charity on $150k wages:
    // Single renter taking standard deduction gets $16,100 + $1,000 = $17,100.
    // Itemizing buyer deducts $3,000 - $750 = $2,250 charity.
    const highCharitySingle = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      w2Wages: 150000,
      annualCharity: 3000,
    });
    expect(highCharitySingle.fedNonItemizerCharity).toBe(1000);
    expect(highCharitySingle.fedItemizedCharity).toBe(2250);
    expect(highCharitySingle.fedRenterDeduction).toBe(16100 + 1000);

    // MFJ non-itemizer cap is $2,000
    const highCharityMfj = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      filingStatus: 'MFJ',
      w2Wages: 150000,
      annualCharity: 3000,
    });
    expect(highCharityMfj.fedNonItemizerCharity).toBe(2000);
    expect(highCharityMfj.fedItemizedCharity).toBe(2250);
    expect(highCharityMfj.fedRenterDeduction).toBe(32200 + 2000);

    // HOH non-itemizer cap is $1,000
    const highCharityHoh = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      filingStatus: 'HOH',
      w2Wages: 150000,
      annualCharity: 3000,
    });
    expect(highCharityHoh.fedNonItemizerCharity).toBe(1000);
    expect(highCharityHoh.fedRenterDeduction).toBe(24150 + 1000);

    // Buyer itemizing threshold compares fedItemizedBuyer against fedStandardDeduction + fedNonItemizerCharity
    const borderlineMfj = calculateTaxSavings2026({
      ...DEFAULT_CA_INPUTS,
      state: 'WA',
      purchasePrice: 400000,
      downPaymentPct: 0.2, // $320k loan -> ~$19.8k yr1 interest
      monthlyPmi: 0,
      propertyTaxRate: 0.0095, // $3,800/yr
      filingStatus: 'MFJ',
      w2Wages: 150000,
      annualCharity: 2000,
    });
    // fedItemizedBuyer is ~$24.8k < $32,200 + $2,000 ($34,200) -> does NOT itemize
    expect(borderlineMfj.fedBuyerItemizes).toBe(false);
    expect(borderlineMfj.fedBuyerDeduction).toBe(32200 + 2000);
    expect(borderlineMfj.fedTaxSavingsAnnual).toBe(0);
  });
});
