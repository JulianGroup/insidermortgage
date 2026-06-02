"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import './Header.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleScroll = (e, id) => {
    e.preventDefault();
    if (pathname !== '/') {
      router.push('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        
        {/* Logo & DBA */}
        <Link href="/" className="logo-section" style={{ textDecoration: 'none' }} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <img src="logo.svg" alt="C2 Financial Logo" style={{ height: '40px' }} />
          <div className="dba-name" style={{ marginLeft: '12px' }}>Insider Mortgage</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links">
          <a href="#solutions" onClick={(e) => handleScroll(e, 'solutions')} className="nav-link">Loan Programs</a>
          <a href="#calculator" onClick={(e) => handleScroll(e, 'calculator')} className="nav-link">Calculator</a>
          <a href="#reviews" onClick={(e) => handleScroll(e, 'reviews')} className="nav-link">Reviews</a>
          <Link href="/economic-insights" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Yield Curve</Link>
          <a href="#contact" onClick={(e) => handleScroll(e, 'contact')} className="btn btn-primary">Get Started</a>
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

