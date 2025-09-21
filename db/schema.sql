-- Schema for a plain Postgres deployment (Neon/Railway/Render)
-- Create dedicated schema
CREATE SCHEMA IF NOT EXISTS wisdomintech;
SET search_path TO wisdomintech, public;

-- Users/profile mapping (optional if you keep Supabase Auth; store minimal profile)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  full_name text,
  created_at timestamptz DEFAULT now()
);

-- Site settings (single row)
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text,
  site_tagline text,
  site_description text,
  contact_email text,
  admin_email text,
  enable_video boolean DEFAULT false,
  default_theme text,
  default_font_size text,
  logo_url text,
  favicon_url text,
  social_media jsonb,
  seo_settings jsonb,
  maintenance_mode boolean DEFAULT false,
  custom_css text,
  custom_js text,
  ui jsonb,
  ads jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  featured_image text,
  gallery_images text[], -- for gallery type
  type text DEFAULT 'image', -- image | video | gallery
  video_url text,
  video_poster text,
  tags text[],
  category text,
  status text DEFAULT 'draft', -- draft | published | archived
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  featured_image text,
  tags text[],
  category text,
  status text DEFAULT 'draft',
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name text,
  author_email text,
  content text NOT NULL,
  status text DEFAULT 'approved', -- approved|pending|rejected
  created_at timestamptz DEFAULT now()
);

-- Hero slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  cta_label text,
  cta_url text,
  status text DEFAULT 'published',
  display_order int DEFAULT 1,
  view_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Likes table (generic)
CREATE TABLE IF NOT EXISTS likes (
  id bigserial PRIMARY KEY,
  content_type text NOT NULL, -- 'project' | 'blog_post' | 'hero_slide'
  project_id uuid,
  blog_post_id uuid,
  slide_id uuid,
  visitor_ip inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(blog_post_id);

-- Helper functions (optional, app now calculates without RPCs)
-- You can add triggers to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'projects_set_updated_at') THEN
    CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'blog_posts_set_updated_at') THEN
    CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'hero_slides_set_updated_at') THEN
    CREATE TRIGGER hero_slides_set_updated_at BEFORE UPDATE ON hero_slides
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'likes_content_check') THEN
    ALTER TABLE likes
      ADD CONSTRAINT likes_content_check CHECK (
        (content_type = 'project' AND project_id IS NOT NULL) OR
        (content_type = 'blog_post' AND blog_post_id IS NOT NULL) OR
        (content_type = 'hero_slide' AND slide_id IS NOT NULL)
      );
  END IF;
END $$;
