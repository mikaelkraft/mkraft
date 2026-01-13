const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { rateLimit } = require("../_lib/rateLimit.js");

const toggleLimiter = rateLimit({ windowMs: 60_000, max: 60 });

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") return error(res, "Method not allowed", 405);
    let proceed = false;
    await new Promise((r) =>
      toggleLimiter(req, res, () => {
        proceed = true;
        r();
      }),
    );
    if (!proceed) return;
    let body = "";
    req.on("data", (c) => (body += c));
    await new Promise((r) => req.on("end", r));
    const data = JSON.parse(body || "{}");
    const { content_type, content_id, visitor_ip, user_agent } = data;
    if (!content_type || !content_id)
      return error(res, "content_type and content_id are required");

    // Supported content types
    const cols = {
      project: "projects",
      blog_post: "blog_posts",
      comment: "comments",
    };
    if (!cols[content_type]) return error(res, "invalid content_type", 400);

    // Use helper function from schema to toggle like and update counts
    const { rows } = await query(
      "SELECT wisdomintech.toggle_like($1::text, $2::uuid, $3::text, $4::text) AS liked",
      [content_type, content_id, visitor_ip || null, user_agent || ""],
    );
    const liked = rows?.[0]?.liked === true;

    // Sync aggregate like_count on the target table
    const table = cols[content_type];
    const likeCol =
      content_type === "project"
        ? "project_id"
        : content_type === "blog_post"
          ? "blog_post_id"
          : "comment_id";
    await query(
      `UPDATE wisdomintech.${table} SET like_count = (
      SELECT COUNT(1) FROM wisdomintech.likes WHERE ${likeCol} = $1
    ) WHERE id = $1`,
      [content_id],
    );

    return json(res, { liked });
  } catch (e) {
    return error(res, "Failed to toggle like", 500, { detail: e.message });
  }
};
