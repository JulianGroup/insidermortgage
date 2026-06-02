"use client";
import React, { useState } from 'react';

const ReviewCard = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const textStyle = {
    color: 'var(--text-secondary)',
    fontSize: '1.05rem',
    lineHeight: 1.6,
    fontStyle: 'italic',
    marginBottom: '1rem',
    display: isExpanded ? 'block' : '-webkit-box',
    WebkitLineClamp: isExpanded ? 'none' : 5,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', borderTop: '4px solid var(--secondary)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ color: 'var(--secondary)', marginBottom: '1rem', fontSize: '1.2rem' }}>★★★★★</div>
      <p style={{ ...textStyle }}>"{review.text}"</p>
      
      {review.text.length > 250 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', padding: 0, textAlign: 'left', marginBottom: '1.5rem', textDecoration: 'underline' }}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: 'auto' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', flexShrink: 0 }}>{review.initials}</div>
        <div>
          <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{review.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{review.source}</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;

