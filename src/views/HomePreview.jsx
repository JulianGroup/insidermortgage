"use client";
import React from 'react';
import Link from 'next/link';
import { WHO_WE_SERVE_CATEGORIES } from '../data/taxonomy';
import Testimonials from '../components/Testimonials';
import TrustChips from '../components/TrustChips';
import ScheduleCallForm from '../components/ScheduleCallForm';
import './HomePreview.css';

/* Unified 18px line icon set (1.75 stroke) — replaces raw emojis & duplicate SVGs */
const LINE_ICONS = {
  'cat-self-employed': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 12h20" />
    </svg>
  ),
  'cat-investors': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 11h1M14 11h1M9 15h1M14 15h1" />
    </svg>
  ),
  'cat-first-time': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  ),
  'cat-retirees': (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V8" />
      <path d="M12 8c-2.5-3-6.5-3-8-.5 2.5 0 5 .5 8 .5z" />
      <path d="M12 8c2.5-3 6.5-3 8-.5-2.5 0-5 .5-8 .5z" />
      <path d="M6 20c1.8-1.2 3.8-1.8 6-1.8s4.2.6 6 1.8" />
    </svg>
  ),
  complicated: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  ),
};

const HERO_SPECIALIZATIONS = [
  { label: 'Self-Employed', href: '/self-employed-programs', icon: LINE_ICONS['cat-self-employed'] },
  { label: 'Investors', href: '/investor-loans', icon: LINE_ICONS['cat-investors'] },
  { label: 'First-Time Buyers', href: '/first-time', icon: LINE_ICONS['cat-first-time'] },
  { label: 'Retirees', href: '/retirees', icon: LINE_ICONS['cat-retirees'] },
  { label: 'Complicated Scenarios', href: '#contact', icon: LINE_ICONS.complicated },
];

export default function HomePreview() {
  const categories = WHO_WE_SERVE_CATEGORIES.filter(
    (cat) => cat.status === 'active' && cat.showOnHomepageWhoWeServe
  );

  return (
    <main className="hp-root">
      {/* Partner Review Banner */}
      <div className="hp-preview-bar">
        <div className="hp-preview-bar-inner">
          <span className="hp-preview-badge">
            <span className="hp-preview-dot" />
            Homepage Polish Preview for David &amp; Rakesh (Live homepage is untouched)
          </span>
          <Link href="/" className="hp-preview-link">
            Compare with Live Homepage →
          </Link>
        </div>
      </div>

      {/* Hero Stage: Surfing Dog Scene + Crisp Live HTML Typography */}
      <div className="hp-hero-wrapper">
        <section className="hp-hero-stage">
          <img
            src="/splash-bg.jpg"
            alt="Surfing dog riding the interest rate wave"
            className="hp-hero-bg"
            width={1920}
            height={1080}
            fetchPriority="high"
          />
          <div className="hp-hero-scrim" />

          <div className="hp-hero-header">
            <h1 className="hp-hero-h1">
              Trusted Mortgage Experts
            </h1>
            <p className="hp-hero-subtitle">
              Recommended by{' '}
              <span className="hp-hero-subtitle-accent">
                Professionals, Friends &amp; Family
              </span>
            </p>
          </div>

          <div className="hp-hero-wave-callout">
            <img
              src="/wave-quote-graphic.png"
              alt="I'm riding the interest rate wave"
              className="hp-hero-wave-quote"
              width={325}
              height={138}
            />
          </div>

          <div className="hp-hero-wave-divider">
            <svg viewBox="0 0 1440 110" preserveAspectRatio="none" className="hp-hero-wave-svg">
              <path
                d="M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65 L1440,110 L0,110 Z"
                fill="#060A2D"
              />
              <path
                d="M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65"
                fill="none"
                stroke="#EFB51E"
                strokeWidth="4"
              />
            </svg>
          </div>
        </section>

        {/* Specialization Bar with Distinct Icons & Real Routes */}
        <section className="hp-spec-band">
          <div className="hp-spec-inner">
            <h2 className="hp-spec-heading">
              <strong>Team Insider</strong> specializes in loans for:
            </h2>

            <div className="hp-spec-grid">
              {HERO_SPECIALIZATIONS.map((item) => (
                <Link key={item.label} href={item.href} className="hp-spec-pill">
                  <span className="hp-spec-icon">{item.icon}</span>
                  <span className="hp-spec-label">{item.label}</span>
                  <span className="hp-spec-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Team Insider Partner Portraits */}
      <section className="hp-partners-band">
        <div className="hp-partners-inner">
          <div className="hp-partners-header">
            <h2 className="hp-partners-h2">Team Insider</h2>
            <div className="hp-partners-accent" />
            <p className="hp-partners-sub">
              Led by <strong>David &amp; Rakesh</strong>
            </p>
          </div>

          <div className="hp-partners-grid">
            <div className="hp-partner-card">
              <img src="/david-sider.jpg" alt="David Sider" className="hp-partner-img" width={1000} height={666} loading="lazy" />
              <div className="hp-partner-info">
                <h3 className="hp-partner-name">David Sider</h3>
                <p className="hp-partner-role">Managing Partner / Broker</p>
                <Link href="/bio-david" className="hp-partner-btn">
                  Read bio →
                </Link>
              </div>
            </div>

            <div className="hp-partner-card">
              <img src="/rakesh-jain.jpg" alt="Rakesh Jain" className="hp-partner-img" width={332} height={336} loading="lazy" />
              <div className="hp-partner-info">
                <h3 className="hp-partner-name">Rakesh Jain</h3>
                <p className="hp-partner-role">Managing Partner / Broker</p>
                <Link href="/bio-rakesh" className="hp-partner-btn">
                  Read bio →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve: Unified Line Icons + Hairline Cards */}
      <section className="hp-solutions-section" id="solutions">
        <div className="hp-section-inner">
          <div className="hp-section-header">
            <h2 className="hp-section-h2">Who We Serve</h2>
            <p className="hp-section-sub">
              Mortgage solutions shouldn&apos;t be one-size-fits-all. We tailor residential and investment loan programs to fit your actual financial picture.
            </p>
          </div>

          <div className="hp-solutions-grid">
            {categories.map((cat) => (
              <div className="hp-solution-card" key={cat.id}>
                <div className="hp-solution-icon">
                  {LINE_ICONS[cat.id] || LINE_ICONS.complicated}
                </div>
                <h3>{cat.label}</h3>
                <p className="hp-solution-desc">{cat.description}</p>

                <ul className="hp-solution-list">
                  {cat.highlights.map((highlight, idx) => (
                    <li key={idx}>
                      <span className="hp-solution-dot" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <Link href={cat.route} className="hp-solution-cta">
                  Explore options
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Calculators Strip */}
      <section className="hp-tools-section">
        <div className="hp-section-inner">
          <div className="hp-tools-card">
            <div>
              <div className="hp-tools-kicker">Interactive Tools</div>
              <h2 className="hp-tools-h2">Run the math before you call</h2>
              <p className="hp-tools-sub">
                Model debt consolidation, HELOC vs. Fixed 2nd payments, or a 10-year rental property cash flow forecast privately in your browser.
              </p>
              <Link href="/geek-out" className="hp-tools-all-link">
                See all calculators →
              </Link>
            </div>

            <div className="hp-tools-grid">
              <Link href="/geek-out/weighted-average" className="hp-tool-tile">
                <span className="hp-tool-title">Blended Rate &amp; Consolidation Loan</span>
                <span className="hp-tool-desc">
                  Calculate your combined rate across existing debts and compare a HELOC 2nd vs. Fixed 2nd consolidation.
                </span>
                <span className="hp-tool-go">Open calculator →</span>
              </Link>

              <Link href="/tools/rental-analyzer" className="hp-tool-tile">
                <span className="hp-tool-title">Rental Property Analyzer</span>
                <span className="hp-tool-desc">
                  Underwrite cash flow, DSCR, 10-year IRR, and future rate-and-term or cash-out refinance scenarios.
                </span>
                <span className="hp-tool-go">Open analyzer →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Google Reviews Carousel */}
      <Testimonials />

      {/* Consultation / Lead Capture with Refined Controls & High-Contrast CTA */}
      <section className="hp-lead-wrap" id="contact">
        <div className="hp-lead-inner">
          <div className="hp-section-header" style={{ marginBottom: 0 }}>
            <h2 className="hp-section-h2">Run your numbers with David and Rakesh</h2>
            <p className="hp-section-sub">
              Whether you&apos;re comparing loan structures, planning a purchase, or weighing a HELOC or refinance, we&apos;ll walk through your exact scenario directly.
            </p>
          </div>

          <TrustChips placement="lead-capture" layout="row" />

          <ScheduleCallForm
            source="HomePreview"
            title="Request a Consultation with David and Rakesh"
          />
        </div>
      </section>
    </main>
  );
}
