import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import OGMeta from '../src/components/seo/OGMeta.jsx';

// Mock settingsService to control returned settings and avoid network
vi.mock('../src/utils/settingsService.js', () => ({
  default: {
    getSettings: async () => ({ success: true, data: { site_title: 'SiteTitle', site_description: 'Desc', og_default_image_url: '/assets/images/mkraft.png', logo_url: '/assets/images/mklogo.png' } })
  }
}));

describe('OGMeta per-post override', () => {
  it('prefers override image over settings fallback', async () => {
    const { container } = render(<OGMeta title="Example" description="Desc" image="https://cdn.example.com/post-specific.jpg" />);
    await waitFor(() => {
      const ogImage = container.querySelector('meta[property="og:image"]');
      expect(ogImage).toBeTruthy();
      expect(ogImage.getAttribute('content')).toBe('https://cdn.example.com/post-specific.jpg');
    });
  });
});
