-- Patch (2025-09-29b): Profile change audit log & ensure avatar_url rule

CREATE TABLE IF NOT EXISTS wisdomintech.profile_change_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_change_events_user ON wisdomintech.profile_change_events(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_events_actor ON wisdomintech.profile_change_events(actor_id);

-- Seed avatar_url rule if missing (enabled for all roles)
INSERT INTO wisdomintech.profile_field_rules (field_name, enabled, editable_roles)
VALUES ('avatar_url', true, ARRAY['admin','publisher','viewer'])
ON CONFLICT (field_name) DO NOTHING;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='wisdomintech' AND table_name='__applied_patches') THEN
    INSERT INTO wisdomintech.__applied_patches (patch_name) VALUES ('patch_20250929b_profile_audit') ON CONFLICT (patch_name) DO NOTHING;
  END IF;
END $$;
