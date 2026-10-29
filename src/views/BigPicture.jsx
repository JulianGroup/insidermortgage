import React from 'react';
import Head from 'next/head';

const BigPicture = () => {
  return (
    <main style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '4rem 1rem' }}>
      <Head>
        <title>Big Picture | Insider Mortgage</title>
      </Head>

      <div className="container" style={{ maxWidth: '900px', backgroundColor: 'white', padding: '3rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        
        <h1 style={{ color: 'var(--primary)', textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem', lineHeight: '1.2' }}>
          Mortgage Strategy Within the Context of the Entire Balance Sheet
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <img 
            src="/big-picture.jpg" 
            alt="IMC's Big Picture - Financial Whealth" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #ddd' }} 
          />
        </div>

        <div style={{ fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-color)' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            For affluent households, financing decisions should not be made in isolation.
          </p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            A mortgage can influence liquidity, investment strategy, tax planning, retirement income, estate objectives, and long-term wealth preservation. Yet these decisions are often evaluated separately from the broader financial plan.
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            We collaborate with Wealth Managers, Tax Professionals, and Estate Planning Attorneys to help clients evaluate mortgage and financing strategies within the context of their entire balance sheet.
          </p>
          
          <p style={{ marginBottom: '1.5rem' }}>
            Rather than focusing solely on interest rates, we help assess how financing decisions may impact:
          </p>

          <ul style={{ marginBottom: '2rem', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '0.5rem' }}>Portfolio preservation and investment flexibility</li>
            <li style={{ marginBottom: '0.5rem' }}>Liquidity needs and cash-flow management</li>
            <li style={{ marginBottom: '0.5rem' }}>Tax-efficient wealth and income strategies</li>
            <li style={{ marginBottom: '0.5rem' }}>Retirement distribution planning</li>
            <li style={{ marginBottom: '0.5rem' }}>Real estate acquisition and financing decisions</li>
            <li style={{ marginBottom: '0.5rem' }}>Trust, estate, and intergenerational wealth transfer objectives</li>
            <li style={{ marginBottom: '0.5rem' }}>Borrowing solutions for retirees, business owners, and high-net-worth families</li>
          </ul>

          <p style={{ marginBottom: '1.5rem' }}>
            Our approach is solution-neutral. Depending on a client's circumstances, a conventional mortgage, interest-only financing, asset-based lending, or even a reverse mortgage may merit consideration. Each strategy carries distinct advantages, trade-offs, and planning implications.
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            Reverse mortgages, in particular, remain one of the most underutilized tools in retirement planning. While not appropriate for every client, they can provide meaningful flexibility in certain situations by creating an additional source of liquidity, reducing portfolio withdrawals during market downturns, or supporting broader retirement income objectives.
          </p>

          <p style={{ marginBottom: '1.5rem' }}>
            We do not replace the client's advisory team. We serve as a specialized mortgage resource, working collaboratively with financial professionals to ensure financing decisions align with the client's broader investment, tax, retirement, and estate planning goals.
          </p>

          <p style={{ fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center', marginTop: '3rem', color: 'var(--primary)' }}>
            The most effective planning occurs when every part of the balance sheet works together.
          </p>
        </div>

      </div>
    </main>
  );
};

export default BigPicture;
