const { json, error } = require("../_lib/respond.js");
const { query } = require("../_lib/db.js");
const fs = require("fs");
const path = require("path");
const nodeCrypto = require("crypto");

// GET /api/migrate -> basic info placeholder
// GET /api/migrate/drift -> drift detection report
module.exports = async function handler(req, res) {
  try {
    const url = req.url || "";
    if (/\/drift(?:\?|$)/.test(url)) {
      return await drift(req, res);
    }
    return json(res, { status: "ok", message: "migrate endpoint" });
  } catch (e) {
    return error(res, "migrate error", 500, { detail: e.message });
  }
};

async function drift(_req, res) {
  try {
    // load applied patches with hashes
    let applied = [];
    try {
      const r = await query(
        "SELECT patch_name, patch_hash FROM wisdomintech.__applied_patches ORDER BY applied_at ASC",
      );
      applied = r.rows;
    } catch (e) {
      return error(res, "patch table missing", 500, { detail: e.message });
    }
    const map = Object.fromEntries(
      applied.map((r) => [r.patch_name, r.patch_hash]),
    );
    const dbDir = path.join(process.cwd(), "db");
    const patchFiles = fs
      .readdirSync(dbDir)
      .filter((f) => /^patch_\d+.*\.sql$/.test(f))
      .sort();
    const mismatches = [];
    const pending = [];
    for (const f of patchFiles) {
      const marker = f.replace(/\.sql$/, "");
      const sql = fs.readFileSync(path.join(dbDir, f), "utf8");
      const hash = nodeCrypto.createHash("sha256").update(sql).digest("hex");
      const stored = map[marker];
      if (stored && stored !== hash) {
        mismatches.push({ patch: marker, stored, current: hash });
      } else if (!stored) {
        pending.push({ patch: marker, current: hash });
      }
    }
    return json(res, {
      status: "ok",
      mismatches,
      pending,
      applied: applied.length,
      drift: mismatches.length > 0,
    });
  } catch (e) {
    return error(res, "drift error", 500, { detail: e.message });
  }
}
