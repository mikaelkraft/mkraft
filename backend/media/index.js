const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin, verifyAuth } = require("../_lib/auth.js");

// GET /api/media?limit=20&offset=0&tag=logo
// (Phase 1: read-only listing; future phases add upload + metadata extraction.)
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return error(res, "Method not allowed", 405);
    // Auth: allow only admin for now (can open later)
    const admin = await requireAdmin(req, res);
    if (!admin) return; // response already sent

    const { resolveBaseUrl } = require("../_lib/respond.js");
    const url = new URL(req.url, resolveBaseUrl());
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "20", 10),
      100,
    );
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const tag = url.searchParams.get("tag");
    const params = [];
    let where = "";
    if (tag) {
      params.push(tag);
      where = `WHERE $${params.length} = ANY(tags)`;
    }
    params.push(limit, offset);
    const { rows } = await query(
      `SELECT id, url, mime_type, width, height, size_bytes, alt, tags, created_at
       FROM wisdomintech.media_assets
       ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    return json(res, { items: rows, count: rows.length });
  } catch (e) {
    return error(res, "Failed to list media assets", 500, {
      detail: e.message,
    });
  }
};
