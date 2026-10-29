"use client";
import React from 'react';
import ScheduleCallForm from '../components/ScheduleCallForm';
import './SelfEmployed.css';

const SelfEmployed = () => {
  return (
    <main>
      <section className="se-hero animate-fade-in">
        <div className="container">
          <h1>Mortgages for the Self-Employed</h1>
          <p>
            You run your business your way. We think your mortgage should be just as flexible. 
            Discover alternative documentation loans tailored specifically for entrepreneurs, freelancers, and independent contractors.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: '2rem', paddingTop: 'var(--space-12)' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Our Approach: Finding Your Best Option</h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-6)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
            Our first step is always to comprehensively review your financial situation—<strong>including your tax returns</strong>. If we can secure the absolute best deal for you using a standard, full-documentation loan, that is always our primary goal. <br/><br/>However, if your tax returns don't accurately reflect your true qualifying income due to business write-offs, that's when we pivot to our exciting alternative documentation options below.
          </p>
        </div>
      </section>

      <section className="section bg-color">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Alternative Documentation Programs</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Standard mortgages rely heavily on W-2s and tax returns, which don't always reflect your true earning power. Our specialized programs evaluate your real cash flow.
            </p>
          </div>

          <div className="programs-grid">
            <div className="program-card">
              <h3>🏦 Bank Statement Loans</h3>
              <p>
                Lenders evaluate your average cash flow using 12 to 24 months of personal or business bank statements. This is ideal for entrepreneurs who write off a large portion of business expenses and don't want their tax returns limiting their purchasing power.
              </p>
            </div>

            <div className="program-card">
              <h3>📊 P&L (Profit and Loss) Loans</h3>
              <p>
                Instead of tax returns, your loan officer will use a 12-month P&L statement prepared by a tax professional to verify your business income. This provides a much more accurate and up-to-date picture of your business's financial health. We even have options available that do not require a tax professional to prepare your statements!
              </p>
            </div>

            <div className="program-card">
              <h3>📈 Asset Utilization Loans</h3>
              <p>
                This program reviews your overall financial health and liquid assets (like stocks, bonds, and retirement accounts) to calculate qualifying income rather than just relying on your business's monthly revenue.
              </p>
            </div>

            <div className="program-card">
              <h3>📝 1099 Expense Ratio Loans</h3>
              <p>
                These options are specifically tailored for independent contractors and freelancers. By relying directly on your 1099 forms and applying a standard expense ratio, we can determine your earning power without complex tax documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="se-contact-section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Speak with a Self-Employed Specialist</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Fill out the form below and one of our alternative-doc experts will reach out to discuss which program fits your unique cash flow.
            </p>
          </div>

          <ScheduleCallForm source="Mortgages for Self-Employed" />
        </div>
      </section>
    </main>
  );
};

export default SelfEmployed;

