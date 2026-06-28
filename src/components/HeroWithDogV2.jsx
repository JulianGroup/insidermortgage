import React from 'react';
import Link from 'next/link';
import './Hero.css';

const HeroWithDogV2 = () => {
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

        {/* Middle Content Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '2rem 10%', zIndex: 2 }}>
          <div className="hero-dog-right-text" style={{ marginTop: 0 }}>
            <h1 className="hero-dog-h1">
              I'm riding the<br/>interest rate<br/>wave
            </h1>
          </div>
        </div>

        {/* Bottom Horizontal Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1.5rem', 
          padding: '2rem 5%', 
          paddingBottom: '5rem', /* extra padding to sit above the wave */
          flexWrap: 'wrap', 
          zIndex: 3,
          position: 'relative'
        }}>
          <Link href="/pre-approval" className="hero-dog-btn-horizontal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            PURCHASE PRE-APPROVAL
          </Link>

          <Link href="/refinance" className="hero-dog-btn-horizontal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            REFINANCE
          </Link>

          <a href="#contact" className="hero-dog-btn-horizontal">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            REQUEST CONSULTATION
          </a>
        </div>

        {/* Wavy Divider at bottom */}
        <div style={{ position: 'absolute', bottom: '-5px', left: '-5px', width: 'calc(100% + 10px)', overflow: 'hidden', lineHeight: 0, zIndex: 1 }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: 'relative', display: 'block', width: '100%', height: '90px' }}>
             <path d="M0,60 C300,120 900,0 1200,60 L1200,130 L0,130 Z" fill="var(--primary)" stroke="#EFB51E" strokeWidth="6" />
          </svg>
        </div>
      </section>

      {/* Bio Section Below Dog Image */}
      <section className="hero" style={{ padding: '4rem 1rem', background: 'var(--primary)', position: 'relative', zIndex: 2 }}>
        <div className="container hero-container animate-fade-in" style={{ padding: 0 }}>
          <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', lineHeight: '1.2', fontFamily: 'Tahoma, sans-serif' }}>
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

export default HeroWithDogV2;
