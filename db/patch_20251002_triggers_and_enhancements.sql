-- Patch: triggers and safe additive enhancements (2025-10-02)
-- Applies generic updated_at trigger function, comment_count maintenance,
-- soft delete columns, and like_count integrity triggers. Idempotent.

-- Ensure marker table exists
CREATE TABLE IF NOT EXISTS wisdomintech.__applied_patches (
  patch_name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- 1. Generic updated_at trigger function (schema-qualified)
CREATE OR REPLACE FUNCTION wisdomintech.set_updated_at()
RETURNS TRIGGER AS $f$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$f$ LANGUAGE plpgsql;

-- Recreate updated_at triggers (idempotent by drop/create)
DROP TRIGGER IF EXISTS user_profiles_set_updated_at ON wisdomintech.user_profiles;
CREATE TRIGGER user_profiles_set_updated_at BEFORE UPDATE ON wisdomintech.user_profiles FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON wisdomintech.site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON wisdomintech.site_settings FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

DROP TRIGGER IF EXISTS projects_set_updated_at ON wisdomintech.projects;
CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON wisdomintech.projects FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON wisdomintech.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON wisdomintech.blog_posts FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

DROP TRIGGER IF EXISTS hero_slides_set_updated_at ON wisdomintech.hero_slides;
CREATE TRIGGER hero_slides_set_updated_at BEFORE UPDATE ON wisdomintech.hero_slides FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

DROP TRIGGER IF EXISTS comments_set_updated_at ON wisdomintech.comments;
CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON wisdomintech.comments FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

DROP TRIGGER IF EXISTS newsletter_subscribers_set_updated_at ON wisdomintech.newsletter_subscribers;
CREATE TRIGGER newsletter_subscribers_set_updated_at BEFORE UPDATE ON wisdomintech.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION wisdomintech.set_updated_at();

-- 2. Soft delete support
ALTER TABLE wisdomintech.blog_posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE wisdomintech.projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE wisdomintech.comments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 3. Comment count maintenance
CREATE OR REPLACE FUNCTION wisdomintech.update_blog_post_comment_count() RETURNS TRIGGER AS $c$
BEGIN
  UPDATE wisdomintech.blog_posts b
    SET comment_count = (SELECT count(*) FROM wisdomintech.comments c WHERE c.blog_post_id = b.id AND c.deleted_at IS NULL)
    WHERE b.id = COALESCE(NEW.blog_post_id, OLD.blog_post_id);
  RETURN NEW;
END;
$c$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS comments_after_insert_count ON wisdomintech.comments;
CREATE TRIGGER comments_after_insert_count
  AFTER INSERT ON wisdomintech.comments
  FOR EACH ROW EXECUTE FUNCTION wisdomintech.update_blog_post_comment_count();

DROP TRIGGER IF EXISTS comments_after_update_count ON wisdomintech.comments;
CREATE TRIGGER comments_after_update_count
  AFTER UPDATE ON wisdomintech.comments
  FOR EACH ROW EXECUTE FUNCTION wisdomintech.update_blog_post_comment_count();

DROP TRIGGER IF EXISTS comments_after_delete_count ON wisdomintech.comments;
CREATE TRIGGER comments_after_delete_count
  AFTER DELETE ON wisdomintech.comments
  FOR EACH ROW EXECUTE FUNCTION wisdomintech.update_blog_post_comment_count();

-- 4. Like count integrity
CREATE OR REPLACE FUNCTION wisdomintech.recalculate_like_counts() RETURNS TRIGGER AS $l$
BEGIN
  UPDATE wisdomintech.projects p
    SET like_count = (SELECT count(*) FROM wisdomintech.likes l WHERE l.project_id = p.id)
    WHERE (NEW.project_id IS NOT NULL AND p.id = NEW.project_id) OR (OLD.project_id IS NOT NULL AND p.id = OLD.project_id);
  UPDATE wisdomintech.blog_posts b
    SET like_count = (SELECT count(*) FROM wisdomintech.likes l WHERE l.blog_post_id = b.id)
    WHERE (NEW.blog_post_id IS NOT NULL AND b.id = NEW.blog_post_id) OR (OLD.blog_post_id IS NOT NULL AND b.id = OLD.blog_post_id);
  RETURN NEW;
END;
$l$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS likes_after_insert_recount ON wisdomintech.likes;
CREATE TRIGGER likes_after_insert_recount
  AFTER INSERT ON wisdomintech.likes
  FOR EACH ROW EXECUTE FUNCTION wisdomintech.recalculate_like_counts();

DROP TRIGGER IF EXISTS likes_after_delete_recount ON wisdomintech.likes;
CREATE TRIGGER likes_after_delete_recount
  AFTER DELETE ON wisdomintech.likes
  FOR EACH ROW EXECUTE FUNCTION wisdomintech.recalculate_like_counts();

-- 5. Patch marker (idempotent)
INSERT INTO wisdomintech.__applied_patches (patch_name) VALUES ('patch_20251002_triggers_and_enhancements')
  ON CONFLICT (patch_name) DO NOTHING;
