"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function PreApproval() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    goal: '',
    timeline: '',
    priceRange: '',
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectGoal = (goal) => {
    setFormData({ ...formData, goal });
    setStep(2);
  };

  const handleSelectTimeline = (timeline) => {
    setFormData({ ...formData, timeline });
    setStep(3);
  };

  const handleSelectPrice = (priceRange) => {
    setFormData({ ...formData, priceRange });
    setStep(4);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we would normally send to a backend/CRM
    setIsSubmitted(true);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ padding: '1.5rem', backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Insider Mortgage
        </Link>
      </header>

      {/* Main Funnel Area */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', width: '100%', backgroundColor: 'white', padding: '3rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
          
          {isSubmitted ? (
            <div className="animate-fade-in">
              <div style={{ color: '#10B981', fontSize: '4rem', marginBottom: '1rem' }}>✓</div>
              <h1 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '2rem' }}>You're all set!</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                We've received your pre-approval request. <strong>Rakesh or David</strong> will be calling you shortly to discuss your custom {formData.goal} strategy.
              </p>
              <Link href="/" style={{ display: 'inline-block', marginTop: '2rem', color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>
                ← Return to Home
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in" key={step}>
              
              {step === 1 && (
                <>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>STEP 1 OF 4</div>
                  <h1 style={{ color: 'var(--primary)', marginBottom: '2rem', fontSize: '2rem' }}>What is your goal today?</h1>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {['Buying a home', 'Cash Out', 'Refinancing'].map((goal) => (
                      <button 
                        key={goal}
                        onClick={() => handleSelectGoal(goal)}
                        style={{
                          padding: '1.5rem',
                          backgroundColor: 'var(--bg-color)',
                          border: '2px solid rgba(0,0,0,0.05)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {goal}
                        <span style={{ color: 'var(--accent)' }}>→</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>STEP 2 OF 4</div>
                  <h1 style={{ color: 'var(--primary)', marginBottom: '2rem', fontSize: '2rem' }}>What is your timeline?</h1>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {['ASAP', '1 to 3 months', '3 to 6 months', 'Just exploring options'].map((time) => (
                      <button 
                        key={time}
                        onClick={() => handleSelectTimeline(time)}
                        style={{
                          padding: '1.5rem',
                          backgroundColor: 'var(--bg-color)',
                          border: '2px solid rgba(0,0,0,0.05)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; }}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} style={{ marginTop: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>← Back</button>
                </>
              )}

              {step === 3 && (
                <>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>STEP 3 OF 4</div>
                  <h1 style={{ color: 'var(--primary)', marginBottom: '2rem', fontSize: '2rem' }}>
                    {formData.goal === 'Buying a home' ? 'Estimated Purchase Price?' : 'Estimated Home Value?'}
                  </h1>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {['Under $300k', '$300k - $600k', '$600k - $900k', '$900k - $1.5M', '$1.5M - $2.5M', 'Over $2.5M'].map((price) => (
                      <button 
                        key={price}
                        onClick={() => handleSelectPrice(price)}
                        style={{
                          padding: '1.5rem 1rem',
                          backgroundColor: 'var(--bg-color)',
                          border: '2px solid rgba(0,0,0,0.05)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; }}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} style={{ marginTop: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>← Back</button>
                </>
              )}

              {step === 4 && (
                <>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 'bold', letterSpacing: '1px' }}>FINAL STEP</div>
                  <h1 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '2rem' }}>Let's review your options.</h1>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Enter your details below and an expert will call you shortly to discuss your custom {formData.goal} strategy.</p>
                  
                  <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Full Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }} 
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        required 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }} 
                        placeholder="(555) 000-0000"
                      />
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        required 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '1rem' }} 
                        placeholder="john@example.com"
                      />
                    </div>

                    <button type="submit" style={{ width: '100%', padding: '1.2rem', backgroundColor: 'var(--accent)', color: 'var(--primary)', border: 'none', borderRadius: '4px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                      Get My Pre-Approval Options
                    </button>
                  </form>
                  <button onClick={() => setStep(3)} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>← Back</button>
                </>
              )}

            </div>
          )}

        </div>
      </section>
    </main>
  );
}
