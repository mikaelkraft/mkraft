const { json, error, getUrl } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const { getJsonBody } = require("../_lib/body.js");
const { getUserWithRole, requireAdmin } = require("../_lib/auth.js");

// Simple in-memory rate limit (process scoped). For production, replace with Redis.
const RL_WINDOW_MS = 60_000; // 1 min
const RL_MAX = 10; // 10 profile writes per minute per user
const rateMap = new Map();

function checkRate(userId) {
  const now = Date.now();
  const bucket = rateMap.get(userId) || { ts: now, count: 0 };
  if (now - bucket.ts > RL_WINDOW_MS) {
    bucket.ts = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  rateMap.set(userId, bucket);
  if (bucket.count > RL_MAX) return false;
  return true;
}

async function loadRules() {
  const { rows } = await query(
    "SELECT field_name, enabled, editable_roles, required FROM wisdomintech.profile_field_rules",
    [],
  );
  const map = {};
  rows.forEach((r) => {
    map[r.field_name] = r;
  });
  return map;
}

module.exports = async function handler(req, res) {
  try {
    const url = getUrl(req);
    if (req.method === "GET") {
      const me = await getUserWithRole(req);
      if (!me) return error(res, "Unauthorized", 401);
      const targetId =
        url.searchParams.get("userId") && me.role === "admin"
          ? url.searchParams.get("userId")
          : me.id;
      const { rows } = await query(
        `SELECT id, email, full_name, avatar_url, role, bio, website_url, twitter_handle, github_handle, linkedin_handle, location, headline, profile_meta, banned, warning_count FROM wisdomintech.user_profiles WHERE id = $1`,
        [targetId],
      );
      if (!rows.length) return error(res, "Not found", 404);
      const rules = await loadRules();
      // Filter out disabled fields for non-admin
      const profile = rows[0];
      if (me.role !== "admin") {
        Object.keys(rules).forEach((field) => {
          if (!rules[field].enabled) delete profile[field];
        });
      }
      return json(res, {
        profile,
        editable_fields: Object.entries(rules)
          .filter(([k, v]) => v.enabled && v.editable_roles.includes(me.role))
          .map(([k]) => k),
      });
    }
    if (req.method === "PUT") {
      const me = await getUserWithRole(req);
      if (!me) return error(res, "Unauthorized", 401);
      const body = await getJsonBody(req);
      const rules = await loadRules();
      const targetUserId =
        body.userId && me.role === "admin" ? body.userId : me.id;
      if (!checkRate(targetUserId))
        return error(res, "Rate limit exceeded", 429);
      // Build update
      const allowedFields = [
        "full_name",
        "bio",
        "website_url",
        "twitter_handle",
        "github_handle",
        "linkedin_handle",
        "location",
        "headline",
        "profile_meta",
        "avatar_url",
      ];
      const sets = [];
      const params = [targetUserId];
      let i = 2;
      const changed = [];
      // Load existing for audit
      const { rows: existingRows } = await query(
        "SELECT * FROM wisdomintech.user_profiles WHERE id = $1",
        [targetUserId],
      );
      const existing = existingRows[0] || {};
      // Normalization helpers
      const normUrl = (u) => {
        if (!u) return u;
        let v = String(u).trim();
        if (!/^https?:\/\//i.test(v)) v = "https://" + v; // enforce protocol
        return v.slice(0, 500);
      };
      const normHandle = (h) =>
        h ? String(h).trim().replace(/^@+/, "").slice(0, 50) : h;
      for (const f of allowedFields) {
        if (!(f in body)) continue;
        const rule = rules[f];
        if (!rule || !rule.enabled) continue; // skip disabled entirely
        if (
          me.role !== "admin" &&
          !(rule.editable_roles || []).includes(me.role)
        )
          continue;
        let val = body[f];
        if (f.endsWith("_handle")) val = normHandle(val);
        if (f === "website_url") val = normUrl(val);
        if (f === "avatar_url") val = normUrl(val);
        if (typeof val === "string") val = val.trim();
        if (JSON.stringify(existing[f]) !== JSON.stringify(val)) {
          changed.push({ field: f, old: existing[f], val });
        }
        sets.push(`${f} = $${i}`);
        params.push(val);
        i++;
      }
      if (!sets.length) return error(res, "No editable fields in payload", 400);
      // Required field enforcement (after applying user-intent but before update): ensure all required fields either already present or in payload
      const missingRequired = Object.entries(rules)
        .filter(([k, r]) => r.required && r.enabled)
        .filter(([k]) => {
          if (!allowedFields.includes(k)) return false; // not a managed field
          const newVal = changed.find((c) => c.field === k)?.val;
          const finalVal = newVal !== undefined ? newVal : existing[k];
          return finalVal == null || finalVal === "";
        })
        .map(([k]) => k);
      if (missingRequired.length)
        return error(res, "Missing required fields", 400, {
          fields: missingRequired,
        });
      sets.push("updated_at = now()");
      const sql = `UPDATE wisdomintech.user_profiles SET ${sets.join(", ")} WHERE id = $1 RETURNING id, email, full_name, avatar_url, role, bio, website_url, twitter_handle, github_handle, linkedin_handle, location, headline, profile_meta`;
      const { rows } = await query(sql, params);
      if (!rows.length) return error(res, "Not found", 404);
      // Audit log inserts
      for (const c of changed) {
        await query(
          `INSERT INTO wisdomintech.profile_change_events (user_id, actor_id, field_name, old_value, new_value) VALUES ($1,$2,$3,$4,$5)`,
          [
            targetUserId,
            me.id,
            c.field,
            c.old == null ? null : String(c.old).slice(0, 1000),
            c.val == null
              ? null
              : typeof c.val === "string"
                ? c.val.slice(0, 1000)
                : JSON.stringify(c.val).slice(0, 1000),
          ],
        );
      }
      return json(res, rows[0]);
    }
    return error(res, "Method not allowed", 405);
  } catch (e) {
    return error(res, "Failed to process profile", 500, { detail: e.message });
  }
};
