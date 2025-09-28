import React from 'react';

// Shared RoleBadge component honoring theme semantic classes.
// Props: role (admin|publisher|viewer), email (optional for super-admin detection), adminEmail (optional override)
export default function RoleBadge({ role, email, adminEmail }) {
  if (!role) return null;
  const isSuper = role === 'admin' && adminEmail && email && email === adminEmail;
  const base = 'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase';
  if (isSuper) return <span className={base + ' bg-gradient-to-r from-primary to-accent border-primary/60 text-background shadow-glow-primary'}>SUPER ADMIN</span>;
  if (role === 'admin') return <span className={base + ' bg-primary/15 border-primary/40 text-primary'}>ADMIN</span>;
  if (role === 'publisher') return <span className={base + ' bg-warning/15 border-warning/40 text-warning'}>PUBLISHER</span>;
  return <span className={base + ' bg-surface/60 border-border-accent/30 text-text-secondary'}>VIEWER</span>;
}
