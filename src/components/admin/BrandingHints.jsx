import React from 'react';

// Simple read-only branding hints block for admin UI.
export default function BrandingHints({ settings = {} }) {
  const logo = settings.logo_light_url || settings.logo_dark_url || settings.logo_url || '/assets/images/mklogo.png';
  const ogImage = settings.og_default_image_url || settings.logo_url || '/assets/images/mkraft.png';
  return (
    <div className="mt-6 p-4 border border-border-accent/40 rounded bg-surface text-sm space-y-3">
      <div className="font-semibold text-text-primary">Branding Preview</div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs uppercase tracking-wide text-text-secondary">Logo</span>
          <img src={logo} alt="Current logo" className="h-12 w-auto object-contain rounded bg-background/40 border border-border-accent/30 p-1" />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs uppercase tracking-wide text-text-secondary">OG Fallback</span>
          <img src={ogImage} alt="Current OG image" className="h-12 w-auto object-contain rounded bg-background/40 border border-border-accent/30 p-1" />
        </div>
      </div>
      <ul className="list-disc list-inside text-text-secondary leading-snug">
        <li>Per-post OG uses the post featured image when set.</li>
        <li>Global OG fallback chain: og_default_image_url → logo_url → /assets/images/mkraft.png.</li>
        <li>Header uses mklogo.png unless an uploaded logo overrides it.</li>
      </ul>
    </div>
  );
}
