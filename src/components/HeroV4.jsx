"use client";
import React from 'react';
import Link from 'next/link';

const HeroV4 = () => {
  return (
    <section style={{ backgroundColor: 'var(--primary)' }}>
      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        <img 
          src="/insidermortgage/main-pg-w-text.png" 
          alt="Insider Mortgage Splash" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>
      
      <div style={{ 
        padding: '3rem 1rem', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1.5rem', 
        justifyContent: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Link href="/pre-approval" style={{
          display: 'inline-block',
          backgroundColor: '#EFB51E',
          color: '#0a192f',
          padding: '1rem 2.5rem',
          borderRadius: '50px',
          fontWeight: 'bold',
          textDecoration: 'none',
          textAlign: 'center',
          fontSize: '1.2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s',
          minWidth: '250px'
        }}>
          Purchase Pre-Approval
        </Link>

        <Link href="/refinance" style={{
          display: 'inline-block',
          backgroundColor: 'transparent',
          border: '2px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '1rem 2.5rem',
          borderRadius: '50px',
          fontWeight: 'bold',
          textDecoration: 'none',
          textAlign: 'center',
          fontSize: '1.2rem',
          transition: 'transform 0.2s',
          minWidth: '250px'
        }}>
          Refinance
        </Link>

        <a href="#contact" style={{
          display: 'inline-block',
          backgroundColor: '#EFB51E',
          color: '#0a192f',
          padding: '1rem 2.5rem',
          borderRadius: '50px',
          fontWeight: 'bold',
          textDecoration: 'none',
          textAlign: 'center',
          fontSize: '1.2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s',
          minWidth: '250px'
        }}>
          Request Consultation
        </a>
      </div>
    </section>
  );
};

export default HeroV4;
