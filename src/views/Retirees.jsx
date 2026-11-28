"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import ReviewCard from '../components/ReviewCard';
import ScheduleCallForm from '../components/ScheduleCallForm';
import RelatedInsights from '../components/blog/RelatedInsights';
import './SelfEmployed.css';

const retireeReviews = [
  {
    name: 'larry gk',
    text: "We consider our financial portion of life a 3- legged stool: Wealth advisor, tax accountant and (especially now) mortgage expert. Insider Mortgage is our go-to source for the latter without question I couldn't craft what made sense through Wells Fargo Mortgage. David Sider and his team at Insider Mortgage had creative and compelling alternatives that not only fit the monthly budget but come with other benefits. They thoroughly explained everything got me the loan for our home in beautiful San Diego. The level of attention to details and service is just fantastic. They may use computer and platform based tools but no stage is assumed without personal 1:1 live conversation. The way it should be.... Thanks.",
    initials: 'LG',
    source: 'Google Review',
  },
  {
    name: 'Client',
    text: "From our very first call, my wife and I felt like David at Insider Mortgage truly cared about us. Over the course of two to three months, we quickly realized that David was intelligent, creative, and trustworthy, even though we had never met him in person. Through regular telephone conversations, we grew to trust his organization, planning and the milestones he set, which he accomplished on time. The end result was not only securing our reverse mortgage but also gaining a new friend in David. It is clear David enjoys his work, and that made the process easier for us. He listens carefully and explains things in a way that helps people who may not understand all the details. David often provided information before we even thought to ask, anticipating our needs and even sharing referrals and resources that explained regulatory requirements and timing. He clearly takes pride in his knowledge and experience, and he has a wit that makes the process more enjoyable. Our experience with David and Insider Mortgage was so positive that we’d happily refer future inquiries to him...WELL DONE DAVID!",
    initials: 'C',
    source: 'Google Review',
  },
];

const RETIREE_CHALLENGES = [
  {
    title: '1. Should I Use My Savings (or IRA) to Pay Off My Mortgage—or Keep My Cash Liquid?',
    preview:
      'Retiring “debt-free” feels comforting emotionally, but putting $250,000–$500,000 of liquid savings into your home turns flexible cash into illiquid equity—and once your paycheck stops, getting that equity back out later can be much harder.',
    moreParagraphs: [
      'Pulling a large lump sum from a pre-tax 401(k) or IRA to pay off a mortgage or buy a home all-cash can also push you into a higher tax bracket, make more of your Social Security taxable, and potentially trigger higher Medicare IRMAA premiums two years later.',
      'Before paying off a low-rate loan or writing an all-cash check, we model the side-by-side math of keeping healthy liquid reserves, carrying a manageable payment, or recasting a loan after selling a prior home—so you can review the trade-offs alongside your CPA and financial advisor.',
    ],
  },
  {
    title: '2. How Can I Qualify for a Mortgage or HELOC Without Employment Income?',
    preview:
      'Many financially strong retirees are stunned when a big retail bank declines them for a straightforward mortgage or line of credit simply because their W-2 paycheck stopped—even when they have substantial home equity and retirement accounts.',
    moreParagraphs: [
      'Traditional automated underwriting often penalizes borrowers who live off investment portfolios or keep taxable withdrawals low. However, retirement-friendly mortgage guidelines allow us to qualify borrowers using Social Security (which can often be “grossed up” for qualifying), pensions, scheduled IRA/401(k) distributions, and asset-based (asset depletion) calculations.',
      'Whether you are purchasing a single-story home, refinancing, or opening a standby equity line, your net worth and retirement assets can often tell a far stronger story than a W-2.',
    ],
  },
  {
    title: '3. How Do We Protect a Surviving Spouse If One of Us Passes Away First?',
    preview:
      'It is one of the most important—and least talked about—retirement questions: when one spouse passes away, one Social Security check disappears, some pensions step down, and tax brackets often tighten for the surviving spouse.',
    moreParagraphs: [
      'Structuring your housing payment, cash reserves, and standby credit access while both spouses are healthy ensures the surviving spouse is never forced to sell under pressure or scramble to qualify for refinancing on a single income.',
      'We help couples stress-test their housing budget against a single-income future so both partners have real peace of mind.',
    ],
  },
  {
    title: '4. How Can We Help Our Kids Buy a Home Now—Without Putting Our Own Retirement at Risk?',
    preview:
      'Many parents and grandparents want to give “with warm hands”—helping family with a down payment today when it makes the biggest difference, rather than waiting decades to pass assets through an estate.',
    moreParagraphs: [
      'The challenge is helping family without draining your own emergency cash, disrupting your investment plan, or triggering unnecessary taxes from retirement account withdrawals.',
      'We walk families through structured options—such as tapping home equity cleanly for a gift, comparing co-signing vs. non-occupant co-borrowing, or building an on-site ADU for multi-generational living—while keeping your own financial security first.',
    ],
  },
  {
    title: '5. How Do I Increase Monthly Cash Flow as Taxes, Insurance & Healthcare Rise?',
    preview:
      'Even homeowners with low or paid-off mortgages feel the pinch of fixed income colliding with rising property taxes, homeowners insurance, HOA dues, utilities, and healthcare expenses.',
    moreParagraphs: [
      'A well-structured housing plan can help free up monthly cash flow—whether by consolidating high-interest debt, extending or restructuring an existing mortgage, or creating a flexible standby reserve so you aren’t forced to sell investments during a market downturn.',
      'We show you transparent month-by-month numbers so you can see exactly how each option improves your breathing room.',
    ],
  },
  {
    title: '6. Should We Remodel to Age in Place—or Move to a Single-Story Home Now?',
    preview:
      'Deciding whether to invest in your current home for the next 10+ years or move to an easier-to-maintain single-story home is both an emotional and financial crossroads.',
    moreParagraphs: [
      'Staying put may mean funding a downstairs bedroom suite, walk-in shower, roof/HVAC updates, or deferred maintenance—while moving means weighing transaction costs, property taxes, and leaving a neighborhood you love.',
      'Preparing flexible access to your equity while you are healthy also gives you options if mobility or in-home care needs arise down the road, rather than trying to arrange financing during a health crisis.',
    ],
  },
  {
    title: '7. How Do I Tap Equity Without Losing My Low-Rate First Mortgage?',
    preview:
      'Countless retirees are sitting on a 2.75% to 4.00% first mortgage that they never want to give up—making a traditional cash-out refinance of the entire balance feel painfully expensive.',
    moreParagraphs: [
      'You don’t necessarily have to touch your low-rate first mortgage to access your equity. Second-position solutions—including competitive traditional and credit union HELOCs, as well as modern 55+ second-position options—can sit behind your existing mortgage so you preserve the low rate you worked hard to lock in.',
    ],
  },
  {
    title: '8. How Do We Buy Our Next Home Before Selling—Without Moving Twice (or Getting Burned)?',
    preview:
      'Selling a home full of 30 years of memories while trying to make a competitive offer on a single-story property can feel overwhelming—and retirees rightly worry about being rushed or pushed into the wrong loan.',
    moreParagraphs: [
      'With buy-before-you-sell and bridge-financing strategies, many homeowners can purchase their next home non-contingently, move once on their own timeline, and then sell their prior home cleanly—often recasting or paying down the new loan afterward.',
      'We also flag hidden surprises upfront—like condo/55+ HOA reserve rules and insurance requirements—and walk through every option with zero sales pressure.',
    ],
  },
];

const RETIREE_GOALS = [
  {
    title: '1. Downsize Into a Single-Story Home',
    preview:
      'Right-size into a comfortable, lower-maintenance single-story home while coordinating your buy/sell timing and keeping cash reserves healthy.',
    moreParagraphs: [
      'For California homeowners age 55 and older, Proposition 19 may allow you to transfer your existing low property tax base to a replacement home anywhere in the state—dramatically reducing your ongoing monthly housing costs.',
      'We help you compare paying cash vs. carrying a low-stress mortgage, model loan recasting after your sale closes, and plan non-contingent offers.',
    ],
    ctaLink: {
      href: '/CAprop-19-calculator/',
      label: 'Explore California Prop 19 Calculator →',
    },
  },
  {
    title: '2. Prepare Your Home for the Next 10+ Years (Home Improvements)',
    preview:
      'Fund aging-in-place upgrades, deferred maintenance, or comfort remodels—so the home and neighborhood you love stay safe and livable for the next decade.',
    moreParagraphs: [
      'From converting a main-floor bedroom and accessible bath to replacing a roof, HVAC system, or kitchen, using structured home equity can preserve your invested retirement portfolio and avoid large taxable IRA distributions.',
      'We compare fixed-rate financing against flexible credit lines so you only borrow what your project actually needs.',
    ],
  },
  {
    title: '3. Build an ADU on Site (Rental Income or Multi-Generational Living)',
    preview:
      'Turn your existing lot into a powerful retirement asset: move into a brand-new single-story ADU and rent out the main house for steady monthly income—or let your kids and their family live in the main home.',
    moreParagraphs: [
      'Building an Accessory Dwelling Unit (ADU) can solve multiple goals at once: single-story living, family proximity, long-term caregiving flexibility, and substantial supplemental income without selling a long-held property.',
      'You can even run real cash-flow, cap-rate, and 10-year ADU projections in our interactive underwriting tool before talking to a contractor.',
    ],
    ctaLink: {
      href: '/tools/rental-analyzer/',
      label: 'Model ADU Cash Flow in Our Rental & ADU Analyzer →',
    },
  },
  {
    title: '4. Buy a Second Home (Near Family or Vacation Retreat)',
    preview:
      'Purchase a getaway near children and grandchildren—or a seasonal retreat—by thoughtfully pairing primary-residence equity with traditional or asset-based financing.',
    moreParagraphs: [
      'Instead of liquidating appreciated brokerage holdings or pulling taxable cash from retirement accounts, we compare using a primary-home cash-out refinance, a HELOC, or equity-based financing for the down payment alongside a clean second-home mortgage.',
      'We model the full carrying cost—including taxes, insurance, and HOA—so your second home stays a joy, not a budget strain.',
    ],
  },
  {
    title: '5. Increase Cash Reserves & Sleep-at-Night Liquidity',
    preview:
      'Build a reliable financial safety net so unexpected medical bills, home repairs, or stock-market downturns never derail your retirement lifestyle.',
    moreParagraphs: [
      'Having accessible liquidity acts as a “sequence-of-returns” shield—allowing you to ride out market dips without selling equities at a loss.',
      'Depending on your goals, a low-cost standby credit line or strategic cash-out structure can put peace of mind in place well before you ever need to draw on it.',
    ],
  },
  {
    title: '6. Avoid Triggering Major Capital Gains on a Long-Held Home',
    preview:
      'Long-time homeowners sitting on $500,000 to $2M+ of appreciation above the federal $250K/$500K exclusion often hesitate to sell because of the immediate capital gains tax bill.',
    moreParagraphs: [
      'Rather than forcing a taxable sale just to unlock cash or fund a move, some retirees explore keeping the home and tapping equity, building an ADU, or converting the property into a rental while coordinating long-term estate and step-up-in-basis strategies.',
      'Because tax and estate rules are highly individual, we work alongside your CPA and estate-planning attorney so the mortgage structure supports their tax strategy.',
    ],
  },
];

const FINANCING_TOOLKIT = [
  {
    badge: 'Standard Mortgages',
    title: 'Asset-Based & Retirement-Income Mortgages (30-Yr Fixed / Jumbo)',
    description:
      'Conventional and jumbo purchase or refinance loans qualified using Social Security, pensions, IRA/401(k) distributions, and asset-depletion formulas—no W-2 employment required.',
  },
  {
    badge: 'Keep Your Low 1st Mortgage',
    title: 'Traditional & Credit Union HELOCs',
    description:
      'Flexible revolving home equity lines—including highly competitive credit union options—that sit behind your low-rate first mortgage so you only pay interest on what you actually draw.',
    link: {
      href: '/resource-library/how-to-shop-for-a-heloc/',
      label: 'Read: How to Shop for a HELOC →',
    },
  },
  {
    badge: 'Payment & Equity Control',
    title: 'Strategic Refinancing & Loan Recasting',
    description:
      'Restructure terms, consolidate high-interest balances, tap equity cleanly when rates make sense, or use a loan recast to lower your monthly payment after selling a prior home.',
  },
  {
    badge: 'Move & Build',
    title: 'ADU Construction & Buy-Before-You-Sell Bridge Financing',
    description:
      'Purpose-built financing paths for constructing an on-site ADU or unlocking current-home equity to buy a single-story home non-contingently and move just once.',
  },
  {
    badge: 'Age 55+ & 62+ Options',
    title: 'Modern 55+ & 62+ Equity-Based Solutions (Reverse Options)',
    description:
      'Modern reverse programs—including 55+ second-position reverse HELOCs that leave a low-rate first mortgage intact and traditional 62+ HECM/HECM-for-Purchase options—are heavily regulated, non-recourse, and very different from outdated stereotypes. They are never our default pitch, but for the right balance sheet they can be a powerful planning tool.',
  },
];

const ExpandableRetireeCard = ({ card, accentColor = 'var(--secondary)' }) => {
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
        <p style={{ marginBottom: expanded && hasMore ? '1rem' : hasMore || card.ctaLink ? '0.75rem' : 0 }}>
          {card.preview}
        </p>
        {expanded &&
          hasMore &&
          card.moreParagraphs.map((para, idx) => (
            <p
              key={idx}
              style={{
                marginBottom:
                  idx < card.moreParagraphs.length - 1 || card.ctaLink ? '1rem' : '0.75rem',
              }}
            >
              {para}
            </p>
          ))}
        {card.ctaLink && (
          <div style={{ marginTop: '0.25rem', marginBottom: hasMore ? '0.85rem' : 0 }}>
            <Link
              href={card.ctaLink.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontWeight: 700,
                fontSize: '0.93rem',
                color: 'var(--secondary, #0468E9)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              {card.ctaLink.label}
            </Link>
          </div>
        )}
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

const Retirees = () => {
  return (
    <main>
      {/* 1. Hero Section */}
      <section className="se-hero animate-fade-in">
        <div className="container">
          <h1>MORTGAGES &amp; HOME EQUITY STRATEGY FOR RETIREES</h1>
          <h2 className="se-hero-subheadline">
            Smart Financing Without a W-2 — Protect Your Liquidity, Your Spouse &amp; Your Independence
          </h2>
          <p style={{ marginBottom: '1rem' }}>
            Retirement shouldn’t mean feeling locked out by banks just because your paycheck stopped—or making irreversible housing and savings decisions out of guesswork.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Whether you’re weighing whether to pay off your mortgage, preparing your home for the next 10+ years, downsizing into a single-story home, building an ADU, or helping family buy a home while you’re here to enjoy it, the right strategy protects both your lifestyle and your nest egg.
          </p>
          <p>
            Our job is to lay out every practical financing path in plain English—zero sales pressure—so you can make confident decisions alongside your financial advisor and CPA.
          </p>
        </div>
      </section>

      {/* 2. Intro Framing: The "3-Legged Stool" Approach */}
      <section className="section" style={{ paddingBottom: '2rem', paddingTop: 'var(--space-12)' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '2rem' }}>
              Your Home Equity Belongs in Your Retirement Plan
            </h2>
            <p style={{ color: 'var(--secondary, #0468E9)', fontSize: '1.18rem', fontWeight: 600, margin: 0 }}>
              Coordinating Your Mortgage Strategy Alongside Your Financial Advisor &amp; CPA
            </p>
          </div>

          <div
            style={{
              padding: 'clamp(1.75rem, 4vw, 2.5rem)',
              backgroundColor: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              borderTop: '4px solid var(--accent)',
              fontSize: '1.12rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
            }}
          >
            <p style={{ marginBottom: '1.1rem' }}>
              Many of our favorite retiree clients think of their retirement finances as a{' '}
              <strong style={{ color: 'var(--primary)' }}>3-legged stool</strong>: a wealth advisor to grow and preserve investments, a tax accountant (CPA) to minimize taxes, and a mortgage strategist to manage housing equity and debt intelligently.
            </p>
            <p style={{ marginBottom: '1.1rem' }}>
              Too often, homeowners make major housing decisions in isolation—draining liquid cash to pay off a mortgage, taking a big taxable IRA distribution to fund a remodel, or selling a long-held home without modeling alternatives first. Once those moves are made, they are hard to undo.
            </p>
            <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 0 }}>
              We model your options side by side—traditional, asset-based, credit-line, and 55+ equity paths—so your home works for your retirement, not against it.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Section 1 — Real Concerns & Challenges Retirees Face */}
      <section className="section bg-color" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
              Real Concerns &amp; Challenges Retirees Face
            </h2>
            <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              These are the kitchen-table questions retirees and near-retirees bring to us every week. Tap <strong>Read More</strong> on any topic to explore how we think through the numbers.
            </p>
          </div>

          <div className="programs-grid" style={{ marginTop: 0, alignItems: 'start' }}>
            {RETIREE_CHALLENGES.map((card, idx) => (
              <ExpandableRetireeCard key={idx} card={card} accentColor="var(--secondary)" />
            ))}
          </div>

          {/* 4. Section 2 — What Are You Trying to Accomplish? (6 Retirement Goals) */}
          <div style={{ marginTop: '4.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                What Are You Trying to Accomplish?
              </h2>
              <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Start with your goal—not a loan product. Here are the six most common housing goals retirees come to us to plan.
              </p>
            </div>

            <div className="programs-grid" style={{ marginTop: 0, alignItems: 'start' }}>
              {RETIREE_GOALS.map((card, idx) => (
                <ExpandableRetireeCard key={idx} card={card} accentColor="var(--accent)" />
              ))}
            </div>
          </div>

          {/* 5. Section 3 — Your Financing Toolkit */}
          <div style={{ marginTop: '4.5rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 2.5rem' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                Your Financing Toolkit — Not One-Size-Fits-All
              </h2>
              <p style={{ fontSize: '1.12rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                As independent mortgage brokers, we compare across dozens of wholesale lenders, credit unions, and specialty retirement programs—starting with conventional options first.
              </p>
            </div>

            <div className="programs-grid" style={{ marginTop: 0 }}>
              {FINANCING_TOOLKIT.map((tool, idx) => (
                <div
                  key={idx}
                  className={`program-card ${idx === FINANCING_TOOLKIT.length - 1 ? 'program-card-double-wide' : ''}`}
                  style={{
                    borderLeftColor: idx === FINANCING_TOOLKIT.length - 1 ? 'var(--primary)' : 'var(--secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '0.22rem 0.7rem',
                        backgroundColor: 'rgba(4, 104, 233, 0.08)',
                        color: 'var(--secondary, #0468E9)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: '999px',
                        marginBottom: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {tool.badge}
                    </div>
                    <h3 style={{ marginBottom: '0.65rem' }}>{tool.title}</h3>
                    <p style={{ marginBottom: tool.link ? '0.9rem' : 0 }}>{tool.description}</p>
                    {tool.link && (
                      <Link
                        href={tool.link.href}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.94rem',
                          color: 'var(--secondary, #0468E9)',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        {tool.link.label}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Dedicated "Coming Soon" Reverse Mortgage Deep-Dive Callout */}
            <div
              style={{
                marginTop: '2.25rem',
                padding: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid #E2E8F0',
                borderLeft: '5px solid var(--accent)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem',
              }}
            >
              <div style={{ flex: '1 1 460px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.22rem 0.75rem',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(239, 181, 30, 0.16)',
                    border: '1px solid rgba(239, 181, 30, 0.45)',
                    color: '#92400E',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '0.65rem',
                  }}
                >
                  Coming Soon • Dedicated Deep-Dive Guide
                </div>
                <h3 style={{ color: 'var(--primary)', margin: '0 0 0.5rem', fontSize: '1.3rem' }}>
                  Our Complete Reverse Mortgage Deep-Dive Guide
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65, fontSize: '0.98rem' }}>
                  Want to separate myth from math on traditional 62+ reverse mortgages and modern 55+ second-position reverse HELOCs—including honest pros, trade-offs, and who they are (and aren’t) right for? Our dedicated educational guide is coming soon. In the meantime, ask David or Rakesh for a zero-pressure, side-by-side comparison.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <a
                  href="#schedule-call"
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap', borderRadius: '999px', padding: '0.75rem 1.4rem' }}
                >
                  Request a Private Walkthrough →
                </a>
              </div>
            </div>

            <p
              style={{
                marginTop: '1.5rem',
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: 1.6,
                maxWidth: '860px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              <em>
                Educational &amp; Planning Note: Insider Mortgage provides mortgage financing guidance and does not provide tax, legal, Medicare, or financial-advisory advice. Please consult your CPA, estate attorney, or financial advisor regarding capital gains exclusions, retirement account distributions, Prop 19 eligibility, and estate planning. All loans are subject to underwriting approval and program guidelines.
              </em>
            </p>
          </div>
        </div>
      </section>

      {/* 6. Retiree Reviews Section (1 General 3-Legged-Stool Review + 1 Reverse Mortgage Review) */}
      <section className="section bg-color" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Success Stories</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: 0 }}>
              Real clients who partnered with David &amp; Rakesh to structure smart retirement financing.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {retireeReviews.map((review, idx) => (
              <ReviewCard key={idx} review={review} />
            ))}
          </div>
        </div>
      </section>

      <RelatedInsights
        categoryId="cat-retirees"
        title="Retirement & 55+ Mortgage Insights"
        subtitle="Articles and scenario breakdowns on equity strategies, Prop 19, and asset-depletion qualifying by David and Rakesh."
        background="#FFFFFF"
      />

      {/* Consultation Form with David & Rakesh Partner Header */}
      <section id="schedule-call" className="se-contact-section">
        <div className="container" style={{ maxWidth: '680px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <div className="se-partner-contact-header">
              <div className="se-partner-card-pill">
                <img
                  src="/david-sider-sm.webp"
                  alt="David Sider"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="se-partner-photo"
                />
                <div className="se-partner-info">
                  <strong>David Sider</strong>
                  <span>Managing Partner</span>
                </div>
              </div>
              <div className="se-partner-card-pill">
                <img
                  src="/rakesh-jain.webp"
                  alt="Rakesh Jain"
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                  className="se-partner-photo"
                />
                <div className="se-partner-info">
                  <strong>Rakesh Jain</strong>
                  <span>Senior Loan Officer &amp; Partner</span>
                </div>
              </div>
            </div>

            <h2 style={{ color: 'var(--primary)', marginBottom: '0.85rem' }}>
              Let’s Map Out Your Retirement Housing Options Together
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: 1.65, maxWidth: '620px', margin: '0 auto' }}>
              Tell us what you’re hoping to accomplish—no obligation, no hard pitch. We’ll walk you through clear, side-by-side numbers you can also share with your spouse, CPA, or financial advisor.
            </p>
            <p style={{ marginTop: '0.85rem', fontSize: '0.98rem', color: 'var(--primary)', fontWeight: 600 }}>
              Prefer to call or text us right now? Reach us directly at{' '}
              <a href="tel:8588485653" style={{ color: 'var(--secondary, #0468E9)', textDecoration: 'underline' }}>
                (858) 848-5653
              </a>
            </p>
          </div>

          <ScheduleCallForm source="Mortgages for Retirees" />
        </div>
      </section>
    </main>
  );
};

export default Retirees;
