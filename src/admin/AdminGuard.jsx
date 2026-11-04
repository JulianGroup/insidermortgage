"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './AuthContext';
import { ADMIN_MODULES, canAccessModule } from './modules';

const box = {
  maxWidth: '520px',
  margin: '6rem auto',
  padding: '2rem',
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 8px 30px rgba(6,10,45,0.1)',
  textAlign: 'center',
};

/**
 * Wrap any admin page. `moduleId` limits access to staff granted that module; omit for any signed-in staff.
 */
export default function AdminGuard({ moduleId, children }) {
  const router = useRouter();
  const { user, profile, loading, logout, resendVerification, refresh } = useAdminAuth();

  React.useEffect(() => {
    if (!loading && !user && typeof window !== 'undefined') {
      window.location.replace('/admin/login/');
    }
  }, [loading, user]);

  if (loading || !user) {
    return <div style={box}>Loading…</div>;
  }

  if (!user.emailVerified) {
    return (
      <div style={box}>
        <h2>Verify your email</h2>
        <p>We sent a verification link to <strong>{user.email}</strong>. Click it, then continue.</p>
        <button className="btn btn-primary" onClick={refresh}>I verified — continue</button>{' '}
        <button className="btn" onClick={resendVerification}>Resend email</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={box}>
        <h2>No access yet</h2>
        <p>{user.email} has not been granted access. Ask Rakesh or David to add you under Team &amp; Access.</p>
        <button className="btn" onClick={logout}>Sign out</button>
      </div>
    );
  }

  if (moduleId) {
    const mod = ADMIN_MODULES.find((m) => m.id === moduleId);
    if (mod && !canAccessModule(profile, mod)) {
      return (
        <div style={box}>
          <h2>Not permitted</h2>
          <p>Your account doesn&apos;t have access to {mod.title}.</p>
          <Link href="/admin/" className="btn btn-primary">Back to dashboard</Link>
        </div>
      );
    }
  }

  return <>{children}</>;
}
