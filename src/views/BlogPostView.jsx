"use client";
import React from 'react';
import Link from 'next/link';
import {
  getAuthorForPost,
  getActiveCategoriesForPost,
  getCalculatorsForPost,
  extractYouTubeId,
  formatPostDate,
} from '../lib/blog';
import AuthorLicenseCard from '../components/blog/AuthorLicenseCard';
import ArticleShareBar from '../components/blog/ArticleShareBar';
import RelatedInsights from '../components/blog/RelatedInsights';

/**
 * Normalizes same-site URLs (insidermortgage.com / insidermtg.com) to internal Next.js routes.
 */
function toInternalHref(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return trimmed;
  const match = trimmed.match(/^https?:\/\/(?:www\.)?(?:insidermortgage|insidermtg)\.com(\/.*)?$/i);
  if (match) {
    return match[1] || '/';
  }
  return null;
}

/**
 * Renders lightweight inline markdown (**bold**, *italic*, `code/formula`, and [label](url)) safely as React elements.
 */
function renderInlineMarkdown(text) {
  if (!text || typeof text !== 'string') return text;
  const tokens = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((tok, i) => {
    if (!tok) return null;

    // Markdown link: [label](url)
    const linkMatch = tok.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, rawUrl] = linkMatch;
      const internalHref = toInternalHref(rawUrl);
      const linkStyle = {
        color: 'var(--secondary, #0468E9)',
        fontWeight: 600,
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
      };
      if (internalHref) {
        return (
          <Link key={i} href={internalHref} style={linkStyle}>
            {renderInlineMarkdown(label)}
          </Link>
        );
      }
      return (
        <a
          key={i}
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {renderInlineMarkdown(label)}
        </a>
      );
    }

    // Bold: **text**
    if (tok.startsWith('**') && tok.endsWith('**') && tok.length > 4) {
      return (
        <strong key={i} style={{ color: '#0F172A', fontWeight: 700 }}>
          {renderInlineMarkdown(tok.slice(2, -2))}
        </strong>
      );
    }

    // Italic: *text*
    if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
      return <em key={i}>{tok.slice(1, -1)}</em>;
    }

    // Inline code / formula chip: `text`
    if (tok.startsWith('`') && tok.endsWith('`') && tok.length > 2) {
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            padding: '0.08rem 0.48rem',
            fontSize: '0.94em',
            fontWeight: 600,
            color: '#0F172A',
          }}
        >
          {tok.slice(1, -1)}
        </span>
      );
    }

    return tok;
  });
}

export default function BlogPostView({ post }) {
  if (!post) return null;

  const author = getAuthorForPost(post);
  const categories = getActiveCategoriesForPost(post);
  const calculators = getCalculatorsForPost(post);
  const youtubeId = extractYouTubeId(post.youtubeUrl);
  const isDraft = post.isDraftSample || /^draft\b/i.test(post.title);

  return (
    <main style={{ backgroundColor: 'var(--bg-color, #F8FAFC)', minHeight: '85vh' }}>
      {/* Article Header */}
      <section
        style={{
          backgroundColor: 'var(--primary, #060A2D)',
          color: '#FFFFFF',
          padding: '4rem 1rem 3.5rem',
        }}
      >
        <div className="container" style={{ maxWidth: '840px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            <Link
              href="/resource-library"
              style={{
                color: 'var(--accent, #EFB51E)',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
              }}
            >
              &larr; Back to Resource Library
            </Link>

            <ArticleShareBar post={post} theme="dark" />
          </div>

          {/* Topic Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {isDraft && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '999px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                }}
              >
                Draft Entry
              </span>
            )}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.route}
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                }}
              >
                {cat.icon} {cat.label}
              </Link>
            ))}
            {categories.length === 0 && post.topicBadge && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                }}
              >
                {post.topicBadge}
              </span>
            )}
          </div>

          <h1
            style={{
              color: '#FFFFFF',
              fontSize: 'clamp(1.9rem, 4vw, 2.75rem)',
              lineHeight: 1.22,
              marginBottom: '1.25rem',
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontSize: '1.12rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.65,
              marginBottom: '1.75rem',
            }}
          >
            {post.excerpt}
          </p>

          {/* Author Byline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link href={author.bioRoute}>
              <img
                src={author.photo}
                alt={author.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'top center',
                  border: '2px solid var(--accent, #EFB51E)',
                }}
              />
            </Link>
            <div>
              <Link
                href={author.bioRoute}
                style={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                }}
              >
                {author.name}
              </Link>
              <div style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.72)' }}>
                {author.role} • NMLS #{author.nmls} • {formatPostDate(post.publishedAt)}
                {post.readTimeMinutes ? ` • ${post.readTimeMinutes} min read` : ''}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Content */}
      <section style={{ padding: '2.75rem 1rem 4rem' }}>
        <div className="container" style={{ maxWidth: '840px' }}>
          {/* Responsive YouTube Video Embed (when youtubeUrl is set) */}
          {youtubeId ? (
            <div
              style={{
                marginBottom: '2.25rem',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                backgroundColor: '#000000',
              }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
                  title={post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                  }}
                />
              </div>
            </div>
          ) : post.videoPlaceholderNote ? (
            <div
              style={{
                marginBottom: '2rem',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '1px dashed #CBD5E1',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                color: '#475569',
                fontSize: '0.9rem',
              }}
            >
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 181, 30, 0.18)',
                  color: '#92400E',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                ▶
              </span>
              <div>
                <strong style={{ color: '#060A2D' }}>Video Slot Ready:</strong>{' '}
                {post.videoPlaceholderNote}
              </div>
            </div>
          ) : null}

          {/* Article Body Card */}
          <article
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 4vw, 2.75rem)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #E2E8F0',
            }}
          >
            {(post.sections || []).map((sec, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < post.sections.length - 1 ? '2.35rem' : '1rem',
                  paddingTop: idx > 0 && sec.dividerAbove ? '1.75rem' : 0,
                  borderTop: idx > 0 && sec.dividerAbove ? '1px solid #E2E8F0' : 'none',
                }}
              >
                {sec.heading && (
                  <h2
                    style={{
                      fontSize: '1.5rem',
                      color: 'var(--primary, #060A2D)',
                      marginBottom: '0.95rem',
                    }}
                  >
                    {sec.heading}
                  </h2>
                )}

                {(sec.paragraphs || []).map((p, pIdx) => (
                  <p
                    key={pIdx}
                    style={{
                      fontSize: '1.06rem',
                      color: '#334155',
                      lineHeight: 1.8,
                      marginBottom: '1.1rem',
                    }}
                  >
                    {renderInlineMarkdown(p)}
                  </p>
                ))}

                {sec.formula && (
                  <div
                    style={{
                      margin: '0.85rem 0 1.35rem',
                      padding: '1.15rem 1.35rem',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1.5px solid #CBD5E1',
                      borderLeft: '4px solid var(--primary, #060A2D)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(0.98rem, 2.2vw, 1.16rem)',
                        fontWeight: 700,
                        color: 'var(--primary, #060A2D)',
                        letterSpacing: '0.01em',
                        lineHeight: 1.5,
                      }}
                    >
                      {renderInlineMarkdown(sec.formula)}
                    </div>
                  </div>
                )}

                {sec.comparisonColumns && sec.comparisonColumns.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '1rem',
                      margin: '1.15rem 0 1.35rem',
                    }}
                  >
                    {sec.comparisonColumns.map((col, colIdx) => (
                      <div
                        key={colIdx}
                        style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: 'var(--primary, #060A2D)',
                            color: '#FFFFFF',
                            padding: '0.9rem 1.15rem',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: '0.96rem',
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {col.title}
                          </div>
                          {col.subtitle && (
                            <div
                              style={{
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                color: 'var(--accent, #EFB51E)',
                                marginTop: '0.2rem',
                              }}
                            >
                              {col.subtitle}
                            </div>
                          )}
                        </div>
                        <ul
                          style={{
                            padding: '1.1rem 1.25rem 1.1rem 2.15rem',
                            margin: 0,
                            color: '#334155',
                            fontSize: '0.98rem',
                            lineHeight: 1.65,
                            flex: 1,
                          }}
                        >
                          {(col.bullets || []).map((b, bIdx) => (
                            <li key={bIdx} style={{ marginBottom: bIdx < col.bullets.length - 1 ? '0.5rem' : 0 }}>
                              {renderInlineMarkdown(b)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {sec.table && sec.table.headers && (
                  <div
                    style={{
                      overflowX: 'auto',
                      margin: '1.25rem 0 1.35rem',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    }}
                  >
                    <table
                      style={{
                        width: '100%',
                        minWidth: sec.table.headers.length > 2 ? '580px' : '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left',
                        fontSize: '0.94rem',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: 'var(--primary, #060A2D)', color: '#FFFFFF' }}>
                          {sec.table.headers.map((h, hIdx) => (
                            <th
                              key={hIdx}
                              style={{
                                padding: '0.85rem 1rem',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                letterSpacing: '0.02em',
                                borderRight:
                                  hIdx < sec.table.headers.length - 1
                                    ? '1px solid rgba(255,255,255,0.12)'
                                    : 'none',
                              }}
                            >
                              {renderInlineMarkdown(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sec.table.rows || []).map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            style={{
                              backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                              borderTop: '1px solid #E2E8F0',
                            }}
                          >
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                style={{
                                  padding: '0.85rem 1rem',
                                  color: cIdx === 0 ? '#0F172A' : '#334155',
                                  fontWeight: cIdx === 0 ? 600 : 400,
                                  lineHeight: 1.55,
                                  verticalAlign: 'top',
                                  borderRight:
                                    cIdx < row.length - 1 ? '1px solid #F1F5F9' : 'none',
                                }}
                              >
                                {renderInlineMarkdown(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {sec.bullets && sec.bullets.length > 0 && (
                  <ul
                    style={{
                      paddingLeft: '1.35rem',
                      marginBottom: '1.1rem',
                      color: '#334155',
                      fontSize: '1.04rem',
                      lineHeight: 1.75,
                    }}
                  >
                    {sec.bullets.map((b, bIdx) => (
                      <li key={bIdx} style={{ marginBottom: '0.65rem' }}>
                        {renderInlineMarkdown(b)}
                      </li>
                    ))}
                  </ul>
                )}

                {sec.numberedItems && sec.numberedItems.length > 0 && (
                  <ol
                    style={{
                      listStyle: 'none',
                      paddingLeft: 0,
                      margin: '1.15rem 0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {sec.numberedItems.map((item, nIdx) => (
                      <li
                        key={nIdx}
                        style={{
                          display: 'flex',
                          gap: '0.95rem',
                          alignItems: 'flex-start',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '1.1rem 1.25rem',
                        }}
                      >
                        <span
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary, #060A2D)',
                            color: 'var(--accent, #EFB51E)',
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          {nIdx + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          {item.title && (
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#0F172A',
                                fontSize: '1.04rem',
                                marginBottom: '0.3rem',
                                lineHeight: 1.45,
                              }}
                            >
                              {renderInlineMarkdown(item.title)}
                            </div>
                          )}
                          {item.text && (
                            <p
                              style={{
                                margin: 0,
                                color: '#334155',
                                fontSize: '1rem',
                                lineHeight: 1.7,
                              }}
                            >
                              {renderInlineMarkdown(item.text)}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                {sec.subsections &&
                  sec.subsections.map((sub, subIdx) => (
                    <div key={subIdx} style={{ marginTop: '1.35rem' }}>
                      {sub.subheading && (
                        <h3
                          style={{
                            fontSize: '1.18rem',
                            color: 'var(--primary, #060A2D)',
                            marginBottom: '0.7rem',
                          }}
                        >
                          {sub.subheading}
                        </h3>
                      )}
                      {(sub.paragraphs || []).map((sp, spIdx) => (
                        <p
                          key={spIdx}
                          style={{
                            fontSize: '1.06rem',
                            color: '#334155',
                            lineHeight: 1.8,
                            marginBottom: '1.1rem',
                          }}
                        >
                          {renderInlineMarkdown(sp)}
                        </p>
                      ))}
                      {sub.bullets && sub.bullets.length > 0 && (
                        <ul
                          style={{
                            paddingLeft: '1.35rem',
                            marginBottom: '1.1rem',
                            color: '#334155',
                            fontSize: '1.04rem',
                            lineHeight: 1.75,
                          }}
                        >
                          {sub.bullets.map((sb, sbIdx) => (
                            <li key={sbIdx} style={{ marginBottom: '0.6rem' }}>
                              {renderInlineMarkdown(sb)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            ))}

            {/* Key Takeaway Callout */}
            {post.keyTakeaway && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.35rem 1.5rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 181, 30, 0.1)',
                  borderLeft: '4px solid var(--accent, #EFB51E)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#92400E',
                    marginBottom: '0.35rem',
                  }}
                >
                  {post.keyTakeawayTitle || 'Bottom-Line Takeaway'}
                </div>
                <p style={{ margin: 0, fontSize: '1.04rem', color: '#0F172A', fontWeight: 500, lineHeight: 1.6 }}>
                  {renderInlineMarkdown(post.keyTakeaway)}
                </p>
              </div>
            )}
            {/* Bottom Share Strip inside Article Card */}
            <div
              style={{
                marginTop: '2rem',
                paddingTop: '1.35rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.85rem',
              }}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#334155' }}>
                Found this breakdown helpful? Share it with a friend, spouse, or client:
              </span>
              <ArticleShareBar post={post} theme="light" />
            </div>
          </article>

          {/* Interactive Calculator Callout Cards */}
          {calculators.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
              {calculators.map((calc) => (
                <div
                  key={calc.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid rgba(4, 104, 233, 0.25)',
                    borderRadius: '16px',
                    padding: '1.5rem 1.75rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ flex: '1 1 320px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--secondary, #0468E9)',
                      }}
                    >
                      🧮 Try the Matching Geeky Calculator
                    </span>
                    <h3
                      style={{
                        fontSize: '1.25rem',
                        color: 'var(--primary, #060A2D)',
                        margin: '0.25rem 0 0.35rem',
                      }}
                    >
                      {calc.label}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.94rem', color: '#475569', lineHeight: 1.55 }}>
                      {calc.description}
                    </p>
                  </div>

                  <Link
                    href={calc.route}
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                  >
                    {calc.ctaLabel} &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Blogger State & NMLS + C2 State & NMLS Disclosure Card */}
          <AuthorLicenseCard author={author} />

          {/* Clean CTA Banner (Buttons only — no inline form) */}
          <section
            style={{
              marginTop: '2.5rem',
              background: 'linear-gradient(135deg, #060A2D 0%, #0C1764 100%)',
              color: '#FFFFFF',
              borderRadius: '18px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.65rem' }}>
              Want Us to Run These Numbers for Your Scenario?
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '1.02rem',
                maxWidth: '580px',
                margin: '0 auto 1.65rem',
                lineHeight: 1.6,
              }}
            >
              Get a custom side-by-side breakdown with zero pressure from {author.name} and Team
              Insider.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1rem',
              }}
            >
              <Link
                href="/#contact"
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.85rem',
                  color: '#060A2D',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Schedule a Call
              </Link>
              <Link
                href="/pre-approval"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.85rem 1.85rem',
                  borderRadius: '999px',
                  border: '2px solid rgba(255,255,255,0.75)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Get Pre-Approved
              </Link>
            </div>
          </section>
        </div>
      </section>

      {/* More Posts in Same Category or Calculator */}
      {categories.length > 0 ? (
        <RelatedInsights
          categoryId={categories[0].id}
          excludeSlug={post.slug}
          title={`More in ${categories[0].label}`}
          limit={3}
          background="#FFFFFF"
        />
      ) : calculators.length > 0 ? (
        <RelatedInsights
          calculatorId={calculators[0].id}
          excludeSlug={post.slug}
          title="Related Equity & Calculator Breakdowns"
          limit={3}
          background="#FFFFFF"
        />
      ) : null}
    </main>
  );
}
