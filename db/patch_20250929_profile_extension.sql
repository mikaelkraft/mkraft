-- Patch (2025-09-29): Extended profile fields & field rules configuration
-- Adds optional user profile enrichment fields and a rules table to enable/disable/edit-by-role per field.

ALTER TABLE wisdomintech.user_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
  ADD COLUMN IF NOT EXISTS github_handle TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_handle TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS profile_meta JSONB;

-- Configuration table controlling which fields are exposed & editable and by which roles.
CREATE TABLE IF NOT EXISTS wisdomintech.profile_field_rules (
  field_name TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  editable_roles TEXT[] NOT NULL DEFAULT ARRAY['admin','publisher','viewer'],
  required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION wisdomintech.touch_profile_field_rules()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'profile_field_rules_touch_update') THEN
    CREATE TRIGGER profile_field_rules_touch_update BEFORE UPDATE ON wisdomintech.profile_field_rules
      FOR EACH ROW EXECUTE FUNCTION wisdomintech.touch_profile_field_rules();
  END IF;
END $$;

-- Seed default rules only if table empty (idempotent)
INSERT INTO wisdomintech.profile_field_rules (field_name, enabled, editable_roles)
SELECT f, true, ARRAY['admin','publisher','viewer'] FROM (VALUES
  ('bio'),('website_url'),('twitter_handle'),('github_handle'),('linkedin_handle'),('location'),('headline')
) AS v(f)
ON CONFLICT (field_name) DO NOTHING;

-- Register patch if registry table present
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'wisdomintech' AND table_name = '__applied_patches') THEN
    INSERT INTO wisdomintech.__applied_patches (patch_name) VALUES ('patch_20250929_profile_extension') ON CONFLICT (patch_name) DO NOTHING;
  END IF;
END $$;
