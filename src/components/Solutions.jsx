"use client";
import React from 'react';
import Link from 'next/link';
import './Solutions.css';

const categories = [
  {
    id: 'self-employed',
    title: 'Self-Employed Borrowers',
    description: 'We understand that your tax returns don\'t always tell the whole story. Leverage our alternative documentation programs designed for entrepreneurs.',
    icon: '💼',
    highlights: ['Bank Statement Loans', 'P&L Only Programs', '1099 Expense Ratio Loans'],
    route: '/self-employed'
  },
  {
    id: 'retiree',
    title: 'Retirees',
    description: 'Unlock the equity in your home or qualify for a new purchase using your hard-earned retirement assets, even without traditional employment income.',
    icon: '🌅',
    highlights: ['Asset Depletion Programs', 'Reverse Mortgages', 'Retirement Account Qualifying'],
    route: '/retirees'
  },
  {
    id: 'investor',
    title: 'Rental Property Financing',
    description: 'Expand your real estate portfolio without the red tape. Qualify strictly based on the cash flow of the property, not your personal income.',
    icon: '🏢',
    highlights: ['DSCR Loans', 'No Personal Income Limits', 'Portfolio Expansion'],
    route: '/dscr-loans'
  },
  {
    id: 'first-time',
    title: 'First-Time Home Buyers',
    description: 'Navigate the home buying process with confidence. We provide a step-by-step roadmap and low-down-payment options to get you into your first home.',
    icon: '🔑',
    highlights: ['Low Down Payment', 'Down Payment Assistance', 'Educational Roadmap'],
    route: '/first-time'
  }
];

const Solutions = () => {
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
              <h3>{cat.title}</h3>
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

