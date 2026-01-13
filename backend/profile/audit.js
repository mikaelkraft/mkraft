const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { requireAdmin } = require("../_lib/auth.js");

// GET /api/profile/audit?userId=...&limit=50
module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") return error(res, "Method not allowed", 405);
    const admin = await requireAdmin(req, res);
    if (!admin) return; // auth helper already responded
    const url = new URL(req.url, "http://localhost");
    const userId = url.searchParams.get("userId");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10) || 50,
      200,
    );
    const params = [];
    let where = "";
    if (userId) {
      where = "WHERE user_id = $1";
      params.push(userId);
    }
    const sql = `SELECT * FROM wisdomintech.profile_change_events ${where} ORDER BY created_at DESC LIMIT ${limit}`;
    const { rows } = await query(sql, params);
    return json(res, rows);
  } catch (e) {
    return error(res, "Failed to load audit log", 500, { detail: e.message });
  }
};
