"use client";
import React, { useState } from 'react';
import ReviewCard from '../components/ReviewCard';
import './SelfEmployed.css';

const retireeReviews = [
  {
    name: 'Client',
    text: "From our very first call, my wife and I felt like David at Insider Mortgage truly cared about us. Over the course of two to three months, we quickly realized that David was intelligent, creative, and trustworthy, even though we had never met him in person. Through regular telephone conversations, we grew to trust his organization, planning and the milestones he set, which he accomplished on time. The end result was not only securing our reverse mortgage but also gaining a new friend in David. It is clear David enjoys his work, and that made the process easier for us. He listens carefully and explains things in a way that helps people who may not understand all the details. David often provided information before we even thought to ask, anticipating our needs and even sharing referrals and resources that explained regulatory requirements and timing. He clearly takes pride in his knowledge and experience, and he has a wit that makes the process more enjoyable. Our experience with David and Insider Mortgage was so positive that we’d happily refer future inquiries to him...WELL DONE DAVID!",
    initials: 'C',
    source: 'Google Review'
  },
  {
    name: 'larry gk',
    text: "We consider our financial portion of life a 3- legged stool: Wealth advisor, tax accountant and (especially now) mortgage expert. Insider Mortgage is our go-to source for the latter without question I couldn't craft what made sense through Wells Fargo Mortgage. David Sider and his team at Insider Mortgage had creative and compelling alternatives that not only fit the monthly budget but come with other benefits. They thoroughly explained everything got me the loan for our home in beautiful San Diego. The level of attention to details and service is just fantastic. They may use computer and platform based tools but no stage is assumed without personal 1:1 live conversation. The way it should be.... Thanks.",
    initials: 'LG',
    source: 'Google Review'
  }
];

const Retirees = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Retiree Borrower'
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
      setFormData({ name: '', email: '', phone: '', category: 'Retiree Borrower' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <main>
      <section className="se-hero animate-fade-in" style={{ background: 'linear-gradient(rgba(6, 10, 45, 0.8), rgba(6, 10, 45, 0.9)), url("https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&q=80") center/cover' }}>
        <div className="container">
          <h1>Mortgages for Retirees</h1>
          <p>
            Retirement should be about enjoying your hard-earned freedom, not stressing over finances. 
            Discover how refinancing or unlocking your home equity can help you achieve your goals, even without traditional employment income.
          </p>
        </div>
      </section>

      <section className="section bg-color">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--primary)' }}>Why Do Retirees Refinance?</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
              Your home is likely your most valuable asset. Here is how strategically leveraging your home's equity can drastically improve your quality of life in retirement.
            </p>
          </div>

          <div className="programs-grid">
            <div className="program-card">
              <h3>💵 Improve Cash Flow</h3>
              <p>
                By refinancing to a lower interest rate or extending your loan term, you can significantly reduce your required monthly mortgage payment. This instantly frees up cash in your budget for:
              </p>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.5rem' }}>Daily living expenses, travel, or leisure</li>
                <li style={{ marginBottom: '0.5rem' }}>Paying off high interest rate credit card balances</li>
                <li>Supplementing your monthly retirement income</li>
              </ul>
            </div>

            <div className="program-card">
              <h3>🏡 Leverage Home Equity</h3>
              <p>
                Unlock the cash tied up in your property to fund major life events without touching your retirement accounts. Equity can be used for:
              </p>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.5rem' }}>Unexpected medical expenses</li>
                <li>Helping family members (e.g., providing a down payment for a child or grandchild's home, funding tuition, or initiating trust income for the family)</li>
              </ul>
            </div>

            <div className="program-card">
              <h3>🏦 Maintain Cash Reserves</h3>
              <p>
                Instead of draining your liquid savings or pulling from your 401(k) / IRA (which can trigger massive tax penalties), using a cash-out refinance allows you to keep your retirement portfolio fully invested and growing while maintaining a large, safe cash reserve.
              </p>
            </div>

            <div className="program-card">
              <h3>♿ Finance Home Modifications</h3>
              <p>
                As your needs change, your home may need to change with you. Refinancing can easily cover the costs of aging-in-place modifications, such as adding a first-floor master suite, widening doorways, or installing walk-in tubs and ramp access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Retiree Reviews Section */}
      <section className="section bg-color" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '2rem' }}>Success Stories</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {retireeReviews.map((review, idx) => (
              <ReviewCard key={idx} review={review} />
            ))}
          </div>
        </div>
      </section>

      <section className="se-contact-section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2>Speak with a Retirement Mortgage Specialist</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Fill out the form below and one of our experts will reach out to discuss how you can qualify using your retirement assets or home equity.
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

export default Retirees;

