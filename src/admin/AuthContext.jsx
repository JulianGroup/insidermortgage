"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ADMIN_EMAIL_WHITELIST } from '../data/taxonomy';

// Owners are bootstrapped from the whitelist (must match firestore.rules).
// Everyone else needs an active profile in Firestore staff/{email}, created by an owner.
const OWNER_EMAILS = ADMIN_EMAIL_WHITELIST.map((e) => e.toLowerCase());

const AuthContext = createContext(null);

export function useAdminAuth() {
  return useContext(AuthContext);
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { role, permissions, name } | null (no access)
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u) => {
    if (!u || !u.email || !u.emailVerified) return null;
    const email = u.email.toLowerCase();
    if (OWNER_EMAILS.includes(email)) {
      return { role: 'owner', permissions: [], name: u.displayName || email, email };
    }
    try {
      const snap = await getDoc(doc(db, 'staff', email));
      if (snap.exists() && snap.data().active !== false) {
        const d = snap.data();
        return {
          role: d.role === 'owner' ? 'owner' : 'staff',
          permissions: d.permissions || [],
          name: d.name || u.displayName || email,
          email,
        };
      }
    } catch {
      // Rules deny read when the user has no profile
    }
    return null;
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfile(await loadProfile(u));
      setLoading(false);
    });
  }, [loadProfile]);

  const value = {
    user,
    profile,
    loading,
    isOwner: profile?.role === 'owner',
    signInWithGoogle: () => signInWithPopup(auth, new GoogleAuthProvider()),
    // Google OAuth2 Token Client path: avoids both firebaseapp.com/__/auth/handler AND gsi/transform iframe bug
    signInWithGoogleTokens: ({ idToken = null, accessToken = null }) =>
      signInWithCredential(auth, GoogleAuthProvider.credential(idToken, accessToken)),
    signInWithPassword: (email, password) => signInWithEmailAndPassword(auth, email, password),
    registerWithPassword: async (email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      return cred;
    },
    resendVerification: () => (auth.currentUser ? sendEmailVerification(auth.currentUser) : null),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
    refresh: async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setUser({ ...auth.currentUser });
        setProfile(await loadProfile(auth.currentUser));
      }
    },
    logout: () => signOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
