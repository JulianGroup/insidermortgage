"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css';

const HeroV5 = () => {
  const specializations = [
    {
      label: 'Self-Employed',
      href: '#self-employed',
      icon: (
        <svg viewBox="0 0 36 36" width="30" height="30" fill="none" stroke="#0A2342" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="15" cy="11" r="4.5" />
          <path d="M7 26c0-4.2 3.6-7.5 8-7.5 2.4 0 4.5.9 6 2.3" />
          <path d="M18 21h10l-2 7H16z" />
          <path d="M6 28h24" />
        </svg>
      )
    },
    {
      label: 'Investors',
      href: '#investors',
      icon: (
        <svg viewBox="0 0 36 36" width="30" height="30" fill="none" stroke="#0A2342" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17L18 6l13 11" />
          <path d="M9 14.5V29h18V14.5" />
          <rect x="15" y="20" width="6" height="9" />
        </svg>
      )
    },
    {
      label: 'First Time Buyers',
      href: '#first-time-buyers',
      icon: (
        <svg viewBox="0 0 36 36" width="30" height="30" fill="none" stroke="#0A2342" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17L18 6l13 11" />
          <path d="M9 14.5V29h18V14.5" />
          <rect x="15" y="20" width="6" height="9" />
        </svg>
      )
    },
    {
      label: 'Seniors',
      href: '#seniors',
      icon: (
        <svg viewBox="0 0 40 36" width="32" height="30" fill="none" stroke="#0A2342" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="12" r="4" />
          <circle cx="11" cy="14" r="3.2" />
          <circle cx="29" cy="14" r="3.2" />
          <path d="M13 28c0-3.8 3.1-7 7-7s7 3.2 7 7" />
          <path d="M5 28c0-3.2 2.5-5.8 5.8-5.8 1.2 0 2.3.4 3.2 1" />
          <path d="M35 28c0-3.2-2.5-5.8-5.8-5.8-1.2 0-2.3.4-3.2 1" />
        </svg>
      )
    },
    {
      label: 'Retirees',
      href: '#retirees',
      icon: (
        <svg viewBox="0 0 36 36" width="30" height="30" fill="none" stroke="#0A2342" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 28V13" />
          <path d="M18 13c-3-4-8-4-10-1 3 0 6 1 10 1z" />
          <path d="M18 13c3-4 8-4 10-1-3 0-6 1-10 1z" />
          <path d="M18 13c-5-1-9 2-10 5 3-1 6-2 10-5z" />
          <path d="M18 13c5-1 9 2 10 5-3-1-6-2-10-5z" />
          <path d="M11 29c2.2-1.8 4.6-2.5 7-2.5s4.8.7 7 2.5" />
        </svg>
      )
    }
  ];

  return (
    <React.Fragment>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="hero-v5-wrapper">
        {/* Aspect-Ratio Locked Hero Stage so the dog and wave are NEVER cropped or misaligned */}
        <section className="hero-v5-stage">
          {/* Clean 16:9 background image */}
          <img
            src="/splash-bg.jpg"
            alt="Surfing dog riding the interest rate wave"
            className="hero-v5-bg-img"
          />

          {/* Top Headline & Subtitle Block */}
          <div className="hero-v5-header">
            <h1 className="hero-v5-title-h1">
              <img
                src="/headline-graphic.png"
                alt="TRUSTED MORTGAGE EXPERTS"
                className="hero-v5-headline-img"
              />
            </h1>

            <p className="hero-v5-subtitle">
              Recommended by{' '}
              <span className="hero-v5-subtitle-accent">
                Professionals, Friends &amp; Family.
              </span>
            </p>
          </div>

          {/* Left CTA Block: "Learn why a mortgage is a:" + TOOL / STRATEGY */}
          <div className="hero-v5-left-cta">
            <p className="hero-v5-learn-label">Learn why a mortgage is a:</p>

            <div className="hero-v5-cards">
              {/* Button 1: TOOL */}
              <a href="#tool" className="hero-v5-card hero-v5-card-tool">
                <span className="hero-v5-card-icon">
                  <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
                    <path
                      d="M25.5 6.5c-2.2 0-4 1.5-4.4 3.6L9.6 21.6c-2.1.4-3.6 2.2-3.6 4.4 0 2.5 2 4.5 4.5 4.5 2.2 0 4-1.5 4.4-3.6l11.5-11.5c2.1-.4 3.6-2.2 3.6-4.4 0-1-.3-1.9-.9-2.6l-2.6 2.6-2.2-.6-.6-2.2 2.6-2.6c-.7-.6-1.6-.9-2.6-.9z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M8.5 6.5l-2 2 4.5 5.5 2.5-2.5-5-5zm8.5 8.5l-2.5 2.5 11 11c1 1 2.5 1 3.5 0s1-2.5 0-3.5l-11-11z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </span>
                <span className="hero-v5-card-label">TOOL</span>
                <span className="hero-v5-card-chevron">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
              </a>

              {/* Button 2: STRATEGY */}
              <a href="#strategy" className="hero-v5-card hero-v5-card-strategy">
                <span className="hero-v5-card-icon">
                  <svg viewBox="0 0 42 36" width="36" height="32" fill="none">
                    <rect x="4" y="21" width="4.5" height="11" rx="1" fill="#0A2342" />
                    <rect x="11" y="16" width="4.5" height="16" rx="1" fill="#0A2342" />
                    <rect x="18" y="19" width="4.5" height="13" rx="1" fill="#0A2342" />
                    <rect x="25" y="13" width="4.5" height="19" rx="1" fill="#0A2342" />
                    <path d="M4 17L15 8L21 12L31 4" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M25 4H31V10" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 19L16 26L22 23L31 31" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M25 31H31V25" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="hero-v5-card-label">STRATEGY</span>
                <span className="hero-v5-card-chevron">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Right Callout: Exact extracted script graphic positioned over the golden reflection */}
          <div className="hero-v5-wave-callout">
            <img
              src="/wave-quote-graphic.png"
              alt="I'm riding the interest rate wave"
              className="hero-v5-wave-quote-img"
            />
          </div>

          {/* Wavy Divider at the bottom of the 16:9 image */}
          <div className="hero-v5-wave-divider">
            <svg
              viewBox="0 0 1440 110"
              preserveAspectRatio="none"
              className="hero-v5-wave-svg"
            >
              <path
                d="M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65 L1440,110 L0,110 Z"
                fill="#041E3A"
              />
              <path
                d="M0,78 C160,12 370,12 560,55 C740,95 860,95 1030,62 C1180,32 1320,82 1440,65"
                fill="none"
                stroke="#F2C230"
                strokeWidth="4.5"
              />
            </svg>
          </div>
        </section>

        {/* Dark Navy Footer Band for Specializations */}
        <section className="hero-v5-specializations-band">
          <div className="hero-v5-spec-inner">
            <h2 className="hero-v5-spec-heading">
              <strong>Team Insider</strong> specializes in:
            </h2>

            <div className="hero-v5-spec-pills">
              {specializations.map((item) => (
                <a key={item.label} href={item.href} className="hero-v5-spec-pill">
                  <span className="hero-v5-spec-pill-icon">{item.icon}</span>
                  <span className="hero-v5-spec-pill-label">{item.label}</span>
                  <span className="hero-v5-spec-pill-chevron">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0A2342" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Bio Section Below Splash Page */}
      <section className="hero" style={{ padding: '4rem 1rem', background: 'var(--primary)', position: 'relative', zIndex: 2 }}>
        <div className="container hero-container animate-fade-in" style={{ padding: 0 }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '2.5rem',
            fontFamily: "'Montserrat', sans-serif",
            color: '#FFFFFF'
          }}>
            <h2 style={{
              margin: 0,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.5px',
              color: '#FFFFFF'
            }}>
              Team Insider
            </h2>

            <svg
              viewBox="0 0 420 26"
              preserveAspectRatio="none"
              style={{
                width: 'clamp(240px, 44vw, 390px)',
                height: 'clamp(14px, 2.2vw, 22px)',
                margin: '0.2rem 0 0.25rem 0',
                display: 'block'
              }}
            >
              <path
                d="M6,20 Q205,2 414,15 Q210,11 18,24 Z"
                fill="#F2C230"
              />
            </svg>

            <p style={{
              margin: 0,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 'clamp(1.25rem, 2.6vw, 2rem)',
              lineHeight: 1.2,
              color: '#FFFFFF'
            }}>
              led by <strong style={{ fontWeight: 700 }}>David &amp; Rakesh</strong>
            </p>
          </div>
          
          <div className="partners-section" style={{ marginTop: '0' }}>
            <div className="partner-card">
              <img src="/rakesh-jain.jpg" alt="Rakesh Jain" className="partner-bg-image" />
              <div className="partner-info">
                <h3>Rakesh Jain</h3>
                <p className="partner-title">Managing Partner / Broker</p>
                <Link href="/bio-rakesh" className="partner-bio-btn">Bio</Link>
              </div>
            </div>

            <div className="partner-card">
              <img src="/david-sider.jpg" alt="David Sider" className="partner-bg-image" />
              <div className="partner-info">
                <h3>David Sider</h3>
                <p className="partner-title">Managing Partner / Broker</p>
                <Link href="/bio-david" className="partner-bio-btn">Bio</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero-v5-wrapper {
          width: 100%;
          background-color: #041E3A;
          overflow: hidden;
        }

        /* Desktop: Lock exact 16:9 image stage so nothing is ever cropped and % coordinates stay locked to the photo */
        .hero-v5-stage {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background-color: #041E3A;
        }

        .hero-v5-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          z-index: 1;
        }

        /* 1. Top Headline & Subheading: slightly scaled down (~76% width instead of 85%) per assistant's feedback */
        .hero-v5-header {
          position: absolute;
          top: 6.5%;
          left: 3.6%;
          width: 76%;
          z-index: 3;
          text-align: left;
        }

        .hero-v5-title-h1 {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        .hero-v5-headline-img {
          width: 100%;
          max-width: 1050px;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
        }

        .hero-v5-subtitle {
          margin: 0.35vw 0 0 0.2vw;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 2.05vw, 2.05rem);
          color: #FFFFFF;
          letter-spacing: -0.3px;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.95);
        }

        .hero-v5-subtitle-accent {
          color: #F2C230;
        }

        /* 2. Left CTA Block positioned at exact % coordinates of the curling wave */
        .hero-v5-left-cta {
          position: absolute;
          top: 41%;
          left: 3.8%;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .hero-v5-learn-label {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1rem, 1.85vw, 1.75rem);
          color: #FFFFFF;
          margin: 0 0 0.9vw 0;
          text-shadow: 0 3px 8px rgba(0, 0, 0, 0.9);
        }

        .hero-v5-cards {
          display: flex;
          flex-direction: column;
          gap: 1vw;
          width: clamp(190px, 18.2vw, 285px);
        }

        .hero-v5-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65vw 1.1vw;
          border-radius: 14px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
        }

        .hero-v5-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.65);
        }

        .hero-v5-card-tool {
          background: rgba(14, 52, 92, 0.88);
          border: 2.5px solid #D8E3F0;
          color: #FFFFFF;
          backdrop-filter: blur(4px);
        }

        .hero-v5-card-tool:hover {
          background: rgba(14, 52, 92, 0.98);
          border-color: #FFFFFF;
        }

        .hero-v5-card-strategy {
          background: #F2C230;
          border: 2.5px solid #F2C230;
          color: #0A2342;
        }

        .hero-v5-card-strategy:hover {
          background: #D6A414;
          border-color: #D6A414;
        }

        .hero-v5-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
        }

        .hero-v5-card-label {
          font-family: 'Anton', Impact, sans-serif;
          font-size: clamp(1.35rem, 2vw, 2rem);
          letter-spacing: 0.8px;
          line-height: 1;
          text-transform: uppercase;
          flex: 1;
          text-align: center;
        }

        .hero-v5-card-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 3. Right Callout ("I'm riding the interest rate wave") locked to the exact sunset water spot (top: 57.5%, left: 77%) */
        .hero-v5-wave-callout {
          position: absolute;
          top: 57.5%;
          left: 77%;
          width: 21%;
          z-index: 3;
          pointer-events: none;
        }

        .hero-v5-wave-quote-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 1px 6px rgba(255, 255, 255, 0.45));
        }

        /* 4. Wavy Divider at bottom of 16:9 image */
        .hero-v5-wave-divider {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 2;
          pointer-events: none;
        }

        .hero-v5-wave-svg {
          display: block;
          width: 100%;
          height: clamp(45px, 6.8vw, 98px);
        }

        /* 5. Specializations Band */
        .hero-v5-specializations-band {
          background-color: #041E3A;
          padding: 0.25rem 3.8% 2.5rem 3.8%;
          position: relative;
          z-index: 3;
        }

        .hero-v5-spec-inner {
          max-width: 1520px;
          margin: 0 auto;
        }

        .hero-v5-spec-heading {
          margin: 0 0 1.1rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 2.1vw, 1.95rem);
          color: #F4F7FB;
        }

        .hero-v5-spec-heading strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .hero-v5-spec-pills {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1.1rem;
          width: 100%;
        }

        .hero-v5-spec-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #F2C230;
          color: #0A2342;
          padding: 0.85rem 1.05rem;
          border-radius: 15px;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(0.92rem, 1.2vw, 1.18rem);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, background-color 0.2s ease;
          gap: 0.5rem;
        }

        .hero-v5-spec-pill:hover {
          background-color: #D6A414;
          transform: translateY(-2px);
        }

        .hero-v5-spec-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-v5-spec-pill-label {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          letter-spacing: -0.2px;
        }

        .hero-v5-spec-pill-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 1100px) {
          .hero-v5-spec-pills {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* Mobile Layout */
        @media (max-width: 768px) {
          .hero-v5-stage {
            aspect-ratio: auto;
            min-height: 580px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.75rem 5% 4.5rem 5%;
          }

          .hero-v5-bg-img {
            object-position: 63% center;
          }

          .hero-v5-header {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            text-align: center;
          }

          .hero-v5-subtitle {
            margin-top: 0.5rem;
          }

          .hero-v5-left-cta {
            position: relative;
            top: auto;
            left: auto;
            margin-top: 1.75rem;
            align-items: center;
            width: 100%;
          }

          .hero-v5-cards {
            width: 240px;
            gap: 0.75rem;
          }

          .hero-v5-card {
            padding: 0.65rem 1rem;
          }

          .hero-v5-wave-callout {
            position: relative;
            top: auto;
            left: auto;
            width: 210px;
            margin: 1.5rem auto 0 auto;
          }

          .hero-v5-spec-heading {
            text-align: center;
          }

          .hero-v5-spec-pills {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .hero-v5-spec-pills {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </React.Fragment>
  );
};

export default HeroV5;
