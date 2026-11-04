"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import BlogCard from '../components/blog/BlogCard';
import {
  getAllPublishedPosts,
  getActiveCategories,
  extractYouTubeId,
} from '../lib/blog';
import { AUTHORS } from '../data/taxonomy';

export default function ResourceLibrary() {
  const allPosts = useMemo(() => getAllPublishedPosts(), []);
  const activeCategories = useMemo(() => getActiveCategories(), []);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAuthor, setSelectedAuthor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Read optional ?category=... or ?author=... query parameter safely in static export
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    const authorParam = params.get('author');
    if (catParam) setSelectedCategory(catParam);
    if (authorParam && (authorParam === 'rakesh' || authorParam === 'david')) {
      setSelectedAuthor(authorParam);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allPosts.filter((post) => {
      // Author filter
      if (selectedAuthor !== 'all' && post.authorId !== selectedAuthor) {
        return false;
      }

      // Category / Type filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'calculators') {
          if (!post.calculators || post.calculators.length === 0) return false;
        } else if (selectedCategory === 'personal') {
          if (!post.bioTags || post.bioTags.length === 0) return false;
        } else if (selectedCategory === 'videos') {
          if (!extractYouTubeId(post.youtubeUrl)) return false;
        } else {
          if (!post.categories || !post.categories.includes(selectedCategory)) {
            return false;
          }
        }
      }

      // Search filter
      if (q) {
        const sectionText = (post.sections || [])
          .map((s) => {
            const tableText = s.table
              ? `${(s.table.headers || []).join(' ')} ${(s.table.rows || [])
                  .map((r) => r.join(' '))
                  .join(' ')}`
              : '';
            const numText = (s.numberedItems || [])
              .map((n) => `${n.title || ''} ${n.text || ''}`)
              .join(' ');
            const compText = (s.comparisonColumns || [])
              .map((col) => `${col.title || ''} ${col.subtitle || ''} ${(col.bullets || []).join(' ')}`)
              .join(' ');
            const subText = (s.subsections || [])
              .map(
                (sub) =>
                  `${sub.subheading || ''} ${(sub.paragraphs || []).join(' ')} ${(
                    sub.bullets || []
                  ).join(' ')}`
              )
              .join(' ');
            return `${s.heading || ''} ${s.formula || ''} ${(s.paragraphs || []).join(' ')} ${(
              s.bullets || []
            ).join(' ')} ${tableText} ${numText} ${compText} ${subText}`;
          })
          .join(' ')
          .toLowerCase();

        const haystack = `${post.title} ${post.topicBadge || ''} ${post.excerpt} ${post.keyTakeaway || ''} ${sectionText}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [allPosts, selectedCategory, selectedAuthor, searchQuery]);

  const hasAnyVideos = useMemo(
    () => allPosts.some((p) => Boolean(extractYouTubeId(p.youtubeUrl))),
    [allPosts]
  );

  return (
    <main style={{ minHeight: '85vh', backgroundColor: 'var(--bg-color, #F8FAFC)' }}>
      {/* Hero Banner */}
      <section
        style={{
          backgroundColor: 'var(--primary, #060A2D)',
          color: '#FFFFFF',
          padding: '5rem 1rem 3.5rem',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '880px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '0.35rem 0.95rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(239, 181, 30, 0.16)',
              border: '1px solid rgba(239, 181, 30, 0.45)',
              color: 'var(--accent, #EFB51E)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Insider Mortgage Knowledge Hub
          </span>
          <h1 style={{ color: '#FFFFFF', fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)', marginBottom: '0.9rem' }}>
            Resource Library &amp; Strategy Blog
          </h1>
          <p
            style={{
              fontSize: '1.12rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.65,
              maxWidth: '720px',
              margin: '0 auto',
            }}
          >
            Straightforward mortgage math, video scenario breakdowns, and loan strategies written
            directly by partners{' '}
            <Link href="/bio-david" style={{ color: '#EFB51E', textDecoration: 'underline' }}>
              David Sider
            </Link>{' '}
            and{' '}
            <Link href="/bio-rakesh" style={{ color: '#EFB51E', textDecoration: 'underline' }}>
              Rakesh Jain
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section style={{ padding: '2rem 1rem 0.5rem' }}>
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.35rem 1.5rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
            }}
          >
            {/* Top Row: Search + Author Toggle */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, loan strategies, calculators..."
                  aria-label="Search articles"
                  style={{
                    width: '100%',
                    padding: '0.7rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Author Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#F1F5F9',
                  padding: '0.3rem',
                  borderRadius: '999px',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { id: 'all', label: 'All Authors' },
                  { id: 'rakesh', label: AUTHORS.rakesh.name },
                  { id: 'david', label: AUTHORS.david.name },
                ].map((opt) => {
                  const active = selectedAuthor === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAuthor(opt.id)}
                      style={{
                        padding: '0.42rem 0.95rem',
                        borderRadius: '999px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        backgroundColor: active ? 'var(--primary, #060A2D)' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Row: Who We Serve & Topic Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {[
                { id: 'all', label: 'All Topics' },
                ...activeCategories.map((c) => ({
                  id: c.id,
                  label: `${c.icon} ${c.label}`,
                })),
                { id: 'calculators', label: '🧮 Calculator Breakdowns' },
                { id: 'personal', label: '✦ Partner Perspectives' },
                ...(hasAnyVideos ? [{ id: 'videos', label: '▶ Video Walkthroughs' }] : []),
              ].map((pill) => {
                const active = selectedCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedCategory(pill.id)}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '999px',
                      border: active ? '1.5px solid var(--primary, #060A2D)' : '1px solid #E2E8F0',
                      backgroundColor: active
                        ? 'rgba(6, 10, 45, 0.08)'
                        : '#FFFFFF',
                      color: active ? 'var(--primary, #060A2D)' : '#475569',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="section" style={{ paddingTop: '2.25rem', paddingBottom: '5rem' }}>
        <div className="container" style={{ maxWidth: '1140px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              color: '#64748B',
              fontSize: '0.9rem',
            }}
          >
            <span>
              Showing <strong>{filteredPosts.length}</strong>{' '}
              {filteredPosts.length === 1 ? 'entry' : 'entries'}
            </span>
            {(selectedCategory !== 'all' || selectedAuthor !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedAuthor('all');
                  setSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--secondary, #0468E9)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '3.5rem 1.5rem',
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
              }}
            >
              <h3 style={{ color: 'var(--primary, #060A2D)', marginBottom: '0.5rem' }}>
                No matching articles found
              </h3>
              <p style={{ color: '#64748B', marginBottom: '1.25rem' }}>
                Try clearing your search or switching topic filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedAuthor('all');
                  setSearchQuery('');
                }}
                className="btn btn-secondary"
              >
                Show All Articles
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.85rem',
              }}
            >
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
