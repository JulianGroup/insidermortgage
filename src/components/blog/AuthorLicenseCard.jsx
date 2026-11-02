"use client";
import React from 'react';
import Link from 'next/link';
import { C2_CORPORATE } from '../../data/taxonomy';

export default function AuthorLicenseCard({ author }) {
  if (!author) return null;

  return (
    <section
      aria-label="Author Licensing & Disclosures"
      style={{
        marginTop: '2.5rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 4px 12px rgba(6, 10, 45, 0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          alignItems: 'center',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <img
          src={author.photo}
          alt={author.name}
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            objectFit: 'cover',
            objectPosition: 'top center',
            border: '3px solid var(--accent, #EFB51E)',
            flexShrink: 0,
          }}
        />

        <div style={{ flex: '1 1 260px' }}>
          <div
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748B',
              marginBottom: '0.2rem',
            }}
          >
            Written By
          </div>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--primary, #060A2D)', margin: 0 }}>
            {author.name}
          </h3>
          <div
            style={{
              fontSize: '0.92rem',
              color: 'var(--secondary, #0468E9)',
              fontWeight: 600,
              marginTop: '0.15rem',
            }}
          >
            {author.role} • {C2_CORPORATE.dba}
          </div>
          {author.shortBio && (
            <p
              style={{
                fontSize: '0.9rem',
                color: '#475569',
                marginTop: '0.5rem',
                marginBottom: 0,
                lineHeight: 1.55,
              }}
            >
              {author.shortBio}
            </p>
          )}
        </div>

        <div>
          <Link
            href={author.bioRoute}
            style={{
              display: 'inline-block',
              padding: '0.55rem 1.1rem',
              borderRadius: '999px',
              border: '1.5px solid var(--primary, #060A2D)',
              color: 'var(--primary, #060A2D)',
              fontWeight: 600,
              fontSize: '0.86rem',
              textDecoration: 'none',
            }}
          >
            View {author.name.split(' ')[0]}&apos;s Bio &rarr;
          </Link>
        </div>
      </div>

      {/* Blogger State + NMLS & Corresponding C2 State + NMLS Table */}
      <div style={{ marginTop: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--primary, #060A2D)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Licensing &amp; Regulatory Identification
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.82rem' }}>
            <span
              style={{
                padding: '0.22rem 0.65rem',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              {author.name} NMLS: <strong>#{author.nmls}</strong>
            </span>
            <span
              style={{
                padding: '0.22rem 0.65rem',
                backgroundColor: '#F1F5F9',
                borderRadius: '6px',
                fontWeight: 600,
                color: '#0F172A',
              }}
            >
              {C2_CORPORATE.name} NMLS: <strong>#{author.c2Nmls}</strong>
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '0.5rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                  Licensed State
                </th>
                <th style={{ padding: '0.5rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                  {author.name} State License
                </th>
                <th style={{ padding: '0.5rem 0.75rem', color: '#475569', fontWeight: 600 }}>
                  {C2_CORPORATE.name} State License
                </th>
              </tr>
            </thead>
            <tbody>
              {author.licenses.map((lic) => (
                <tr key={lic.state} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#0F172A' }}>
                    {lic.state}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#334155' }}>
                    #{lic.bloggerLicense}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', color: '#334155' }}>
                    #{lic.c2License}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.75rem', marginBottom: 0 }}>
          {C2_CORPORATE.name} dba {C2_CORPORATE.dba} • Equal Housing Opportunity. Educational content
          only; not a commitment to lend.
        </p>
      </div>
    </section>
  );
}
