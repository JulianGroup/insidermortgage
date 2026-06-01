import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="about">
      <div className="container hero-container animate-fade-in">
        <div className="hero-content">
          <h1 className="hero-title">Elevate Your Home Financing Experience</h1>
          <p className="hero-subtitle">
            Expert guidance tailored to your unique financial situation. 
            Whether you are self-employed, retiring, investing, or buying your first home, 
            our tailored strategies ensure you secure the best terms available.
          </p>
          <div className="hero-cta-group">
            <a href="#contact" className="btn btn-primary">Get Pre-Approved Today</a>
            <a href="#solutions" className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
              Explore Solutions
            </a>
          </div>
        </div>

        <div className="partners-section">
          <div className="partner-card">
            <div className="partner-headshot">
              [Rakesh Jain Headshot]
            </div>
            <div className="partner-info">
              <h3>Rakesh Jain</h3>
              <p>Managing Partner / Broker</p>
            </div>
          </div>

          <div className="partner-card">
            <div className="partner-headshot">
              [David Sider Headshot]
            </div>
            <div className="partner-info">
              <h3>David Sider</h3>
              <p>Managing Partner / Broker</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
