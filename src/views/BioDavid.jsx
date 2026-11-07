"use client";
import React from 'react';
import Link from 'next/link';
import RelatedInsights from '../components/blog/RelatedInsights';

const BioDavid = () => {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'white', padding: '6rem 1rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontWeight: 'bold' }}>
          &larr; Back to Home
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'start' }}>
          
          <div style={{ position: 'sticky', top: '2rem' }}>
            <img 
              src="/david-sider.jpg" 
              alt="David Sider" 
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', display: 'block' }} 
            />
          </div>

          <div>
            <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>Meet David Sider</h1>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '2rem', fontWeight: '400' }}>The Original Insider | Managing Partner &amp; Broker, NMLS #254108</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>
                Welcome to the world of Insider Mortgage!
              </p>
              <p>
                I&apos;m David Sider, founder of Insider Mortgage. I&apos;ve spent over 30 years helping people make smarter mortgage and real estate decisions. My philosophy is simple: a mortgage is more than a loan. It&apos;s a financial tool, and understanding how to use it can make a tremendous difference in your financial future.
              </p>
              <p>
                I founded Insider Mortgage in San Diego in 1999 and grew it into a boutique brokerage of 26 people. In 2019, we joined forces with C2 Financial, one of the nation&apos;s largest mortgage brokerages. Today, we offer the lending resources of a major company with the independent thinking and personal attention of a boutique firm.
              </p>
              <p>
                My longtime partner, Rakesh Jain, and I have worked together for decades. Between us, we&apos;ve been involved in more than 5,000 mortgage transactions. We&apos;ve navigated just about every kind of real estate market imaginable—booms, busts, skyrocketing interest rates, historically low rates, and everything in between. That experience has taught us a lot, and we believe our clients should benefit from every bit of it.
              </p>
              <p>
                That&apos;s really the philosophy behind Insider Mortgage. <strong style={{ color: 'var(--primary)' }}>We share the Insider Info.</strong>
              </p>
              <p>
                We believe clients deserve to understand how mortgage financing actually works—how interest rates are determined, where costs come from, what lenders look for, and how to use that knowledge to their advantage. No smoke and mirrors, no confusing industry jargon, and certainly no mysterious veil hiding how the lending world operates.
              </p>
              <p>
                But getting a mortgage is about much more than qualifying for a loan or finding the lowest interest rate.
              </p>
              <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', borderLeft: '4px solid var(--accent)', paddingLeft: '1rem', margin: '0.5rem 0' }}>
                A mortgage is a financial tool, and the right strategy can have a profound impact on your financial future.
              </p>
              <p>
                We look at the big picture. In fact, we coined a term for it: <strong style={{ color: 'var(--primary)' }}>Financial Whealth</strong>—combining financial <em>wealth</em> and financial <em>health</em>. It&apos;s our philosophy of looking beyond the mortgage itself to understand how debt management, real estate investing, taxes, asset protection, estate planning, and retirement goals all fit together.
              </p>
              <p>
                I&apos;m continually surprised by how often people take out substantial loans without ever discussing a financial strategy. A great rate is nice, but it doesn't necessarily mean you&apos;ve made the best financial decision.
              </p>
              <p>
                Our job is to help you understand your options, see the trade-offs, and make informed decisions that work for you today and well into the future. We do the analysis, explain the possibilities, and give you the knowledge to decide with confidence.
              </p>
              <p>
                And here&apos;s something you might not expect: <strong style={{ color: 'var(--primary)' }}>we actually make the mortgage process enjoyable.</strong> We take the work seriously, but we don&apos;t believe it has to be intimidating or boring. Our clients become part of the Insider Family, and many have stayed with us for years, even decades.
              </p>

              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.25rem', fontWeight: 700 }}>
                A Little About Me Outside the Mortgage World
              </h3>
              <p>
                I grew up in Encino, California, and moved to San Diego for college, where I played varsity tennis at UCSD and San Diego State, eventually earning All-American honors.
              </p>
              <p>
                When it became clear that professional tennis wasn&apos;t going to be my ticket to fame and fortune, I took a slightly different path—computer consulting, database management, and designing software for government agencies. Not quite as glamorous as saying I was a professional tennis player, but it turned into a fascinating 10-year career.
              </p>
              <p>
                In 1995, two important things happened: I got married, and I entered the mortgage and real estate business. My wife and I raised two boys, and somewhere along the way, I discovered I&apos;d found my professional niche.
              </p>
              <p>
                Almost everyone has a story, a question, or an opinion about real estate and mortgages. I love talking about it, finding solutions, and helping people make smarter decisions.
              </p>
              <p>
                Nearly everything in my career has changed since 1995—interest rates, technology, lending regulations, real estate markets—but one thing hasn&apos;t:
              </p>
              <p style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--primary)' }}>
                I&apos;m still passionate about helping people understand how money, mortgages, and real estate can work together to improve their lives.
              </p>
              <div>
                <strong style={{ color: 'var(--primary)' }}>Licensed to Serve You In:</strong>
                <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: '0.5rem' }}>
                  <li>California: DRE #01193796 | NMLS #254108</li>
                </ul>
              </div>
            </div>
            
            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/pre-approval" className="btn btn-primary" style={{ display: 'inline-block', padding: '1rem 2rem' }}>
                Purchase Pre-Approval
              </Link>
              <a
                href="https://www.linkedin.com/in/david-sider-010701b/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.9rem 1.4rem',
                  backgroundColor: '#0A66C2',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md, 8px)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(10,102,194,0.3)',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Connect on LinkedIn ↗
              </a>
            </div>
          </div>
          
        </div>
      </div>

      <div style={{ marginTop: '4rem' }}>
        <RelatedInsights
          bioTagId="bio-david"
          title="Personal Perspectives from David"
          subtitle="Stories, milestones, and behind-the-scenes updates explicitly shared on David's bio."
          background="#FFFFFF"
        />
      </div>
    </main>
  );
};

export default BioDavid;
