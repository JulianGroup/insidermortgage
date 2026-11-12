import { describe, it, expect } from 'vitest';
import { getDealClassification } from './dealClassifier';

describe('Deal Classifier Taglines', () => {
  it('returns Awaiting Property Inputs when price or rent is 0', () => {
    const res = getDealClassification({
      purchasePrice: 0,
      totalMonthlyRent: 0,
      monthlyCf: 0,
      dscr: 0,
      totalMonthlyPitia: 0,
      tenYearIrrPct: 0,
    });
    expect(res.badgeText).toBe('Awaiting Property Inputs');
  });

  it('classifies strong cash-flow deals with high DSCR', () => {
    const res = getDealClassification({
      purchasePrice: 500000,
      totalMonthlyRent: 4500,
      monthlyCf: 650,
      dscr: 1.35,
      totalMonthlyPitia: 3333,
      tenYearIrrPct: 11.2,
    });
    expect(res.badgeText).toBe('Cash-Flow Positive · Strong DSCR (1.35x)');
    expect(res.badgeColor).toBe('#15803D');
  });

  it('classifies self-sustaining moderate cash-flow deals', () => {
    const res = getDealClassification({
      purchasePrice: 600000,
      totalMonthlyRent: 4000,
      monthlyCf: 80,
      dscr: 1.05,
      totalMonthlyPitia: 3800,
      tenYearIrrPct: 8.5,
    });
    expect(res.badgeText).toBe('Cash-Flow Positive · Self-Sustaining Hold');
  });

  it('classifies appreciation-dependent deals with initial negative cash flow (Tam O Shanter baseline)', () => {
    const res = getDealClassification({
      purchasePrice: 880000,
      totalMonthlyRent: 4800,
      monthlyCf: -1565,
      dscr: 0.83,
      totalMonthlyPitia: 5788,
      tenYearIrrPct: 6.67,
      breakEvenYear: null,
    });
    expect(res.badgeText).toBe('Appreciation-Dependent / Negative Cash Flow (-$1,565/mo)');
    expect(res.badgeColor).toBe('#B45309');
  });

  it('classifies appreciation-driven deals with early break-even', () => {
    const res = getDealClassification({
      purchasePrice: 800000,
      totalMonthlyRent: 4600,
      monthlyCf: -200,
      dscr: 0.95,
      totalMonthlyPitia: 4842,
      tenYearIrrPct: 7.8,
      breakEvenYear: 3,
    });
    expect(res.badgeText).toBe('Appreciation-Driven · Break-Even Yr 3 (0.95x DSCR)');
    expect(res.badgeColor).toBe('#0468E9');
  });

  it('classifies capital-intensive deals with low 10-year IRR', () => {
    const res = getDealClassification({
      purchasePrice: 1200000,
      totalMonthlyRent: 3500,
      monthlyCf: -2500,
      dscr: 0.58,
      totalMonthlyPitia: 6000,
      tenYearIrrPct: 3.8,
    });
    expect(res.badgeText).toBe('Capital-Intensive / High Negative Carry (-$2,500/mo)');
    expect(res.badgeColor).toBe('#DC2626');
  });
});
