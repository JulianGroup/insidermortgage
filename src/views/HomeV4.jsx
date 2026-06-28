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
    </main>
  );
};

export default HomeV4;
