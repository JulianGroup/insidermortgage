"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css';

const HeroV7 = () => {
  const specialties = [
    'Self-Employed',
    'Investors',
    'First Time Buyers',
    'Retirees',
    'Complicated Scenarios'
  ];

  return (
    <React.Fragment>
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="hero-v7-wrapper">
        {/* Aspect-Ratio Locked Hero Stage */}
        <section className="hero-v7-stage">
          <img
            src="/splash-bg.jpg"
            alt="Surfing dog riding the interest rate wave"
            className="hero-v7-bg-img"
          />

          {/* Top Headline & Subtitle Block */}
          <div className="hero-v7-header">
            <h1 className="hero-v7-title-h1">
              <img
                src="/headline-graphic.png"
                alt="TRUSTED MORTGAGE EXPERTS"
                className="hero-v7-headline-img"
              />
            </h1>

            <p className="hero-v7-subtitle">
              Recommended by{' '}
              <span className="hero-v7-subtitle-accent">
                Professionals, Friends &amp; Family.
              </span>
            </p>
          </div>

          {/* Right Callout: Exact extracted script graphic positioned over the golden reflection */}
          <div className="hero-v7-wave-callout">
            <img
              src="/wave-quote-graphic.png"
              alt="I'm riding the interest rate wave"
              className="hero-v7-wave-quote-img"
            />
          </div>

          {/* Wavy Divider at the bottom of the 16:9 image */}
          <div className="hero-v7-wave-divider">
            <svg
              viewBox="0 0 1440 110"
              preserveAspectRatio="none"
              className="hero-v7-wave-svg"
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

        {/* Dark Navy Footer Band for Specializations (Plain Text with Gold Bullets) */}
        <section className="hero-v7-specializations-band">
          <div className="hero-v7-spec-inner">
            <h2 className="hero-v7-spec-heading">
              <strong>Team Insider</strong> specializes in loans for:
            </h2>

            <div className="hero-v7-spec-text-line">
              {specialties.map((item, idx) => (
                <React.Fragment key={item}>
                  <span className="hero-v7-spec-item">{item}</span>
                  {idx < specialties.length - 1 && (
                    <span className="hero-v7-spec-bullet" aria-hidden="true" />
                  )}
                </React.Fragment>
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
        .hero-v7-wrapper {
          width: 100%;
          background-color: #041E3A;
          overflow: hidden;
        }

        .hero-v7-stage {
          position: relative;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background-color: #041E3A;
        }

        .hero-v7-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          z-index: 1;
        }

        .hero-v7-header {
          position: absolute;
          top: 6.5%;
          left: 3.6%;
          width: 76%;
          z-index: 3;
          text-align: left;
        }

        .hero-v7-title-h1 {
          margin: 0;
          padding: 0;
          line-height: 1;
        }

        .hero-v7-headline-img {
          width: 100%;
          max-width: 1050px;
          height: auto;
          display: block;
          filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
        }

        .hero-v7-subtitle {
          margin: 0.35vw 0 0 0.2vw;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.05rem, 2.05vw, 2.05rem);
          color: #FFFFFF;
          letter-spacing: -0.3px;
          text-shadow: 0 3px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.95);
        }

        .hero-v7-subtitle-accent {
          color: #F2C230;
        }

        .hero-v7-wave-callout {
          position: absolute;
          top: 57.5%;
          left: 77%;
          width: 21%;
          z-index: 3;
          pointer-events: none;
        }

        .hero-v7-wave-quote-img {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 1px 6px rgba(255, 255, 255, 0.45));
        }

        .hero-v7-wave-divider {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          line-height: 0;
          z-index: 2;
          pointer-events: none;
        }

        .hero-v7-wave-svg {
          display: block;
          width: 100%;
          height: clamp(45px, 6.8vw, 98px);
        }

        .hero-v7-specializations-band {
          background-color: #041E3A;
          padding: 0.4rem 3.8% 2.75rem 3.8%;
          position: relative;
          z-index: 3;
        }

        .hero-v7-spec-inner {
          max-width: 1520px;
          margin: 0 auto;
        }

        .hero-v7-spec-heading {
          margin: 0 0 1.25rem 0;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 2.1vw, 1.95rem);
          color: #F4F7FB;
        }

        .hero-v7-spec-heading strong {
          font-weight: 800;
          color: #FFFFFF;
        }

        .hero-v7-spec-text-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.9rem 1.25rem;
          max-width: 1420px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          font-size: clamp(1.15rem, 1.85vw, 1.75rem);
          color: #F4F7FB;
          letter-spacing: -0.2px;
        }

        .hero-v7-spec-item {
          white-space: nowrap;
        }

        .hero-v7-spec-bullet {
          display: inline-block;
          width: clamp(9px, 0.9vw, 13px);
          height: clamp(9px, 0.9vw, 13px);
          border-radius: 50%;
          background-color: #F2C230;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .hero-v7-spec-text-line {
            justify-content: flex-start;
          }
        }

        @media (max-width: 768px) {
          .hero-v7-stage {
            aspect-ratio: auto;
            min-height: 440px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 1.75rem 5% 4.5rem 5%;
          }

          .hero-v7-bg-img {
            object-position: 63% center;
          }

          .hero-v7-header {
            position: relative;
            top: auto;
            left: auto;
            width: 100%;
            text-align: center;
          }

          .hero-v7-subtitle {
            margin-top: 0.5rem;
          }

          .hero-v7-wave-callout {
            position: relative;
            top: auto;
            left: auto;
            width: 200px;
            margin: 12rem auto 0 auto;
          }

          .hero-v7-spec-heading {
            text-align: center;
          }

          .hero-v7-spec-text-line {
            justify-content: center;
            text-align: center;
          }
        }
      `}} />
    </React.Fragment>
  );
};

export default HeroV7;
