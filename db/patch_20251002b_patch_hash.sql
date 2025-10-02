-- Patch: add patch_hash column for drift detection
-- Date: 2025-10-02
-- Idempotent additive column on marker table

ALTER TABLE wisdomintech.__applied_patches
  ADD COLUMN IF NOT EXISTS patch_hash TEXT;

INSERT INTO wisdomintech.__applied_patches(patch_name)
VALUES ('patch_20251002b_patch_hash')
ON CONFLICT (patch_name) DO NOTHING;
