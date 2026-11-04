"use client";
import React from 'react';
import Link from 'next/link';
import {
  getAuthorForPost,
  getActiveCategoriesForPost,
  getCalculatorsForPost,
  getBioTagsForPost,
  getYouTubeThumbnail,
  formatPostDate,
} from '../../lib/blog';

export default function BlogCard({ post, compact = false }) {
  const author = getAuthorForPost(post);
  const categories = getActiveCategoriesForPost(post);
  const calculators = getCalculatorsForPost(post);
  const bioTags = getBioTagsForPost(post);
  const ytThumb = getYouTubeThumbnail(post.youtubeUrl);
  const isDraft = post.isDraftSample || /^draft\b/i.test(post.title);

  return (
    <Link
      href={`/resource-library/${post.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
    >
      <article
        style={{
          backgroundColor: 'var(--surface, #FFFFFF)',
          borderRadius: 'var(--radius-lg, 1rem)',
          border: '1px solid var(--border-color, #E2E8F0)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
          e.currentTarget.style.borderColor = 'var(--accent, #EFB51E)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--border-color, #E2E8F0)';
        }}
      >
        {/* Top Accent or YouTube Video Thumbnail */}
        {ytThumb ? (
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              backgroundColor: '#060A2D',
              overflow: 'hidden',
            }}
          >
            <img
              src={ytThumb}
              alt={post.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(6,10,45,0.65), rgba(6,10,45,0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent, #EFB51E)',
                  color: '#060A2D',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
                  fontSize: '1.2rem',
                  paddingLeft: '3px',
                }}
              >
                ▶
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              height: '5px',
              background:
                author.id === 'david'
                  ? 'linear-gradient(90deg, #0468E9 0%, #EFB51E 100%)'
                  : 'linear-gradient(90deg, #060A2D 0%, #EFB51E 100%)',
            }}
          />
        )}

        <div
          style={{
            padding: compact ? '1.35rem 1.5rem' : '1.65rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {/* Badges Row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginBottom: '0.85rem',
              alignItems: 'center',
            }}
          >
            {isDraft && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FDE68A',
                }}
              >
                Draft Preview
              </span>
            )}

            {ytThumb && (
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                }}
              >
                ▶ Video + Breakdown
              </span>
            )}

            {categories.map((cat) => (
              <span
                key={cat.id}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(4, 104, 233, 0.08)',
                  color: 'var(--primary, #060A2D)',
                }}
              >
                {cat.icon} {cat.shortLabel}
              </span>
            ))}

            {categories.length === 0 && post.topicBadge && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(4, 104, 233, 0.08)',
                  color: 'var(--primary, #060A2D)',
                }}
              >
                {post.topicBadge}
              </span>
            )}

            {bioTags.length > 0 && categories.length === 0 && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(239, 181, 30, 0.16)',
                  color: '#78350F',
                }}
              >
                ✦ Personal Perspective
              </span>
            )}

            {!compact &&
              calculators.slice(0, 1).map((calc) => (
                <span
                  key={calc.id}
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor: '#F1F5F9',
                    color: '#334155',
                  }}
                >
                  🧮 {calc.shortLabel}
                </span>
              ))}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: compact ? '1.15rem' : '1.28rem',
              fontWeight: 700,
              color: 'var(--primary, #060A2D)',
              lineHeight: 1.35,
              marginBottom: '0.65rem',
            }}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          <p
            style={{
              fontSize: '0.96rem',
              color: 'var(--text-secondary, #475569)',
              lineHeight: 1.6,
              marginBottom: '1.35rem',
              flex: 1,
            }}
          >
            {post.excerpt}
          </p>

          {/* Author & Metadata Footer */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={author.photo}
                alt={author.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  border: '2px solid rgba(239, 181, 30, 0.5)',
                  flexShrink: 0,
                }}
              />
              <div style={{ lineHeight: 1.25 }}>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--primary, #060A2D)',
                  }}
                >
                  {author.name}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748B)' }}>
                  {formatPostDate(post.publishedAt)}
                  {post.readTimeMinutes ? ` • ${post.readTimeMinutes} min read` : ''}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: 'var(--secondary, #0468E9)',
                whiteSpace: 'nowrap',
              }}
            >
              Read &rarr;
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
