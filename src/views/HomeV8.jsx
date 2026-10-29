"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { submitConsultationLead } from '../lib/submitLead';
import TrustChips from '../components/TrustChips';

const specialtiesBento = [
  {
    id: 'self-employed',
    tag: 'ENTREPRENEURS & 1099',
    title: 'Self-Employed',
    shortDesc: 'Bank Statement, P&L-only, and 1099 qualification strategies.',
    route: '/self-employed-programs',
    icon: (
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="22" height="16" rx="2.5" />
        <path d="M9 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        <path d="M3 13h22" />
      </svg>
    )
  },
  {
    id: 'investors',
    tag: 'PORTFOLIO GROWTH',
    title: 'Investors',
    shortDesc: 'DSCR cash-flow loans with no personal income limits.',
    route: '/dscr-loans',
    icon: (
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 24h22" />
        <path d="M6 24V10l8-6 8 6v14" />
        <path d="M11 24v-6h6v6" />
      </svg>
    )
  },
  {
    id: 'first-time',
    tag: 'STEP-BY-STEP ROADMAP',
    title: 'First Time Buyers',
    shortDesc: 'Low down payment options and strategic pre-approvals.',
    route: '/first-time',
    icon: (
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9.5" cy="14.5" r="5.5" />
        <path d="M14 14.5h11" />
        <path d="M21 14.5v4" />
        <path d="M24 14.5v3" />
      </svg>
    )
  },
  {
    id: 'retirees',
    tag: 'ASSET-BASED QUALIFYING',
    title: 'Retirees',
    shortDesc: 'Asset depletion & equity solutions without W-2 income.',
    route: '/retirees',
    icon: (
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 24V11" />
        <path d="M14 11c-2.5-3.5-7-3.5-9-1 2.5 0 5.5 1 9 1z" />
        <path d="M14 11c2.5-3.5 7-3.5 9-1-2.5 0-5.5 1-9 1z" />
        <path d="M8 24c2-1.5 4-2 6-2s4 .5 6 2" />
      </svg>
    )
  },
  {
    id: 'complicated',
    tag: 'BESPOKE STRUCTURING',
    title: 'Borrowers with Complicated Scenarios',
    shortDesc: 'Multi-entity LLCs, S-Corps, trusts, and non-traditional income.',
    route: '/mortgage-for-llc',
    icon: (
      <svg viewBox="0 0 28 28" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 23H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7" />
        <line x1="8" y1="9" x2="15" y2="9" />
        <line x1="8" y1="13" x2="15" y2="13" />
        <circle cx="21" cy="20" r="3" />
        <path d="M21 15.5v1.2M21 23.3v1.2M16.5 20h1.2M24.3 20h1.2" />
      </svg>
    )
  }
];

const solutionPrograms = [
  {
    id: 'self-employed',
    badge: 'ENTREPRENEURS & CONTRACTORS',
    title: 'Self-Employed Borrowers',
    description:
      "Your tax returns are designed to minimize tax liability—not showcase your true borrowing power. We use alternative documentation programs tailored to how your business actually operates.",
    metrics: '12–24 Mo. Bank Statements • 1099 Only • CPA P&L',
    highlights: [
      'Bank Statement Loans (Personal or Business)',
      '1099 Expense-Ratio Qualification',
      'S-Corp, LLC & Small Business Structuring'
    ],
    route: '/self-employed-programs',
    span: 'wide'
  },
  {
    id: 'investors',
    badge: 'REAL ESTATE PORTFOLIOS',
    title: 'Rental & DSCR Financing',
    description:
      'Scale your real estate holdings without personal debt-to-income bottlenecks. Qualify directly on the subject property’s rental cash flow.',
    metrics: 'DSCR Cash-Flow Qualifying • LLC Vesting Available',
    highlights: [
      'No Personal Income or Tax Returns Required',
      'Long-Term & Short-Term Rental Options',
      'Portfolio & Cross-Collateral Strategies'
    ],
    route: '/dscr-loans',
    span: 'normal'
  },
  {
    id: 'retirees',
    badge: 'WEALTH & RETIREMENT',
    title: 'Retirees & Asset-Rich Borrowers',
    description:
      'Turn retirement accounts, investment portfolios, and home equity into qualifying power—even with zero traditional W-2 employment income.',
    metrics: 'Asset Depletion • Retirement Distributions',
    highlights: [
      'Asset Depletion & Portfolio Qualifying',
      'Strategic Equity Unlocking & Downsizing',
      'Tailored Cash-Flow Preservation'
    ],
    route: '/retirees',
    span: 'normal'
  },
  {
    id: 'first-time',
    badge: 'NEXT-GENERATION BUYERS',
    title: 'First-Time Home Buyers & Complex Scenarios',
    description:
      'Buying your first home—or navigating variable RSU/bonus compensation, family gifts, or co-borrowers—requires an advisor who maps out every step before you make an offer.',
    metrics: ' Rock-Solid Pre-Approvals • Low Down Payment Options',
    highlights: [
      'Clear Side-by-Side Total Cost Comparisons',
      'Low Down Payment & Assistance Strategies',
      'Realtor-Backed Pre-Approval Letters That Win Offers'
    ],
    route: '/first-time',
    span: 'wide'
  }
];

function formatUsPhoneInput(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  const trimmed = normalized.slice(0, 10);
  if (trimmed.length === 0) return '';
  if (trimmed.length < 4) return `(${trimmed}`;
  if (trimmed.length < 7) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6, 10)}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim());
}

function isValidUsPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  return /^[2-9]\d{9}$/.test(normalized);
}

const PREFERRED_DAY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

const HomeV8 = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    preferredDays: [],
    preferredTime: "I'm flexible",
    smsConsent: false
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    phone: '',
    category: ''
  });
  const [showScheduleSection, setShowScheduleSection] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const existingScript = document.querySelector('script[data-igr-script]');
    const initWidget = () => {
      if (typeof window !== 'undefined' && window.InsiderGoogleReviews) {
        window.InsiderGoogleReviews.init();
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '/google-reviews/google-reviews-widget.js';
      script.async = true;
      script.setAttribute('data-igr-script', 'true');
      script.onload = initWidget;
      document.body.appendChild(script);
    } else {
      initWidget();
    }
  }, []);

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const exists = prev.preferredDays.includes(day);
      const nextDays = exists
        ? prev.preferredDays.filter((d) => d !== day)
        : [...prev.preferredDays, day];
      return {
        ...prev,
        preferredDays: nextDays
      };
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue =
      type === 'checkbox'
        ? checked
        : name === 'phone'
        ? formatUsPhoneInput(value)
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStepOne = () => {
    const errors = {
      name: '',
      email: '',
      phone: '',
      category: ''
    };
    if (!formData.name.trim()) {
      errors.name = 'Please enter your full name.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address.';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address (e.g., you@example.com).';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter a 10-digit US phone number.';
    } else if (!isValidUsPhone(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit US phone number, e.g., (555) 123-4567.';
    }
    if (!formData.category) {
      errors.category = 'Please select a profile option.';
    }
    setFieldErrors(errors);
    return !errors.name && !errors.email && !errors.phone && !errors.category;
  };

  const handleOpenSchedule = () => {
    setShowScheduleSection(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStepOne()) return;
    setStatus('submitting');
    try {
      await submitConsultationLead(formData, 'HomeV8');
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: '',
        preferredDays: [],
        preferredTime: "I'm flexible",
        smsConsent: false
      });
      setFieldErrors({ name: '', email: '', phone: '', category: '' });
      setShowScheduleSection(false);
    } catch (err) {
      console.error('Submission Error:', err);
      setStatus('error');
    }
  };

  return (
    <main className="v8-page">
      <Head>
        <title>Insider Mortgage | Trusted Mortgage Experts (V8)</title>
        <meta
          name="description"
          content="Team Insider — Trusted Mortgage Experts Recommended by Professionals, Friends & Family."
        />
      </Head>

      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Fraunces:ital,opsz,wght@0,9..144,600;0,9..144,700;1,9..144,600&family=Montserrat:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* =================================================================
          1. LAND-BOOK EDITORIAL SPLIT-SCREEN ADVISORY HERO
         ================================================================= */}
      <section className="v8-hero-section">
        <div className="v8-ambient-glow v8-glow-1" />
        <div className="v8-ambient-glow v8-glow-2" />

        <div className="v8-container">
          <div className="v8-hero-grid">
            {/* Left Column: High-Trust Editorial Typography & Advisory CTA */}
            <div className="v8-hero-copy">
              <div className="v8-eyebrow-pill">
                <span className="v8-eyebrow-dot" />
                <span>TEAM INSIDER • MORTGAGE ADVISORY</span>
              </div>

              <div className="v8-headline-wrap">
                <img
                  src="/headline-graphic.png"
                  alt="TRUSTED MORTGAGE EXPERTS"
                  className="v8-headline-graphic"
                />
              </div>

              <p className="v8-recommended-line">
                Recommended by{' '}
                <span className="v8-gold-text">
                  Professionals, Friends &amp; Family.
                </span>
              </p>

              <h2 className="v8-editorial-subhead">
                Mortgage advice built around your situation—
                <em>not simply a loan.</em>
              </h2>

              <p className="v8-editorial-lead">
                Experienced mortgage professionals helping buyers, homeowners,
                investors, self-employed borrowers, and retirees evaluate their
                options and structure the right financing strategy.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="v8-cta-group">
                <a href="#contact" className="v8-btn-primary">
                  <span>Schedule a Mortgage Review</span>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>

                <a href="#solutions" className="v8-btn-secondary">
                  Explore Loan Strategies
                </a>
              </div>

              <div className="v8-referral-note">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#F2C230" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span>
                  Referred by a friend, client, or trusted professional?{' '}
                  <strong>You’re in the right place.</strong>
                </span>
              </div>
            </div>

            {/* Right Column: Framed Surfing Dog Showcase Card + Floating Badges */}
            <div className="v8-hero-visual">
              <div className="v8-dog-showcase-frame">
                <img
                  src="/splash-bg.jpg"
                  alt="Surfing dog riding the interest rate wave"
                  className="v8-dog-showcase-img"
                />

                {/* Subtle top-left glass tag inside image */}
                <div className="v8-floating-chip v8-chip-top">
                  <span className="v8-chip-indicator" />
                  <span>Strategic Rate &amp; Structure Analysis</span>
                </div>

                {/* Extracted handwritten quote positioned on the sunset reflection */}
                <div className="v8-dog-quote-overlay">
                  <img
                    src="/wave-quote-graphic.png"
                    alt="I'm riding the interest rate wave"
                    className="v8-dog-quote-img"
                  />
                </div>
              </div>

              {/* Floating Advisory Card bottom-left of frame */}
              <div className="v8-floating-advisory-card">
                <div className="v8-advisory-avatars">
                  <img src="/david-sider.jpg" alt="David Sider" />
                  <img src="/rakesh-jain.jpg" alt="Rakesh Jain" />
                </div>
                <div className="v8-advisory-meta">
                  <strong>Direct Partner Advisory</strong>
                  <span>Work directly with David &amp; Rakesh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Bento Specialty Bar */}
          <div className="v8-bento-bar">
            <div className="v8-bento-header">
              <div className="v8-bento-title-group">
                <span className="v8-bento-eyebrow">TAILORED LENDING EXPERTISE</span>
                <h3>
                  <strong>Team Insider</strong> specializes in loans for:
                </h3>
              </div>
              <span className="v8-bento-hint">Select a profile to explore →</span>
            </div>

            <div className="v8-bento-grid">
              {specialtiesBento.map((item) => (
                <Link key={item.id} href={item.route} className="v8-bento-card">
                  <div className="v8-bento-card-top">
                    <span className="v8-bento-icon">{item.icon}</span>
                    <span className="v8-bento-arrow">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </span>
                  </div>
                  <span className="v8-bento-tag">{item.tag}</span>
                  <h4 className="v8-bento-card-title">{item.title}</h4>
                  <p className="v8-bento-card-desc">{item.shortDesc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          2. EDITORIAL BIO SECTION: TEAM INSIDER LED BY DAVID & RAKESH
         ================================================================= */}
      <section className="v8-partners-section">
        <div className="v8-container">
          <div className="v8-partners-header">
            <span className="v8-section-kicker">MEET YOUR ADVISORS</span>
            <h2 className="v8-team-insider-title">Team Insider</h2>
            <svg
              viewBox="0 0 420 26"
              preserveAspectRatio="none"
              className="v8-team-swoosh"
            >
              <path
                d="M6,20 Q205,2 414,15 Q210,11 18,24 Z"
                fill="#F2C230"
              />
            </svg>
            <p className="v8-team-led-by">
              led by <strong>David &amp; Rakesh</strong>
            </p>
            <p className="v8-partners-intro">
              Unlike call-center lenders or algorithms, we personally evaluate your
              tax returns, business entities, real estate goals, and long-term
              balance sheet to craft a financing strategy that fits.
            </p>
          </div>

          <div className="v8-partners-grid">
            {/* Partner 1: Rakesh Jain */}
            <div className="v8-partner-editorial-card">
              <div className="v8-partner-photo-wrap">
                <img
                  src="/rakesh-jain.jpg"
                  alt="Rakesh Jain"
                  className="v8-partner-photo"
                />
              </div>
              <div className="v8-partner-content">
                <span className="v8-partner-role">Managing Partner / Broker</span>
                <h3>Rakesh Jain</h3>
                <p>
                  Known for structuring complex self-employed, multi-entity, and
                  real estate investor transactions with precision and clarity.
                </p>
                <div className="v8-partner-tags">
                  <span>Self-Employed Strategy</span>
                  <span>Investor &amp; DSCR</span>
                  <span>Complex Tax Returns</span>
                </div>
                <Link href="/bio-rakesh" className="v8-partner-link">
                  <span>Read Rakesh’s Full Bio</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Partner 2: David Sider */}
            <div className="v8-partner-editorial-card">
              <div className="v8-partner-photo-wrap">
                <img
                  src="/david-sider.jpg"
                  alt="David Sider"
                  className="v8-partner-photo"
                />
              </div>
              <div className="v8-partner-content">
                <span className="v8-partner-role">Managing Partner / Broker</span>
                <h3>David Sider</h3>
                <p>
                  Dedicated to helping home buyers, families, and retirees navigate
                  rate cycles and unlock flexible financing solutions with zero
                  surprises.
                </p>
                <div className="v8-partner-tags">
                  <span>Purchase &amp; Refinance</span>
                  <span>Retiree &amp; Asset Loans</span>
                  <span>First-Time Buyers</span>
                </div>
                <Link href="/bio-david" className="v8-partner-link">
                  <span>Read David’s Full Bio</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          3. LAND-BOOK BENTO SOLUTIONS SECTION
         ================================================================= */}
      <section className="v8-solutions-section" id="solutions">
        <div className="v8-container">
          <div className="v8-section-header-split">
            <div>
              <span className="v8-section-kicker v8-kicker-dark">FINANCING ARCHITECTURES</span>
              <h2 className="v8-section-title-dark">
                Built for borrowers who don’t fit inside a cookie-cutter box.
              </h2>
            </div>
            <p className="v8-section-desc-dark">
              We believe mortgage advice shouldn’t be one-size-fits-all. Explore how
              we tailor loan programs around your income structure, assets, and
              investment horizon.
            </p>
          </div>

          <div className="v8-solutions-bento">
            {solutionPrograms.map((prog) => (
              <div
                key={prog.id}
                className={`v8-solution-bento-card ${
                  prog.span === 'wide' ? 'v8-bento-span-7' : 'v8-bento-span-5'
                }`}
              >
                <div className="v8-sol-top">
                  <span className="v8-sol-badge">{prog.badge}</span>
                  <span className="v8-sol-metrics">{prog.metrics}</span>
                </div>

                <h3>{prog.title}</h3>
                <p>{prog.description}</p>

                <ul className="v8-sol-list">
                  {prog.highlights.map((h) => (
                    <li key={h}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#D99B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="v8-sol-footer">
                  <Link href={prog.route} className="v8-sol-btn">
                    <span>Explore {prog.title}</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          4. EDITORIAL CLIENT SUCCESS STORIES (TESTIMONIALS)
         ================================================================= */}
      <section className="v8-testimonials-section" id="reviews">
        <div className="v8-container">
          <div className="v8-testimonials-header">
            <span className="v8-section-kicker">VERIFIED CLIENT REVIEWS</span>
            <h2>Why Professionals, Friends &amp; Family Refer Us</h2>
            <p>
              Our business is built on trust and repeat referrals from CPAs,
              financial advisors, Realtors, and past clients.
            </p>
          </div>

          <div className="v8-testimonials-frame">
            <div
              id="insider-google-reviews"
              data-reviews-url="/google-reviews/data/reviews.json"
              data-heading="The Word on the Street"
              data-show-heading="true"
              data-expand-mode="inline"
              style={{ width: '100%', '--igr-bg': 'transparent', '--igr-padding': '0' }}
            />
          </div>
        </div>
      </section>

      {/* =================================================================
          5. LAND-BOOK CONCIERGE CONSULTATION SECTION (LEAD CAPTURE)
         ================================================================= */}
      <section className="v8-contact-section" id="contact">
        <div className="v8-container">
          <div style={{ marginBottom: '2rem' }}>
            <TrustChips placement="lead-capture" layout="row" />
          </div>
          <div className="v8-contact-card">
            <div className="v8-contact-left">
              <span className="v8-section-kicker">ONE OBVIOUS NEXT STEP</span>
              <h2>Schedule Your Mortgage Review</h2>
              <p>
                Whether you are preparing to buy, evaluating a refinance, or
                structuring a complex self-employed or investment scenario, let’s
                review your numbers together.
              </p>

              <div className="v8-contact-pillars">
                <div className="v8-pillar-item">
                  <div className="v8-pillar-icon">1</div>
                  <div>
                    <strong>15-Minute Discovery Call</strong>
                    <span>A candid conversation about your goals and timeline—no sales pressure.</span>
                  </div>
                </div>
                <div className="v8-pillar-item">
                  <div className="v8-pillar-icon">2</div>
                  <div>
                    <strong>Custom Scenario Modeling</strong>
                    <span>We analyze tax returns, entity structures, and rate/cost trade-offs.</span>
                  </div>
                </div>
                <div className="v8-pillar-item">
                  <div className="v8-pillar-icon">3</div>
                  <div>
                    <strong>Clear Actionable Strategy</strong>
                    <span>Walk away with a concrete financing roadmap or pre-approval.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="v8-contact-right">
              <h3>Request a Consultation</h3>

              <form onSubmit={handleSubmit} className="v8-form" noValidate>
                <h4 className="v8-schedule-heading">When is a good time to connect?</h4>
                <p className="v8-schedule-subtext">
                  Let us know what works best for you.
                </p>

                <div className="v8-radio-group">
                  <span className="v8-radio-title">Preferred day</span>
                  <div className="v8-options-grid v8-days-grid">
                    {PREFERRED_DAY_OPTIONS.map((day) => {
                      const isSelected = formData.preferredDays.includes(day);
                      return (
                        <label key={day} className="v8-radio-item">
                          <input
                            type="checkbox"
                            name="preferredDays"
                            value={day}
                            checked={isSelected}
                            onChange={() => handleDayToggle(day)}
                            className="v8-multi-radio-input"
                          />
                          <span>{day}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="v8-radio-group">
                  <span className="v8-radio-title">Preferred time (Pacific Time)</span>
                  <div className="v8-options-grid v8-times-grid">
                    <label className="v8-radio-item">
                      <input
                        type="radio"
                        name="preferredTime"
                        value="Morning (9 AM–12 PM)"
                        checked={formData.preferredTime === 'Morning (9 AM–12 PM)'}
                        onChange={handleChange}
                      />
                      <span>Morning (9 AM–12 PM)</span>
                    </label>
                    <label className="v8-radio-item">
                      <input
                        type="radio"
                        name="preferredTime"
                        value="Afternoon (12 PM–4 PM)"
                        checked={formData.preferredTime === 'Afternoon (12 PM–4 PM)'}
                        onChange={handleChange}
                      />
                      <span>Afternoon (12 PM–4 PM)</span>
                    </label>
                    <label className="v8-radio-item">
                      <input
                        type="radio"
                        name="preferredTime"
                        value="Late afternoon (4 PM–6 PM)"
                        checked={formData.preferredTime === 'Late afternoon (4 PM–6 PM)'}
                        onChange={handleChange}
                      />
                      <span>Late afternoon (4 PM–6 PM)</span>
                    </label>
                    <label className="v8-radio-item">
                      <input
                        type="radio"
                        name="preferredTime"
                        value="I'm flexible"
                        checked={formData.preferredTime === "I'm flexible"}
                        onChange={handleChange}
                      />
                      <span>I&apos;m flexible</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className="v8-dark-pill-btn"
                  onClick={handleOpenSchedule}
                >
                  Schedule Time
                </button>

                {showScheduleSection && (
                  <div className="v8-schedule-drawer">
                    <p className="v8-form-sub" style={{ margin: '0 0 0.25rem 0' }}>
                      Tell us a little about yourself, and we&apos;ll help you take the next step.
                    </p>

                    <div className="v8-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className={`v8-pill-input ${fieldErrors.name ? 'v8-input-error' : ''}`}
                      />
                      {fieldErrors.name && (
                        <span className="v8-error-text">{fieldErrors.name}</span>
                      )}
                    </div>

                    <div className="v8-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`v8-pill-input ${fieldErrors.email ? 'v8-input-error' : ''}`}
                      />
                      {fieldErrors.email && (
                        <span className="v8-error-text">{fieldErrors.email}</span>
                      )}
                    </div>

                    <div className="v8-field">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        className={`v8-pill-input ${fieldErrors.phone ? 'v8-input-error' : ''}`}
                      />
                      {fieldErrors.phone ? (
                        <span className="v8-error-text">{fieldErrors.phone}</span>
                      ) : (
                        <span className="v8-phone-helper">
                          We&apos;ll use this to follow up on your consultation request.
                        </span>
                      )}
                    </div>

                    <div className="v8-field">
                      <label>I am best described as a...</label>
                      <select
                        name="category"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className={`v8-pill-input ${fieldErrors.category ? 'v8-input-error' : ''}`}
                      >
                        <option value="" disabled>
                          Select a profile...
                        </option>
                        <option value="Self-Employed">Self-Employed Borrower</option>
                        <option value="Retiree">Retiree</option>
                        <option value="Real Estate Investor">Real Estate Investor (Rental Property)</option>
                        <option value="First-Time Home Buyer">First-Time Home Buyer</option>
                        <option value="Other">Other / Standard Refinance</option>
                      </select>
                      {fieldErrors.category && (
                        <span className="v8-error-text">{fieldErrors.category}</span>
                      )}
                    </div>

                    <div className="v8-sms-consent">
                      <label className="v8-sms-label">
                        <input
                          type="checkbox"
                          name="smsConsent"
                          checked={formData.smsConsent}
                          onChange={handleChange}
                        />
                        <strong>Yes, you may text me.</strong>
                      </label>
                      <p className="v8-sms-disclaimer">
                        I agree to receive text messages from Insider Mortgage about my consultation
                        request and scheduling. Consent is not a condition of purchasing services.
                        Message frequency varies. Message and data rates may apply. Reply STOP to opt
                        out.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="v8-dark-pill-btn"
                      disabled={status === 'submitting'}
                    >
                      {status === 'submitting' ? 'Sending...' : 'Request a Call'}
                    </button>
                  </div>
                )}

                {status === 'success' && (
                  <div className="v8-alert v8-alert-success">
                    Thank you! Your request has been received. David or Rakesh will
                    be in touch shortly.
                  </div>
                )}
                {status === 'error' && (
                  <div className="v8-alert v8-alert-error">
                    Something went wrong submitting your request. Please try again.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .v8-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0A192F;
          background-color: #F8FAFC;
          overflow-x: hidden;
        }

        .v8-container {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 4%;
          position: relative;
          z-index: 2;
        }

        /* =========================================================
           1. HERO SECTION (LAND-BOOK SPLIT EDITORIAL + BENTO BAR)
           ========================================================= */
        .v8-hero-section {
          position: relative;
          background: radial-gradient(circle at 82% 22%, #133B6E 0%, #061A33 52%, #031022 100%);
          color: #FFFFFF;
          padding: 3.5rem 0 4.5rem 0;
          overflow: hidden;
        }

        .v8-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          z-index: 1;
        }

        .v8-glow-1 {
          width: 520px;
          height: 520px;
          background: rgba(242, 194, 48, 0.14);
          top: -120px;
          right: 8%;
        }

        .v8-glow-2 {
          width: 460px;
          height: 460px;
          background: rgba(29, 122, 218, 0.18);
          bottom: 5%;
          left: -100px;
        }

        .v8-hero-grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          gap: 3.25rem;
          align-items: center;
        }

        .v8-eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 1rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(242, 194, 48, 0.35);
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 1.4px;
          color: #F2C230;
          margin-bottom: 1.25rem;
        }

        .v8-eyebrow-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F2C230;
          box-shadow: 0 0 10px #F2C230;
        }

        .v8-headline-wrap {
          width: 100%;
          max-width: 640px;
          margin-bottom: 0.45rem;
        }

        .v8-headline-graphic {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.65));
        }

        .v8-recommended-line {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 1.55vw, 1.38rem);
          color: #F8FAFC;
          margin: 0 0 1.5rem 0;
        }

        .v8-gold-text {
          color: #F2C230;
        }

        .v8-editorial-subhead {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          font-size: clamp(1.65rem, 2.6vw, 2.45rem);
          line-height: 1.2;
          color: #FFFFFF;
          margin: 0 0 1rem 0;
          letter-spacing: -0.4px;
        }

        .v8-editorial-subhead em {
          font-style: italic;
          color: #F2C230;
          font-weight: 600;
        }

        .v8-editorial-lead {
          font-size: clamp(1rem, 1.2vw, 1.14rem);
          line-height: 1.68;
          color: rgba(241, 245, 249, 0.86);
          margin: 0 0 2rem 0;
          max-width: 590px;
        }

        .v8-cta-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.65rem;
        }

        .v8-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          background: #F2C230;
          color: #061A33;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          padding: 1rem 1.75rem;
          border-radius: 14px;
          text-decoration: none;
          box-shadow: 0 12px 28px rgba(242, 194, 48, 0.28);
          transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .v8-btn-primary:hover {
          background: #FFCF40;
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(242, 194, 48, 0.38);
        }

        .v8-btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 1rem 1.45rem;
          border-radius: 14px;
          border: 1.5px solid rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.05);
          color: #FFFFFF;
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 0.96rem;
          text-decoration: none;
          transition: background-color 0.2s ease, border-color 0.2s ease;
        }

        .v8-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .v8-referral-note {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.94rem;
          color: rgba(241, 245, 249, 0.85);
          background: rgba(255, 255, 255, 0.05);
          border-left: 3px solid #F2C230;
          padding: 0.65rem 1rem;
          border-radius: 0 10px 10px 0;
        }

        .v8-referral-note strong {
          color: #FFFFFF;
        }

        /* Right Column Visual Showcase */
        .v8-hero-visual {
          position: relative;
        }

        .v8-dog-showcase-frame {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10.5;
          border-radius: 26px;
          overflow: hidden;
          border: 1.5px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.55);
          background: #041E3A;
        }

        .v8-dog-showcase-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 62% center;
          display: block;
          transform: scale(1.01);
        }

        .v8-floating-chip {
          position: absolute;
          top: 1.1rem;
          left: 1.1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem 0.9rem;
          border-radius: 999px;
          background: rgba(4, 24, 48, 0.72);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          font-size: 0.78rem;
          font-weight: 600;
          color: #F8FAFC;
          z-index: 3;
        }

        .v8-chip-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22C55E;
        }

        .v8-dog-quote-overlay {
          position: absolute;
          bottom: 13%;
          right: 4%;
          width: 34%;
          z-index: 3;
          pointer-events: none;
        }

        .v8-dog-quote-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 1px 6px rgba(255, 255, 255, 0.55));
        }

        .v8-floating-advisory-card {
          position: absolute;
          bottom: -1.35rem;
          left: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          padding: 0.75rem 1.15rem;
          border-radius: 18px;
          background: rgba(8, 31, 58, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(242, 194, 48, 0.45);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
          z-index: 4;
        }

        .v8-advisory-avatars {
          display: flex;
          align-items: center;
        }

        .v8-advisory-avatars img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #F2C230;
        }

        .v8-advisory-avatars img + img {
          margin-left: -12px;
        }

        .v8-advisory-meta {
          display: flex;
          flex-direction: column;
          font-size: 0.82rem;
          line-height: 1.3;
        }

        .v8-advisory-meta strong {
          color: #FFFFFF;
          font-weight: 700;
        }

        .v8-advisory-meta span {
          color: #F2C230;
          font-weight: 500;
        }

        /* Bento Specialty Bar */
        .v8-bento-bar {
          margin-top: 4.25rem;
          padding-top: 2.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .v8-bento-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.35rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .v8-bento-eyebrow {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #F2C230;
          margin-bottom: 0.25rem;
        }

        .v8-bento-title-group h3 {
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.25rem, 2vw, 1.7rem);
          color: #F8FAFC;
        }

        .v8-bento-title-group h3 strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .v8-bento-hint {
          font-size: 0.88rem;
          color: rgba(241, 245, 249, 0.7);
          font-weight: 500;
        }

        .v8-bento-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
        }

        .v8-bento-card {
          display: flex;
          flex-direction: column;
          padding: 1.25rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.12);
          text-decoration: none;
          color: #FFFFFF;
          transition: transform 0.22s ease, background-color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }

        .v8-bento-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.1);
          border-color: #F2C230;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
        }

        .v8-bento-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
        }

        .v8-bento-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: rgba(242, 194, 48, 0.16);
          color: #F2C230;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .v8-bento-arrow {
          color: rgba(255, 255, 255, 0.45);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .v8-bento-card:hover .v8-bento-arrow {
          color: #F2C230;
          transform: translate(2px, -2px);
        }

        .v8-bento-tag {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 1px;
          color: #F2C230;
          margin-bottom: 0.3rem;
        }

        .v8-bento-card-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 0.4rem 0;
          line-height: 1.25;
        }

        .v8-bento-card-desc {
          font-size: 0.84rem;
          line-height: 1.45;
          color: rgba(241, 245, 249, 0.74);
          margin: 0;
        }

        /* =========================================================
           2. BIO SECTION (TEAM INSIDER LED BY DAVID & RAKESH)
           ========================================================= */
        .v8-partners-section {
          background: #061A33;
          color: #FFFFFF;
          padding: 5.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .v8-partners-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3.5rem auto;
        }

        .v8-section-kicker {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 1.8px;
          color: #F2C230;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }

        .v8-team-insider-title {
          margin: 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          font-size: clamp(2.4rem, 4.8vw, 3.6rem);
          line-height: 1.05;
          color: #FFFFFF;
        }

        .v8-team-swoosh {
          width: clamp(240px, 40vw, 370px);
          height: 20px;
          margin: 0.25rem 0;
          display: block;
        }

        .v8-team-led-by {
          margin: 0 0 1.25rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.25rem, 2.3vw, 1.85rem);
          color: #FFFFFF;
        }

        .v8-team-led-by strong {
          font-weight: 700;
          color: #F2C230;
        }

        .v8-partners-intro {
          font-size: 1.05rem;
          line-height: 1.65;
          color: rgba(241, 245, 249, 0.8);
          margin: 0;
        }

        .v8-partners-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 2rem;
        }

        .v8-partner-editorial-card {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 1.75rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 1.5rem;
          align-items: center;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .v8-partner-editorial-card:hover {
          border-color: rgba(242, 194, 48, 0.6);
          transform: translateY(-3px);
        }

        .v8-partner-photo-wrap {
          width: 100%;
          aspect-ratio: 4 / 5;
          border-radius: 16px;
          overflow: hidden;
          background: #0A2342;
        }

        .v8-partner-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .v8-partner-role {
          display: inline-block;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #F2C230;
          margin-bottom: 0.35rem;
        }

        .v8-partner-content h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.75rem;
          margin: 0 0 0.65rem 0;
          color: #FFFFFF;
        }

        .v8-partner-content p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: rgba(241, 245, 249, 0.8);
          margin: 0 0 1rem 0;
        }

        .v8-partner-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-bottom: 1.25rem;
        }

        .v8-partner-tags span {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #E2E8F0;
        }

        .v8-partner-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 0.9rem;
          color: #F2C230;
          text-decoration: none;
        }

        .v8-partner-link:hover {
          text-decoration: underline;
        }

        /* =========================================================
           3. BENTO SOLUTIONS SECTION (LIGHT WARM IVORY / SLATE)
           ========================================================= */
        .v8-solutions-section {
          padding: 6rem 0;
          background: #F8FAFC;
        }

        .v8-section-header-split {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
          align-items: end;
          margin-bottom: 3rem;
        }

        .v8-kicker-dark {
          color: #B47D00;
          display: block;
        }

        .v8-section-title-dark {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2rem, 3.2vw, 2.85rem);
          line-height: 1.15;
          color: #061A33;
          margin: 0;
        }

        .v8-section-desc-dark {
          font-size: 1.06rem;
          line-height: 1.65;
          color: #475569;
          margin: 0;
        }

        .v8-solutions-bento {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .v8-bento-span-7 {
          grid-column: span 7;
        }

        .v8-bento-span-5 {
          grid-column: span 5;
        }

        .v8-solution-bento-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(6, 26, 51, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .v8-solution-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(6, 26, 51, 0.09);
          border-color: #CBD5E1;
        }

        .v8-sol-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .v8-sol-badge {
          font-family: 'Montserrat', sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1.1px;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          background: #FEF3C7;
          color: #92400E;
        }

        .v8-sol-metrics {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748B;
        }

        .v8-solution-bento-card h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.6rem;
          color: #061A33;
          margin: 0 0 0.75rem 0;
        }

        .v8-solution-bento-card p {
          font-size: 0.98rem;
          line-height: 1.65;
          color: #475569;
          margin: 0 0 1.35rem 0;
        }

        .v8-sol-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .v8-sol-list li {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.93rem;
          font-weight: 600;
          color: #1E293B;
        }

        .v8-sol-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #F1F5F9;
        }

        .v8-sol-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 0.92rem;
          color: #061A33;
          text-decoration: none;
          transition: gap 0.2s ease, color 0.2s ease;
        }

        .v8-sol-btn:hover {
          color: #B47D00;
          gap: 0.75rem;
        }

        /* =========================================================
           4. TESTIMONIALS SECTION
           ========================================================= */
        .v8-testimonials-section {
          padding: 5.5rem 0;
          background: #FFFFFF;
          border-top: 1px solid #E2E8F0;
        }

        .v8-testimonials-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 2.5rem auto;
        }

        .v8-testimonials-header h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(1.9rem, 3vw, 2.6rem);
          color: #061A33;
          margin: 0.4rem 0 0.75rem 0;
        }

        .v8-testimonials-header p {
          font-size: 1.05rem;
          color: #475569;
          margin: 0;
        }

        .v8-testimonials-frame {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          padding: 2rem;
        }

        /* =========================================================
           5. CONCIERGE CONSULTATION SECTION
           ========================================================= */
        .v8-contact-section {
          padding: 5.5rem 0 6.5rem 0;
          background: #F8FAFC;
        }

        .v8-contact-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #061A33;
          color: #FFFFFF;
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 28px 60px rgba(6, 26, 51, 0.22);
        }

        .v8-contact-left {
          padding: 3.5rem;
          background: radial-gradient(circle at top left, #123764 0%, #061A33 75%);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .v8-contact-left h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2rem, 3vw, 2.65rem);
          margin: 0.4rem 0 1rem 0;
          color: #FFFFFF;
        }

        .v8-contact-left p {
          font-size: 1.02rem;
          line-height: 1.65;
          color: rgba(241, 245, 249, 0.82);
          margin: 0 0 2.25rem 0;
        }

        .v8-contact-pillars {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .v8-pillar-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .v8-pillar-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #F2C230;
          color: #061A33;
          font-family: 'Montserrat', sans-serif;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .v8-pillar-item strong {
          display: block;
          font-size: 1rem;
          color: #FFFFFF;
          margin-bottom: 0.2rem;
        }

        .v8-pillar-item span {
          font-size: 0.88rem;
          color: rgba(241, 245, 249, 0.74);
          line-height: 1.45;
        }

        .v8-contact-right {
          padding: 3.5rem;
          background: #FFFFFF;
          color: #061A33;
        }

        .v8-contact-right h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.75rem;
          margin: 0 0 0.4rem 0;
          color: #061A33;
        }

        .v8-form-sub {
          font-size: 0.94rem;
          color: #64748B;
          margin: 0 0 1.75rem 0;
        }

        .v8-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .v8-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .v8-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .v8-field label {
          font-size: 0.86rem;
          font-weight: 600;
          color: #374151;
        }

        .v8-field input.v8-pill-input,
        .v8-field select.v8-pill-input {
          padding: 0.78rem 1.15rem;
          border-radius: 999px;
          border: 1px solid #D1D5DB;
          font-size: 0.95rem;
          font-family: inherit;
          color: #111827;
          background: #FFFFFF;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .v8-field input.v8-pill-input:focus,
        .v8-field select.v8-pill-input:focus {
          outline: none;
          border-color: #111827;
          box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.08);
        }

        .v8-phone-helper {
          font-size: 0.78rem;
          color: #6B7280;
          margin-top: 0.1rem;
        }

        .v8-input-error {
          border-color: #DC2626 !important;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
        }

        .v8-error-text {
          font-size: 0.78rem;
          font-weight: 600;
          color: #DC2626;
          margin-top: 0.1rem;
        }

        .v8-dark-pill-btn {
          width: 100%;
          margin-top: 0.2rem;
          padding: 0.85rem 1.5rem;
          border-radius: 999px;
          border: none;
          background: #0B0F17;
          color: #FFFFFF;
          font-family: inherit;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .v8-dark-pill-btn:hover {
          background: #1F2937;
        }

        .v8-schedule-drawer {
          margin-top: 0.4rem;
          padding-top: 1.25rem;
          border-top: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .v8-schedule-heading {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }

        .v8-schedule-subtext {
          font-size: 0.88rem;
          color: #6B7280;
          margin: -0.6rem 0 0 0;
        }

        .v8-radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .v8-options-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.55rem 0.9rem;
        }

        @media (max-width: 540px) {
          .v8-days-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.5rem 0.75rem;
          }

          .v8-times-grid {
            grid-template-columns: 1fr;
            gap: 0.45rem;
          }
        }

        .v8-radio-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #4B5563;
          margin-bottom: 0.1rem;
        }

        .v8-radio-item {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.95rem;
          color: #1F2937;
          cursor: pointer;
          font-weight: 500;
          text-transform: none;
          letter-spacing: 0;
        }

        .v8-radio-item input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #0B0F17;
          cursor: pointer;
          margin: 0;
        }

        .v8-multi-radio-input {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 1.5px solid #6B7280;
          border-radius: 50%;
          background-color: #FFFFFF;
          cursor: pointer;
          margin: 0;
          display: inline-grid;
          place-content: center;
          flex-shrink: 0;
        }

        .v8-multi-radio-input::before {
          content: "";
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #0B0F17;
          transform: scale(0);
          transition: transform 0.12s ease-in-out;
        }

        .v8-multi-radio-input:checked {
          border-color: #0B0F17;
        }

        .v8-multi-radio-input:checked::before {
          transform: scale(1);
        }

        .v8-sms-consent {
          margin-top: 0.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .v8-sms-label {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          font-size: 0.95rem;
          color: #111827;
          cursor: pointer;
          text-transform: none;
          letter-spacing: 0;
        }

        .v8-sms-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #0B0F17;
          cursor: pointer;
          margin: 0;
        }

        .v8-sms-disclaimer {
          font-size: 0.78rem;
          line-height: 1.5;
          color: #4B5563;
          margin: 0;
        }

        .v8-alert {
          padding: 0.85rem 1rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .v8-alert-success {
          background: #DCFCE7;
          color: #166534;
        }

        .v8-alert-error {
          background: #FEE2E2;
          color: #991B1B;
        }

        /* =========================================================
           RESPONSIVE BREAKPOINTS
           ========================================================= */
        @media (max-width: 1120px) {
          .v8-hero-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .v8-bento-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .v8-partners-grid {
            grid-template-columns: 1fr;
          }

          .v8-section-header-split {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .v8-bento-span-7,
          .v8-bento-span-5 {
            grid-column: span 6;
          }

          .v8-contact-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .v8-hero-section {
            padding: 2.25rem 0 3.5rem 0;
          }

          .v8-bento-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .v8-partner-editorial-card {
            grid-template-columns: 1fr;
          }

          .v8-partner-photo-wrap {
            max-width: 240px;
          }

          .v8-bento-span-7,
          .v8-bento-span-5 {
            grid-column: span 12;
          }

          .v8-field-row {
            grid-template-columns: 1fr;
          }

          .v8-contact-left,
          .v8-contact-right {
            padding: 2.25rem 1.5rem;
          }

          .v8-floating-advisory-card {
            position: relative;
            bottom: auto;
            left: auto;
            margin-top: 1rem;
          }
        }

        @media (max-width: 520px) {
          .v8-bento-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </main>
  );
};

export default HomeV8;
