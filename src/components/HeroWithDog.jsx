"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css';

const HeroWithDog = () => {
  return (
    <React.Fragment>
      <section 
        style={{
          position: 'relative',
          minHeight: '80vh',
          width: '100%',
          backgroundImage: "url('/insidermortgage/DogSurfing1.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top Text Overlay */}
        <div className="hero-dog-top-overlay" style={{
          width: '100%',
          zIndex: 2
        }}>
          <h2 style={{
            color: 'white',
            fontSize: 'clamp(2.5rem, 8vw, 62px)',
            fontFamily: 'Tahoma, sans-serif',
            fontWeight: 'bold',
            maxWidth: '100%',
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            Trusted Mortgage Experts
            <span style={{ color: '#EFB51E', display: 'block', marginTop: '1rem', fontSize: '80%' }}>
              Recommended by<br />
              Professionals,<br />
              Friends &<br />
              Family
            </span>
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="hero-dog-content">
          
          {/* Left Side Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center'
          }}>
            
            <Link href="/pre-approval" className="hero-dog-btn hero-dog-btn-primary">
              Purchase Pre-Approval
            </Link>

            <Link href="/refinance" className="hero-dog-btn hero-dog-btn-secondary">
              Refinance
            </Link>

            <a href="#contact" className="hero-dog-btn hero-dog-btn-primary">
              Request Consultation
            </a>

          </div>

          {/* Right Side Text */}
          <div className="hero-dog-right-text">
            <h1 className="hero-dog-h1">
              I'm riding the<br/>interest rate<br/>wave
            </h1>
          </div>

        </div>
      </section>

      {/* Bio Section Below Dog Image */}
      <section className="hero" style={{ padding: '4rem 1rem', background: 'var(--primary)' }}>
        <div className="container hero-container animate-fade-in" style={{ padding: 0 }}>
          <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem', lineHeight: '1.2', fontFamily: 'Tahoma, sans-serif' }}>
            Rakesh & David– specialize in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors
          </h2>
          
          <div className="partners-section" style={{ marginTop: '0' }}>
            <div className="partner-card">
              <img src="/insidermortgage/rakesh-jain.jpg" alt="Rakesh Jain" className="partner-bg-image" />
              <div className="partner-info">
                <h3>Rakesh Jain</h3>
                <p className="partner-title">Managing Partner / Broker</p>
                <Link href="/bio-rakesh" className="partner-bio-btn">Bio</Link>
              </div>
            </div>

            <div className="partner-card">
              <img src="/insidermortgage/david-sider.jpg" alt="David Sider" className="partner-bg-image" />
              <div className="partner-info">
                <h3>David Sider</h3>
                <p className="partner-title">Managing Partner / Broker</p>
                <Link href="/bio-david" className="partner-bio-btn">Bio</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default HeroWithDog;
