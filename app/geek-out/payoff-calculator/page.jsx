import PayoffCalculator from '../../../src/views/PayoffCalculator';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Refinance & Pre-Payment Calculator | Geek Out | Insider Mortgage',
  description: 'See how much time you can save by refinancing to a higher payment or making extra principal payments.',
});

export default function PayoffCalculatorPage() {
  return <PayoffCalculator />;
}
