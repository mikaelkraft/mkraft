-- Patch: Add light/dark logo variant columns + default OG image
-- Date: 2025-09-29
ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS logo_light_url TEXT,
  ADD COLUMN IF NOT EXISTS logo_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS og_default_image_url TEXT;

-- Backfill og_default_image_url if empty using existing logo/site_logo if plausible
UPDATE wisdomintech.site_settings
  SET og_default_image_url = COALESCE(og_default_image_url, logo_url, site_logo_url)
  WHERE og_default_image_url IS NULL;

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250929d_logo_variants')
ON CONFLICT (patch_name) DO NOTHING;
