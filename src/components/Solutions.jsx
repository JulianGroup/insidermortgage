"use client";
import React from 'react';
import Link from 'next/link';
import { WHO_WE_SERVE_CATEGORIES } from '../data/taxonomy';
import './Solutions.css';

const Solutions = () => {
  const categories = WHO_WE_SERVE_CATEGORIES.filter(
    (cat) => cat.status === 'active' && cat.showOnHomepageWhoWeServe
  );

  return (
    <section className="section solutions-section" id="solutions">
      <div className="container">
        <div className="solutions-header">
          <h2>Who We Serve</h2>
          <p>We believe mortgage solutions shouldn't be one-size-fits-all. We specialize in tailoring programs to fit your unique financial picture.</p>
        </div>
        
        <div className="solutions-grid">
          {categories.map((cat) => (
            <div className="solution-card" key={cat.id}>
              <div className="solution-icon">{cat.icon}</div>
              <h3>{cat.label}</h3>
              <p>{cat.description}</p>
              
              <ul className="solution-features">
                {cat.highlights.map((highlight, idx) => (
                  <li key={idx}>
                    {highlight}
                  </li>
                ))}
              </ul>
              
              <Link href={cat.route} className="btn btn-outline" style={{ width: '100%', textAlign: 'center', display: 'inline-block' }}>
                Learn More
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;

