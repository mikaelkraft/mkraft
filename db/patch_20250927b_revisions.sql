-- Patch: Add revisions table for blog posts (Track 4)
BEGIN;

CREATE TABLE IF NOT EXISTS wisdomintech.blog_post_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES wisdomintech.blog_posts(id) ON DELETE CASCADE,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  tags TEXT[] ,
  category TEXT,
  status TEXT,
  featured BOOLEAN,
  featured_image TEXT,
  source_url TEXT,
  author_id UUID REFERENCES wisdomintech.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wit_blog_post_revisions_post_id ON wisdomintech.blog_post_revisions(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_wit_blog_post_revisions_created_at ON wisdomintech.blog_post_revisions(created_at);

INSERT INTO wisdomintech.schema_patches (patch_name, applied_at)
VALUES ('20250927b_revisions', now())
ON CONFLICT (patch_name) DO NOTHING;

COMMIT;
