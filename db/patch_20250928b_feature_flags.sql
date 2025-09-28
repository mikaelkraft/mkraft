-- Feature Flags foundational table
CREATE TABLE IF NOT EXISTS wisdomintech.feature_flags (
  id BIGSERIAL PRIMARY KEY,
  flag_key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION wisdomintech.feature_flags_touch() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS feature_flags_touch_tgr ON wisdomintech.feature_flags;
CREATE TRIGGER feature_flags_touch_tgr
BEFORE UPDATE ON wisdomintech.feature_flags
FOR EACH ROW EXECUTE FUNCTION wisdomintech.feature_flags_touch();

-- Seed initial flags if not present
INSERT INTO wisdomintech.feature_flags (flag_key, enabled, note)
  VALUES ('command_palette', true, 'Admin command palette rollout'),
         ('related_posts', true, 'Show related posts section'),
         ('full_text_search', true, 'Enable /api/blog/search & palette suggestions')
ON CONFLICT (flag_key) DO NOTHING;
