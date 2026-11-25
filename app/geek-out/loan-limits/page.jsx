import LoanLimitTool from '../../../src/views/LoanLimitTool';
import { buildPageMetadata } from '../../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: '2027 & 2026 County Loan Limit Look-Up | Insider Mortgage',
  description: 'Instantly check the new 2027 and 2026 maximum conforming and high-balance loan limits by state and county for 1, 2, 3, and 4 unit properties.',
});

export default function LoanLimitsPage() {
  return <LoanLimitTool />;
}
