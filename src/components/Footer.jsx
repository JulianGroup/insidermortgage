import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--primary)', color: 'var(--text-muted)', padding: 'var(--space-8) 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-white.svg" alt="C2 Financial Logo" style={{ height: '40px' }} />
          <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', margin: 0 }}>Insider Mortgage</h3>
        </div>
        <p>Expert Mortgage Brokerage Services. Equal Housing Lender.</p>
        <p style={{ fontSize: '0.875rem' }}>12230 El Camino Real #100, San Diego, CA 92130</p>
        <p style={{ fontSize: '0.875rem' }}>© {new Date().getFullYear()} Insider Mortgage. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
