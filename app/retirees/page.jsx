import Retirees from '../../src/views/Retirees';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Mortgage Programs for Retirees | Insider Mortgage',
  description:
    'Mortgage options for retirees, including asset-based qualifying and strategies for buying or refinancing in retirement. Talk with Insider Mortgage today.',
});

export default function Page() {
  return <Retirees />;
}
