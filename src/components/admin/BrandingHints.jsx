// Simple read-only branding hints block for admin UI.
export default function BrandingHints({ settings = {}, onOgImageChange }) {
  const logo = settings.logo_url || "/assets/images/mklogo.png";
  const ogImage =
    settings.og_default_image_url || logo || "/assets/images/mkraft.png";
  return (
    <div className="mt-6 p-4 border border-border-accent/40 rounded bg-surface text-sm space-y-3">
      <div className="font-semibold text-text-primary">Branding Preview</div>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs uppercase tracking-wide text-text-secondary">
            Logo
          </span>
          <img
            src={logo}
            alt="Current logo"
            className="h-12 w-auto object-contain rounded bg-background/40 border border-border-accent/30 p-1"
          />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="text-xs uppercase tracking-wide text-text-secondary">
            OG Fallback
          </span>
          <img
            src={ogImage}
            alt="Current OG image"
            className="h-12 w-auto object-contain rounded bg-background/40 border border-border-accent/30 p-1"
          />
        </div>
      </div>
      <ul className="list-disc list-inside text-text-secondary leading-snug">
        <li>Single logo model: one logo used across all themes.</li>
        <li>Per-post OG uses the post featured image when set.</li>
        <li>
          Global OG fallback: og_default_image_url → logo_url →
          /assets/images/mkraft.png.
        </li>
      </ul>
      {onOgImageChange && (
        <div className="pt-2 border-t border-border-accent/20">
          <label className="block text-xs font-medium mb-1 text-text-secondary">
            Replace OG Default Image (base64 data URI or https URL)
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="data:image/png;base64,... or https://"
              className="flex-1 px-2 py-1 text-sm bg-background border border-border-accent/30 rounded"
              id="ogImageInput"
            />
            <button
              type="button"
              className="px-3 py-1 text-xs rounded bg-primary text-background hover:bg-primary/80"
              onClick={() => {
                const val = document
                  .getElementById("ogImageInput")
                  .value.trim();
                if (val) onOgImageChange(val);
              }}
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
