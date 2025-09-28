#!/usr/bin/env node
/**
 * Suggest commit scope(s) based on staged file paths.
 * Non-fatal helper. Usage: node scripts/suggest-scope.js $COMMIT_MSG_FILE
 */
const { execSync } = require('child_process');

function getStaged() {
  try {
    const out = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch { return []; }
}

function deriveScopes(files) {
  const scopes = new Set();
  files.forEach(f => {
    if (f.startsWith('src/pages/')) scopes.add('pages');
    else if (f.startsWith('src/components/')) scopes.add('components');
    else if (f.startsWith('src/utils/')) scopes.add('utils');
    else if (f.startsWith('api/')) scopes.add('api');
    else if (f.startsWith('db/')) scopes.add('db');
    else if (f.startsWith('scripts/')) scopes.add('scripts');
    else if (f.startsWith('test/')) scopes.add('test');
    else if (f.startsWith('src/hooks/')) scopes.add('hooks');
  });
  return Array.from(scopes).slice(0,5);
}

function main() {
  const msgFile = process.argv[2];
  if (!msgFile) return;
  const files = getStaged();
  const scopes = deriveScopes(files);
  if (scopes.length) {
    process.stderr.write(`\nHint: possible scopes -> ${scopes.join(', ')}\n`);
  }
}

main();
