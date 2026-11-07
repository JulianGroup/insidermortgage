"use client";
import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--primary)', color: 'var(--text-muted)', padding: 'var(--space-8) 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h3 style={{ color: 'white', fontFamily: 'var(--font-heading)', margin: 0 }}>Insider Mortgage</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.65rem', lineHeight: '1.2', color: 'rgba(255,255,255,0.7)' }}>
            <span>powered</span>
            <span>by</span>
          </div>
          <img src="/logo-white.svg" alt="C2 Financial Logo" style={{ height: '40px' }} />
        </div>
        <div style={{ display: 'flex', gap: '20px', margin: '10px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/resource-library" style={{ color: 'white', textDecoration: 'underline' }}>Resource Library</Link>
          <Link href="/partners" style={{ color: 'white', textDecoration: 'underline' }}>Partners</Link>
          <Link href="/big-picture" style={{ color: 'white', textDecoration: 'underline' }}>IMC's Big Picture</Link>
          <Link href="/privacy-policy" style={{ color: 'white', textDecoration: 'underline' }}>Privacy Policy</Link>
        </div>
        <p>Expert Mortgage Brokerage Services. Equal Housing Lender.</p>
        <p style={{ fontSize: '0.875rem' }}>
          <a
            href="https://maps.app.goo.gl/YNzoKE4J1ywzhySE8"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255, 255, 255, 0.9)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <span>📍 12230 El Camino Real #100, San Diego, CA 92130</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(View on Google Maps ↗)</span>
          </a>
        </p>
        
        <div style={{ width: '100%', maxWidth: '700px', margin: 'var(--space-6) 0', padding: 'var(--space-6)', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)', textAlign: 'left', fontSize: '0.8rem', lineHeight: '1.6' }}>
          <h4 style={{ color: 'white', marginBottom: 'var(--space-4)', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-2)' }}>Licensing & Disclosures</h4>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', opacity: 0.9 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '2px 4px', color: 'white', fontWeight: 600 }}></th>
                <th style={{ padding: '2px 4px', color: 'white', fontWeight: 600 }}>David Sider</th>
                <th style={{ padding: '2px 4px', color: 'white', fontWeight: 600 }}>Rakesh Jain</th>
                <th style={{ padding: '2px 4px', color: 'white', fontWeight: 600 }}>C2 Financial Corp</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '2px 4px', fontWeight: 'bold', color: 'white' }}>NMLS</td>
                <td style={{ padding: '2px 4px' }}>254108</td>
                <td style={{ padding: '2px 4px' }}>240594</td>
                <td style={{ padding: '2px 4px' }}>135622</td>
              </tr>
              <tr><td colSpan="4" style={{ height: '10px' }}></td></tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <td colSpan="4" style={{ padding: '2px 4px', fontWeight: 'bold', color: 'white' }}>State</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '2px 4px' }}>Arizona</td>
                <td style={{ padding: '2px 4px' }}></td>
                <td style={{ padding: '2px 4px' }}>1050797</td>
                <td style={{ padding: '2px 4px' }}>BK-2009362</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '2px 4px' }}>California (DRE)</td>
                <td style={{ padding: '2px 4px' }}>01193796</td>
                <td style={{ padding: '2px 4px' }}>01336748</td>
                <td style={{ padding: '2px 4px' }}>01821025</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '2px 4px' }}>Florida</td>
                <td style={{ padding: '2px 4px' }}></td>
                <td style={{ padding: '2px 4px' }}>LO121680</td>
                <td style={{ padding: '2px 4px' }}>MLD2635</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '2px 4px' }}>Utah (UDRE)</td>
                <td style={{ padding: '2px 4px' }}></td>
                <td style={{ padding: '2px 4px' }}>13917645</td>
                <td style={{ padding: '2px 4px' }}>13748829</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '2px 4px' }}>Washington</td>
                <td style={{ padding: '2px 4px' }}></td>
                <td style={{ padding: '2px 4px' }}>MLO-240594</td>
                <td style={{ padding: '2px 4px' }}>MB135622</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'rgba(255,255,255,0.88)', fontSize: '0.78rem', lineHeight: '1.6' }}>
            <div>
              <p style={{ margin: 0 }}>
                This licensee is performing acts for which a mortgage broker/lender license is required. C2 Financial Corporation (NMLS #135622) is licensed in: California by the Department of Real Estate, Real Estate Broker License #01821025, and the Department of Financial Protection and Innovation, California Finance Lenders Law License #603L442; Arizona Mortgage Banker License #BK-2009362; Florida Mortgage Lender License #MLD2635; Utah Division of Real Estate Entity License #13748829; and Washington Consumer Loan Company License #MB135622. Individual loan officer state authorizations vary as listed above (David Sider NMLS #254108: CA DRE #01193796; Rakesh Jain NMLS #240594: AZ #1050797, CA DRE #01336748, FL #LO121680, UT #13917645, WA #MLO-240594). Loan approval is not guaranteed and is subject to lender review of information. All loan approvals are conditional and all conditions must be met by borrower. Loan is only approved when lender has issued approval in writing and is subject to the Lender conditions. Specified rates may not be available for all borrowers. Rate subject to change with market conditions. C2 Financial Corporation is an Equal Opportunity Mortgage Broker/Lender. Services referred to herein are available only to persons located in states where licensed (AZ, CA, FL, UT, and WA).
              </p>
            </div>

            <div>
              <strong style={{ color: 'white', display: 'block', marginBottom: '0.2rem' }}>VA/FHA Disclaimer</strong>
              <p style={{ margin: 0 }}>
                C2 Financial Corporation has the ability to broker VA loans based on their relationship with VA approved lenders. C2 Financial Corporation is not acting on behalf of or at the direction of HUD/FHA or the VA.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginTop: '0.4rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {/* Equal Housing Opportunity Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <svg
                  viewBox="0 0 64 64"
                  width="38"
                  height="38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Equal Housing Opportunity Logo"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M32 8L6 28v4h6v22h40V32h6v-4L32 8zm18 40H14V28.5L32 14.8 50 28.5V48z"
                    fill="#FFFFFF"
                  />
                  <rect x="21" y="29" width="22" height="4.5" fill="#FFFFFF" />
                  <rect x="21" y="37" width="22" height="4.5" fill="#FFFFFF" />
                </svg>
                <span style={{ fontWeight: 700, color: 'white', fontSize: '0.78rem', letterSpacing: '0.4px', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Equal Housing<br />Opportunity
                </span>
              </div>

              {/* Regulatory & Corporate Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
                <a
                  href="https://www.nmlsconsumeraccess.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#F2C230', textDecoration: 'underline', fontWeight: 600 }}
                >
                  NMLS Consumer Access
                </a>
                <a
                  href="https://www.c2financialcorp.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#F2C230', textDecoration: 'underline', fontWeight: 600 }}
                >
                  C2 Financial Corporation
                </a>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem' }}>© {new Date().getFullYear()} Insider Mortgage. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

