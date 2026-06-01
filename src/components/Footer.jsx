import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--primary)', color: 'var(--text-muted)', padding: 'var(--space-8) 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="logo-white.svg" alt="C2 Financial Logo" style={{ height: '40px' }} />
          <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', margin: 0 }}>Insider Mortgage</h3>
        </div>
        <p>Expert Mortgage Brokerage Services. Equal Housing Lender.</p>
        <p style={{ fontSize: '0.875rem' }}>12230 El Camino Real #100, San Diego, CA 92130</p>
        
        <div style={{ width: '100%', maxWidth: '700px', margin: 'var(--space-6) 0', padding: 'var(--space-6)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', textAlign: 'left', fontSize: '0.8rem', lineHeight: '1.6' }}>
          <h4 style={{ color: 'white', marginBottom: 'var(--space-4)', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-2)' }}>Licensing & Disclosures</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div>
              <strong style={{ color: 'white' }}>Rakesh Jain</strong><br/>
              NMLS #240594
            </div>
            <div>
              <strong style={{ color: 'white' }}>David Sider</strong><br/>
              NMLS #254108 | CA DRE #01193796
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', opacity: 0.9 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '8px 4px', color: 'white', fontWeight: 600 }}>State</th>
                <th style={{ padding: '8px 4px', color: 'white', fontWeight: 600 }}>Rakesh Jain's License</th>
                <th style={{ padding: '8px 4px', color: 'white', fontWeight: 600 }}>C2 State License</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><td style={{ padding: '8px 4px' }}>Arizona</td><td style={{ padding: '8px 4px' }}>1050797</td><td style={{ padding: '8px 4px' }}>0919209</td></tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><td style={{ padding: '8px 4px' }}>California</td><td style={{ padding: '8px 4px' }}>01336748</td><td style={{ padding: '8px 4px' }}>01821025</td></tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><td style={{ padding: '8px 4px' }}>Florida</td><td style={{ padding: '8px 4px' }}>LO121680</td><td style={{ padding: '8px 4px' }}>MBR3519</td></tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><td style={{ padding: '8px 4px' }}>Utah</td><td style={{ padding: '8px 4px' }}>13917645</td><td style={{ padding: '8px 4px' }}>13748829</td></tr>
              <tr><td style={{ padding: '8px 4px' }}>Washington</td><td style={{ padding: '8px 4px' }}>MLO-240594</td><td style={{ padding: '8px 4px' }}>MB135622</td></tr>
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '0.875rem' }}>© {new Date().getFullYear()} Insider Mortgage. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
