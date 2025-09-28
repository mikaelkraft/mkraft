#!/usr/bin/env node
/**
 * Conventional Commit message validator.
 * Allowed types: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
 * Format: type(scope?): subject
 * Examples:
 *   feat(search): add snippet highlighting
 *   fix: handle null excerpt in related posts
 */

const fs = require('fs');

const msgFile = process.argv[2];
const message = fs.readFileSync(msgFile, 'utf8').trim();

const ALLOWED = [
  'feat','fix','chore','docs','style','refactor','perf','test','build','ci','revert'
];

// Regex breakdown:
// ^(type)(\([^)]+\))?: (.+)$
// - type from list
// - optional (scope)
// - colon + space
// - subject (non-empty)
const pattern = new RegExp(`^(${ALLOWED.join('|')})(\\([^)]+\\))?: .+`);

if (!pattern.test(message)) {
  console.error('\nInvalid commit message:\n  ' + message + '\n');
  console.error('Expected format: type(scope?): subject');
  console.error('Allowed types: ' + ALLOWED.join(', '));
  console.error('Examples:');
  console.error('  feat(search): add snippet highlighting');
  console.error('  fix: handle null excerpt in related posts');
  process.exit(1);
}

process.exit(0);
