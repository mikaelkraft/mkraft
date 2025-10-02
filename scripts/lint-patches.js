#!/usr/bin/env node
/** Patch linter: ensures each patch inserts marker & discourages large DO blocks */
const fs = require("fs");
const path = require("path");

const dbDir = path.join(__dirname, "..", "db");
const patchFiles = fs
  .readdirSync(dbDir)
  .filter((f) => /^patch_\d+.*\.sql$/.test(f))
  .sort();
let failed = false;

for (const f of patchFiles) {
  const full = path.join(dbDir, f);
  const sql = fs.readFileSync(full, "utf8");
  const marker = f.replace(/\.sql$/, "");
  if (!new RegExp(marker.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$")).test(sql)) {
    console.error(`[patch-lint] ${f}: missing self marker string '${marker}'`);
    failed = true;
  }
  // Discourage procedural DO blocks unless absolutely needed
  const doCount = (sql.match(/DO\s+\$\$/gi) || []).length;
  if (doCount > 1) {
    console.warn(
      `[patch-lint] ${f}: contains multiple DO $$ blocks (consider refactor)`,
    );
  }
  if (/EXECUTE\s+'CREATE TRIGGER/gi.test(sql)) {
    console.warn(
      `[patch-lint] ${f}: dynamic EXECUTE for triggers (static CREATE preferred)`,
    );
  }
}

if (failed) {
  console.error("\nPatch lint failed. Fix issues above.");
  process.exit(1);
} else {
  console.log("Patch lint passed.");
}
