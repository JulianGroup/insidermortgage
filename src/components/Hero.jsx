"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="about">
      <div className="container hero-container animate-fade-in">
        <div className="hero-content">
          <h1 className="hero-title">
            Trusted Mortgage Experts <br className="mobile-break" />
            <br className="mobile-break" />
            <span style={{fontSize: '0.7em', color: 'var(--accent)', fontWeight: '500', display: 'inline-block', marginTop: '10px'}}>Recommended by Friends &amp; Colleagues</span>
          </h1>
          <p className="hero-subtitle">
            <strong style={{color: 'white'}}>Rakesh &amp; David</strong> – Loan Officers who specialize in Self-Employed, First-Time Buyers, Retirees &amp; Real Estate Investors
          </p>

          <div className="hero-cta-group">
            <Link href="/pre-approval" className="btn btn-accent btn-lg" style={{ backgroundColor: '#EFB51E', color: '#1e3a8a', border: 'none', fontWeight: 'bold' }}>Purchase Pre-Approval</Link>
            <Link href="/refinance" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Refinance</Link>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'}); }} className="btn btn-primary btn-lg">Request Consultation</a>
          </div>
        </div>

        <div className="partners-section">
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
  );
};

export default Hero;

