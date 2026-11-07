"use client";
import React from 'react';
import Link from 'next/link';
import RelatedInsights from '../components/blog/RelatedInsights';

const BioRakesh = () => {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'white', padding: '6rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontWeight: 'bold' }}>
          &larr; Back to Home
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          <div style={{ position: 'sticky', top: '2rem' }}>
            <img 
              src="/rakesh-jain.jpg" 
              alt="Rakesh Jain" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', display: 'block' }} 
            />
          </div>

          <div>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>Meet Rakesh Jain</h1>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '2rem', fontWeight: '400' }}>Senior Loan Officer & Partner, Insider Mortgage | NMLS #240594</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>
                With a mortgage career spanning over two decades, Rakesh Jain has been navigating the complexities of home financing and delivering successful closings since May 2002. Rakesh understands that a mortgage is never just a transaction—it is a sophisticated debt management strategy and a core piece of your long-term financial security.
              </p>
              <p>
                Where traditional big banks see roadblocks, Rakesh sees solutions. He has built a reputation for handling highly intricate, non-traditional loan profiles. He works extensively with self-employed business owners and real estate investors, bringing a sharp technical understanding to complicated tax returns and diverse income structures. Trusted by CPAs and financial professionals alike, Rakesh excels at expertly packaging files for underwriters, consistently securing approvals where other lenders cannot.
              </p>
              <p>
                At the core of Rakesh’s philosophy is a deep commitment to client empowerment. He avoids confusing industry jargon, choosing instead to break down the process into clear, layman's terms. Rather than pushing a single product, he regularly provides clients with a comprehensive roadmap—typically laying out multiple tailored options alongside their unique pros, cons, and long-term financial impacts—so you can make decisions with absolute confidence.
              </p>
              <p>
                When you partner with Insider Mortgage, you get the combined elite expertise of Rakesh and his partner, David Sider. Together, they break through the traditional corporate red tape to deliver a highly responsive, boutique lending experience built on daily transparency, quick 21-day average closings, and a genuine care for your family's future.
              </p>
              <p>
                Outside of work, Rakesh stays active through golf, skiing, and stand-up paddle boarding. He is also currently studying for his mortgage broker license and exploring practical applications of AI to better serve clients.
              </p>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Licensed to Serve You In:</strong>
                <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: '0.5rem' }}>
                  <li>California: DRE #01336748</li>
                  <li>Arizona: License #1050797</li>
                  <li>Florida: License #LO121680</li>
                  <li>Utah: License #13917645</li>
                  <li>Washington: License #MLO-240594</li>
                </ul>
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/pre-approval" className="btn btn-primary" style={{ display: 'inline-block', padding: '1rem 2rem' }}>
                Purchase Pre-Approval
              </Link>
              <a
                href="https://www.linkedin.com/in/rakeshjainprofile/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.9rem 1.4rem',
                  backgroundColor: '#0A66C2',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(10,102,194,0.3)',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Connect on LinkedIn ↗
              </a>
            </div>
          </div>
          
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <RelatedInsights
          bioTagId="bio-rakesh"
          title="Personal Perspectives from Rakesh"
          subtitle="Stories, milestones, and reflections explicitly shared on Rakesh's bio."
          background="#FFFFFF"
        />
      </div>
    </main>
  );
};

export default BioRakesh;
