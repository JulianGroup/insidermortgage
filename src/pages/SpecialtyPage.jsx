import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { seoPages } from '../data/seoPages';
import './SelfEmployed.css'; // Reusing the identical layout styling

const SpecialtyPage = ({ data }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: data.leadCategory
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
      setFormData({ name: '', email: '', phone: '', category: data.leadCategory });
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet>
        <title>{data.seoTitle}</title>
        <meta name="description" content={data.seoDescription} />
      </Helmet>
      
      <main>
        <section className="se-hero animate-fade-in">
          <div className="container">
            <h1>{data.title}</h1>
            <p>{data.heroSubtitle}</p>
          </div>
        </section>

        <section className="section" style={{ paddingBottom: '2rem', paddingTop: 'var(--space-12)' }}>
          <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{data.introHeader}</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-6)', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
              {data.introText}
            </p>
          </div>
        </section>

        <section className="section bg-color">
          <div className="container">
            <div className="programs-grid">
              {data.gridCards.map((card, idx) => (
                <div className="program-card" key={idx}>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              ))}
            </div>

            {data.extraSection && (
              <div style={{ marginTop: '4rem', padding: '3rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>{data.extraSection.title}</h2>
                {data.extraSection.paragraphs.map((p, i) => (
                  <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem', lineHeight: 1.6 }}>{p}</p>
                ))}
                
                {data.extraSection.listItems && (
                  <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    {data.extraSection.listItems.map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {data.extraSection.closingParagraph && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>{data.extraSection.closingParagraph}</p>
                )}
              </div>
            )}

            {data.calloutBox && (
              <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: 'rgba(239, 181, 30, 0.1)', borderLeft: '4px solid var(--accent)', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {data.calloutBox.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
                  {data.calloutBox.text}
                </p>
              </div>
            )}

            {data.reviews && data.reviews.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Success Stories</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  {data.reviews.map((review, idx) => (
                    <div key={idx} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', borderTop: '4px solid var(--secondary)' }}>
                      <div style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.2rem' }}>★★★★★</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '1.5rem' }}>"{review.text}"</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>{review.initials}</div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{review.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{review.source}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Explore Other Specialty Programs</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                {seoPages.filter(p => p.slug !== data.slug).map(page => (
                  <Link key={page.slug} to={`/${page.slug}`} style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(30,58,138,0.05)', borderRadius: '999px', color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="se-contact-section">
          <div className="container" style={{ maxWidth: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2>Speak with a Specialist</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {data.formSubtitle}
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
    </>
  );
};

export default SpecialtyPage;
