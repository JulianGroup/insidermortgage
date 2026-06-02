"use client";
import React from 'react';
import Hero from '../components/Hero';
import Solutions from '../components/Solutions';
import Testimonials from '../components/Testimonials';
import LeadCapture from '../components/LeadCapture';

const Home = () => {
  return (
    <main>
      <Hero />
      <Solutions />
      <Testimonials />
      <LeadCapture />
    </main>
  );
};

export default Home;

