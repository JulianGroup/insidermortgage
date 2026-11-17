import PrivacyPolicy from '../../src/views/PrivacyPolicy';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy | Insider Mortgage',
  description: 'Insider Mortgage Privacy Policy and SMS Terms of Service.',
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
