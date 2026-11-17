import BankStatementLoans from '../../src/views/BankStatementLoans';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'San Diego Bank Statement Mortgages | Insider Mortgage',
  description:
    'Self-employed? Qualify for a mortgage using bank statements instead of tax returns. Learn how Insider Mortgage structures these loans. Schedule a call.',
});

export default function Page() {
  return <BankStatementLoans />;
}
