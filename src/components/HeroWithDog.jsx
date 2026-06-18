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
        <div style={{
          width: '100%',
          paddingTop: '3rem',
          paddingLeft: '10%',
          paddingRight: '10%',
          zIndex: 2
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            maxWidth: '800px',
            lineHeight: '1.4',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            Rakesh & David– specialize in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors
          </h2>
        </div>

        {/* Main Content Area */}
        <div style={{
          display: 'flex',
          flex: 1,
          width: '100%',
          padding: '2rem 10%',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 2
        }}>
          
          {/* Left Side Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            
            <Link href="/pre-approval" style={{
              display: 'inline-block',
              backgroundColor: '#EFB51E',
              color: '#0a192f',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontWeight: 'bold',
              textDecoration: 'none',
              width: '280px',
              textAlign: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s'
            }}>
              Purchase Pre-Approval
            </Link>

            <Link href="/refinance" style={{
              display: 'inline-block',
              backgroundColor: '#0a192f',
              border: '2px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontWeight: 'bold',
              textDecoration: 'none',
              width: '280px',
              textAlign: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s'
            }}>
              Refinance
            </Link>

            <a href="#contact" style={{
              display: 'inline-block',
              backgroundColor: '#EFB51E',
              color: '#0a192f',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontWeight: 'bold',
              textDecoration: 'none',
              width: '280px',
              textAlign: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s'
            }}>
              Request Consultation
            </a>

          </div>

          {/* Right Side Text */}
          <div style={{
            paddingRight: '2%',
            marginTop: 'auto',
            marginBottom: '1rem',
            textAlign: 'right'
          }}>
            <h1 style={{
              color: 'white',
              fontSize: '3.5rem',
              fontWeight: 'bold',
              lineHeight: '1.2',
              textShadow: '2px 2px 4px rgba(0,0,0,0.6)'
            }}>
              Riding the<br/>interest rate<br/>wave
            </h1>
          </div>

        </div>
      </section>

      {/* Bio Section Below Dog Image */}
      <section className="hero" style={{ padding: '4rem 1rem', background: 'var(--primary)' }}>
        <div className="container hero-container animate-fade-in" style={{ padding: 0 }}>
          <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '2.5rem', lineHeight: '1.2' }}>
            Trusted Mortgage Experts <br className="mobile-break" />
            <span style={{fontSize: '0.6em', color: 'var(--accent)', fontWeight: '500', display: 'inline-block', marginTop: '10px'}}>Recommended by Friends &amp; Colleagues</span>
          </h2>
          
          <div className="partners-section" style={{ marginTop: '0' }}>
            <div className="partner-card" style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="partner-headshot" style={{ border: '3px solid #1d4ed8' }}>
                <img src="https://ui-avatars.com/api/?name=RJ&background=1e40af&color=fff&size=120&font-size=0.4" alt="RJ" />
              </div>
              <div className="partner-info">
                <h3>Rakesh Jain</h3>
                <p className="partner-title">MANAGING PARTNER / BROKER<br/><a href="tel:8588485653" style={{color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginTop: '8px'}}>📞 858-848-5653</a></p>
                <p className="partner-credentials">NMLS #240594<br/>20+ years helping borrowers secure tailored financing</p>
              </div>
            </div>

            <div className="partner-card" style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="partner-headshot" style={{ border: '3px solid #1d4ed8' }}>
                <img src="https://ui-avatars.com/api/?name=DS&background=1e40af&color=fff&size=120&font-size=0.4" alt="DS" />
              </div>
              <div className="partner-info">
                <h3>David Sider</h3>
                <p className="partner-title">MANAGING PARTNER / BROKER<br/><a href="tel:8588765363" style={{color: 'var(--accent)', textDecoration: 'none', display: 'inline-block', marginTop: '8px'}}>📞 858-876-5363</a></p>
                <p className="partner-credentials">NMLS #254108 | CA DRE #01193796<br/>Expert mortgage strategies for complex financial scenarios</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default HeroWithDog;
