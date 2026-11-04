// Admin Portal module registry.
// To add a new dashboard option: add one entry here and create app/admin/<route>/page.jsx.
// `permission` is the key granted to staff in their staff/{email} profile. Owners have every permission.
// status: 'live' (clickable) | 'soon' (shown as "Coming soon").

export const ADMIN_MODULES = [
  {
    id: 'blog',
    title: 'Blog Studio',
    description: 'Write, edit, and submit Resource Library articles. Owners approve and publish.',
    icon: '✍️',
    route: '/admin/blog',
    permission: 'blog',
    status: 'live',
  },
  {
    id: 'contacts',
    title: 'Contact Database',
    description: 'Leads and client contacts from the website forms (design coming soon).',
    icon: '👥',
    route: '/admin/contacts',
    permission: 'contacts',
    status: 'soon',
  },
  {
    id: 'team',
    title: 'Team & Access',
    description: 'Add staff, choose which modules each person can use.',
    icon: '🔐',
    route: '/admin/team',
    permission: 'team',
    status: 'live',
    ownerOnly: true,
  },
];

// Permissions that can be granted to staff (owner-only modules are excluded).
export const GRANTABLE_PERMISSIONS = ADMIN_MODULES.filter((m) => !m.ownerOnly).map((m) => ({
  key: m.permission,
  label: m.title,
}));

export function canAccessModule(profile, mod) {
  if (!profile) return false;
  if (profile.role === 'owner') return true;
  if (mod.ownerOnly) return false;
  return Array.isArray(profile.permissions) && profile.permissions.includes(mod.permission);
}
