import rawPosts from '../data/blogPosts.json';
import {
  AUTHORS,
  C2_CORPORATE,
  WHO_WE_SERVE_CATEGORIES,
  CALCULATOR_TAGS,
  BIO_TAGS,
} from '../data/taxonomy';

export function getAllPublishedPosts() {
  return [...rawPosts]
    .filter((post) => post.status === 'published')
    .sort((a, b) => {
      const dateDiff = new Date(b.publishedAt) - new Date(a.publishedAt);
      if (dateDiff !== 0) return dateDiff;
      // Put live non-draft articles ahead of draft placeholders on the same date
      const aDraft = a.isDraftSample ? 1 : 0;
      const bDraft = b.isDraftSample ? 1 : 0;
      return aDraft - bDraft;
    });
}

export function getPostBySlug(slug) {
  return getAllPublishedPosts().find((p) => p.slug === slug) || null;
}

export function getAuthorForPost(post) {
  return AUTHORS[post?.authorId] || AUTHORS.rakesh;
}

export function getActiveCategories() {
  return WHO_WE_SERVE_CATEGORIES.filter((cat) => cat.status === 'active');
}

export function getActiveCategoriesForPost(post) {
  if (!post?.categories?.length) return [];
  return WHO_WE_SERVE_CATEGORIES.filter(
    (cat) => cat.status === 'active' && post.categories.includes(cat.id)
  );
}

export function getCalculatorsForPost(post) {
  if (!post?.calculators?.length) return [];
  return CALCULATOR_TAGS.filter((calc) => post.calculators.includes(calc.id));
}

export function getBioTagsForPost(post) {
  if (!post?.bioTags?.length) return [];
  return BIO_TAGS.filter((b) => post.bioTags.includes(b.id));
}

export function getCategoryForRouteSlug(routeSlug) {
  if (!routeSlug) return null;
  const clean = routeSlug.replace(/^\/+|\/+$/g, '');
  return (
    WHO_WE_SERVE_CATEGORIES.find(
      (cat) => cat.status === 'active' && cat.matchingSlugs?.includes(clean)
    ) || null
  );
}

/**
 * Flexible placement query:
 * - On /bio-rakesh and /bio-david (`bioTagId`), ONLY returns posts explicitly tagged with that bioTagId.
 * - On calculator pages (`calculatorId`), returns posts linked to that calculator.
 * - On Who We Serve & specialty loan pages (`categoryId` or `routeSlug`), returns posts matching
 *   either the specific route slug or its parent active Who We Serve category.
 */
export function getPostsForPlacement({
  categoryId,
  routeSlug,
  calculatorId,
  bioTagId,
  excludeSlug,
  limit = 6,
} = {}) {
  const posts = getAllPublishedPosts().filter((p) => p.slug !== excludeSlug);

  // Strict explicit-tag rule for personal bio pages
  if (bioTagId) {
    return posts.filter((p) => Array.isArray(p.bioTags) && p.bioTags.includes(bioTagId)).slice(0, limit);
  }

  if (calculatorId) {
    return posts
      .filter((p) => Array.isArray(p.calculators) && p.calculators.includes(calculatorId))
      .slice(0, limit);
  }

  const cleanSlug = routeSlug ? routeSlug.replace(/^\/+|\/+$/g, '') : null;
  const inferredCategory = !categoryId && cleanSlug ? getCategoryForRouteSlug(cleanSlug) : null;
  const effectiveCategoryId = categoryId || inferredCategory?.id || null;

  // Verify category isn't archived
  const categoryObj = effectiveCategoryId
    ? WHO_WE_SERVE_CATEGORIES.find((c) => c.id === effectiveCategoryId)
    : null;
  const isCategoryActive = categoryObj ? categoryObj.status === 'active' : false;

  const matched = posts.filter((p) => {
    const matchesRoute =
      cleanSlug && Array.isArray(p.specificRoutes) && p.specificRoutes.includes(cleanSlug);
    const matchesCategory =
      isCategoryActive &&
      effectiveCategoryId &&
      Array.isArray(p.categories) &&
      p.categories.includes(effectiveCategoryId);
    return matchesRoute || matchesCategory;
  });

  // Prioritize exact route matches first, then date
  if (cleanSlug) {
    matched.sort((a, b) => {
      const aExact = a.specificRoutes?.includes(cleanSlug) ? 1 : 0;
      const bExact = b.specificRoutes?.includes(cleanSlug) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }

  return matched.slice(0, limit);
}

/**
 * Extracts 11-character YouTube Video ID from watch, youtu.be, shorts, or embed URLs.
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function getYouTubeThumbnail(url) {
  const videoId = extractYouTubeId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export function formatPostDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatAuthorLicenseLine(author) {
  const stateParts = author.licenses
    .map((l) => `${l.state}: #${l.bloggerLicense} (C2 #${l.c2License})`)
    .join(' | ');
  return `${author.name}, NMLS #${author.nmls} | ${C2_CORPORATE.name} dba ${C2_CORPORATE.dba}, NMLS #${author.c2Nmls} | ${stateParts}`;
}

export function generateShareSnippets(post, siteOrigin = 'https://www.insidermtg.com') {
  const author = getAuthorForPost(post);
  const cleanTitle = post.title.replace(/^Draft:\s*/i, '');
  const postUrl = `${siteOrigin.replace(/\/$/, '')}/resource-library/${post.slug}/`;
  const hasVideo = Boolean(extractYouTubeId(post.youtubeUrl));
  const licenseFooter = formatAuthorLicenseLine(author);

  const emailSubject = `${hasVideo ? '[Video + Breakdown] ' : ''}${cleanTitle}`;
  const emailBody = `Hi [First Name],

I just put together a new ${hasVideo ? 'video and numbers breakdown' : 'mortgage strategy breakdown'} that I thought you might find helpful:

${cleanTitle}

${post.excerpt}

${post.keyTakeaway ? `Key Takeaway: ${post.keyTakeaway}\n\n` : ''}${hasVideo ? 'Watch the video & read the full breakdown here' : 'Read the full breakdown here'}:
${postUrl}

If you ever want me to run these numbers for your specific situation, just reply to this email or give me a call/text at ${author.phone}.

Best,
${author.name}
${author.role}, Insider Mortgage
${licenseFooter}
Equal Housing Opportunity`;

  const socialCopy = `${cleanTitle}

${post.excerpt}

${post.keyTakeaway ? `💡 ${post.keyTakeaway}\n\n` : ''}${hasVideo ? '🎥 Watch the walkthrough & run the numbers:' : '📊 Full breakdown & calculators:'} ${postUrl}

—
${licenseFooter} | Equal Housing Opportunity`;

  const smsCopy = `Hi! ${author.name.split(' ')[0]} here from Insider Mortgage — thought you'd like this breakdown on "${cleanTitle}": ${postUrl}`;

  return {
    emailSubject,
    emailBody,
    socialCopy,
    smsCopy,
    postUrl,
  };
}
