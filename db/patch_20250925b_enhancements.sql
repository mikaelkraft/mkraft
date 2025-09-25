-- Enhancement Patch (2025-09-25 B)
-- Adds comment count maintenance triggers, optional theme presets default data, and supporting indexes.

-- Function: Recalculate comment_count for a blog post (approved only)
CREATE OR REPLACE FUNCTION wisdomintech.recalc_blog_post_comment_count(p_blog_post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE wisdomintech.blog_posts bp
    SET comment_count = (
      SELECT count(1)
      FROM wisdomintech.comments c
      WHERE c.blog_post_id = bp.id AND c.is_approved = true
    )
  WHERE bp.id = p_blog_post_id;
END;$$ LANGUAGE plpgsql;

-- Trigger function for INSERT/DELETE/UPDATE on comments
CREATE OR REPLACE FUNCTION wisdomintech.comments_change_recount()
RETURNS trigger AS $$
DECLARE
  affected uuid;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.is_approved THEN
      affected := NEW.blog_post_id;
      PERFORM wisdomintech.recalc_blog_post_comment_count(affected);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.is_approved THEN
      affected := OLD.blog_post_id;
      PERFORM wisdomintech.recalc_blog_post_comment_count(affected);
    END IF;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (COALESCE(OLD.is_approved,false) <> COALESCE(NEW.is_approved,false)) THEN
      affected := NEW.blog_post_id;
      PERFORM wisdomintech.recalc_blog_post_comment_count(affected);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_comments_change_recount ON wisdomintech.comments;
CREATE TRIGGER trg_comments_change_recount
AFTER INSERT OR DELETE OR UPDATE OF is_approved ON wisdomintech.comments
FOR EACH ROW EXECUTE FUNCTION wisdomintech.comments_change_recount();

-- Index optimization for moderation queries
CREATE INDEX IF NOT EXISTS idx_wit_comments_blog_post_id_approved ON wisdomintech.comments(blog_post_id, is_approved);

-- Theme presets injection if absent
UPDATE wisdomintech.site_settings
SET ui = COALESCE(ui, '{}'::jsonb) || jsonb_build_object(
  'theme_presets', jsonb_build_array(
    jsonb_build_object('name','cyberpunk','accent','#ff00ff','primary','#00f6ff','background','#030014'),
    jsonb_build_object('name','neural','accent','#6ee7b7','primary','#3b82f6','background','#0b1120'),
    jsonb_build_object('name','futuristic','accent','#f59e0b','primary','#6366f1','background','#10172a'),
    jsonb_build_object('name','light','accent','#2563eb','primary','#111827','background','#ffffff')
  )
)
WHERE (ui IS NULL) OR (NOT (ui ? 'theme_presets'));

INSERT INTO wisdomintech.__applied_patches (patch_name)
VALUES ('patch_20250925b_enhancements')
ON CONFLICT (patch_name) DO NOTHING;
