import GeekOut from '../../src/views/GeekOut';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Geek Out | Financial Calculators & Insights | Insider Mortgage',
  description: 'Deep dive into financial calculators, market insights, and analytical tools built for investors and homeowners.',
});

export default function Page() {
  return <GeekOut />;
}
