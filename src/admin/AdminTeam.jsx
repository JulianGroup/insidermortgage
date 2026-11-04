"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { collection, getDocs, setDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import AdminGuard from './AdminGuard';
import { useAdminAuth } from './AuthContext';
import { GRANTABLE_PERMISSIONS } from './modules';

function Team() {
  const { profile } = useAdminAuth();
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ email: '', name: '', permissions: ['blog'] });
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    const snap = await getDocs(collection(db, 'staff'));
    setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, []);

  useEffect(() => {
    load().catch(() => setMsg('Could not load team.'));
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const email = form.email.trim().toLowerCase();
    if (!email) return;
    await setDoc(doc(db, 'staff', email), {
      email,
      name: form.name.trim(),
      role: 'staff',
      permissions: form.permissions,
      active: true,
      updatedBy: profile.email,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    setForm({ email: '', name: '', permissions: ['blog'] });
    setMsg(`Saved ${email}. They can now sign in with Google or email/password.`);
    load();
  };

  const toggleActive = async (s) => {
    await setDoc(doc(db, 'staff', s.id), { active: s.active === false, updatedBy: profile.email, updatedAt: serverTimestamp() }, { merge: true });
    load();
  };

  const remove = async (s) => {
    if (!window.confirm(`Remove ${s.id}?`)) return;
    await deleteDoc(doc(db, 'staff', s.id));
    load();
  };

  const togglePerm = (key) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key) ? f.permissions.filter((k) => k !== key) : [...f.permissions, key],
    }));

  const input = { padding: '0.65rem', border: '1px solid #CBD5E1', borderRadius: '8px', marginRight: '0.5rem', marginBottom: '0.5rem' };

  return (
    <div className="container" style={{ maxWidth: '860px', padding: '3rem 0' }}>
      <Link href="/admin/">← Dashboard</Link>
      <h1 style={{ color: 'var(--primary)' }}>Team &amp; Access</h1>
      <p style={{ color: '#475569' }}>Owners (Rakesh &amp; David) have full access. Staff below can only use the modules you tick, and can only save blog drafts — an owner approves and publishes.</p>

      <form onSubmit={save} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Add / update staff</h3>
        <input style={input} type="email" placeholder="Email (Google or work email)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input style={input} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div style={{ margin: '0.5rem 0 1rem' }}>
          {GRANTABLE_PERMISSIONS.map((p) => (
            <label key={p.key} style={{ marginRight: '1.25rem' }}>
              <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} /> {p.label}
            </label>
          ))}
        </div>
        <button className="btn btn-primary" type="submit">Save staff member</button>
        {msg && <p style={{ color: '#15803D' }}>{msg}</p>}
      </form>

      <table style={{ width: '100%', background: '#fff', borderCollapse: 'collapse', borderRadius: '12px', overflow: 'hidden' }}>
        <thead><tr style={{ background: '#060A2D', color: '#fff', textAlign: 'left' }}>
          <th style={{ padding: '0.75rem' }}>Email</th><th>Name</th><th>Modules</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {staff.length === 0 && <tr><td colSpan={5} style={{ padding: '1rem', color: '#64748B' }}>No staff added yet.</td></tr>}
          {staff.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
              <td style={{ padding: '0.75rem' }}>{s.id}</td>
              <td>{s.name}</td>
              <td>{(s.permissions || []).join(', ')}</td>
              <td>{s.active === false ? 'Disabled' : 'Active'}</td>
              <td>
                <button className="btn" onClick={() => toggleActive(s)}>{s.active === false ? 'Enable' : 'Disable'}</button>{' '}
                <button className="btn" onClick={() => remove(s)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminTeam() {
  return (
    <AdminGuard moduleId="team">
      <Team />
    </AdminGuard>
  );
}
