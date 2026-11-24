import React from 'react';
import type { Metadata } from 'next';
import FirstTimeBuyerTaxCalculator from '../../../components/calculators/tax-savings/FirstTimeBuyerTaxCalculator';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'First-Time Home Buyer Tax Savings & Net Monthly Payment Calculator | Insider Mortgage',
  description:
    'Estimate your 2026 Federal and State homeowner tax savings and true after-tax net monthly mortgage payment across CA, WA, UT, AZ, and FL.',
  robots: { index: false, follow: false },
});

export default function FirstTimeBuyerTaxSavingsPage() {
  return <FirstTimeBuyerTaxCalculator />;
}
