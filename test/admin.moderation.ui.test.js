import { describe, it, expect } from 'vitest';

// Lightweight smoke test placeholder for admin moderation integration.
// Full DOM/component tests would require a testing library setup.
// Here we assert that the sidebar source includes the moderation id.

import fs from 'fs';
import path from 'path';

describe('Admin Moderation UI wiring', () => {
  it('DashboardSidebar contains moderation navigation item', () => {
    const p = path.join(process.cwd(), 'src/pages/admin-dashboard-content-management/components/DashboardSidebar.jsx');
    const src = fs.readFileSync(p, 'utf8');
    expect(src).toMatch(/id:\s*'moderation'/);
    expect(src).toMatch(/Moderation/);
  });
});
