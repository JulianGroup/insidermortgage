"use client";
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';

const TableOfContents = ({ categories = [] }) => {
  const totalPages = categories.reduce((sum, cat) => sum + cat.pages.length, 0);

  return (
    <main className="toc-page">
      <Head>
        <title>Table of Contents | Insider Mortgage</title>
        <meta
          name="description"
          content="Complete auto-updating directory of all published pages, homepage variations, loan programs, and calculators on Insider Mortgage."
        />
      </Head>

      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Montserrat:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header Banner */}
      <section className="toc-hero">
        <div className="toc-container">
          <div className="toc-eyebrow-row">
            <span className="toc-eyebrow">AUTO-UPDATING SITE INDEX</span>
            <span className="toc-total-pill">{totalPages} Published Pages</span>
          </div>
          <h1>Insider Mortgage — Table of Contents</h1>
          <p>
            A complete, categorized list of all published pages on the website. This
            directory automatically updates whenever pages are added or removed.
          </p>

          {/* Quick Jump Links */}
          <div className="toc-jump-nav">
            {categories.map((cat) => (
              <a key={cat.id} href={`#${cat.id}`} className="toc-jump-pill">
                <span>{cat.title}</span>
                <span className="toc-jump-count">{cat.pages.length}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Clean List Format by Category */}
      <section className="toc-body">
        <div className="toc-container">
          {categories.map((cat) => (
            <div key={cat.id} id={cat.id} className="toc-category-section">
              <div className="toc-category-header">
                <div className="toc-category-title-row">
                  <h2>{cat.title}</h2>
                  <span className="toc-category-badge">{cat.badge}</span>
                </div>
                <p>{cat.subtitle}</p>
              </div>

              <ul className="toc-list">
                {cat.pages.map((page) => {
                  const relativePath = page.path;
                  return (
                    <li key={page.path} className="toc-list-item">
                      <Link href={page.path} className="toc-list-link">
                        <div className="toc-item-main">
                          <div className="toc-item-title-line">
                            <span className="toc-item-title">{page.title}</span>
                            {page.highlight && (
                              <span className="toc-highlight-tag">{page.highlight}</span>
                            )}
                          </div>
                          <p className="toc-item-desc">{page.description}</p>
                        </div>

                        <div className="toc-item-meta">
                          <code className="toc-route-code">{relativePath}</code>
                          <span className="toc-item-arrow">Open →</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .toc-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: #F8FAFC;
          color: #0F172A;
          min-height: 100vh;
          padding-bottom: 5rem;
        }

        .toc-container {
          max-width: 1060px;
          margin: 0 auto;
          padding: 0 4%;
        }

        .toc-hero {
          background: linear-gradient(135deg, #061A33 0%, #0D2D56 100%);
          color: #FFFFFF;
          padding: 3.25rem 0 2.5rem 0;
          border-bottom: 4px solid #F2C230;
        }

        .toc-eyebrow-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
          flex-wrap: wrap;
        }

        .toc-eyebrow {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #F2C230;
          background: rgba(242, 194, 48, 0.14);
          border: 1px solid rgba(242, 194, 48, 0.35);
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
        }

        .toc-total-pill {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.76rem;
          font-weight: 700;
          color: #E2E8F0;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
        }

        .toc-hero h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.85rem, 3.4vw, 2.75rem);
          margin: 0 0 0.6rem 0;
          color: #FFFFFF;
        }

        .toc-hero p {
          font-size: 1.02rem;
          line-height: 1.6;
          color: rgba(241, 245, 249, 0.85);
          max-width: 700px;
          margin: 0 0 1.65rem 0;
        }

        .toc-jump-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }

        .toc-jump-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #F8FAFC;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .toc-jump-pill:hover {
          background: rgba(242, 194, 48, 0.2);
          border-color: #F2C230;
        }

        .toc-jump-count {
          background: #F2C230;
          color: #061A33;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 0.08rem 0.42rem;
          border-radius: 999px;
        }

        /* List Layout */
        .toc-body {
          padding-top: 3rem;
        }

        .toc-category-section {
          margin-bottom: 3.25rem;
          scroll-margin-top: 1.5rem;
        }

        .toc-category-header {
          margin-bottom: 0.85rem;
          padding-bottom: 0.65rem;
          border-bottom: 2px solid #061A33;
        }

        .toc-category-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .toc-category-header h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.35rem, 2.2vw, 1.75rem);
          color: #061A33;
          margin: 0;
        }

        .toc-category-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #061A33;
          background: #F2C230;
          padding: 0.22rem 0.65rem;
          border-radius: 999px;
        }

        .toc-category-header p {
          margin: 0.25rem 0 0 0;
          font-size: 0.92rem;
          color: #475569;
        }

        .toc-list {
          list-style: none;
          margin: 0;
          padding: 0;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
        }

        .toc-list-item + .toc-list-item {
          border-top: 1px solid #E2E8F0;
        }

        .toc-list-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 1rem 1.35rem;
          text-decoration: none;
          color: inherit;
          transition: background-color 0.15s ease;
        }

        .toc-list-link:hover {
          background-color: #F8FAFC;
        }

        .toc-item-main {
          flex: 1;
          min-width: 0;
        }

        .toc-item-title-line {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 0.25rem;
        }

        .toc-item-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #061A33;
          transition: color 0.15s ease;
        }

        .toc-list-link:hover .toc-item-title {
          color: #B47D00;
          text-decoration: underline;
        }

        .toc-highlight-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.65rem;
          font-weight: 800;
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FDE68A;
          padding: 0.12rem 0.5rem;
          border-radius: 999px;
        }

        .toc-item-desc {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.45;
          color: #475569;
        }

        .toc-item-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .toc-route-code {
          font-size: 0.78rem;
          font-weight: 600;
          color: #0369A1;
          background: #F0F9FF;
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
          white-space: nowrap;
        }

        .toc-item-arrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          color: #061A33;
          white-space: nowrap;
          transition: transform 0.15s ease, color 0.15s ease;
        }

        .toc-list-link:hover .toc-item-arrow {
          color: #B47D00;
          transform: translateX(3px);
        }

        @media (max-width: 720px) {
          .toc-list-link {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.65rem;
          }

          .toc-item-meta {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}} />
    </main>
  );
};

export default TableOfContents;
