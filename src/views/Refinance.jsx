"use client";
import React, { useState } from 'react';
import TestimonialBox from '../components/TestimonialBox';
import ScheduleCallForm from '../components/ScheduleCallForm';

export default function Refinance() {
  const [activeTab, setActiveTab] = useState(1);
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'white', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <section style={{ padding: '6rem 1rem 3rem', backgroundColor: 'var(--primary)', textAlign: 'center' }}>
        <div className="container animate-fade-in">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>Refinance Your Mortgage</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
            Lower your rate, tap into your home's equity, or change your loan term. Explore our resources to make the smartest move.
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', padding: '0.5rem', gap: '0.5rem' }}>
          
          <button 
            onClick={() => setActiveTab(1)}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: activeTab === 1 ? 'var(--primary)' : 'transparent',
              color: activeTab === 1 ? 'white' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '1.1rem'
            }}
          >
            1. Process
          </button>

          <button 
            onClick={() => setActiveTab(2)}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: activeTab === 2 ? 'var(--primary)' : 'transparent',
              color: activeTab === 2 ? 'white' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '1.1rem'
            }}
          >
            2. Strategies
          </button>

          <button 
            onClick={() => setActiveTab(3)}
            style={{ 
              flex: 1, 
              padding: '1rem', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: activeTab === 3 ? 'var(--primary)' : 'transparent',
              color: activeTab === 3 ? 'white' : 'var(--text-secondary)',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '1.1rem'
            }}
          >
            3. Consultation
          </button>

        </div>
      </div>

      <div className="container" style={{ marginTop: '3rem' }}>
        {/* Stage 1: Understanding the Process */}
        {activeTab === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Understanding the Process</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>What is a Refinance?</h3>
                <p>Refinancing replaces your current mortgage with a new one. It pays off your existing debt and creates a new loan with new terms, potentially saving you thousands in interest or providing cash for large expenses.</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', color: 'var(--primary)' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>The Step-by-Step Guide</h3>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                  <li>Determine your financial goal (lower payment, cash-out, term change).</li>
                  <li>Check your home equity and credit score.</li>
                  <li>Gather income and asset documentation.</li>
                  <li>Lock your new interest rate and close!</li>
                </ul>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => setActiveTab(2)} className="btn btn-primary btn-lg">Continue to Strategies →</button>
            </div>
          </div>
        )}

        {/* Stage 2: Strategy Articles and Videos */}
        {activeTab === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--primary)' }}>Refinance Strategies</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>Expert articles and videos designed to help you maximize the return on your investment.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🌊</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>How do I ride the interest rate wave?</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Learn the optimal timing to refinance when market rates are fluctuating rapidly.</p>
                  <a href="#" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>Read Article →</a>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📉</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>Are paying points a good investment?</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Understand the break-even math behind buying down your interest rate.</p>
                  <a href="#" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>Watch Video 📺</a>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>⏳</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>How to avoid amortization extension</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Why refinancing into a new 30-year term might cost you more in the long run.</p>
                  <a href="#" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>Read Article →</a>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ height: '180px', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>💰</div>
                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1rem' }}>The benefits of cash-out</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Leverage your home equity for renovations, debt consolidation, or investments.</p>
                  <a href="#" style={{ color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none' }}>Watch Video 📺</a>
                </div>
              </div>

            </div>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={() => setActiveTab(3)} className="btn btn-primary btn-lg">Continue to Consultation →</button>
            </div>
          </div>
        )}

        {/* Stage 3: Schedule a Consultation */}
        {activeTab === 3 && (
          <div className="animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center', color: 'var(--primary)' }}>Schedule a Consultation</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>Ready to run the numbers? Request a consultation and we'll help you build a personalized refinance strategy.</p>
            
            <ScheduleCallForm source="Refinance Page" />
          </div>
        )}

      </div>

      {/* Testimonial Section */}
      <div className="container" style={{ marginTop: '4rem' }}>
        <TestimonialBox 
          title="What Our Clients Say"
          quote="This was our second time working with David and Rakesh at Insider Mortgage, and we came back because the first experience was so great. When we decided to refinance our home, we reached out again, and they handled everything with ease. I've worked with other mortgage brokers before, but David and Rakesh just get us. They understand our goals, know our background, and always find a way to make things happen.

Our jumbo refinance process was straightforward from start to finish. They told us exactly what was needed, kept us informed, and even suggested waiting until interest rates dropped a bit before locking things in. Their communication and response time were incredibly fast, and they went above and beyond by giving helpful advice about the timing of other financial plans like solar installation. It felt personal, they genuinely cared about our long-term financial picture, not just closing a loan. We’ll definitely be calling Insider Mortgage again and recommending David and Rakesh to anyone looking to refinance or purchase a home in San Diego County."
          author="Michelle Thompson"
        />
      </div>
    </main>
  );
}
