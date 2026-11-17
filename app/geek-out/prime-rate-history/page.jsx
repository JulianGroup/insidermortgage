import PrimeRateHistory from '../../../src/views/PrimeRateHistory';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'U.S. Prime Rate History (Last 10 Years) | Insider Mortgage',
  description:
    'Current U.S. Prime Rate, FOMC interest rate vote updates, and 10-year Wall Street Journal / Federal Reserve Prime Rate change history from newest to oldest.',
});

export default function PrimeRateHistoryPage() {
  return <PrimeRateHistory />;
}
