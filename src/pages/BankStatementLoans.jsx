import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { seoPages } from '../data/seoPages';
import './SelfEmployed.css'; 

const BankStatementLoans = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Bank Statement Loan Lead'
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
      setFormData({ name: '', email: '', phone: '', category: 'Bank Statement Loan Lead' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: "Can I use personal bank statements?", a: "Many programs allow personal bank statements if business deposits can be clearly identified." },
    { q: "Do I need tax returns?", a: "Often tax returns are not required for income qualification, though they may be requested for other underwriting purposes." },
    { q: "What if my income increased recently?", a: "A bank statement loan may allow lenders to consider your most recent 12 months of revenue rather than relying solely on older tax returns." },
    { q: "What if I own less than 25% of the business?", a: "Some exceptions may be available depending on the lender and program." }
  ];

  const professions = [
    'Realtors', 'Contractors', 'Consultants', 'Doctors with private practices', 
    'Attorneys', 'Insurance agents', 'Gig workers', 'Trucking company owners', 
    'E-commerce sellers', 'Small business owners'
  ];

  return (
    <>
      <Helmet>
        <title>Bank Statement Loan California | Insider Mortgage</title>
        <meta name="description" content="Qualify for a mortgage without tax returns using a 12-month bank statement loan." />
      </Helmet>
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="se-hero animate-fade-in" style={{ padding: '6rem 1rem', background: 'linear-gradient(rgba(6, 10, 45, 0.85), rgba(6, 10, 45, 0.95)), url("https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80") center/cover' }}>
          <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Bank Statement Loans for Self-Employed Borrowers</h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.9)' }}>
              Use 12 months of bank statements instead of tax returns to qualify for a mortgage.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', marginBottom: '3rem', fontSize: '1.1rem', color: 'white' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Business Owners</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> 1099 Contractors</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> LLCs, S-Corps & Corporations</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Recent Income Growth Welcome</span>
            </div>
            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Get Pre-Qualified
            </button>
          </div>
        </section>

        {/* 2. PROBLEM: Why Tax Returns Don't Tell the Whole Story */}
        <section className="section" style={{ backgroundColor: 'white' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h2 style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '2rem' }}>Why Tax Returns Don't Tell the Whole Story</h2>
            <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p style={{ marginBottom: '1.5rem' }}>
                Tax returns are often a snapshot of income from a previous year and may not accurately reflect a business's current financial performance.
              </p>
              <p style={{ marginBottom: '1.5rem' }}>
                For example, a business owner applying for a mortgage in June 2026 may only have a completed 2025 tax return available. If the business experienced significant growth during the last 12 months, the tax return may drastically understate the owner's current income.
              </p>
              <p>A bank statement loan allows lenders to evaluate recent business activity by reviewing the most recent 12 months of deposits and revenue. This can be especially beneficial for:</p>
              <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Growing businesses with increasing revenue</li>
                <li style={{ marginBottom: '0.5rem' }}>Business owners who take substantial tax deductions</li>
                <li style={{ marginBottom: '0.5rem' }}>Companies that have expanded operations or added new clients</li>
                <li>Self-employed borrowers whose current income is higher than their older tax return</li>
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
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>2025 Tax Return Income:</p>
                  <p style={{ margin: 0, color: '#DC2626', fontSize: '1.25rem', fontWeight: 'bold' }}>$80,000</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Actual Business Deposits Last 12 Months:</p>
                  <p style={{ margin: 0, color: '#059669', fontSize: '1.25rem', fontWeight: 'bold' }}>Equivalent to $150,000 Income</p>
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>Result:</p>
                <p style={{ margin: 0 }}>A bank statement loan may qualify the borrower using recent business performance instead of relying solely on an older tax return.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SOLUTION: Benefits Grid */}
        <section className="section bg-color">
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary)' }}>Benefits of Alternative Income Verification</h2>
            <div className="programs-grid">
              <div className="program-card">
                <h3>💼 No Tax Returns Required</h3>
                <p>We do not ask for or look at your tax returns. Your approval is based entirely on the gross deposits shown on your bank statements.</p>
              </div>
              <div className="program-card">
                <h3>🏦 Personal or Business Accounts</h3>
                <p>You can qualify using either personal bank statements (often counting 100% of deposits) or business bank statements.</p>
              </div>
              <div className="program-card">
                <h3>📈 Higher Purchasing Power</h3>
                <p>Because we aren't subtracting all your aggressive tax write-offs, your qualifying income is typically much higher.</p>
              </div>
              <div className="program-card">
                <h3>⚡ Fast and Flexible</h3>
                <p>These non-QM mortgage loans are designed specifically for entrepreneurs. They close quickly and offer flexible terms.</p>
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
                <h3 style={{ marginBottom: '1rem' }}>Review Statements</h3>
                <p style={{ color: 'var(--text-secondary)' }}>We analyze 12 months of your business or personal bank statements.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>2</div>
                <h3 style={{ marginBottom: '1rem' }}>Apply Expense Factor</h3>
                <p style={{ color: 'var(--text-secondary)' }}>We apply standard, lender-specific expense factors to your gross deposits.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem auto' }}>3</div>
                <h3 style={{ marginBottom: '1rem' }}>Verify Business</h3>
                <p style={{ color: 'var(--text-secondary)' }}>We quickly verify your business ownership and time in business to finalize approval.</p>
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
                  <span>Own at least 25% of the business</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>Business ownership for 12+ months</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>12 months of bank statements</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '1.2rem' }}>✓</span>
                  <span>Verifiable business income</span>
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
            <h2 style={{ marginBottom: '3rem', color: 'white' }}>Who Uses Bank Statement Loans?</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
              {professions.map(prof => (
                <span key={prof} style={{ padding: '0.8rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '1.1rem', fontWeight: '500' }}>
                  {prof}
                </span>
              ))}
            </div>
            <p style={{ marginTop: '3rem', fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
              If you fall into any of these categories, this program was built for you.
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
                  <span>Bank statement loan specialists</span>
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
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Upload statements or schedule a call.</p>
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
          
          {/* Responsive CSS for Contact Grid */}
          <style>{`
            @media (max-width: 768px) {
              .se-contact-section .container {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
              }
            }
          `}</style>
        </section>

        {/* 10. OTHER PROGRAMS */}
        <section className="section bg-color" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div className="container" style={{ textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Explore Other Specialty Programs</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {seoPages.filter(p => p.slug !== 'bank-statement-loans').map(page => (
                <Link key={page.slug} to={`/${page.slug}`} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default BankStatementLoans;
