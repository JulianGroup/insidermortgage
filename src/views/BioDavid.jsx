"use client";
import React from 'react';
import Link from 'next/link';

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
              src="/insidermortgage/david-sider.jpg" 
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
            
            <div style={{ marginTop: '3rem' }}>
              <Link href="/pre-approval" className="btn btn-primary" style={{ display: 'inline-block', padding: '1rem 2rem', marginRight: '1rem' }}>Purchase Pre-Approval</Link>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default BioDavid;
