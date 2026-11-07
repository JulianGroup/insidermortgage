"use client";
import React from 'react';
import Link from 'next/link';
import RelatedInsights from '../components/blog/RelatedInsights';

const BioDavid = () => {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'white', padding: '6rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontWeight: 'bold' }}>
          &larr; Back to Home
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          <div style={{ position: 'sticky', top: '2rem' }}>
            <img 
              src="/david-sider.jpg" 
              alt="David Sider" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', display: 'block' }} 
            />
          </div>

          <div>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>David Sider</h1>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '2rem', fontWeight: '400' }}>Managing Partner / Broker</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </div>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/pre-approval" className="btn btn-primary" style={{ display: 'inline-block', padding: '1rem 2rem' }}>
                Purchase Pre-Approval
              </Link>
              <a
                href="https://www.linkedin.com/in/david-sider-010701b/"
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
          bioTagId="bio-david"
          title="Personal Perspectives from David"
          subtitle="Stories, milestones, and behind-the-scenes updates explicitly shared on David's bio."
          background="#FFFFFF"
        />
      </div>
    </main>
  );
};

export default BioDavid;
