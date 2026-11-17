import PreApproval from '../../src/views/PreApproval';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Get Pre-Approved | Insider Mortgage',
  description: 'Start your mortgage pre-approval process and connect with an expert loan officer today.',
});

export default function PreApprovalPage() {
  return <PreApproval />;
}
