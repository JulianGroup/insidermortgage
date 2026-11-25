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
    expect(res.schedule[0].propertyValue).toBeCloseTo((989000 + 10000) * 1.04, 2);
    expect(res.fiveYear.irrPct).toBeCloseTo(4.25, 1);
    expect(res.tenYear.irrPct).toBeCloseTo(6.08, 1);
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
    expect(res.schedule[0].propertyValue).toBeCloseTo((880000 + 50000) * 1.04, 2);
    expect(res.fiveYear.irrPct).toBeCloseTo(6.53, 1);
    expect(res.tenYear.irrPct).toBeCloseTo(7.81, 1);
  });

  it('Test Case C: Realistic Maintenance Budget, Escalations & DSCR Convention', () => {
    const inputs: UnderwriteInputs = {
      propertyAddress: '535 Tam O Shanter Dr, San Marcos, CA 92069',
      unitCount: 2,
      units: [
        { id: 'u1', label: 'Unit 1', monthlyRent: 2600 },
        { id: 'u2', label: 'Unit 2', monthlyRent: 2200 },
      ],
      purchasePrice: 880000,
      downPaymentPct: 0.25,
      interestRate: 0.075,
      loanTermYears: 30,
      makeReadyCost: 10000,
      vacancyRate: 0.03,
      propMgmtRate: 0.05,
      propertyTaxRate: 0.0125,
      insuranceRate: 0.0035,
      monthlyHoa: 0,
      monthlyMaintenance: 200, // $200/mo ($2,400/yr)
      propertyTaxGrowthRate: 0.02, // 2% annual escalation
      insuranceGrowthRate: 0.05, // 5% annual escalation
      annualRentGrowth: 0.03,
      annualAppreciation: 0.04,
      sellingCostPct: 0.05,
      refiEnabled: false,
      aduEnabled: false,
    };

    const res = runUnderwriteModel(inputs);

    // Initial Year 1 Net Operating Income includes $2,400 annual maintenance
    expect(Math.round(res.year1Noi)).toBe(38998 - 2400); // $36,598
    expect(Math.round(res.year1CashFlow)).toBe(-16379 - 2400); // -$18,779

    // Check Year 1 vs Year 2 Operating Expenses reflect 2% tax and 5% insurance growth
    const yr1 = res.schedule[0];
    const yr2 = res.schedule[1];
    expect(yr2.operatingExpenses).toBeGreaterThan(yr1.operatingExpenses);

    // Validate Standard Residential Mortgage DSCR Loan Convention: Rent / PITIA
    const monthlyPi = res.monthlyPmt;
    const monthlyTax = (inputs.purchasePrice * inputs.propertyTaxRate) / 12;
    const monthlyIns = (inputs.purchasePrice * inputs.insuranceRate) / 12;
    const totalPitia = monthlyPi + monthlyTax + monthlyIns + (inputs.monthlyHoa || 0);

    expect(Math.round(totalPitia)).toBe(5788);
    const dscr = res.totalMonthlyRent / totalPitia;
    expect(dscr).toBeCloseTo(0.83, 2);
  });

  it('Test Case D: Purchase Closing Costs vs 1:1 Make-Ready / Rehab Property Value Lift', () => {
    const baseInputs: UnderwriteInputs = {
      propertyAddress: 'Test Property, San Diego, CA 92120',
      unitCount: 1,
      units: [{ id: 'u1', label: 'Unit 1', monthlyRent: 5000 }],
      purchasePrice: 1000000,
      downPaymentPct: 0.25,
      interestRate: 0.07,
      loanTermYears: 30,
      closingCosts: 0,
      makeReadyCost: 0,
      vacancyRate: 0.03,
      propMgmtRate: 0.05,
      propertyTaxRate: 0.0125,
      insuranceRate: 0.0035,
      monthlyHoa: 0,
      annualRentGrowth: 0.03,
      annualAppreciation: 0.04,
      sellingCostPct: 0.05,
    };

    const baseline = runUnderwriteModel(baseInputs);
    const withClosingOnly = runUnderwriteModel({ ...baseInputs, closingCosts: 15000 });
    const withRehabOnly = runUnderwriteModel({ ...baseInputs, makeReadyCost: 50000 });
    const withBoth = runUnderwriteModel({
      ...baseInputs,
      closingCosts: 15000,
      makeReadyCost: 50000,
    });

    // Closing costs add to cash invested only (no property value or operating expense change)
    expect(withClosingOnly.initialCashInvested).toBe(baseline.initialCashInvested + 15000);
    expect(withClosingOnly.schedule[0].propertyValue).toBeCloseTo(
      baseline.schedule[0].propertyValue,
      2
    );
    expect(withClosingOnly.year1Noi).toBeCloseTo(baseline.year1Noi, 2);
    expect(withClosingOnly.tenYear.totalProfit).toBeCloseTo(
      baseline.tenYear.totalProfit - 15000,
      2
    );

    // Make-ready/rehab adds 1:1 to starting property value and cash invested, not property tax
    expect(withRehabOnly.initialCashInvested).toBe(baseline.initialCashInvested + 50000);
    expect(withRehabOnly.schedule[0].propertyValue).toBeCloseTo((1000000 + 50000) * 1.04, 2);
    expect(withRehabOnly.year1Noi).toBeCloseTo(baseline.year1Noi, 2);

    // Combined
    expect(withBoth.initialCashInvested).toBe(250000 + 15000 + 50000);
    expect(withBoth.schedule[0].propertyValue).toBeCloseTo((1000000 + 50000) * 1.04, 2);
  });
});
