"use client";
import React, { useEffect } from 'react';
import './Testimonials.css';

const Testimonials = () => {
  useEffect(() => {
    const existingScript = document.querySelector('script[data-igr-script]');
    const initWidget = () => {
      if (typeof window !== 'undefined' && window.InsiderGoogleReviews) {
        window.InsiderGoogleReviews.init();
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = '/google-reviews/google-reviews-widget.js';
      script.async = true;
      script.setAttribute('data-igr-script', 'true');
      script.onload = initWidget;
      document.body.appendChild(script);
    } else {
      initWidget();
    }
  }, []);

  return (
    <section className="testimonials-section" id="reviews">
      <div className="container">
        <div
          id="insider-google-reviews"
          data-reviews-url="/google-reviews/data/reviews.json"
          data-heading="The Word on the Street"
          data-show-heading="true"
          data-expand-mode="inline"
          style={{ width: '100%', '--igr-bg': 'transparent', '--igr-padding': '0' }}
        />
      </div>
    </section>
  );
};

export default Testimonials;
