import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import './SelfEmployed.css';
import yieldCurveDataRaw from '../data/yieldCurveData.json';

const YieldCurve = () => {
  const [timeframe, setTimeframe] = useState('10Y');

  // Parse dates once
  const data = useMemo(() => {
    return yieldCurveDataRaw.map(obs => ({
      ...obs,
      date: new Date(obs.date)
    }));
  }, []);

  // Filter data based on selected timeframe
  const getFilteredData = () => {
    if (data.length === 0) return [];
    
    const latestDate = data[data.length - 1].date;
    const cutoffDate = new Date(latestDate);
    
    if (timeframe === '1Y') cutoffDate.setFullYear(latestDate.getFullYear() - 1);
    else if (timeframe === '5Y') cutoffDate.setFullYear(latestDate.getFullYear() - 5);
    else if (timeframe === '10Y') cutoffDate.setFullYear(latestDate.getFullYear() - 10);
    else return data; // MAX
    
    return data.filter(obs => obs.date >= cutoffDate);
  };

  const chartData = getFilteredData();

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const spreadData = payload.find(p => p.dataKey === 'spread');
      const yieldData = payload.find(p => p.dataKey === 'yield10');
      const isNegative = spreadData && spreadData.value < 0;
      
      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {yieldData && (
            <p style={{ margin: '0', color: yieldData.color, fontWeight: 'bold' }}>
              10-Year Yield: {yieldData.value.toFixed(2)}%
            </p>
          )}
          {spreadData && (
            <p style={{ margin: '5px 0 0 0', color: spreadData.color, fontWeight: 'bold' }}>
              Treasury Spread: {spreadData.value.toFixed(2)}%
            </p>
          )}
          {isNegative && <p style={{ margin: '5px 0 0 0', color: '#DC2626', fontSize: '0.85rem' }}>⚠️ Yield Curve Inverted</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Economic Insights: The Yield Curve | Insider Mortgage</title>
        <meta name="description" content="Live tracker for the 10-Year vs 3-Month Treasury Yield Spread. Understand the yield curve inversion and its impact on the economy." />
      </Helmet>
      
      <main>
        {/* HERO SECTION */}
        <section className="se-hero animate-fade-in" style={{ padding: '6rem 1rem 4rem 1rem', background: 'linear-gradient(rgba(6, 10, 45, 0.9), rgba(6, 10, 45, 0.95)), url("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80") center/cover' }}>
          <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>Economic Insights: The Yield Curve</h1>
            <p style={{ fontSize: '1.3rem', marginBottom: '2rem', color: 'rgba(255,255,255,0.9)' }}>
              Tracking the spread between the 10-Year Treasury and the 3-Month Treasury.
            </p>
          </div>
        </section>

        {/* CHART SECTION */}
        <section className="section" style={{ backgroundColor: 'var(--bg-color)' }}>
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>10-Year minus 3-Month Treasury Spread</h2>
                
                {/* Timeframe Controls */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['1Y', '5Y', '10Y', 'MAX'].map(tf => (
                    <button 
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      style={{ 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        border: '1px solid var(--primary)', 
                        background: timeframe === tf ? 'var(--primary)' : 'white',
                        color: timeframe === tf ? 'white' : 'var(--primary)',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Container */}
              <div style={{ height: '400px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="dateString" 
                        tickFormatter={(tick) => {
                          const d = new Date(tick);
                          if (timeframe === '1Y' || timeframe === '5Y') {
                            return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                          }
                          return d.getFullYear().toString();
                        }}
                        minTickGap={50}
                      />
                      <YAxis 
                        tickFormatter={(tick) => `${tick}%`}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontWeight: 'bold', paddingBottom: '10px' }} />
                      <ReferenceLine y={0} stroke="#DC2626" strokeWidth={2} strokeDasharray="3 3" />
                      <Line 
                        name="Treasury Spread (10Y minus 3M)"
                        type="monotone" 
                        dataKey="spread" 
                        stroke="var(--primary)" 
                        strokeWidth={2}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={false}
                        activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'white', strokeWidth: 2 }}
                      />
                      <Line 
                        name="10-Year Treasury Yield"
                        type="monotone" 
                        dataKey="yield10" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                        connectNulls={true}
                        isAnimationActive={false}
                        activeDot={{ r: 6, fill: '#f59e0b', stroke: 'white', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '1.5rem', textAlign: 'center', fontStyle: 'italic' }}>
                Data Source: Federal Reserve Economic Data (FRED), Federal Reserve Bank of St. Louis.
              </p>
            </div>
          </div>
        </section>

        {/* EDUCATIONAL SECTION */}
        <section className="section" style={{ backgroundColor: 'white' }}>
          <div className="container" style={{ maxWidth: '900px' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center' }}>Why This Spread Matters</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', display: 'inline-block' }}>The Normal Yield Curve</h3>
                <p>
                  In a healthy, growing economy, long-term interest rates (like the 10-Year Treasury) are typically higher than short-term rates (like the 3-Month Treasury). This creates a positive spread. Investors demand a higher return (yield) for locking their money up for a longer period of time because of the increased risk of inflation over time.
                </p>
              </div>

              <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', borderLeft: '4px solid #DC2626', padding: '2rem', borderRadius: '0 var(--radius) var(--radius) 0' }}>
                <h3 style={{ color: '#DC2626', marginBottom: '1rem' }}>The Inverted Yield Curve (Below Zero)</h3>
                <p>
                  When the chart dips below the red dashed zero line, it means the 3-Month yield is actually <em>higher</em> than the 10-Year yield. This is known as a <strong>Yield Curve Inversion</strong>.
                </p>
                <p style={{ marginTop: '1rem' }}>
                  An inversion indicates that investors are deeply concerned about the short-term future of the economy. They rush to buy long-term bonds as a safe haven, which drives long-term yields down. Historically, an inverted yield curve between the 10-Year and 3-Month treasuries has been one of the most reliable leading indicators of an impending economic recession.
                </p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-color)', padding: '2rem', borderRadius: 'var(--radius)' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem', display: 'inline-block' }}>Impact on Mortgage Rates</h3>
                <p>
                  Mortgage rates are heavily influenced by the 10-Year Treasury yield. When the yield curve inverts and long-term yields drop, mortgage rates often stabilize or fall as well. Furthermore, if an inversion correctly predicts a recession, the Federal Reserve will typically respond by cutting short-term rates to stimulate the economy, which can eventually lead to broad declines in interest rates across the board.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default YieldCurve;
