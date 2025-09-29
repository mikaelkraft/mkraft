-- User Moderation: warnings & bans
-- Adds moderation fields to user_profiles to support admin warning & banning workflows.

ALTER TABLE wisdomintech.user_profiles
  ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS warning_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_warning_at TIMESTAMPTZ;

-- Index to quickly filter banned users
CREATE INDEX IF NOT EXISTS idx_user_profiles_banned ON wisdomintech.user_profiles(banned) WHERE banned = true;
-- Partial index for users with warnings (optional for reporting)
CREATE INDEX IF NOT EXISTS idx_user_profiles_warning_count ON wisdomintech.user_profiles(warning_count) WHERE warning_count > 0;
