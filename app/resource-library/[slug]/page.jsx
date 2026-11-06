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

  return {
    title: `${post.title} | Insider Mortgage`,
    description: post.excerpt,
    authors: [{ name: author.name }],
    // Draft-sample posts stay out of Google until finalized.
    ...(post.isDraftSample ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: post.title,
      description: post.excerpt,
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
      name: author.name,
      jobTitle: author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Insider Mortgage (C2 Financial Corporation)',
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
