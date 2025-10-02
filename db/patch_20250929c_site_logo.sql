-- Patch: Ensure site logo column (logo_url) exists and create view alias if needed
-- Date: 2025-09-29
-- Idempotent: safe re-run

ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Ensure alias column exists (simple additive; IF NOT EXISTS handles idempotency)
ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS site_logo_url TEXT;

-- Backfill alias from primary if empty
UPDATE wisdomintech.site_settings
  SET site_logo_url = logo_url
  WHERE site_logo_url IS NULL AND logo_url IS NOT NULL;

-- Keep alias columns in sync (trigger)
CREATE OR REPLACE FUNCTION wisdomintech._sync_logo_alias()
RETURNS TRIGGER AS $fn$
BEGIN
  IF NEW.logo_url IS NOT NULL AND (NEW.site_logo_url IS NULL OR NEW.site_logo_url <> NEW.logo_url) THEN
    NEW.site_logo_url := NEW.logo_url;
  ELSIF NEW.site_logo_url IS NOT NULL AND (NEW.logo_url IS NULL OR NEW.logo_url <> NEW.site_logo_url) THEN
    NEW.logo_url := NEW.site_logo_url;
  END IF;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DO $trg$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_sync_logo_alias') THEN
    CREATE TRIGGER trg_sync_logo_alias BEFORE INSERT OR UPDATE ON wisdomintech.site_settings
      FOR EACH ROW EXECUTE FUNCTION wisdomintech._sync_logo_alias();
  END IF;
END
$trg$;

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250929c_site_logo')
ON CONFLICT (patch_name) DO NOTHING;
