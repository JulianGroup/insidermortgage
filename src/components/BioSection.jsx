"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css'; 

const BioSection = () => {
  return (
    <section style={{ backgroundColor: '#0a192f', padding: '4rem 1rem 3rem 1rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ 
          color: 'white', 
          fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
          marginBottom: '3rem', 
          fontWeight: 'bold',
          lineHeight: '1.4'
        }}>
          David & Rakesh – specialize in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors
        </h2>
        
        <div className="partners-section">
          <div className="partner-card">
            <img src="/david-sider-sm.webp" alt="David Sider" className="partner-bg-image" width={600} height={400} loading="lazy" decoding="async" />
            <div className="partner-info">
              <h3>David Sider</h3>
              <p className="partner-title">Managing Partner / Broker</p>
              <Link href="/bio-david" className="partner-bio-btn">Bio</Link>
            </div>
          </div>

          <div className="partner-card">
            <img src="/rakesh-jain.webp" alt="Rakesh Jain" className="partner-bg-image" width={332} height={336} loading="lazy" decoding="async" />
            <div className="partner-info">
              <h3>Rakesh Jain</h3>
              <p className="partner-title">Managing Partner / Broker</p>
              <Link href="/bio-rakesh" className="partner-bio-btn">Bio</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioSection;
