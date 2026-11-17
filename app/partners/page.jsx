import Partners from '../../src/views/Partners';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Why Referrers Choose Insider Mortgage',
  description: 'When you refer someone to us, you are trusting us with your reputation. We specialize in complex mortgage scenarios and protect your client relationships.',
});

export default function PartnersPage() {
  return <Partners />;
}
