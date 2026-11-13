import BlogPostView from '../../../src/views/BlogPostView';
import {
  getAllPublishedPosts,
  getPostBySlug,
  getAuthorForPost,
  extractYouTubeId,
  getYouTubeThumbnail,
} from '../../../src/lib/blog';

export function generateStaticParams() {
  return getAllPublishedPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);
  if (!post) {
    return { title: 'Resource Library | Insider Mortgage' };
  }
  const author = getAuthorForPost(post);
  const ytThumb = getYouTubeThumbnail(post.youtubeUrl);

  const metaTitle = post.seoTitle || `${post.title} | Insider Mortgage`;
  const metaDesc = post.seoDescription || post.excerpt;

  return {
    title: metaTitle,
    description: metaDesc,
    authors: [{ name: author.name }],
    // Draft-sample posts stay out of Google until finalized.
    ...(post.isDraftSample ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [author.name],
      ...(ytThumb ? { images: [{ url: ytThumb }] } : {}),
    },
  };
}

export default async function BlogArticlePage({ params }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);
  if (!post) return null;

  const author = getAuthorForPost(post);
  const youtubeId = extractYouTubeId(post.youtubeUrl);

  // SEO Structured Data (Article + optional VideoObject)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      '@type': 'Person',
      ...(author.bioRoute ? { '@id': `https://insidermortgage.com${author.bioRoute}/#person` } : {}),
      name: author.name,
      jobTitle: author.role,
      ...(author.bioRoute ? { url: `https://insidermortgage.com${author.bioRoute}/` } : {}),
    },
    publisher: {
      '@type': ['MortgageBroker', 'Organization'],
      '@id': 'https://insidermortgage.com/#organization',
      name: 'Insider Mortgage (C2 Financial Corporation)',
      url: 'https://insidermortgage.com/',
    },
    ...(youtubeId
      ? {
          video: {
            '@type': 'VideoObject',
            name: post.title,
            description: post.excerpt,
            thumbnailUrl: [`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`],
            uploadDate: post.publishedAt,
            embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostView post={post} />
    </>
  );
}
