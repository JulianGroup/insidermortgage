"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css';

const HeroV6 = () => {
  const specializations = [
    {
      label: 'Self-Employed',
      href: '#self-employed',
      twoLine: false,
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
      twoLine: false,
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
      twoLine: false,
      icon: (
        <svg viewBox="0 0 36 36" width="30" height="30" fill="none" stroke="#0A2342" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17L18 6l13 11" />
          <path d="M9 14.5V29h18V14.5" />
          <rect x="15" y="20" width="6" height="9" />
        </svg>
      )
    },
    {
      label: 'Retirees',
      href: '#retirees',
      twoLine: false,
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
    },
    {
      label: (
        <>
          Borrowers with
          <br />
          Complicated Scenarios
        </>
      ),
      key: 'Borrowers with Complicated Scenarios',
      href: '#complicated-scenarios',
      twoLine: true,
      icon: (
        <svg viewBox="0 0 40 36" width="34" height="32" fill="none" stroke="#0A2342" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
          {/* Document */}
          <path d="M23 27H9a2.5 2.5 0 0 1-2.5-2.5v-17A2.5 2.5 0 0 1 9 5h13a2.5 2.5 0 0 1 2.5 2.5v9" />
          <line x1="11" y1="11" x2="19" y2="11" />
          <line x1="11" y1="15.5" x2="19" y2="15.5" />
          <line x1="11" y1="20" x2="16" y2="20" />
          {/* Gear */}
          <circle cx="27" cy="24" r="3.2" />
          <path d="M27 18.2v1.6M27 28.2v1.6M21.2 24h1.6M31.2 24h1.6M22.9 19.9l1.1 1.1M30 27l1.1 1.1M31.1 19.9L30 21M24 27l-1.1 1.1" />
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

      <div className="hero-v6-wrapper">
        {/* Aspect-Ratio Locked Hero Stage */}
        <section className="hero-v6-stage">
          <img
            src="/splash-bg.jpg"
            alt="Surfing dog riding the interest rate wave"
            className="hero-v6-bg-img"
          />

          {/* Top Headline & Subtitle Block */}
          <div className="hero-v6-header">
            <h1 className="hero-v6-title-h1">
              <img
                src="/headline-graphic.png"
                alt="TRUSTED MORTGAGE EXPERTS"
                className="hero-v6-headline-img"
              />
            </h1>

            <p className="hero-v6-subtitle">
              Recommended by{' '}
              <span className="hero-v6-subtitle-accent">
                Professionals, Friends &amp; Family.
              </span>
            </p>
          </div>

          {/* Right Callout: Exact extracted script graphic positioned over the golden reflection */}
          <div className="hero-v6-wave-callout">
            <img
              src="/wave-quote-graphic.png"
              alt="I'm riding the interest rate wave"
              className="hero-v6-wave-quote-img"
            />
          </div>

          {/* Wavy Divider at the bottom of the 16:9 image */}
          <div className="hero-v6-wave-divider">
            <svg
              viewBox="0 0 1440 110"
              preserveAspectRatio="none"
              className="hero-v6-wave-svg"
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
        <section className="hero-v6-specializations-band">
          <div className="hero-v6-spec-inner">
            <h2 className="hero-v6-spec-heading">
              <strong>Team Insider</strong> specializes in loans for:
            </h2>

            <div className="hero-v6-spec-pills">
              {specializations.map((item) => (
                <a
                  key={item.key || item.label}
                  href={item.href}
                  className={`hero-v6-spec-pill ${item.twoLine ? 'hero-v6-spec-pill-twoline' : ''}`}
                >
                  <span className="hero-v6-spec-pill-icon">{item.icon}</span>
                  <span className="hero-v6-spec-pill-label">{item.label}</span>
                  <span className="hero-v6-spec-pill-chevron">
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
        .hero-v6-wrapper {
          width: 100%;
          background-color: #041E3A;
          overflow: hidden;
        }

        .hero-v6-stage {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background-color: #041E3A;
        }

        .hero-v6-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          z-index: 1;
        }

        .hero-v6-header {
          position: absolute;
          top: 6.5%;
          left: 3.6%;
          width: 76%;
          z-index: 3;
          text-align: left;
        }

        .hero-v6-title-h1 {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        .hero-v6-headline-img {
          width: 100%;
          max-width: 1050px;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
        }

        .hero-v6-subtitle {
          margin: 0.35vw 0 0 0.2vw;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 2.05vw, 2.05rem);
          color: #FFFFFF;
          letter-spacing: -0.3px;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.95);
        }

        .hero-v6-subtitle-accent {
          color: #F2C230;
        }

        .hero-v6-wave-callout {
          position: absolute;
          top: 57.5%;
          left: 77%;
          width: 21%;
          z-index: 3;
          pointer-events: none;
        }

        .hero-v6-wave-quote-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 1px 6px rgba(255, 255, 255, 0.45));
        }

        .hero-v6-wave-divider {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 2;
          pointer-events: none;
        }

        .hero-v6-wave-svg {
          display: block;
          width: 100%;
          height: clamp(45px, 6.8vw, 98px);
        }

        .hero-v6-specializations-band {
          background-color: #041E3A;
          padding: 0.25rem 3.8% 2.5rem 3.8%;
          position: relative;
          z-index: 3;
        }

        .hero-v6-spec-inner {
          max-width: 1520px;
          margin: 0 auto;
        }

        .hero-v6-spec-heading {
          margin: 0 0 1.1rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 2.1vw, 1.95rem);
          color: #F4F7FB;
        }

        .hero-v6-spec-heading strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .hero-v6-spec-pills {
          display: grid;
          grid-template-columns: 1fr 0.88fr 1.12fr 0.86fr 1.32fr;
          gap: 1rem;
          width: 100%;
        }

        .hero-v6-spec-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #F2C230;
          color: #0A2342;
          padding: 0.75rem 1rem;
          border-radius: 15px;
          text-decoration: none;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(0.9rem, 1.15vw, 1.15rem);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
          transition: transform 0.2s ease, background-color 0.2s ease;
          gap: 0.5rem;
          min-height: 64px;
        }

        .hero-v6-spec-pill:hover {
          background-color: #D6A414;
          transform: translateY(-2px);
        }

        .hero-v6-spec-pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hero-v6-spec-pill-label {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          letter-spacing: -0.2px;
        }

        .hero-v6-spec-pill-twoline .hero-v6-spec-pill-label {
          text-align: left;
          line-height: 1.18;
          font-size: clamp(0.82rem, 1vw, 1.02rem);
          padding-left: 0.2rem;
        }

        .hero-v6-spec-pill-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 1180px) {
          .hero-v6-spec-pills {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .hero-v6-stage {
            aspect-ratio: auto;
            min-height: 440px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.75rem 5% 4.5rem 5%;
          }

          .hero-v6-bg-img {
            object-position: 63% center;
          }

          .hero-v6-header {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            text-align: center;
          }

          .hero-v6-subtitle {
            margin-top: 0.5rem;
          }

          .hero-v6-wave-callout {
            position: relative;
            top: auto;
            left: auto;
            width: 200px;
            margin: 12rem auto 0 auto;
          }

          .hero-v6-spec-heading {
            text-align: center;
          }

          .hero-v6-spec-pills {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 520px) {
          .hero-v6-spec-pills {
            grid-template-columns: 1fr;
          }
        }
      `}} />
    </React.Fragment>
  );
};

export default HeroV6;
