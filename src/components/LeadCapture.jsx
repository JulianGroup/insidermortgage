import React, { useState } from 'react';
import './LeadCapture.css';

const LeadCapture = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: ''
  });
  
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    // Replace this URL with your actual Google Apps Script Web App URL once deployed
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_YOUR_SCRIPT_ID/exec';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Scripts without complex CORS setup
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // no-cors mode won't return a readable response body, 
      // so we assume success if the fetch promise resolves.
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', category: '' });
    } catch (error) {
      console.error('Submission Error:', error);
      setStatus('error');
    }
  };

  return (
    <section className="lead-capture-section" id="contact">
      <div className="container lead-capture-container">
        
        <div className="lead-content">
          <h2>Ready to Take the Next Step?</h2>
          <p>
            Whether you're just starting to explore your options or you're ready to get pre-approved, 
            our team is here to provide expert guidance tailored to your scenario.
          </p>
          <div className="trust-badges">
            <span className="trust-badge">🔒 Secure Data</span>
            <span className="trust-badge">⚡ Fast Pre-Approvals</span>
            <span className="trust-badge">🤝 Expert Guidance</span>
          </div>
        </div>

        <div className="card lead-form-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Request a Consultation</h3>
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="name"
                className="form-input" 
                required 
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                name="email"
                className="form-input" 
                required 
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                className="form-input" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">I am best described as a...</label>
              <select 
                name="category"
                className="form-select" 
                required
                value={formData.category}
                onChange={handleChange}
              >
                <option value="" disabled>Select a profile...</option>
                <option value="Self-Employed">Self-Employed Borrower</option>
                <option value="Retiree">Retiree</option>
                <option value="Real Estate Investor">Real Estate Investor (Rental Property)</option>
                <option value="First-Time Home Buyer">First-Time Home Buyer</option>
                <option value="Other">Other / Standard Refinance</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary submit-btn"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending...' : 'Get Started'}
            </button>

            {status === 'success' && (
              <div className="form-status status-success">
                Thank you! Your information has been received. We will be in touch shortly.
              </div>
            )}
            {status === 'error' && (
              <div className="form-status status-error">
                There was an error sending your request. Please try again later.
              </div>
            )}

          </form>
        </div>

      </div>
    </section>
  );
};

export default LeadCapture;
