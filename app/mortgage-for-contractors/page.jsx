import ContractorLoans from '../../src/views/ContractorLoans';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Mortgage for Contractors & Tradespeople | Insider Mortgage',
  description:
    'Home loans built for contractors and tradespeople with variable or self-reported income. Insider Mortgage can help you qualify. Schedule a call.',
});

export default function Page() {
  return <ContractorLoans />;
}
