-- Patch D (2025-09-25): Media enhancements (avatar + defensive columns)
-- Adds avatar_url to user_profiles for profile image uploads.
-- Idempotent: uses IF NOT EXISTS and patch registry.

ALTER TABLE wisdomintech.user_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250925d_media_enhancements')
ON CONFLICT (patch_name) DO NOTHING;
