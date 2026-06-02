"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { seoPages } from '../data/seoPages';
import './SelfEmployed.css'; 

const Loans1099 = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '1099 Loan Lead'
  });
  const [status, setStatus] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await fetch('https://script.google.com/macros/s/AKfycbz_YOUR_SCRIPT_ID/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', category: '1099 Loan Lead' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: "Do I need to provide tax returns?", a: "No. The entire purpose of the 1099 mortgage loan is to qualify you using only your 1099 forms and a standard expense ratio, completely bypassing complex tax returns." },
    { q: "What if I have multiple 1099s from different companies?", a: "That is perfectly fine! We can combine income from multiple 1099 sources (e.g., consulting for three different firms) into one cohesive qualifying income." },
    { q: "How is my net qualifying income calculated?", a: "We take the gross amount on your 1099 and apply a standard expense factor (usually between 10% and 50%, depending on your industry) to determine your net usable income." },
    { q: "Can I get a mortgage with one year of 1099 income?", a: "While many traditional loans require 2 full years, we have alternative income verification mortgage programs that allow for just 1 year of 1099 history if you have previous experience in the same field." }
  ];

  const professions = [
    'Realtors', 'Tech Contractors', 'Truck Drivers', 'Traveling Nurses', 
    'Freelance Designers', 'Ride-Share Drivers', 'Consultants', 'Independent Sales Reps'
  ];

  return (
    <>
      
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="se-hero animate-fade-in" style={{ padding: '6rem 1rem', background: 'linear-gradient(rgba(6, 10, 45, 0.85), rgba(6, 10, 45, 0.95)), url("https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&q=80") center/cover' }}>
          <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.2rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>1099 Mortgage Loans for Contractors</h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.9)' }}>
              Get approved using only your 1099 forms. No complex tax returns required.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', marginBottom: '3rem', fontSize: '1.1rem', color: 'white' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Independent Contractors</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Freelancers & Consultants</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Gig Economy Workers</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Fast, Simple Approval</span>
            </div>
            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Get Pre-Qualified
            </button>
          </div>
        </section>

        {/* 2. PROBLEM: Why Tax Returns Don't Tell the Whole Story */}
        <section className="section" style={{ backgroundColor: 'white' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h2 style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '2rem' }}>Why 1099 Income is Hard to Verify Traditionally</h2>
            <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p style={{ marginBottom: '1.5rem' }}>
                If you earn a living as an independent contractor, you receive 1099s instead of W-2s. Traditional lenders struggle to process this income without demanding years of massive tax returns and scrutinizing every single deduction on your Schedule C.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                As a smart contractor, you likely write off heavy expenses (mileage, home office, equipment) to minimize your tax burden. Traditional banks penalize you for this by deducting all those write-offs from your qualifying income, often leading to a loan denial.
              </p>
              <p>Our 1099 mortgage loan program bypasses this entirely. By relying directly on your 1099 forms and applying a standard expense ratio, we determine your true earning power without complex tax documentation. This is perfect for:</p>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Contractors with heavy, legal tax write-offs</li>
                <li style={{ marginBottom: '0.5rem' }}>Freelancers who don't want the hassle of providing CPA letters</li>
                <li style={{ marginBottom: '0.5rem' }}>Gig workers with multiple 1099 streams of income</li>
              </ul>
              
              {/* 3. PROOF: Real-World Example */}
              <div style={{ padding: '2rem', backgroundColor: 'rgba(239, 181, 30, 0.1)', borderLeft: '4px solid var(--accent)', borderRadius: 'var(--radius-md)', marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-World Example
                </h3>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Net Income on Schedule C Tax Return (After Write-Offs):</p>
                  <p style={{ margin: 0, color: '#DC2626', fontSize: '1.25rem', fontWeight: 'bold' }}>$45,000</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Gross 1099 Income (With a Standard 10% Expense Ratio):</p>
                  <p style={{ margin: 0, color: '#059669', fontSize: '1.25rem', fontWeight: 'bold' }}>$90,000 Usable Income</p>
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>Result:</p>
                <p style={{ margin: 0 }}>The borrower doubles their purchasing power and avoids providing any tax returns to the underwriter!</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SOLUTION: Benefits Grid */}
        <section className="section bg-color">
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary)' }}>Benefits of a 1099 Mortgage</h2>
            <div className="programs-grid">
              <div className="program-card">
                <h3>📄 Simple Documentation</h3>
                <p>Just provide your 1099 forms from the past 1-2 years. No need to dig up massive tax returns or coordinate with your CPA.</p>
              </div>
              <div className="program-card">
                <h3>🧮 Fixed Expense Ratios</h3>
                <p>Instead of scrutinizing every deduction on your Schedule C, we apply a standardized expense ratio to your gross 1099 income.</p>
              </div>
              <div className="program-card">
                <h3>🚀 Perfect for Gig Economy</h3>
                <p>Whether you consult independently, drive for Uber, or work as a freelance designer, if you get a 1099, you can use this program.</p>
              </div>
              <div className="program-card">
                <h3>💰 Competitive Rates</h3>
                <p>1099 loans are mainstream alternative products, meaning you still get access to highly competitive interest rates and standard 30-year terms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROCESS: How We Calculate */}
        <section className="section" style={{ backgroundColor: 'white' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary)' }}>How We Calculate Your Income</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>1</div>
                <h3 style={{ marginBottom: '1rem' }}>Review 1099s</h3>
                <p style={{ color: 'var(--text-secondary)' }}>You provide your official 1099 forms for the most recent 1 to 2 years.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>2</div>
                <h3 style={{ marginBottom: '1rem' }}>Apply Expense Factor</h3>
                <p style={{ color: 'var(--text-secondary)' }}>We apply a standard fixed expense ratio (usually 10% to 50%) to your gross 1099 amount.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>3</div>
                <h3 style={{ marginBottom: '1rem' }}>Verify Status</h3>
                <p style={{ color: 'var(--text-secondary)' }}>We verify that you are currently still operating as an active independent contractor.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. QUALIFICATION REQUIREMENTS */}
        <section className="section bg-color">
          <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Typical Qualification Requirements</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>Must receive 1099 tax forms for your income</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>1 to 2 years of 1099 income history</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>Verification of current active contractor status</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>Credit score and down payment requirements vary</span>
                </div>
              </div>
              <p style={{ marginTop: '2rem', fontStyle: 'italic', color: 'var(--text-light)', textAlign: 'center' }}>*Some exceptions may be available.</p>
            </div>
          </div>
        </section>

        {/* 7. AUDIENCE: Who Uses This Program? */}
        <section className="section" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '3rem', color: 'white' }}>Who Uses 1099 Mortgage Loans?</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
              {professions.map(prof => (
                <span key={prof} style={{ padding: '0.8rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '1.1rem', fontWeight: '500' }}>
                  {prof}
                </span>
              ))}
            </div>
            <p style={{ marginTop: '3rem', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
              If you fall into any of these categories, this non-QM mortgage was built for you.
            </p>
          </div>
        </section>

        {/* 8. FAQ SECTION */}
        <section className="section bg-color">
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary)' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faqs.map((faq, index) => (
                <div key={index} style={{ backgroundColor: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                  <button 
                    onClick={() => toggleFaq(index)}
                    style={{ width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'left' }}
                  >
                    {faq.q}
                    <span style={{ fontSize: '1.5rem', color: 'var(--accent)', transform: openFaq === index ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </button>
                  {openFaq === index && (
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. TRUST & ACTION (Contact) */}
        <section className="se-contact-section" style={{ backgroundColor: '#fff' }}>
          <div className="container" style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Trust Signals */}
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Why Work With Us?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>1099 mortgage loan specialists</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>Access to multiple wholesale investors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>Self-employed borrower expertise</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>Personalized 1-on-1 income analysis</span>
                </div>
              </div>
            </div>

            {/* Lead Form */}
            <div style={{ backgroundColor: 'var(--bg-color)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>Get a Free Income Review</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Upload your 1099s or schedule a call.</p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" name="name" className="form-input" required 
                  placeholder="Full Name" value={formData.name} onChange={handleChange} 
                  style={{ backgroundColor: 'white' }}
                />
                <input 
                  type="email" name="email" className="form-input" required 
                  placeholder="Email Address" value={formData.email} onChange={handleChange} 
                  style={{ backgroundColor: 'white' }}
                />
                <input 
                  type="tel" name="phone" className="form-input" 
                  placeholder="Phone Number" value={formData.phone} onChange={handleChange} 
                  style={{ backgroundColor: 'white' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }} disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending...' : 'Request Consultation'}
                </button>
                {status === 'success' && <div style={{ color: '#059669', textAlign: 'center', marginTop: '1rem', fontWeight: 'bold' }}>Thank you! A specialist will contact you shortly.</div>}
                {status === 'error' && <div style={{ color: '#DC2626', textAlign: 'center', marginTop: '1rem' }}>An error occurred. Please try again.</div>}
              </form>
            </div>
          </div>
        </section>

        {/* 10. OTHER PROGRAMS */}
        <section className="section bg-color" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div className="container" style={{ textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Explore Other Specialty Programs</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {seoPages.filter(p => p.slug !== '1099-loans').map(page => (
                <Link key={page.slug} href={`/${page.slug}`} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                  {page.title}
                </Link>
              ))}
              <Link href="/bank-statement-loans" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Bank Statement Loans</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default Loans1099;

