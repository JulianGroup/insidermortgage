"use client";
import React from 'react';
import Link from 'next/link';

export default function GeekOut() {
  const tools = [
    {
      title: "Yield Curve",
      description: "Interactive chart tracking the Treasury Yield Curve to understand its impact on mortgage rates.",
      href: "/geek-out/yield-curve",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'40px', height:'40px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      title: "Weighted Average Calculator",
      description: "Calculate the blended interest rate across multiple forms of debt and total monthly payments.",
      href: "/geek-out/weighted-average",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'40px', height:'40px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Interactive Active Calculator",
      description: "Estimate monthly payments, analyze investment property cash flow, or solve for missing mortgage variables.",
      href: "/geek-out/interactive-active-calculator",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'40px', height:'40px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <main style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)' }}>
      <section style={{ padding: '6rem 1rem 3rem', textAlign: 'center', backgroundColor: 'var(--primary)', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Geek Out</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Deep dive into our analytical tools and financial calculators built specifically for data-driven real estate investors and homeowners.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {tools.map((tool, idx) => (
              <Link key={idx} href={tool.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div 
                  style={{ 
                    padding: '2.5rem', 
                    backgroundColor: 'white', 
                    borderRadius: 'var(--radius-lg)', 
                    boxShadow: 'var(--shadow-md)', 
                    transition: 'all 0.3s ease', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-8px)'; 
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; 
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'translateY(0)'; 
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'; 
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{ color: 'var(--accent)', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 181, 30, 0.1)', display: 'inline-flex', borderRadius: 'var(--radius-md)', alignSelf: 'flex-start' }}>
                    {tool.icon}
                  </div>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.5rem' }}>{tool.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1.1rem' }}>{tool.description}</p>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', alignItems: 'center', color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Launch Tool
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{width:'20px', height:'20px', marginLeft:'0.5rem'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
