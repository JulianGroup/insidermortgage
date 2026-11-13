import { describe, it, expect } from 'vitest';
import { computeMortgagePmt, runUnderwriteModel, UnderwriteInputs } from '../../../lib/financial-engine';
import { computeUnderwritingInsights } from './underwritingInsights';

const base: UnderwriteInputs = {
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
  makeReadyCost: 50000,
  vacancyRate: 0.03,
  propMgmtRate: 0.05,
  propertyTaxRate: 0.0125,
  insuranceRate: 0.0035,
  monthlyHoa: 0,
  monthlyMaintenance: 200,
  propertyTaxGrowthRate: 0.02,
  insuranceGrowthRate: 0.05,
  annualRentGrowth: 0.03,
  annualAppreciation: 0.04,
  sellingCostPct: 0.05,
  refiEnabled: false,
  aduEnabled: false,
};

describe('Underwriting insights', () => {
  const summary = runUnderwriteModel(base);
  const ins = computeUnderwritingInsights(base, summary);

  it('computes DSCR as Rent / PITIA, rounded as displayed', () => {
    expect(ins.dscr).toBe(0.83);
    expect(Math.round(ins.totalMonthlyPitia)).toBe(5788);
  });

  it('profit sources reconcile to total 10-year profit', () => {
    const p = ins.profitSources;
    expect(p.appreciation + p.principalPaydown + p.cashFlow + p.frictionCosts).toBeCloseTo(
      summary.tenYear.totalProfit,
      4
    );
    expect(p.frictionCosts).toBeLessThan(0);
  });

  it('cumulative carry equals the sum of negative annual cash flows', () => {
    const expected = summary.schedule
      .filter((r) => r.netCashFlow < 0)
      .reduce((a, r) => a - r.netCashFlow, 0);
    expect(ins.cumulativeCarry).toBeCloseTo(expected, 4);
    expect(ins.cumulativeCarry).toBeGreaterThan(0);
  });

  it('break-even rent produces $0 Year 1 cash flow', () => {
    const lever = ins.levers.find((l) => l.label === 'Break-even rent')!;
    const rentNeeded = Number(lever.value.replace(/[^0-9.]/g, ''));
    const scale = rentNeeded / 4800;
    const sim = runUnderwriteModel({
      ...base,
      units: base.units.map((u) => ({ ...u, monthlyRent: u.monthlyRent * scale })),
    });
    expect(Math.abs(sim.year1CashFlow)).toBeLessThan(50);
  });

  it('max price for 1.00x DSCR yields DSCR of 1.00', () => {
    const lever = ins.levers.find((l) => l.label === 'Max price for 1.00x DSCR')!;
    const maxPrice = Number(lever.value.replace(/[^0-9.]/g, ''));
    const pitia =
      computeMortgagePmt(maxPrice * 0.75, 0.075, 30) + (maxPrice * (0.0125 + 0.0035)) / 12;
    expect(4800 / pitia).toBeCloseTo(1.0, 2);
  });

  it('rate for $0 cash flow is below the current rate', () => {
    const lever = ins.levers.find((l) => l.label === 'Rate for $0 cash flow')!;
    const rate = parseFloat(lever.value);
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(7.5);
    const sim = runUnderwriteModel({ ...base, interestRate: rate / 100 });
    expect(Math.abs(sim.year1CashFlow)).toBeLessThan(100);
  });

  it('stress test includes base, 2% and 0% appreciation with declining profit', () => {
    expect(ins.stress).toHaveLength(3);
    expect(ins.stress[0].totalProfit).toBeGreaterThan(ins.stress[1].totalProfit);
    expect(ins.stress[1].totalProfit).toBeGreaterThan(ins.stress[2].totalProfit);
  });

  it('verdict states the carry for a negative cash-flow deal', () => {
    expect(ins.verdictHeadline).toMatch(/negative cash flow|Never breaks even/);
  });

  it('positive cash-flow deal gets an income-supported verdict', () => {
    const rich = { ...base, purchasePrice: 500000 };
    const s = runUnderwriteModel(rich);
    const i = computeUnderwritingInsights(rich, s);
    expect(i.verdictHeadline).toBe('Income-supported hold');
    expect(i.levers.find((l) => l.label === 'Rate for $0 cash flow')!.value).toBe('Already met');
  });
});
