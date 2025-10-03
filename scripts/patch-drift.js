#!/usr/bin/env node
/**
 * patch-drift.js
 * Recompute SHA-256 hashes for all patch_*.sql files and compare to stored patch_hash values.
 * Exits non-zero if drift is detected (hash mismatch for an applied patch).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

(async () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL (or DATABASE_URL) env var is required");
    process.exit(2);
  }
  const ssl =
    process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false;
  const pool = new Pool({ connectionString, ssl });
  const client = await pool.connect();
  try {
    const dbDir = path.join(process.cwd(), "db");
    const patchFiles = fs
      .readdirSync(dbDir)
      .filter((f) => /^patch_\d+.*\.sql$/.test(f))
      .sort();

    // Load applied patch hashes
    let rows = [];
    try {
      const r = await client.query(
        "SELECT patch_name, patch_hash FROM wisdomintech.__applied_patches",
      );
      rows = r.rows;
    } catch (e) {
      console.error("Could not read __applied_patches:", e.message);
      process.exit(3);
    }
    const map = Object.fromEntries(
      rows.map((r) => [r.patch_name, r.patch_hash]),
    );

    let drift = false;
    for (const f of patchFiles) {
      const marker = f.replace(/\.sql$/, "");
      const full = path.join(dbDir, f);
      const sql = fs.readFileSync(full, "utf8");
      const hash = crypto.createHash("sha256").update(sql).digest("hex");
      const stored = map[marker];
      if (stored && stored !== hash) {
        console.error(
          `[DRIFT] ${f}: stored hash ${stored.slice(0, 12)} != current ${hash.slice(0, 12)}`,
        );
        drift = true;
      }
      if (!stored) {
        console.warn(`[INFO] ${f}: not applied yet (no stored hash)`);
      }
    }

    if (drift) {
      console.error(
        "\nPatch drift detected. Create compensating patch instead of editing history.",
      );
      process.exit(1);
    } else {
      console.log("No patch drift detected.");
    }
  } finally {
    client.release();
    await pool.end();
  }
})();
