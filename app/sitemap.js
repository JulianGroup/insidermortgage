import { seoPages } from '../src/data/seoPages';
import { getAllPublishedPosts } from '../src/lib/blog';

export const dynamic = 'force-static';

const SITE_URL = 'https://insidermortgage.com';

// Public, indexable static routes. Intentionally excluded: /admin/*, /home-v8,
// /home-with-dog, /TOC and /geek-out/mbs-rate-watch (all set to noindex).
const STATIC_ROUTES = [
  '/',
  '/1099-loans',
  '/bank-statement-loans',
  '/big-picture',
  '/bio-david',
  '/bio-rakesh',
  '/CAprop-19-calculator',
  '/geek-out',
  '/geek-out/interactive-active-calculator',
  '/geek-out/loan-limits',
  '/geek-out/payoff-calculator',
  '/geek-out/prime-rate-history',
  '/geek-out/weighted-average',
  '/geek-out/yield-curve',
  '/mortgage-for-contractors',
  '/partners',
  '/pre-approval',
  '/privacy-policy',
  '/refinance',
  '/resource-library',
  '/retirees',
];

export default function sitemap() {
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: route === '/' ? `${SITE_URL}/` : `${SITE_URL}${route}/`,
  }));

  const specialtyEntries = seoPages.map((page) => ({
    url: `${SITE_URL}/${page.slug}/`,
  }));

  // Draft-sample posts are kept out of the sitemap until they are finalized.
  const postEntries = getAllPublishedPosts()
    .filter((post) => !post.isDraftSample)
    .map((post) => ({
      url: `${SITE_URL}/resource-library/${post.slug}/`,
      lastModified: post.publishedAt,
    }));

  return [...staticEntries, ...specialtyEntries, ...postEntries];
}
