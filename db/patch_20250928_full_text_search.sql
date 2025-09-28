-- Full Text Search foundations for blog posts
-- Adds tsvector column, backfills, index, and trigger for maintenance

ALTER TABLE wisdomintech.blog_posts
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Backfill existing rows
UPDATE wisdomintech.blog_posts SET search_vector = 
  setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
  setweight(to_tsvector('english', coalesce(excerpt,'')), 'B') ||
  setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '),'')), 'C') ||
  setweight(to_tsvector('english', coalesce(content,'')), 'D');

CREATE INDEX IF NOT EXISTS blog_posts_search_vector_idx
  ON wisdomintech.blog_posts USING GIN (search_vector);

CREATE OR REPLACE FUNCTION wisdomintech.blog_posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags,' '),'')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.content,'')), 'D');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_search_vector_tgr ON wisdomintech.blog_posts;
CREATE TRIGGER blog_posts_search_vector_tgr
BEFORE INSERT OR UPDATE ON wisdomintech.blog_posts
FOR EACH ROW EXECUTE FUNCTION wisdomintech.blog_posts_search_vector_update();
