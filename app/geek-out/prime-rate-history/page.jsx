import PrimeRateHistory from '../../../src/views/PrimeRateHistory';

export const metadata = {
  title: 'U.S. Prime Rate History (Last 10 Years) | Insider Mortgage',
  description:
    'Current U.S. Prime Rate, FOMC interest rate vote updates, and 10-year Wall Street Journal / Federal Reserve Prime Rate change history from newest to oldest.',
};

export default function PrimeRateHistoryPage() {
  return <PrimeRateHistory />;
}
