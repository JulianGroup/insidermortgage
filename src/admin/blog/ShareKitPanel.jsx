"use client";
import React, { useState } from 'react';
import { generateShareSnippets } from '../../lib/blog';

const cardStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #CBD5E1',
  borderRadius: '12px',
  padding: '1.35rem',
  marginBottom: '1.25rem',
};

const preStyle = {
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '1rem',
  whiteSpace: 'pre-wrap',
  fontFamily: 'inherit',
  fontSize: '0.94rem',
  lineHeight: 1.6,
  color: '#1E293B',
  margin: '0.6rem 0 0',
};

export default function ShareKitPanel({ post }) {
  const [copiedKey, setCopiedKey] = useState('');
  const snippets = generateShareSnippets(post, 'https://insidermortgage.com');

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2200);
    } catch {
      // Clipboard fallback
    }
  };

  const CopyBtn = ({ id, text, label = 'Copy' }) => (
    <button
      type="button"
      className="btn"
      onClick={() => copy(id, text)}
      style={{
        padding: '0.4rem 0.85rem',
        fontSize: '0.84rem',
        fontWeight: 700,
        backgroundColor: copiedKey === id ? '#15803D' : '#060A2D',
        color: '#FFFFFF',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {copiedKey === id ? '✓ Copied!' : label}
    </button>
  );

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
              Canonical Live URL
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0468E9', wordBreak: 'break-all' }}>
              {snippets.postUrl}
            </div>
          </div>
          <CopyBtn id="url" text={snippets.postUrl} label="Copy Link" />
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#060A2D' }}>📧 Email Newsletter / Client Blast</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <CopyBtn id="subject" text={snippets.emailSubject} label="Copy Subject" />
            <CopyBtn id="email" text={snippets.emailBody} label="Copy Email Body" />
          </div>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#475569' }}>
          <strong>Subject:</strong> {snippets.emailSubject}
        </div>
        <pre style={preStyle}>{snippets.emailBody}</pre>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#060A2D' }}>💼 LinkedIn / Facebook Post</h3>
          <CopyBtn id="social" text={snippets.socialCopy} label="Copy Social Post" />
        </div>
        <pre style={preStyle}>{snippets.socialCopy}</pre>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#060A2D' }}>📱 Client Text / SMS</h3>
          <CopyBtn id="sms" text={snippets.smsCopy} label="Copy SMS" />
        </div>
        <pre style={preStyle}>{snippets.smsCopy}</pre>
      </div>
    </div>
  );
}
