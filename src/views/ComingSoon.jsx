"use client";
import React from 'react';
import Link from 'next/link';

const ComingSoon = ({ title }) => {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>{title}</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          We are currently crafting dedicated content and resources for this specific loan program. 
          Please check back shortly!
        </p>
        <Link href="/" className="btn btn-primary">
          Return to Homepage
        </Link>
      </div>
    </main>
  );
};

export default ComingSoon;

