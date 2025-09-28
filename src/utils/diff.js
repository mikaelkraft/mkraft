// Minimal line-based diff (LCS not required for simple visual)
export function simpleLineDiff(before = '', after = '') {
  const beforeLines = before.split(/\r?\n/);
  const afterLines = after.split(/\r?\n/);
  const max = Math.max(beforeLines.length, afterLines.length);
  const rows = [];
  for (let i = 0; i < max; i++) {
    const a = beforeLines[i];
    const b = afterLines[i];
    if (a === b) {
      rows.push({ type: 'context', before: a, after: b });
    } else {
      if (a !== undefined) rows.push({ type: 'remove', before: a, after: '' });
      if (b !== undefined) rows.push({ type: 'add', before: '', after: b });
    }
  }
  return rows;
}
