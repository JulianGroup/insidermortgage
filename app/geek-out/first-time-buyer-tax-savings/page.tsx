import React from 'react';
import type { Metadata } from 'next';
import FirstTimeBuyerTaxCalculator from '../../../components/calculators/tax-savings/FirstTimeBuyerTaxCalculator';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'First-Time Home Buyer Tax Savings Calculator | Rent vs Buy',
  description:
    'Compare renting vs buying with 2026 federal and state tax savings. See your after-tax monthly housing cost and Year 1 equity vs. renting. For buyers in CA, WA, UT, AZ and FL.',
  robots: { index: false, follow: false },
});

export default function FirstTimeBuyerTaxSavingsPage() {
  return <FirstTimeBuyerTaxCalculator />;
}
