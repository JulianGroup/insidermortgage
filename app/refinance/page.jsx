import Refinance from '../../src/views/Refinance';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Refinance Strategies | Insider Mortgage',
  description: 'Learn about the refinancing process, explore strategies for saving money, and schedule a consultation.',
});

export default function RefinancePage() {
  return <Refinance />;
}
