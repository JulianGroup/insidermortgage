import { describe, it, expect } from 'vitest';
import { runUnderwriteModel, UnderwriteInputs } from './financial-engine';

describe('Rental Property Financial Engine', () => {
  it('Test Case A: 6234 Crawford St (1 Unit Baseline)', () => {
    const inputs: UnderwriteInputs = {
      propertyAddress: '6234 Crawford St, San Diego, CA 92120',
      unitCount: 1,
      units: [{ id: 'u1', label: 'Single Family Home', monthlyRent: 4600 }],
      purchasePrice: 989000,
      downPaymentPct: 0.25,
      interestRate: 0.075,
      loanTermYears: 30,
      makeReadyCost: 10000,
      vacancyRate: 0.03,
      propMgmtRate: 0.05,
      propertyTaxRate: 0.0125,
      insuranceRate: 0.0035,
      monthlyHoa: 0,
      annualRentGrowth: 0.03,
      annualAppreciation: 0.04,
      sellingCostPct: 0.05,
      refiEnabled: false,
      aduEnabled: false,
    };

    const res = runUnderwriteModel(inputs);

    expect(res.initialCashInvested).toBe(257250);
    expect(res.loanAmount).toBe(741750);
    expect(Math.round(res.monthlyPmt)).toBe(5186);
    expect(Math.round(res.year1Noi)).toBe(35043);
    expect(Math.round(res.year1CashFlow)).toBe(-27194);
    expect(res.fiveYear.irrPct).toBeCloseTo(3.85, 1);
    expect(res.tenYear.irrPct).toBeCloseTo(6.26, 1);
  });

  it('Test Case B: 535 Tam O Shanter Dr (2-Unit Duplex Baseline)', () => {
    const inputs: UnderwriteInputs = {
      propertyAddress: '535 Tam O Shanter Dr, San Marcos, CA 92069',
      unitCount: 2,
      units: [
        { id: 'u1', label: 'Unit 1 (Primary)', monthlyRent: 2600 },
        { id: 'u2', label: 'Unit 2 (Attached)', monthlyRent: 2200 },
      ],
      purchasePrice: 880000,
      downPaymentPct: 0.25,
      interestRate: 0.075,
      loanTermYears: 30,
      makeReadyCost: 50000,
      vacancyRate: 0.03,
      propMgmtRate: 0.05,
      propertyTaxRate: 0.0125,
      insuranceRate: 0.0035,
      monthlyHoa: 0,
      annualRentGrowth: 0.03,
      annualAppreciation: 0.04,
      sellingCostPct: 0.05,
      refiEnabled: false,
      aduEnabled: false,
    };

    const res = runUnderwriteModel(inputs);

    expect(res.totalMonthlyRent).toBe(4800);
    expect(res.initialCashInvested).toBe(270000);
    expect(res.loanAmount).toBe(660000);
    expect(Math.round(res.monthlyPmt)).toBe(4615);
    expect(Math.round(res.year1Noi)).toBe(38998);
    expect(Math.round(res.year1CashFlow)).toBe(-16379);
    expect(res.fiveYear.irrPct).toBeCloseTo(3.57, 1);
    expect(res.tenYear.irrPct).toBeCloseTo(7.01, 1);
  });
});
