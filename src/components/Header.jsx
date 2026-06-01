import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        
        {/* Logo & DBA */}
        <a href="/" className="logo-section" style={{ textDecoration: 'none' }}>
          <img src="/logo.svg" alt="C2 Financial Logo" style={{ height: '40px' }} />
          <div className="dba-name" style={{ marginLeft: '12px' }}>Insider Mortgage</div>
        </a>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <a href="/#solutions" className="nav-link">Loan Programs</a>
          <a href="/#calculator" className="nav-link">Calculator</a>
          <a href="/#reviews" className="nav-link">Reviews</a>
          <a href="/economic-insights" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Yield Curve</a>
          <a href="/#contact" className="btn btn-primary">Get Started</a>
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" aria-label="Open Menu">
          ☰
        </button>
      </div>
    </header>
  );
};

export default Header;
