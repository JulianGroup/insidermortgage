import WeightedAverage from '../../../src/views/WeightedAverage';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Blended Rate Calculator | Insider Mortgage',
  description: 'Calculate your blended interest rate across multiple debts and simulate consolidating into a HELOC.',
});

export default function Page() {
  return <WeightedAverage />;
}
