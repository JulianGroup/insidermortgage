"use client";
import React from 'react';
import HeroWithDog from '../components/HeroWithDog';
import Solutions from '../components/Solutions';
import Testimonials from '../components/Testimonials';
import LeadCapture from '../components/LeadCapture';

const HomeWithDog = () => {
  return (
    <main>
      <HeroWithDog />
      <Solutions />
      <Testimonials />
      <LeadCapture />
    </main>
  );
};

export default HomeWithDog;
