"use client";
import React, { useState } from 'react';
import { generateShareSnippets } from '../../lib/blog';

export default function ShareSnippetModal({ post }) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!post) return null;

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://www.insidermtg.com';

  const snippets = generateShareSnippets(post, origin);

  const handleCopy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.9rem',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.28)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: '#FFFFFF',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span>✉️</span> Newsletter &amp; Social Copy
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 10, 45, 0.72)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
                marginBottom: '1.25rem',
                paddingBottom: '0.85rem',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#060A2D', margin: 0 }}>
                  Ready-to-Send Newsletter &amp; Social Snippets
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '0.25rem', marginBottom: 0 }}>
                  Auto-formatted with this article&apos;s link and the blogger&apos;s NMLS &amp; state licenses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#334155',
                }}
              >
                ✕
              </button>
            </div>

            {/* 1. Email Newsletter */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: '#060A2D' }}>
                  1. Email Newsletter / Client Broadcast
                </strong>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      'email',
                      `Subject: ${snippets.emailSubject}\n\n${snippets.emailBody}`
                    )
                  }
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: copiedKey === 'email' ? '#059669' : '#060A2D',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedKey === 'email' ? '✓ Copied!' : 'Copy Subject + Email'}
                </button>
              </div>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  color: '#334155',
                  maxHeight: '190px',
                  overflowY: 'auto',
                }}
              >
                <strong>Subject:</strong> {snippets.emailSubject}
                {'\n\n'}
                {snippets.emailBody}
              </div>
            </div>

            {/* 2. LinkedIn / Facebook */}
            <div style={{ marginBottom: '1.35rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: '#060A2D' }}>
                  2. LinkedIn / Facebook Post
                </strong>
                <button
                  type="button"
                  onClick={() => handleCopy('social', snippets.socialCopy)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: copiedKey === 'social' ? '#059669' : '#060A2D',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedKey === 'social' ? '✓ Copied!' : 'Copy Social Post'}
                </button>
              </div>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  whiteSpace: 'pre-wrap',
                  color: '#334155',
                }}
              >
                {snippets.socialCopy}
              </div>
            </div>

            {/* 3. Quick SMS / Text */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.4rem',
                }}
              >
                <strong style={{ fontSize: '0.9rem', color: '#060A2D' }}>
                  3. Quick Client Text (SMS)
                </strong>
                <button
                  type="button"
                  onClick={() => handleCopy('sms', snippets.smsCopy)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: copiedKey === 'sms' ? '#059669' : '#060A2D',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copiedKey === 'sms' ? '✓ Copied!' : 'Copy Text'}
                </button>
              </div>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.82rem',
                  whiteSpace: 'pre-wrap',
                  color: '#334155',
                }}
              >
                {snippets.smsCopy}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
