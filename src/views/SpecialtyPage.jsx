"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { seoPages } from '../data/seoPages';
import ReviewCard from '../components/ReviewCard';
import ScheduleCallForm from '../components/ScheduleCallForm';
import RelatedInsights from '../components/blog/RelatedInsights';
import './SelfEmployed.css';

const ExpandableCard = ({ card, accentColor = 'var(--secondary)' }) => {
  const [expanded, setExpanded] = useState(false);
  const hasMore = Array.isArray(card.moreParagraphs) && card.moreParagraphs.length > 0;

  return (
    <div
      className="program-card expandable-card"
      style={{
        borderLeftColor: accentColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <h3>{card.title}</h3>
        <p style={{ marginBottom: expanded && hasMore ? '1rem' : hasMore ? '0.75rem' : 0 }}>
          {card.text || card.preview}
        </p>
        {expanded &&
          hasMore &&
          card.moreParagraphs.map((para, idx) => (
            <p
              key={idx}
              style={{
                marginBottom: idx < card.moreParagraphs.length - 1 ? '1rem' : '0.75rem',
              }}
            >
              {para}
            </p>
          ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="expand-card-btn"
          aria-expanded={expanded}
        >
          {expanded ? 'Show Less ▲' : 'Read More ▼'}
        </button>
      )}
    </div>
  );
};

const SpecialtyPage = ({ data }) => {
  return (
    <>
      <main>
        <section className="se-hero animate-fade-in">
          <div className="container">
            <h1>{data.title}</h1>
            {data.heroSubheadline && (
              <h2 className="se-hero-subheadline">{data.heroSubheadline}</h2>
            )}
            <p>{data.heroSubtitle}</p>
          </div>
        </section>

        {data.contentSections ? (
          <section className="section" style={{ paddingBottom: '2rem', paddingTop: 'var(--space-12)' }}>
            <div className="container" style={{ maxWidth: '850px' }}>
              {data.contentSections.map((sec, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    marginBottom: sIdx < data.contentSections.length - 1 ? '3rem' : '1.5rem',
                    padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <h2 style={{ color: 'var(--primary)', marginBottom: '1.25rem', textAlign: 'center' }}>
                    {sec.heading}
                  </h2>
                  {sec.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.15rem',
                        lineHeight: 1.7,
                        marginBottom: pIdx < sec.paragraphs.length - 1 ? '1.15rem' : 0,
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : data.introHeader ? (
          <section className="section" style={{ paddingBottom: '2rem', paddingTop: 'var(--space-12)' }}>
            <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{data.introHeader}</h2>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-6)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                {data.introText}
              </p>
            </div>
          </section>
        ) : null}

        <section className="section bg-color">
          <div className="container">
            {data.commonIssuesSection && (
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
                  <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    {data.commonIssuesSection.heading}
                  </h2>
                  {data.commonIssuesSection.subtitle && (
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {data.commonIssuesSection.subtitle}
                    </p>
                  )}
                </div>
                <div className="programs-grid" style={{ marginTop: 0 }}>
                  {data.commonIssuesSection.cards.map((card, idx) => (
                    <ExpandableCard key={idx} card={card} accentColor="var(--secondary)" />
                  ))}
                </div>
              </div>
            )}

            {data.goodNewsSection && (
              <div
                style={{
                  marginBottom: '4rem',
                  padding: 'clamp(1.75rem, 4vw, 3rem)',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-md)',
                  borderTop: '4px solid var(--accent)',
                  maxWidth: '900px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              >
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                  {data.goodNewsSection.title}
                </h2>
                {data.goodNewsSection.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      color: 'var(--text-secondary)',
                      marginBottom: '1.1rem',
                      fontSize: '1.1rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {p}
                  </p>
                ))}
                {data.goodNewsSection.ctaText && (
                  <div style={{ textAlign: 'center', marginTop: '2.25rem' }}>
                    <a
                      href="#schedule-call"
                      className="btn btn-primary se-gold-headshot-btn"
                    >
                      {data.goodNewsSection.showHeadshotsInCta && (
                        <span className="se-btn-avatars">
                          <img
                            src="/david-sider.jpg"
                            alt="David Sider"
                            className="se-btn-avatar"
                          />
                          <img
                            src="/rakesh-jain.jpg"
                            alt="Rakesh Jain"
                            className="se-btn-avatar se-btn-avatar-overlap"
                          />
                        </span>
                      )}
                      <span>{data.goodNewsSection.ctaText}</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {data.solutionsSection && (
              <div style={{ marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2.5rem' }}>
                  <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    {data.solutionsSection.heading}
                  </h2>
                  {data.solutionsSection.subtitle && (
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {data.solutionsSection.subtitle}
                    </p>
                  )}
                </div>
                <div className="programs-grid" style={{ marginTop: 0 }}>
                  {data.solutionsSection.cards.map((card, idx) => (
                    <ExpandableCard key={idx} card={card} accentColor="var(--accent)" />
                  ))}
                </div>
              </div>
            )}

            {data.gridCards && data.gridCards.length > 0 && (
              <div className="programs-grid">
                {data.gridCards.map((card, idx) => (
                  <div className="program-card" key={idx}>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                ))}
              </div>
            )}

            {data.extraSection && (
              <div style={{ marginTop: '4rem', padding: '3rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>{data.extraSection.title}</h2>
                {data.extraSection.paragraphs.map((p, i) => (
                  <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem', lineHeight: 1.6 }}>{p}</p>
                ))}
                
                {data.extraSection.listItems && (
                  <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    {data.extraSection.listItems.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {data.extraSection.closingParagraph && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>{data.extraSection.closingParagraph}</p>
                )}
              </div>
            )}

            {data.calloutBox && (
              <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'rgba(239, 181, 30, 0.1)', borderLeft: '4px solid var(--accent)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {data.calloutBox.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                  {data.calloutBox.text}
                </p>
              </div>
            )}

            {data.reviews && data.reviews.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Success Stories</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  {data.reviews.map((review, idx) => (
                    <ReviewCard key={idx} review={review} />
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Explore Other Specialty Programs</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                {seoPages.filter(p => p.slug !== data.slug).map(page => (
                  <Link key={page.slug} href={`/${page.slug}`} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <RelatedInsights
          routeSlug={data.slug}
          title={data.insightsTitle || `${data.title} — Insights & Breakdowns`}
          subtitle="Real-world mortgage math and scenario walkthroughs by David Sider and Rakesh Jain."
          background="#FFFFFF"
        />

        <section id="schedule-call" className="se-contact-section">
          <div className="container" style={{ maxWidth: '680px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
              {data.showPartnerHeaderInForm && (
                <div className="se-partner-contact-header">
                  <div className="se-partner-card-pill">
                    <img src="/david-sider.jpg" alt="David Sider" className="se-partner-photo" />
                    <div className="se-partner-info">
                      <strong>David Sider</strong>
                      <span>Managing Partner</span>
                    </div>
                  </div>
                  <div className="se-partner-card-pill">
                    <img src="/rakesh-jain.jpg" alt="Rakesh Jain" className="se-partner-photo" />
                    <div className="se-partner-info">
                      <strong>Rakesh Jain</strong>
                      <span>Senior Loan Officer &amp; Partner</span>
                    </div>
                  </div>
                </div>
              )}
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.85rem' }}>
                {data.formTitle || 'Speak with David & Rakesh'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '620px', margin: '0 auto' }}>
                {data.formSubtitle}
              </p>
              {data.showPartnerHeaderInForm && (
                <p style={{ marginTop: '0.85rem', fontSize: '0.98rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Prefer to call or text us right now? Reach us directly at{' '}
                  <a href="tel:8588485653" style={{ color: 'var(--secondary, #0468E9)', textDecoration: 'underline' }}>
                    (858) 848-5653
                  </a>
                </p>
              )}
            </div>

            <ScheduleCallForm source={data.formSource || data.title || data.leadCategory} />
          </div>
        </section>
      </main>
    </>
  );
};

export default SpecialtyPage;
