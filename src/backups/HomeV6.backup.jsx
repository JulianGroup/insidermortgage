"use client";
import React from 'react';
import HeroV6 from '../components/HeroV6';
import Solutions from '../components/Solutions';
import Testimonials from '../components/Testimonials';
import LeadCapture from '../components/LeadCapture';

const HomeV6 = () => {
  return (
    <main>
      <HeroV6 />
      <Solutions />
      <Testimonials />
      <LeadCapture />
    </main>
  );
};

export default HomeV6;
