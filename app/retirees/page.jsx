import Retirees from '../../src/views/Retirees';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Mortgages & Home Equity Strategy for Retirees | Insider Mortgage',
  description:
    'Smart mortgage and home equity strategies for retirees without W-2 income: asset-based qualifying, downsizing, CA Prop 19, ADUs, HELOCs, and protecting liquidity and family.',
});

export default function Page() {
  return <Retirees />;
}
