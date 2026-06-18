"use client";
import React, { useState } from 'react';

export default function PreApproval() {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    firstTimeBuyer: '',
    vaEligible: '',
    movingHomes: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData({ 
        name: '', email: '', phone: '',
        firstTimeBuyer: '', vaEligible: '', movingHomes: ''
      });
    }, 1000);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'white', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <section style={{ padding: '6rem 1rem 3rem', backgroundColor: 'var(--primary)', textAlign: 'center' }}>
        <div className="container animate-fade-in">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Purchase Pre-Approval</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
            Strengthen your offer and understand your buying power. Walk through our educational guide and request a custom pre-approval consultation.
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {[
            { id: 1, label: '1. Budgeting' },
            { id: 2, label: '2. Process' },
            { id: 3, label: '3. Strategies' },
            { id: 4, label: '4. Consultation' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                flex: '1 1 200px', 
                padding: '1rem', 
                border: 'none', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '1.1rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        
        {/* Tab 1: Budgeting */}
        {activeTab === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Budgeting for Your Home</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Income & Debt-to-Income (DTI)</h3>
                <p style={{ marginBottom: '1rem' }}>Your buying power largely depends on your verifiable income relative to your monthly debt obligations.</p>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li><strong>Gross Income:</strong> Lenders use your gross (pre-tax) income to calculate affordability.</li>
                  <li><strong>DTI Ratio:</strong> Your total monthly debt payments (including the new mortgage) shouldn't typically exceed 43-50% of your gross monthly income.</li>
                  <li><strong>Variable Income:</strong> Bonuses, commissions, and self-employment income usually require a two-year history to be fully counted.</li>
                </ul>
              </div>

              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Down Payment & Closing Costs</h3>
                <p style={{ marginBottom: '1rem' }}>You need cash to close, which is broken down into two main buckets:</p>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li><strong>Down Payment:</strong> Minimums range from 0% (VA/USDA) to 3% or 3.5% (FHA/Conventional). 20% eliminates Mortgage Insurance (MI).</li>
                  <li><strong>Closing Costs:</strong> These are fees paid to third parties (escrow, title, appraisal, taxes). They typically range from 1% to 3% of the purchase price.</li>
                  <li><strong>Reserves:</strong> Lenders may require you to have extra cash left over after closing, usually equivalent to a few months of mortgage payments.</li>
                </ul>
              </div>

            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => setActiveTab(2)} className="btn btn-primary btn-lg">Continue to Process →</button>
            </div>
          </div>
        )}

        {/* Tab 2: Process */}
        {activeTab === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>The Purchase Process</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Documents to Collect</h3>
                <p style={{ marginBottom: '1rem' }}>Being prepared helps expedite the pre-approval process. Have these ready:</p>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li>Most recent 30 days of pay stubs</li>
                  <li>Last 2 years of W-2s and tax returns</li>
                  <li>Most recent 2 months of bank statements (all pages)</li>
                  <li>Clear copy of your driver's license</li>
                  <li>If self-employed: Business tax returns & K-1s</li>
                </ul>
              </div>

              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Timeline of Events</h3>
                <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li><strong>Pre-Approval:</strong> 24-48 hours after submitting documents.</li>
                  <li><strong>House Hunting:</strong> Weeks or months, depending on the market.</li>
                  <li><strong>Offer Accepted:</strong> You go into escrow!</li>
                  <li><strong>Appraisal & Underwriting:</strong> 14-21 days of processing.</li>
                  <li><strong>Clear to Close:</strong> Sign final loan documents and get the keys!</li>
                </ol>
              </div>

              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Why Get Pre-Approved?</h3>
                <p style={{ marginBottom: '1rem' }}>A pre-approval is much stronger than a pre-qualification. It means an underwriter has actually reviewed your financials.</p>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li><strong>Strengthens Your Offer:</strong> Sellers prioritize buyers whose financing is already verified.</li>
                  <li><strong>Defines Your Budget:</strong> You won't waste time looking at homes outside your price range.</li>
                  <li><strong>Faster Closing:</strong> Since the upfront work is done, you can close faster than competing buyers.</li>
                </ul>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => setActiveTab(3)} className="btn btn-primary btn-lg">Continue to Strategies →</button>
            </div>
          </div>
        )}

        {/* Tab 3: Strategies */}
        {activeTab === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--primary)' }}>Purchase Strategies</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>Different loan programs offer different strategic advantages depending on your specific situation.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📈</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>Fixed vs. Adjustable Rates (ARMs)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>If you plan to move or refinance within 5-7 years, an ARM might offer a significantly lower introductory rate than a 30-year fixed loan.</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>💵</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>Permanent Rate Buy-Downs</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Paying "points" upfront can lower your interest rate for the life of the loan. We'll help you calculate the break-even point to see if it's worth it.</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>⏱️</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>Temporary Buy-Downs (2-1 Buy-Down)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Sellers can concede funds to temporarily lower your rate by 2% the first year and 1% the second year, easing you into the full payment.</p>
                </div>
              </div>

            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => setActiveTab(4)} className="btn btn-primary btn-lg">Continue to Consultation →</button>
            </div>
          </div>
        )}

        {/* Tab 4: Consultation */}
        {activeTab === 4 && (
          <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--primary)' }}>Schedule a Pre-Approval Consultation</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>We'll review your specific scenario and issue a strong pre-approval letter so you can start shopping with confidence.</p>
            
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}>
              <form onSubmit={handleSubmit}>
                
                {/* Part 1: Contact Info */}
                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>Contact Information</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Full Name</label>
                    <input type="text" name="name" required value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }} placeholder="John Doe" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Email Address</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }} placeholder="john@example.com" />
                  </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }} placeholder="(555) 123-4567" />
                </div>

                {/* Part 2: Questions */}
                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>Tell us about your plans</h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Are you a First Time Home Buyer?</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}>
                      <input type="radio" name="firstTimeBuyer" value="Yes" checked={formData.firstTimeBuyer === 'Yes'} onChange={handleInputChange} required /> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}>
                      <input type="radio" name="firstTimeBuyer" value="No" checked={formData.firstTimeBuyer === 'No'} onChange={handleInputChange} /> No
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Are you VA Eligible?</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}>
                      <input type="radio" name="vaEligible" value="Yes" checked={formData.vaEligible === 'Yes'} onChange={handleInputChange} required /> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}>
                      <input type="radio" name="vaEligible" value="No" checked={formData.vaEligible === 'No'} onChange={handleInputChange} /> No
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Are you moving from one home to a new home?</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}>
                      <input type="radio" name="movingHomes" value="Yes" checked={formData.movingHomes === 'Yes'} onChange={handleInputChange} required /> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', cursor: 'pointer' }}>
                      <input type="radio" name="movingHomes" value="No" checked={formData.movingHomes === 'No'} onChange={handleInputChange} /> No
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={submitStatus === 'submitting'} style={{ width: '100%', padding: '1.2rem', backgroundColor: 'var(--accent)', color: 'var(--primary)', border: 'none', borderRadius: '4px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                  {submitStatus === 'submitting' ? 'Sending...' : 'Request Pre-Approval'}
                </button>
                
                {submitStatus === 'success' && (
                  <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                    Request received! We'll be in touch shortly.
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
