import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SelfEmployed from './pages/SelfEmployed';
import Retirees from './pages/Retirees';
import ComingSoon from './pages/ComingSoon';
import SpecialtyPage from './pages/SpecialtyPage';
import BankStatementLoans from './pages/BankStatementLoans';
import Loans1099 from './pages/Loans1099';
import ContractorLoans from './pages/ContractorLoans';
import YieldCurve from './pages/YieldCurve';
import { seoPages } from './data/seoPages';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/retirees" element={<Retirees />} />
          <Route path="/dscr-loans" element={<SpecialtyPage data={seoPages.find(p => p.slug === 'dscr-loans')} />} />
          <Route path="/first-time" element={<ComingSoon title="First-Time Home Buyers" />} />
          <Route path="/bank-statement-loans" element={<BankStatementLoans />} />
          <Route path="/1099-loans" element={<Loans1099 />} />
          <Route path="/mortgage-for-contractors" element={<ContractorLoans />} />
          <Route path="/economic-insights" element={<YieldCurve />} />
          
          {/* Dynamic SEO Routes */}
          {seoPages.map((pageData) => (
            <Route 
              key={pageData.slug} 
              path={`/${pageData.slug}`} 
              element={<SpecialtyPage data={pageData} />} 
            />
          ))}
          
          {/* Fallback for the old /self-employed route */}
          <Route path="/self-employed" element={<SpecialtyPage data={seoPages[0]} />} />
        </Routes>
        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
