"use client";
import React from 'react';
import Link from 'next/link';

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
            
            <div style={{ marginTop: '3rem' }}>
              <Link href="/pre-approval" className="btn btn-primary" style={{ display: 'inline-block', padding: '1rem 2rem', marginRight: '1rem' }}>Purchase Pre-Approval</Link>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default BioRakesh;
