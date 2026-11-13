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
            {Array.isArray(data.heroSubtitle) ? (
              data.heroSubtitle.map((para, idx) => (
                <p key={idx} style={{ marginBottom: idx < data.heroSubtitle.length - 1 ? '1rem' : 0 }}>
                  {para}
                </p>
              ))
            ) : (
              <p>{data.heroSubtitle}</p>
            )}
          </div>
        </section>

        {data.firstSection && (
          <section className="section" style={{ paddingBottom: '2rem', paddingTop: 'var(--space-12)' }}>
            <div className="container" style={{ maxWidth: '850px' }}>
              <div
                style={{
                  padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  {data.firstSection.heading}
                </h2>
                {Array.isArray(data.firstSection.paragraphs) ? (
                  data.firstSection.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.15rem',
                        lineHeight: 1.7,
                        marginBottom: pIdx < data.firstSection.paragraphs.length - 1 ? '1.15rem' : 0,
                      }}
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '1.15rem',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {data.firstSection.body}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {data.showBlogsAfterFirstSection && (
          <RelatedInsights
            routeSlug={data.slug}
            title={data.insightsTitle || 'Investment Property Insights & Breakdowns'}
            subtitle="Real-world mortgage math and scenario walkthroughs by David Sider and Rakesh Jain."
            background="#FFFFFF"
          />
        )}

        {data.secondSection && (
          <section className="section" style={{ paddingBottom: '2rem', paddingTop: data.showBlogsAfterFirstSection ? '2rem' : '2.5rem' }}>
            <div className="container" style={{ maxWidth: '850px' }}>
              <div
                style={{
                  padding: 'clamp(1.75rem, 4vw, 2.75rem)',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.25rem', textAlign: 'center' }}>
                  {data.secondSection.heading}
                </h2>
                {Array.isArray(data.secondSection.paragraphs) ? (
                  data.secondSection.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.15rem',
                        lineHeight: 1.7,
                        marginBottom: pIdx < data.secondSection.paragraphs.length - 1 ? '1.15rem' : 0,
                      }}
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '1.15rem',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {data.secondSection.body}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {data.contentSections && !data.firstSection && (
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
        )}

        {data.introHeader && !data.firstSection && !data.contentSections && (
          <section className="section" style={{ paddingBottom: '2.5rem', paddingTop: 'var(--space-12)' }}>
            <div className="container" style={{ maxWidth: '960px' }}>
              <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '2rem' }}>
                  {data.introHeader}
                </h2>
                {Array.isArray(data.introParagraphs) ? (
                  <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'clamp(1.5rem, 3vw, 2.25rem)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', textAlign: 'left' }}>
                    {data.introParagraphs.map((p, i) => (
                      <p key={i} style={{ marginBottom: i < data.introParagraphs.length - 1 ? '1.1rem' : 0 }}>
                        {p}
                      </p>
                    ))}
                  </div>
                ) : data.introText ? (
                  <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-6)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
                    {data.introText}
                  </p>
                ) : null}
              </div>

              {data.stageBoxes && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
                  {data.stageBoxes.map((box, bIdx) => (
                    <div
                      key={bIdx}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'clamp(1.75rem, 3vw, 2.25rem)',
                        boxShadow: 'var(--shadow-md)',
                        borderTop: `4px solid ${box.accentColor || (bIdx === 0 ? 'var(--secondary, #0468E9)' : 'var(--primary, #0B2545)')}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <h3 style={{ color: 'var(--primary)', fontSize: '1.35rem', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                          {box.title}
                        </h3>
                        {box.subtitle && (
                          <div
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              backgroundColor: 'rgba(4, 104, 233, 0.08)',
                              color: 'var(--secondary, #0468E9)',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              borderRadius: '999px',
                              marginBottom: '1.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {box.subtitle}
                          </div>
                        )}
                        {box.paragraphs && box.paragraphs.map((bp, bpIdx) => (
                          <p key={bpIdx} style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: 1.7, marginBottom: '0.95rem' }}>
                            {bp}
                          </p>
                        ))}
                        {box.bulletTitle && (
                          <p style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.65rem' }}>
                            {box.bulletTitle}
                          </p>
                        )}
                        {box.bullets && (
                          <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1.25rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem' }}>
                            {box.bullets.map((bullet, bltIdx) => (
                              <li key={bltIdx} style={{ marginBottom: '0.5rem' }}>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                        {box.callout && (
                          <div
                            style={{
                              marginTop: '1.25rem',
                              padding: '1rem',
                              backgroundColor: 'rgba(11, 37, 69, 0.04)',
                              borderLeft: `3px solid ${box.accentColor || 'var(--primary)'}`,
                              borderRadius: '6px',
                              fontSize: '0.92rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                            }}
                          >
                            {box.callout}
                          </div>
                        )}
                      </div>
                      {box.footerNote && (
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(15, 23, 42, 0.07)', fontSize: '0.88rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                          {box.footerNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {data.videoPlaceholder && (
                <div
                  style={{
                    maxWidth: '820px',
                    margin: '0 auto',
                    backgroundColor: '#0F172A',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      padding: 'clamp(2.5rem, 6vw, 3.75rem) 2rem',
                      textAlign: 'center',
                      background: 'radial-gradient(circle at center, rgba(30, 58, 138, 0.55) 0%, rgba(15, 23, 42, 0.98) 100%)',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        backgroundColor: '#FF0000',
                        color: 'white',
                        boxShadow: '0 8px 24px rgba(255, 0, 0, 0.45)',
                        marginBottom: '1.25rem',
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.85rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#CBD5E1',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem',
                      }}
                    >
                      YouTube Video Walkthrough
                    </div>
                    <h3 style={{ color: 'white', fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', marginBottom: '0.75rem', fontWeight: 700 }}>
                      {data.videoPlaceholder.title}
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.82)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                      {data.videoPlaceholder.description || "Watch David Sider break down the numbers and demonstrate how to stress-test your buying power in real time with our Pre-Qual Analyzer."}
                    </p>
                    <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <img
                        src="/david-sider.jpg"
                        alt="David Sider"
                        style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', objectFit: 'cover' }}
                      />
                      <span style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '0.98rem', fontWeight: 600 }}>
                        Presented by David Sider • Insider Mortgage
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

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
                  <div
                    className={`program-card ${card.isDoubleWide ? 'program-card-double-wide' : ''}`}
                    key={idx}
                    style={card.isDoubleWide ? { gridColumn: '1 / -1' } : undefined}
                  >
                    <h3>{card.title}</h3>
                    {card.subtitle && (
                      <h4 style={{ color: 'var(--secondary, #0468E9)', fontSize: '1.08rem', fontWeight: 600, marginTop: '-0.25rem', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                        {card.subtitle}
                      </h4>
                    )}
                    {card.paragraphs ? (
                      card.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} style={{ marginBottom: pIdx < card.paragraphs.length - 1 ? '1rem' : 0 }}>
                          {p}
                        </p>
                      ))
                    ) : card.text ? (
                      <p>{card.text}</p>
                    ) : null}

                    {card.subsections && card.subsections.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          marginTop: '2rem',
                          paddingTop: '1.75rem',
                          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
                        }}
                      >
                        <h4 style={{ color: 'var(--primary)', fontSize: '1.2rem', marginBottom: '0.85rem', fontWeight: 700 }}>
                          {sub.title}
                        </h4>
                        {sub.paragraphs && sub.paragraphs.map((sp, spIdx) => (
                          <p key={spIdx} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: spIdx < sub.paragraphs.length - 1 ? '1rem' : 0 }}>
                            {sp}
                          </p>
                        ))}
                        {sub.formulaBox && (
                          <div
                            style={{
                              margin: '1.25rem 0',
                              padding: '1rem 1.25rem',
                              backgroundColor: 'rgba(4, 104, 233, 0.06)',
                              borderLeft: '4px solid var(--secondary, #0468E9)',
                              borderRadius: 'var(--radius-md, 8px)',
                              fontFamily: 'monospace, sans-serif',
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                            }}
                          >
                            {sub.formulaBox}
                          </div>
                        )}
                        {sub.items && (
                          <ul style={{ paddingLeft: '1.25rem', margin: '1rem 0', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                            {sub.items.map((it, itIdx) => (
                              <li key={itIdx} style={{ marginBottom: '0.5rem' }}>
                                <strong>{it.label}</strong> {it.text}
                              </li>
                            ))}
                          </ul>
                        )}
                        {sub.exampleBox && (
                          <div
                            style={{
                              margin: '1.25rem 0',
                              padding: '1.25rem',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: 'var(--radius-md, 8px)',
                              fontSize: '0.98rem',
                              lineHeight: 1.7,
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem 1.5rem', marginBottom: '0.85rem' }}>
                              {sub.exampleBox.dataPoints.map((dp, dpIdx) => (
                                <div key={dpIdx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.25rem' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>{dp.label}:</span>
                                  <strong style={{ color: 'var(--primary)' }}>{dp.value}</strong>
                                </div>
                              ))}
                            </div>
                            <div
                              style={{
                                marginTop: '0.75rem',
                                padding: '0.75rem 1rem',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                borderLeft: '4px solid #10B981',
                                fontWeight: 700,
                                color: 'var(--primary)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                              }}
                            >
                              <span>{sub.exampleBox.resultFormula}</span>
                              <span style={{ color: '#047857', fontSize: '1.1rem' }}>{sub.exampleBox.resultBadge}</span>
                            </div>
                            {sub.exampleBox.conclusion && (
                              <p style={{ marginTop: '0.85rem', marginBottom: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                {sub.exampleBox.conclusion}
                              </p>
                            )}
                          </div>
                        )}
                        {sub.callout && (
                          <div
                            style={{
                              marginTop: '1rem',
                              padding: '0.85rem 1.15rem',
                              backgroundColor: 'rgba(239, 181, 30, 0.1)',
                              borderLeft: '4px solid var(--accent, #EFB51E)',
                              borderRadius: '6px',
                              fontSize: '0.95rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.6,
                            }}
                          >
                            {sub.callout}
                          </div>
                        )}
                        {sub.closingParagraph && (
                          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: '1rem', marginBottom: 0 }}>
                            {sub.closingParagraph}
                          </p>
                        )}
                      </div>
                    ))}
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

        {!data.showBlogsAfterFirstSection && (
          <RelatedInsights
            routeSlug={data.slug}
            title={data.insightsTitle || `${data.title} — Insights & Breakdowns`}
            subtitle="Real-world mortgage math and scenario walkthroughs by David Sider and Rakesh Jain."
            background="#FFFFFF"
          />
        )}

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
