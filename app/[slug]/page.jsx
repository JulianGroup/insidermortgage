import SpecialtyPage from '../../src/views/SpecialtyPage';
import { seoPages } from '../../src/data/seoPages';
import { buildPageMetadata } from '../../src/lib/seoMetadata';

export function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const page = seoPages.find((p) => p.slug === resolvedParams.slug);
  if (!page) return { title: 'Insider Mortgage' };
  return buildPageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
  });
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const pageData = seoPages.find((p) => p.slug === resolvedParams.slug);
  if (!pageData) return null;
  return <SpecialtyPage data={pageData} />;
}
