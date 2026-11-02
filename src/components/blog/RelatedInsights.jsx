"use client";
import React from 'react';
import Link from 'next/link';
import BlogCard from './BlogCard';
import { getPostsForPlacement, getCategoryForRouteSlug } from '../../lib/blog';

export default function RelatedInsights({
  categoryId,
  routeSlug,
  calculatorId,
  bioTagId,
  excludeSlug,
  title = 'Related Insights & Video Breakdowns',
  subtitle,
  limit = 4,
  background = '#F8FAFC',
}) {
  const posts = getPostsForPlacement({
    categoryId,
    routeSlug,
    calculatorId,
    bioTagId,
    excludeSlug,
    limit,
  });

  // Gracefully hide section if 0 matching posts exist
  if (!posts || posts.length === 0) return null;

  const inferredCat = !categoryId && routeSlug ? getCategoryForRouteSlug(routeSlug) : null;
  const filterCatId = categoryId || inferredCat?.id;
  const hubHref = filterCatId
    ? `/resource-library?category=${encodeURIComponent(filterCatId)}`
    : '/resource-library';

  return (
    <section
      className="section"
      style={{
        backgroundColor: background,
        borderTop: '1px solid rgba(15, 23, 42, 0.07)',
        padding: '4rem 1rem',
      }}
    >
      <div className="container" style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--secondary, #0468E9)',
                marginBottom: '0.35rem',
              }}
            >
              From Our Resource Library
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.15rem)',
                color: 'var(--primary, #060A2D)',
                margin: 0,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  color: 'var(--text-secondary, #475569)',
                  fontSize: '1rem',
                  marginTop: '0.4rem',
                  marginBottom: 0,
                  maxWidth: '680px',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href={hubHref}
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--primary, #060A2D)',
              textDecoration: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(6, 10, 45, 0.06)',
            }}
          >
            View All in Resource Library &rarr;
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
