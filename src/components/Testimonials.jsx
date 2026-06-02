"use client";
import React, { useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  useEffect(() => {
    if (!document.getElementById('jotform-widget-script')) {
      const script = document.createElement('script');
      script.id = 'jotform-widget-script';
      script.src = 'https://www.jotform.com/website-widgets/embed/019e8576208670b48ce5b752598ff8e0e156';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section className="testimonials-section" id="reviews">
      <div className="container">
        <div className="testimonials-header">
          <h2>Client Success Stories</h2>
          <p>Don't just take our word for it. Here is what our clients have to say about working with Insider Mortgage.</p>
        </div>

        {/* Jotform Custom Widget */}
        <div id="JFWebsiteWidget-019e8576208670b48ce5b752598ff8e0e156" style={{ width: '100%', margin: 'var(--space-8) 0' }}></div>
      </div>
    </section>
  );
};

export default Testimonials;

