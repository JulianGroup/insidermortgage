"use client";
import React from 'react';
import Link from 'next/link';
import AdminGuard from './AdminGuard';
import { useAdminAuth } from './AuthContext';
import { ADMIN_MODULES, canAccessModule } from './modules';

function Dashboard() {
  const { profile, logout } = useAdminAuth();
  const visible = ADMIN_MODULES.filter((m) => canAccessModule(profile, m));

  return (
    <div className="container" style={{ maxWidth: '980px', padding: '3rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--primary)' }}>Admin Portal</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B' }}>
            Welcome, {profile.name} · {profile.role === 'owner' ? 'Owner' : 'Staff'}
          </p>
        </div>
        <button className="btn" onClick={logout}>Sign out</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {visible.map((m) => {
          const live = m.status === 'live';
          const card = (
            <div
              style={{
                background: '#fff',
                padding: '1.75rem',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                height: '100%',
                opacity: live ? 1 : 0.65,
                borderTop: '4px solid var(--accent)',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{m.icon}</div>
              <h3 style={{ margin: '0.5rem 0', color: 'var(--primary)' }}>
                {m.title}{' '}
                {!live && <span style={{ fontSize: '0.75rem', color: '#92400E', background: '#FEF3C7', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>Coming soon</span>}
              </h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{m.description}</p>
            </div>
          );
          return live ? (
            <Link key={m.id} href={`${m.route}/`} style={{ textDecoration: 'none' }}>{card}</Link>
          ) : (
            <div key={m.id}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );
}
