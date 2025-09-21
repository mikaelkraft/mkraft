-- Portable schema for WisdomInTech API (no Supabase auth dependency)
CREATE SCHEMA IF NOT EXISTS wisdomintech;
-- Required for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Basic tables
CREATE TABLE IF NOT EXISTS wisdomintech.user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wisdomintech.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT,
  site_tagline TEXT,
  site_description TEXT,
  contact_email TEXT,
  admin_email TEXT,
  enable_video BOOLEAN DEFAULT true,
  default_theme TEXT,
  default_font_size TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  social_media JSONB DEFAULT '{}',
  seo_settings JSONB DEFAULT '{}',
  maintenance_mode BOOLEAN DEFAULT false,
  custom_css TEXT,
  custom_js TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wisdomintech.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  featured_image TEXT,
  gallery_images JSONB,
  type TEXT DEFAULT 'image',
  video_url TEXT,
  video_poster TEXT,
  tags TEXT[],
  category TEXT,
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES wisdomintech.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wisdomintech.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  tags TEXT[],
  category TEXT,
  status TEXT DEFAULT 'draft',
  read_time INTEGER,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  author_id UUID REFERENCES wisdomintech.user_profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wisdomintech.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  background_image TEXT,
  cta_text TEXT,
  cta_link TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  duration INTEGER DEFAULT 5,
  status TEXT DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wisdomintech.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES wisdomintech.blog_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES wisdomintech.comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  visitor_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wisdomintech.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES wisdomintech.blog_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES wisdomintech.comments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES wisdomintech.projects(id) ON DELETE CASCADE,
  visitor_ip TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT likes_single_target CHECK (
    (blog_post_id IS NOT NULL AND comment_id IS NULL AND project_id IS NULL) OR
    (blog_post_id IS NULL AND comment_id IS NOT NULL AND project_id IS NULL) OR
    (blog_post_id IS NULL AND comment_id IS NULL AND project_id IS NOT NULL)
  ),
  UNIQUE(blog_post_id, visitor_ip),
  UNIQUE(comment_id, visitor_ip),
  UNIQUE(project_id, visitor_ip)
);

-- Simple helper functions used by API endpoints
CREATE OR REPLACE FUNCTION wisdomintech.increment_view_count(content_type TEXT, content_id UUID)
RETURNS VOID AS $$
BEGIN
  CASE content_type
    WHEN 'project' THEN UPDATE wisdomintech.projects SET view_count = view_count + 1 WHERE id = content_id;
    WHEN 'blog_post' THEN UPDATE wisdomintech.blog_posts SET view_count = view_count + 1 WHERE id = content_id;
    WHEN 'hero_slide' THEN UPDATE wisdomintech.hero_slides SET view_count = view_count + 1 WHERE id = content_id;
  END CASE;
END;$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION wisdomintech.toggle_like(content_type TEXT, content_id UUID, visitor_ip_addr TEXT, user_agent_str TEXT)
RETURNS BOOLEAN AS $$
DECLARE like_exists BOOLEAN := false; col TEXT; tbl TEXT; BEGIN
  CASE content_type
    WHEN 'blog_post' THEN col := 'blog_post_id'; tbl := 'blog_posts';
    WHEN 'comment' THEN col := 'comment_id'; tbl := 'comments';
    WHEN 'project' THEN col := 'project_id'; tbl := 'projects';
    ELSE RAISE EXCEPTION 'Invalid content type: %', content_type;
  END CASE;
  EXECUTE format('SELECT EXISTS(SELECT 1 FROM wisdomintech.likes WHERE %I = $1 AND visitor_ip = $2)', col)
  INTO like_exists USING content_id, visitor_ip_addr;
  IF like_exists THEN
    EXECUTE format('DELETE FROM wisdomintech.likes WHERE %I = $1 AND visitor_ip = $2', col) USING content_id, visitor_ip_addr;
    EXECUTE format('UPDATE wisdomintech.%I SET like_count = like_count - 1 WHERE id = $1', tbl) USING content_id;
    RETURN false;
  ELSE
    IF content_type = 'blog_post' THEN
      INSERT INTO wisdomintech.likes (blog_post_id, visitor_ip, user_agent) VALUES (content_id, visitor_ip_addr, user_agent_str);
    ELSIF content_type = 'comment' THEN
      INSERT INTO wisdomintech.likes (comment_id, visitor_ip, user_agent) VALUES (content_id, visitor_ip_addr, user_agent_str);
    ELSE
      INSERT INTO wisdomintech.likes (project_id, visitor_ip, user_agent) VALUES (content_id, visitor_ip_addr, user_agent_str);
    END IF;
    EXECUTE format('UPDATE wisdomintech.%I SET like_count = like_count + 1 WHERE id = $1', tbl) USING content_id;
    RETURN true;
  END IF;
END;$$ LANGUAGE plpgsql;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wit_projects_status ON wisdomintech.projects(status);
CREATE INDEX IF NOT EXISTS idx_wit_projects_featured ON wisdomintech.projects(featured);
CREATE INDEX IF NOT EXISTS idx_wit_blog_slug ON wisdomintech.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_wit_blog_status ON wisdomintech.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_wit_blog_published_at ON wisdomintech.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_wit_slides_order ON wisdomintech.hero_slides(display_order);
CREATE INDEX IF NOT EXISTS idx_wit_comments_post_id ON wisdomintech.comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_wit_likes_blog_post_id ON wisdomintech.likes(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_wit_likes_comment_id ON wisdomintech.likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_wit_likes_project_id ON wisdomintech.likes(project_id);
