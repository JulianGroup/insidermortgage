import React from 'react';
import type { Metadata } from 'next';
import RentalAnalyzerContainer from '../../../components/calculators/rental-analyzer/RentalAnalyzerContainer';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Rental Property Analyzer | Cash Flow, DSCR & IRR Calculator',
  description:
    'Underwrite Single Family, Condos, and 2–4 unit investment properties with dynamic unit-level rent schedules, DSCR, 5-year & 10-year IRR, future refinance, and California ADU projections.',
});

export default function PublicRentalAnalyzerPage() {
  return <RentalAnalyzerContainer mode="public" />;
}
