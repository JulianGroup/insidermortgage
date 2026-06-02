import LoanLimitTool from '../../../src/views/LoanLimitTool';

export const metadata = {
  title: '2026 County Loan Limit Look-Up | Insider Mortgage',
  description: 'Instantly check the 2026 maximum conforming and high-balance loan limits by state and county for 1, 2, 3, and 4 unit properties.',
};

export default function LoanLimitsPage() {
  return <LoanLimitTool />;
}
