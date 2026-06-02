"use client";
import React, { useState } from 'react';
import './SelfEmployed.css';

const SelfEmployed = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Self-Employed Borrower'
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_YOUR_SCRIPT_ID/exec';
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', category: 'Self-Employed Borrower' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" name="name" className="form-input" required 
              placeholder="Full Name" value={formData.name} onChange={handleChange} 
            />
            <input 
              type="email" name="email" className="form-input" required 
              placeholder="Email Address" value={formData.email} onChange={handleChange} 
            />
            <input 
              type="tel" name="phone" className="form-input" 
              placeholder="Phone Number" value={formData.phone} onChange={handleChange} 
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }} disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending...' : 'Request Consultation'}
            </button>
            {status === 'success' && <div style={{ color: '#059669', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>Thank you! A specialist will contact you shortly.</div>}
            {status === 'error' && <div style={{ color: '#DC2626', textAlign: 'center', marginTop: '1rem' }}>An error occurred. Please try again.</div>}
          </form>
        </div>
      </section>
    </main>
  );
};

export default SelfEmployed;

