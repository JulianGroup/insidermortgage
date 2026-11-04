import { AdminAuthProvider } from '../../src/admin/AuthContext';

export const metadata = {
  title: 'Admin Portal | Insider Mortgage',
  robots: { index: false, follow: false },
  referrer: 'no-referrer-when-downgrade',
};

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <div style={{ minHeight: '80vh', backgroundColor: 'var(--bg-color)', padding: '1rem' }}>{children}</div>
    </AdminAuthProvider>
  );
}
