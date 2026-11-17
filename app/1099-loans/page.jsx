import Loans1099 from '../../src/views/Loans1099';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'San Diego 1099 Mortgage Loans | Insider Mortgage',
  description:
    'Get a home loan with 1099 income. Insider Mortgage helps independent contractors and freelancers qualify with flexible documentation. Schedule a call.',
});

export default function Page() {
  return <Loans1099 />;
}
