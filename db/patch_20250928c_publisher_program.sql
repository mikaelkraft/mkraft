-- Publisher Program: roles & request workflow
-- Adds role & publisher request workflow columns to user_profiles and seeds feature flag.

ALTER TABLE wisdomintech.user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'viewer',
  ADD COLUMN IF NOT EXISTS publisher_request_status TEXT,       -- pending | approved | rejected
  ADD COLUMN IF NOT EXISTS publisher_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS role_updated_at TIMESTAMPTZ;

-- Helpful indexes for admin dashboards / queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON wisdomintech.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_publisher_request ON wisdomintech.user_profiles(publisher_request_status) WHERE publisher_request_status IS NOT NULL;

-- Seed feature flag (disabled by default until rollout)
INSERT INTO wisdomintech.feature_flags (flag_key, enabled, note)
VALUES ('publisher_program', false, 'Multi-publisher rollout gating')
ON CONFLICT (flag_key) DO NOTHING;
