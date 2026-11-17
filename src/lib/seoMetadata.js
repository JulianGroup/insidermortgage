/**
 * Builds consistent Next.js page metadata so every route's Open Graph and Twitter
 * link-preview tags match its own title and description (instead of falling back
 * to the homepage defaults) while preserving site-wide OG/Twitter image & URL tags.
 */
export function buildPageMetadata({
  title,
  description,
  openGraph = {},
  twitter = {},
  ...rest
}) {
  return {
    title,
    description,
    ...rest,
    openGraph: {
      title,
      description,
      url: './',
      siteName: 'Insider Mortgage',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: '/og-preview.jpg',
          width: 1200,
          height: 630,
          alt: 'Insider Mortgage - Trusted Mortgage Experts',
        },
      ],
      ...openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-preview.jpg'],
      ...twitter,
    },
  };
}
