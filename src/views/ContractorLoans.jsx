"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { seoPages } from '../data/seoPages';
import './SelfEmployed.css'; 

const ContractorLoans = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Contractor Mortgage Lead'
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
      setFormData({ name: '', email: '', phone: '', category: 'Contractor Mortgage Lead' });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    { q: "Can I qualify if I write off most of my income?", a: "Potentially yes. Many contractor-focused programs use bank deposits instead of tax returns." },
    { q: "Can truck payments be excluded?", a: "Some programs allow business vehicle debt to be excluded from personal debt-to-income calculations when properly documented." },
    { q: "Can I qualify with 1099 income?", a: "Yes. Certain programs are specifically designed for independent contractors and self-employed borrowers." },
    { q: "Do I need two years of tax returns?", a: "Not always. Alternative documentation programs may allow qualification using bank statements or other business records." }
  ];

  const professions = [
    'General Contractors', 'Electricians', 'Plumbers', 'HVAC Contractors', 
    'Landscapers', 'Concrete Contractors', 'Painters', 'Roofing Contractors', 
    'Flooring Contractors', 'Remodelers', 'Carpenters', 'Pool Contractors'
  ];

  return (
    <>
      
      
      <main>
        {/* 1. HERO SECTION */}
        <section className="se-hero animate-fade-in" style={{ padding: '6rem 1rem', background: 'linear-gradient(rgba(6, 10, 45, 0.85), rgba(6, 10, 45, 0.95)), url("https://images.unsplash.com/photo-1504307651254-35680f35aa27?auto=format&fit=crop&q=80") center/cover' }}>
          <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.2rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Mortgages for Self-Employed Contractors</h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.9)' }}>
              Qualify using bank statements, 1099s, or business cash flow—even if your tax returns show limited income due to heavy write-offs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', marginBottom: '3rem', fontSize: '1.1rem', color: 'white' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> General Contractors</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Electricians & Plumbers</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> HVAC & Landscaping</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--accent)' }}>✓</span> Roofers & Painters</span>
            </div>
            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              Get Pre-Qualified
            </button>
          </div>
        </section>

        {/* 2. PROBLEM: Common Problems We Solve */}
        <section className="section" style={{ backgroundColor: 'white' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h2 style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '2rem' }}>Why Contractors Get Denied by Traditional Banks</h2>
            <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <p style={{ marginBottom: '1.5rem' }}>
                Traditional lenders often calculate income using tax returns. Unfortunately, many contractors legitimately deduct:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li>Materials and Supplies</li>
                <li>Fuel and Travel</li>
                <li>Vehicle expenses (Truck loans)</li>
                <li>Heavy Equipment purchases</li>
                <li>Depreciation</li>
                <li>Subcontractor costs</li>
              </ul>
              <p style={{ marginBottom: '1.5rem' }}>
                As a result, a highly profitable contractor may appear to earn far less on paper than they actually earn. 
                This is where bank statement and alternative documentation loans step in to save the day.
              </p>
              
              {/* 3. PROOF: Real-World Example */}
              <div style={{ padding: '2rem', backgroundColor: 'rgba(239, 181, 30, 0.1)', borderLeft: '4px solid var(--accent)', borderRadius: 'var(--radius-md)', marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Real-World Example
                </h3>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Contractor Gross Revenue:</p>
                  <p style={{ margin: 0, color: '#059669', fontSize: '1.25rem', fontWeight: 'bold' }}>$250,000</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Tax Return Net Income (After write-offs):</p>
                  <p style={{ margin: 0, color: '#DC2626', fontSize: '1.25rem', fontWeight: 'bold' }}>$65,000</p>
                </div>
                <p style={{ fontWeight: 'bold', color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>The Outcome:</p>
                <p style={{ margin: 0 }}><strong>Traditional Lender:</strong> Declined due to low net income.</p>
                <p style={{ margin: '0.5rem 0 0 0' }}><strong>Our Alternative Program:</strong> Qualified beautifully based on the $250,000 of business deposits flowing into the contractor's bank account.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SOLUTION: Why Contractor-Friendly Mortgage Programs Work */}
        <section className="section bg-color">
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>Why Contractor-Friendly Mortgage Programs Work</h2>
            <p style={{ textAlign: 'center', fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
              Many contractors run healthy businesses but report lower taxable income due to legitimate business deductions. Our lender network offers alternative programs to bypass this issue entirely.
            </p>
            <div className="programs-grid">
              <div className="program-card">
                <h3>🏦 Bank Statement Loans</h3>
                <p>We evaluate your most recent 12 to 24 months of bank deposits to determine your true cash flow, ignoring your massive tax write-offs.</p>
              </div>
              <div className="program-card">
                <h3>📄 1099 Income Loans</h3>
                <p>If you are a sub-contractor receiving 1099s from larger firms, we can use those 1099s directly to qualify you using a standardized expense ratio.</p>
              </div>
              <div className="program-card">
                <h3>📊 Profit & Loss Programs</h3>
                <p>Provide a simple 12-month P&L statement to show your true operating income. Perfect for contractors with heavy upfront material costs.</p>
              </div>
              <div className="program-card">
                <h3>📈 Asset Utilization</h3>
                <p>Have significant cash reserves from a big job? We can utilize your liquid assets to supplement your monthly qualifying income.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. AUDIENCE: Contractor Types We Frequently Work With */}
        <section className="section" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '3rem', color: 'white' }}>Contractor Types We Frequently Work With</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', maxWidth: '900px', margin: '0 auto' }}>
              {professions.map(prof => (
                <span key={prof} style={{ padding: '0.8rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', fontSize: '1.1rem', fontWeight: '500' }}>
                  {prof}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 6. HEAVY SEO: Industry-Specific Sections */}
        <section className="section" style={{ backgroundColor: 'white' }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary)' }}>Specialized Mortgage Approvals by Trade</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Mortgages for General Contractors</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  General contractors often manage massive budgets, but sub-contractor payouts and heavy material costs can decimate net income on a tax return. We understand the GC business model. Many GCs choose our <Link href="/bank-statement-loans">Bank Statement Loan</Link> program because it allows lenders to evaluate recent gross business deposits rather than relying solely on older, heavily deducted tax returns.
                </p>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Mortgages for Electricians</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Whether you run a large commercial electrical crew or operate as an independent residential electrician, your income shouldn't stop you from buying a home. Electricians often have heavy vehicle, tool, and copper wire write-offs. A self-employed contractor mortgage allows you to bypass the Schedule C deductions and qualify based on your true gross receipts.
                </p>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Mortgages for Plumbers</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Plumbing contractors face unique overhead costs, including expensive service vans, specialized equipment, and inventory holding costs. If traditional banks are rejecting your mortgage because of these legitimate deductions, we have alternative documentation programs. We can even explore excluding commercial truck payments from your debt-to-income ratio.
                </p>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Mortgages for HVAC Contractors</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  The HVAC industry is heavily seasonal. You might have massive deposit months in the summer and winter, with slower shoulder seasons. Traditional underwriting hates fluctuating income. Our alternative income verification mortgages average your deposits out over 12 to 24 months, smoothing out your income and maximizing your purchasing power.
                </p>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Mortgages for Landscapers</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Landscaping contractors are notorious for heavy equipment depreciation. From zero-turn mowers to dump trailers, your tax returns are designed to show minimal profit to save you money. If you receive a large portion of your income via <Link href="/1099-loans">1099s</Link> from commercial clients, we can use those forms directly to qualify you for your next home.
                </p>
              </div>

              <div style={{ padding: '2rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Mortgages for Roofers</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Roofing companies handle enormous material costs (shingles, underlayment, dumpsters). When a bank looks at a roofer's tax return, they often misunderstand the massive cost of goods sold. By using a Profit & Loss statement or your business bank accounts, we strip away the confusion and secure approvals for hard-working roofing contractors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. FAQ SECTION */}
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

        {/* 8. TRUST & ACTION (Contact) */}
        <section className="se-contact-section" style={{ backgroundColor: '#fff' }}>
          <div className="container" style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Trust Signals */}
            <div>
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Why Work With Us?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>Contractor mortgage loan specialists</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>Access to multiple wholesale investors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--accent)', fontSize: '1.5rem' }}>★</span>
                  <span>Experts in navigating heavy Schedule C write-offs</span>
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
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Stop letting tax write-offs hold you back.</p>
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

        {/* 9. OTHER PROGRAMS */}
        <section className="section bg-color" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
          <div className="container" style={{ textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '4rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Explore Other Self-Employed Programs</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/self-employed-programs" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Self-Employed Mortgage Programs</Link>
              <Link href="/bank-statement-loans" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>Bank Statement Loans</Link>
              <Link href="/1099-loans" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>1099 Loans</Link>
              <Link href="/mortgage-for-llc" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>LLC Owner Mortgages</Link>
              <Link href="/mortgage-for-scorp" style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>S-Corp Mortgages</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default ContractorLoans;

