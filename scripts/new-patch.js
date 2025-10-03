#!/usr/bin/env node
// Usage: node scripts/new-patch.js short_description_words
// Generates db/patch_YYYYMMDD[a-z]_short_description.sql with template.
const fs = require("fs");
const path = require("path");

function slugify(parts) {
  return parts
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error(
    "Provide a short description, e.g.: node scripts/new-patch.js add_user_avatar",
  );
  process.exit(1);
}

const date = new Date();
const y = date.getFullYear();
const m = String(date.getMonth() + 1).padStart(2, "0");
const d = String(date.getDate()).padStart(2, "0");
// Determine suffix letter if multiple patches same day
const dbDir = path.join(__dirname, "..", "db");
const existing = fs
  .readdirSync(dbDir)
  .filter((f) => f.startsWith(`patch_${y}${m}${d}`));
let suffix = ""; // '' for first, then a,b,c,...
if (existing.length) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  suffix = letters[existing.length - 1] || "x" + existing.length;
}

const desc = slugify(args);
const filename = `patch_${y}${m}${d}${suffix ? suffix : ""}_${desc}.sql`;
const fullPath = path.join(dbDir, filename);

if (fs.existsSync(fullPath)) {
  console.error("File already exists:", fullPath);
  process.exit(1);
}

const template = `-- Patch: ${desc.replace(/_/g, " ")} (${y}-${m}-${d})\n-- Idempotent migration template. Include only additive / safe operations.\n-- Pattern: apply DDL with IF NOT EXISTS / CREATE OR REPLACE, then insert marker.\n\nCREATE TABLE IF NOT EXISTS wisdomintech.__applied_patches (\n  patch_name TEXT PRIMARY KEY,\n  applied_at TIMESTAMPTZ DEFAULT now(),\n  patch_hash TEXT\n);\n\n-- TODO: Add DDL / DML here (wrap destructive changes in new compensating patch instead of editing history).\n\nINSERT INTO wisdomintech.__applied_patches(patch_name) VALUES('${filename.replace(/\.sql$/, "")}')\nON CONFLICT (patch_name) DO NOTHING;\n`;

fs.writeFileSync(fullPath, template, "utf8");
console.log("Created patch file:", path.relative(process.cwd(), fullPath));
