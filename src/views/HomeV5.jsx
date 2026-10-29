"use client";
import React from 'react';
import Head from 'next/head';
import HeroV5 from '../components/HeroV5';
import Solutions from '../components/Solutions';
import Testimonials from '../components/Testimonials';
import LeadCapture from '../components/LeadCapture';

const HomeV5 = () => {
  return (
    <main>
      <Head>
        <title>Insider Mortgage | Trusted Experts</title>
        <meta name="description" content="Insider Mortgage - Specializing in Self-Employed, First-Time Buyers, Retirees & Real Estate Investors" />
      </Head>
      <HeroV5 />
      <Solutions />
      <Testimonials />
      <LeadCapture />
    </main>
  );
};

export default HomeV5;
