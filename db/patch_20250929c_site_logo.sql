-- Patch: Ensure site logo column (logo_url) exists and create view alias if needed
-- Date: 2025-09-29
-- Idempotent: safe re-run

ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Optionally create a view aliasing future naming (site_logo_url) if desired by clients
-- (Skip if already present)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='wisdomintech' AND table_name='site_settings' AND column_name='site_logo_url'
  ) THEN
    BEGIN
      ALTER TABLE wisdomintech.site_settings ADD COLUMN site_logo_url TEXT;
      -- Backfill new alias from existing logo_url if null
      UPDATE wisdomintech.site_settings SET site_logo_url = logo_url WHERE site_logo_url IS NULL AND logo_url IS NOT NULL;
    EXCEPTION WHEN duplicate_column THEN NULL; END;
  END IF;
END $$;

-- Keep alias columns in sync (trigger)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_sync_logo_alias') THEN
    CREATE OR REPLACE FUNCTION wisdomintech._sync_logo_alias()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.logo_url IS NOT NULL AND (NEW.site_logo_url IS NULL OR NEW.site_logo_url <> NEW.logo_url) THEN
        NEW.site_logo_url := NEW.logo_url;
      ELSIF NEW.site_logo_url IS NOT NULL AND (NEW.logo_url IS NULL OR NEW.logo_url <> NEW.site_logo_url) THEN
        NEW.logo_url := NEW.site_logo_url;
      END IF;
      RETURN NEW;
    END; $$ LANGUAGE plpgsql;
    CREATE TRIGGER trg_sync_logo_alias BEFORE INSERT OR UPDATE ON wisdomintech.site_settings
      FOR EACH ROW EXECUTE FUNCTION wisdomintech._sync_logo_alias();
  END IF;
END $$;

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250929c_site_logo')
ON CONFLICT (patch_name) DO NOTHING;
