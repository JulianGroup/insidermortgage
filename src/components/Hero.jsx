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
            <Link href="/pre-approval" className="btn btn-accent btn-lg" style={{ backgroundColor: '#EFB51E', color: '#1e3a8a', border: 'none', fontWeight: 'bold' }}>Get Pre-Approved</Link>
            <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'}); }} className="btn btn-primary btn-lg">Schedule a Call</a>
            <a href="#solutions" onClick={(e) => { e.preventDefault(); document.getElementById('solutions')?.scrollIntoView({behavior: 'smooth'}); }} className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              Explore Loan Programs
            </a>
          </div>
        </div>

        <div className="partners-section">
          <div className="partner-card">
            <div className="partner-headshot">
              <img src="https://ui-avatars.com/api/?name=Rakesh+Jain&background=1e3a8a&color=fff&size=120" alt="Rakesh Jain" />
            </div>
            <div className="partner-info">
              <h3>Rakesh Jain</h3>
              <p className="partner-title">Managing Partner / Broker<br/><a href="tel:8588485653" style={{color: 'var(--accent)', textDecoration: 'none'}}>📞 858-848-5653</a></p>
              <p className="partner-credentials">NMLS #240594<br/>20+ years helping borrowers secure tailored financing</p>
            </div>
          </div>

          <div className="partner-card">
            <div className="partner-headshot">
              <img src="https://ui-avatars.com/api/?name=David+Sider&background=1e3a8a&color=fff&size=120" alt="David Sider" />
            </div>
            <div className="partner-info">
              <h3>David Sider</h3>
              <p className="partner-title">Managing Partner / Broker<br/><a href="tel:8588765363" style={{color: 'var(--accent)', textDecoration: 'none'}}>📞 858-876-5363</a></p>
              <p className="partner-credentials">NMLS #254108 | CA DRE #01193796<br/>Expert mortgage strategies for complex financial scenarios</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

