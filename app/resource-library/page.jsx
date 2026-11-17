import ResourceLibrary from '../../src/views/ResourceLibrary';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export const metadata = buildPageMetadata({
  title: 'Resource Library & Mortgage Strategy Blog | Insider Mortgage',
  description:
    'Mortgage strategy breakdowns, YouTube walkthroughs, and interactive calculator guides by David Sider and Rakesh Jain at Insider Mortgage.',
});

export default function ResourceLibraryPage() {
  return <ResourceLibrary />;
}
