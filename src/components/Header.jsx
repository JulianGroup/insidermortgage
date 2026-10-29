"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import './Header.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu automatically when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleScroll = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetEl = document.getElementById(id);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${id}`);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        
        {/* Logo & DBA */}
        <Link
          href="/"
          className="logo-section"
          style={{ textDecoration: 'none' }}
          onClick={() => {
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img src="/C2-IMCv2.jpg?v=2" alt="Insider Mortgage Logo" style={{ height: '40px' }} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <a href="#solutions" onClick={(e) => handleScroll(e, 'solutions')} className="nav-link">Specialty Loans</a>
          <a href="#reviews" onClick={(e) => handleScroll(e, 'reviews')} className="nav-link">Reviews</a>
          <Link href="/geek-out" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Geeky Calculators</Link>
          <Link href="/resource-library" className="nav-link">Resource Library</Link>
          <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className="btn btn-primary">
            Schedule Call
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={`mobile-menu-btn ${mobileMenuOpen ? 'mobile-menu-btn-open' : ''}`}
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="mobile-nav-drawer"
            aria-label="Mobile Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href="#solutions"
              onClick={(e) => handleScroll(e, 'solutions')}
              className="mobile-nav-link"
            >
              Specialty Loans
            </a>

            <a
              href="#reviews"
              onClick={(e) => handleScroll(e, 'reviews')}
              className="mobile-nav-link"
            >
              Reviews
            </a>

            <Link
              href="/geek-out"
              className="mobile-nav-link mobile-nav-highlight"
              onClick={() => setMobileMenuOpen(false)}
            >
              Geeky Calculators
            </Link>

            <div className="mobile-sublinks">
              <Link
                href="/geek-out/mbs-rate-watch"
                className="mobile-sublink"
                onClick={() => setMobileMenuOpen(false)}
              >
                • MBS &amp; Treasury Rate Watch
              </Link>
              <Link
                href="/geek-out/weighted-average"
                className="mobile-sublink"
                onClick={() => setMobileMenuOpen(false)}
              >
                • Weighted Average Calculator
              </Link>
              <Link
                href="/geek-out/yield-curve"
                className="mobile-sublink"
                onClick={() => setMobileMenuOpen(false)}
              >
                • Yield Curve Tracker
              </Link>
              <Link
                href="/big-picture"
                className="mobile-sublink"
                onClick={() => setMobileMenuOpen(false)}
              >
                • Big Picture Economic Dashboard
              </Link>
            </div>

            <Link
              href="/resource-library"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resource Library
            </Link>

            <div className="mobile-nav-cta">
              <a
                href="#contact"
                onClick={(e) => handleScroll(e, 'contact')}
                className="btn btn-primary mobile-apply-btn"
              >
                Schedule Call
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
