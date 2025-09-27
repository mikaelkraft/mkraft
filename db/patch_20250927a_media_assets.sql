-- Patch (2025-09-27 A): Media Library Phase 1
-- Creates media_assets table to catalog uploaded media (initially referenced externally via URL).
-- Idempotent creation + patch registry insert.

CREATE TABLE IF NOT EXISTS wisdomintech.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  mime_type text,
  width int,
  height int,
  size_bytes int,
  alt text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES wisdomintech.user_profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON wisdomintech.media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_tags ON wisdomintech.media_assets USING GIN(tags);

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250927a_media_assets')
ON CONFLICT (patch_name) DO NOTHING;
