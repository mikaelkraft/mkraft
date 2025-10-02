#!/usr/bin/env node
/* Simple migration runner for db/wisdomintech_schema.sql */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  const schemaPath = path.join(
    __dirname,
    "..",
    "db",
    "wisdomintech_schema.sql",
  );
  if (!fs.existsSync(schemaPath)) {
    console.error("Schema file not found at", schemaPath);
    process.exit(1);
  }
  const baseSql = fs.readFileSync(schemaPath, "utf8");
  // Collect patch files (prefixed with patch_*) and apply sequentially after base schema
  const dbDir = path.join(__dirname, "..", "db");
  const patchFiles = fs
    .readdirSync(dbDir)
    .filter((f) => /^patch_\d+.*\.sql$/.test(f))
    .sort();
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("POSTGRES_URL (or DATABASE_URL) env var is required");
    process.exit(1);
  }
  const ssl =
    process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: false } : false;
  const pool = new Pool({ connectionString, ssl });
  const client = await pool.connect();
  try {
    console.log("Applying base schema (idempotent)...");
    await client.query(baseSql);

    // Ensure marker table exists early so we can query it even if base already had it
    await client.query(
      "CREATE TABLE IF NOT EXISTS wisdomintech.__applied_patches (patch_name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())",
    );

    // Fetch already applied patch names
    const { rows: appliedRows } = await client.query(
      "SELECT patch_name FROM wisdomintech.__applied_patches",
    );
    const applied = new Set(appliedRows.map((r) => r.patch_name));

    const toApply = [];
    for (const f of patchFiles) {
      // Derive patch marker key convention: file name without .sql
      const marker = f.replace(/\.sql$/, "");
      if (!applied.has(marker)) toApply.push(f);
    }

    if (toApply.length) {
      console.log("Patches to apply:", toApply.join(", "));
      for (const f of toApply) {
        const p = path.join(dbDir, f);
        const sql = fs.readFileSync(p, "utf8");
        console.log("-> Applying", f);
        await client.query(sql);
        // If patch itself did not insert marker, insert defensively
        const marker = f.replace(/\.sql$/, "");
        await client.query(
          "INSERT INTO wisdomintech.__applied_patches (patch_name) VALUES ($1) ON CONFLICT (patch_name) DO NOTHING",
          [marker],
        );
      }
    } else {
      console.log("No new patches to apply.");
    }
    console.log("Migration completed successfully.");
  } catch (e) {
    console.error("Migration failed:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
