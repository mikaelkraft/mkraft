#!/usr/bin/env node
/* Simple migration runner for db/wisdomintech_schema.sql */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  const schemaPath = path.join(__dirname, '..', 'db', 'wisdomintech_schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found at', schemaPath);
    process.exit(1);
  }
  const baseSql = fs.readFileSync(schemaPath, 'utf8');
  // Collect patch files (prefixed with patch_*) and apply sequentially after base schema
  const dbDir = path.join(__dirname, '..', 'db');
  const patchFiles = fs.readdirSync(dbDir)
    .filter(f => /^patch_\d+.*\.sql$/.test(f))
    .sort();
  const patchSql = patchFiles.map(f => {
    const p = path.join(dbDir, f);
    return `-- Begin Patch: ${f}\n` + fs.readFileSync(p, 'utf8') + `\n-- End Patch: ${f}`;
  }).join('\n\n');
  const fullSql = baseSql + '\n\n' + patchSql;
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('POSTGRES_URL (or DATABASE_URL) env var is required');
    process.exit(1);
  }
  const ssl = process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false;
  const pool = new Pool({ connectionString, ssl });
  const client = await pool.connect();
  try {
    console.log('Applying base schema...');
    await client.query(baseSql);
    if (patchFiles.length) {
      console.log('Applying patches:', patchFiles.join(', '));
      await client.query(patchSql);
    } else {
      console.log('No patch files detected.');
    }
    console.log('Migration completed successfully.');
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
