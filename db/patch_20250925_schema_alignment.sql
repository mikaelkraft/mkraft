-- Schema alignment patch (2025-09-25)
-- Adds columns referenced by API/UI but absent in base portable schema.
-- Safe to run multiple times (uses IF NOT EXISTS patterns / tolerant updates).

-- blog_posts: external/source reference
ALTER TABLE wisdomintech.blog_posts
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- site_settings: resume, hero image, ui + ads JSON blobs
ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS resume_url TEXT;
ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS ui JSONB DEFAULT '{}'::jsonb;
ALTER TABLE wisdomintech.site_settings
  ADD COLUMN IF NOT EXISTS ads JSONB DEFAULT '{}'::jsonb;

-- hero_slides: image_url alias for background_image (UI expects image_url)
ALTER TABLE wisdomintech.hero_slides
  ADD COLUMN IF NOT EXISTS image_url TEXT;
-- Backfill image_url from background_image if empty
UPDATE wisdomintech.hero_slides SET image_url = background_image
  WHERE image_url IS NULL AND background_image IS NOT NULL;

-- Optional future linking from slide to a blog post (prepare for feature)
ALTER TABLE wisdomintech.hero_slides
  ADD COLUMN IF NOT EXISTS blog_post_id UUID REFERENCES wisdomintech.blog_posts(id) ON DELETE SET NULL;

-- Index for potential blog post linkage lookups
CREATE INDEX IF NOT EXISTS idx_wit_slides_blog_post_id ON wisdomintech.hero_slides(blog_post_id);

-- Comment count integrity helpers (future: if we add triggers)
-- (Placeholder comment; triggers not yet created in this patch.)

-- Marker table for applied patches (idempotent pattern)
CREATE TABLE IF NOT EXISTS wisdomintech.__applied_patches (
  patch_name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250925_schema_alignment')
ON CONFLICT (patch_name) DO NOTHING;
