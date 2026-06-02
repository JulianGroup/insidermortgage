import SpecialtyPage from '../../src/views/SpecialtyPage';
import { seoPages } from '../../src/data/seoPages';

export function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

export function generateMetadata({ params }) {
  const page = seoPages.find((p) => p.slug === params.slug);
  if (!page) return { title: 'Insider Mortgage' };
  return {
    title: page.seoTitle,
    description: page.seoDescription,
  };
}

export default function Page({ params }) {
  const pageData = seoPages.find((p) => p.slug === params.slug);
  if (!pageData) return null;
  return <SpecialtyPage data={pageData} />;
}
