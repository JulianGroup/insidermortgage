"use client";
import React from 'react';
import Link from 'next/link';
import './Hero.css'; 

const HeroV4 = () => {
  return (
    <section 
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '80vh',
        maxWidth: '1600px',
        margin: '0 auto',
        backgroundImage: "url('/insidermortgage/main-pg-no-text.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '4rem 5%',
        backgroundColor: '#0a192f'
      }}
    >
      {/* Top Text Area */}
      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontFamily: 'Impact, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          margin: 0,
          lineHeight: '1.1',
          textShadow: '2px 2px 8px rgba(0,0,0,0.8)'
        }}>
          Trusted Mortgage <span style={{ color: '#FDB813', fontStyle: 'italic' }}>Experts</span>
        </h1>
        <p style={{
          color: 'white',
          fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
          margin: 0,
          fontWeight: '500',
          textShadow: '1px 1px 4px rgba(0,0,0,0.8)'
        }}>
          Recommended by<br/>
          <span style={{ color: '#FDB813', fontWeight: 'bold' }}>Professionals, Friends & Family</span>
        </p>
      </div>
      
      {/* Absolute positioning for the "I'm riding..." text on the right */}
      <div style={{
        position: 'absolute',
        right: '5%',
        top: '45%',
        textAlign: 'center',
        zIndex: 2,
        display: 'none' // Can toggle on if requested, but let's just keep it simple for now or use media query
      }} className="mobile-hide">
        <h3 style={{
          color: '#1e3a8a',
          fontSize: '2rem',
          fontFamily: '"Comic Sans MS", cursive, sans-serif', // close enough for the handwritten look without loading a new font
          fontWeight: 'bold',
          transform: 'rotate(-5deg)'
        }}>
          I'm riding the<br/>interest rate wave
        </h3>
      </div>

      {/* Buttons Area */}
      <div style={{ 
        zIndex: 2, 
        marginTop: 'auto', 
        marginBottom: '2rem',
        display: 'flex', 
        gap: '1.5rem', 
        flexWrap: 'wrap',
        maxWidth: '900px'
      }}>
        <Link href="/pre-approval" className="hero-dog-btn-horizontal" style={{ flex: '1', minWidth: '220px', backgroundColor: '#EFB51E', color: '#000', border: '2px solid #EFB51E', borderRadius: '12px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          PURCHASE PRE-APPROVAL
        </Link>

        <Link href="/refinance" className="hero-dog-btn-horizontal" style={{ flex: '1', minWidth: '220px', backgroundColor: '#EFB51E', color: '#000', border: '2px solid #EFB51E', borderRadius: '12px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          REFINANCE
        </Link>

        <a href="#contact" className="hero-dog-btn-horizontal" style={{ flex: '1', minWidth: '220px', backgroundColor: '#EFB51E', color: '#000', border: '2px solid #EFB51E', borderRadius: '12px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          REQUEST CONSULTATION
        </a>
      </div>
      
      {/* Mobile hide class */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-hide { display: block !important; }
        }
      `}} />
    </section>
  );
};

export default HeroV4;
