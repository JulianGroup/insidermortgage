import CAProp19Calculator from '../../src/views/CAProp19Calculator';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'California Prop 19 Tax Transfer Calculator | Insider Mortgage',
  description:
    'Calculate your property tax savings under CA Proposition 19. Learn how seniors 55+ can transfer their low tax base when buying a replacement home in California.',
});

export default function Page() {
  return <CAProp19Calculator />;
}
