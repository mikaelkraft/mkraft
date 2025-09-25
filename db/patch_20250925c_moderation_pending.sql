-- Patch C (2025-09-25): Enable pending moderation workflow for comments
-- Changes default of is_approved to false so new comments require approval.
-- Existing rows remain unchanged.

ALTER TABLE wisdomintech.comments ALTER COLUMN is_approved SET DEFAULT false;

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250925c_moderation_pending')
ON CONFLICT (patch_name) DO NOTHING;
