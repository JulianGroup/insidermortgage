"use client";
import React from 'react';
import HeroV4 from '../components/HeroV4';
import Solutions from '../components/Solutions';
import BioSection from '../components/BioSection';
import Testimonials from '../components/Testimonials';
import LeadCapture from '../components/LeadCapture';

const HomeV4 = () => {
  return (
    <main>
      <HeroV4 />
      <BioSection />
      <Solutions />
      <Testimonials />
      <LeadCapture />
      {/* Version Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.8rem',
        zIndex: 9999,
        pointerEvents: 'none',
        fontFamily: 'sans-serif'
      }}>
        Build v4.2
      </div>
    </main>
  );
};

export default HomeV4;
