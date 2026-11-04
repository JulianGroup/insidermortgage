"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from './AuthContext';

// Web client ID of the Firebase project's default Google OAuth client (public, safe in client code)
const GOOGLE_CLIENT_ID =
  '243344090160-br9f2ogr2sa8p0vtsj6o51a4ov6b41u4.apps.googleusercontent.com';

const friendly = (err) => {
  const code = err?.code || '';
  if (
    code.includes('invalid-credential') ||
    code.includes('wrong-password') ||
    code.includes('user-not-found')
  ) {
    return 'Incorrect email or password.';
  }
  if (code.includes('email-already-in-use')) {
    return 'An account with that email already exists — sign in instead.';
  }
  if (code.includes('weak-password')) return 'Password must be at least 6 characters.';
  return err?.message || 'Something went wrong.';
};

function generateNonce() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminLogin() {
  const {
    user,
    loading,
    signInWithGoogleTokens,
    signInWithPassword,
    registerWithPassword,
    resetPassword,
  } = useAdminAuth();

  const [mode, setMode] = useState('signin'); // signin | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handledHashRef = useRef(false);
  const tokenSignInRef = useRef(signInWithGoogleTokens);
  tokenSignInRef.current = signInWithGoogleTokens;

  // 1. Complete same-tab Google OAuth redirect when returning with #id_token=...
  useEffect(() => {
    if (handledHashRef.current || typeof window === 'undefined') return;
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;

    const params = new URLSearchParams(rawHash.slice(1));
    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');
    const oauthError = params.get('error');

    if (!idToken && !accessToken && !oauthError) return;
    handledHashRef.current = true;

    // Immediately clean token out of the browser URL bar
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (oauthError) {
      setMsg(`Google sign-in error: ${params.get('error_description') || oauthError}`);
      return;
    }

    setBusy(true);
    setMsg('');
    tokenSignInRef
      .current({ idToken, accessToken })
      .then(() => {
        window.location.replace('/admin/');
      })
      .catch((e) => {
        setMsg(friendly(e));
        setBusy(false);
      });
  }, []);

  // 2. If already signed in, go straight to /admin/
  useEffect(() => {
    if (!loading && user) {
      window.location.replace('/admin/');
    }
  }, [loading, user]);

  // Same-tab OAuth 2.0 redirect — zero popups, immune to popup blockers & storage partitioning
  const handleGoogleRedirect = () => {
    setBusy(true);
    setMsg('');
    const nonce = generateNonce();
    try {
      window.sessionStorage.setItem('imc_oauth_nonce', nonce);
    } catch {
      // Ignore if sessionStorage is restricted
    }

    const redirectUri = `${window.location.origin}/admin/login/`;
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('prompt', 'select_account');

    window.location.assign(authUrl.toString());
  };

  const run = async (fn) => {
    setBusy(true);
    setMsg('');
    try {
      await fn();
    } catch (e) {
      setMsg(friendly(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    run(() =>
      mode === 'signin'
        ? signInWithPassword(email, password)
        : registerWithPassword(email, password)
    );
  };

  if (loading || user || (busy && !msg)) {
    return (
      <div
        style={{
          maxWidth: '420px',
          margin: '5rem auto',
          background: '#fff',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(6,10,45,0.1)',
          textAlign: 'center',
          color: '#334155',
        }}
      >
        {user || busy ? 'Signing you into Admin Portal…' : 'Checking sign-in status…'}
      </div>
    );
  }

  const input = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    fontSize: '1rem',
  };

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '5rem auto',
        background: '#fff',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(6,10,45,0.1)',
      }}
    >
      <h1 style={{ fontSize: '1.6rem', color: 'var(--primary)', marginTop: 0 }}>
        Insider Mortgage Admin
      </h1>
      <p style={{ color: '#64748B' }}>Staff sign-in</p>

      <button
        type="button"
        onClick={handleGoogleRedirect}
        disabled={busy}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          padding: '0.78rem 1rem',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          fontWeight: 700,
          fontSize: '0.98rem',
          cursor: busy ? 'wait' : 'pointer',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          marginBottom: '0.75rem',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        Continue with Google
      </button>

      <div style={{ textAlign: 'center', color: '#94A3B8', margin: '0.5rem 0' }}>or</div>

      <form onSubmit={submit}>
        <input
          style={input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn" style={{ width: '100%' }} disabled={busy} type="submit">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {msg && <p style={{ color: '#B91C1C', marginTop: '1rem' }}>{msg}</p>}

      <div
        style={{
          marginTop: '1rem',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setMode(mode === 'signin' ? 'register' : 'signin');
            setMsg('');
          }}
        >
          {mode === 'signin' ? 'First time? Create account' : 'Have an account? Sign in'}
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            email
              ? run(async () => {
                  await resetPassword(email);
                  setMsg('Password reset email sent.');
                })
              : setMsg('Enter your email first.');
          }}
        >
          Forgot password?
        </a>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '1.25rem' }}>
        Access is limited to approved staff. Creating an account does not grant access.
      </p>
    </div>
  );
}
