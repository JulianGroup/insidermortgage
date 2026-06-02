"use client";
import React, { useState } from 'react';
import Head from 'next/head';

export default function Partners() {
  const [formData, setFormData] = useState({ name: '', email: '', role: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    setTimeout(() => {
      setStatus('Scenario submitted successfully. We will be in touch shortly!');
      setFormData({ name: '', email: '', role: '', message: '' });
    }, 1000);
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <Head>
        <title>Why Referrers Choose Insider Mortgage</title>
      </Head>

      {/* Hero Section */}
      <section style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '6rem 1rem 4rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Why Referrers Choose Insider Mortgage
          </h1>
          <p style={{ fontSize: '1.3rem', opacity: 0.9, lineHeight: '1.6' }}>
            When you refer someone to us, you're trusting us with your reputation. We take that responsibility seriously.
          </p>
        </div>
      </section>

      {/* Main Content & Form Layout */}
      <section style={{ padding: '4rem 1rem' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', maxWidth: '1200px' }}>
          
          {/* Left Column: The "Why Us" Content */}
          <div style={{ flex: '1 1 600px' }}>
            
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>We Solve Complex Mortgage Scenarios</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', paddingLeft: '56px' }}>
                Many of our clients are self-employed, own businesses, have significant tax write-offs, or require specialty loan programs. We work hard to find solutions when traditional lenders say no.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>We Communicate Proactively</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', paddingLeft: '56px' }}>
                Referrers and borrowers receive clear updates throughout the loan process. No wondering what happens next. No disappearing loan officers.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>We Educate, Not Pressure</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', paddingLeft: '56px' }}>
                A mortgage is one of the largest financial decisions most people will ever make. We take the time to explain options, answer questions, and help borrowers make informed decisions.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>We Protect Your Relationship</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', paddingLeft: '56px' }}>
                Whether the referral comes from a Realtor, financial advisor, CPA, attorney, or past client, we understand that every referral reflects on you. Our goal is to make you look good.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>We Focus on Long-Term Relationships</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', paddingLeft: '56px' }}>
                Many of our clients return for future purchases, refinances, and investment properties. We believe relationships matter more than transactions.
              </p>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '24px', height: '24px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                </div>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>A Reputation Built on Results</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', paddingLeft: '56px' }}>
                Our business has been built largely through referrals and repeat clients. We are grateful for the trust our clients and referral partners place in us and work every day to earn it.
              </p>
            </div>

          </div>

          {/* Right Column: Contact / Scenario Submission Form */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ position: 'sticky', top: '100px', backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>Submit a complex scenario for review</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                Have a client with a tricky income situation or unique property? Send us the details and we'll tell you how we can get it funded.
              </p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Your Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '1rem' }}
                    placeholder="Jane Doe"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Your Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '1rem', backgroundColor: 'white' }}
                  >
                    <option value="">Select your profession...</option>
                    <option value="Realtor">Real Estate Agent / Broker</option>
                    <option value="CPA">CPA / Tax Professional</option>
                    <option value="FinancialAdvisor">Financial Advisor</option>
                    <option value="Attorney">Attorney</option>
                    <option value="PastClient">Past Client</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '1rem' }}
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Scenario Details</label>
                  <textarea 
                    required 
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                    placeholder="Briefly describe the client's situation, income type, or property challenges..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
                >
                  Submit Scenario
                </button>

                {status && (
                  <div style={{ padding: '1rem', backgroundColor: status.includes('successfully') ? '#DEF7EC' : '#F3F4F6', color: status.includes('successfully') ? '#03543F' : '#374151', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 'bold' }}>
                    {status}
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
