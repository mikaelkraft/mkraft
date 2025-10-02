// Utility functions that operate on markdown strings given a selection range.
// They return an object { text, selectionStart, selectionEnd } describing the new content
// and suggested cursor selection after insertion.

export function wrapInline(
  md,
  start,
  end,
  prefix,
  suffix = prefix,
  placeholder = "text",
) {
  const before = md.slice(0, start);
  const selected = md.slice(start, end) || placeholder;
  const after = md.slice(end);
  const text = before + prefix + selected + suffix + after;
  const posStart = before.length + prefix.length;
  const posEnd = posStart + selected.length;
  return { text, selectionStart: posStart, selectionEnd: posEnd };
}

export function applyLinePrefix(md, start, end, prefix, placeholder = "text") {
  const before = md.slice(0, start);
  const selected = md.slice(start, end) || placeholder;
  const after = md.slice(end);
  const block = selected.replace(/^/gm, prefix);
  const text = before + block + after;
  return {
    text,
    selectionStart: before.length,
    selectionEnd: before.length + block.length,
  };
}

export function insertCodeBlock(md, start, end) {
  const before = md.slice(0, start);
  const selected = md.slice(start, end) || "code";
  const after = md.slice(end);
  const snippet = `\n\n\
\n${selected}\n\
\n\n`;
  const text = before + snippet + after;
  const cursor = before.length + snippet.length;
  return { text, selectionStart: cursor, selectionEnd: cursor };
}

export function insertPre(md, start, end) {
  const before = md.slice(0, start);
  const selected = md.slice(start, end) || "preformatted text";
  const after = md.slice(end);
  const block = `\n\n<pre>\n${selected}\n</pre>\n\n`;
  const text = before + block + after;
  const cursor = before.length + block.length;
  return { text, selectionStart: cursor, selectionEnd: cursor };
}

export function insertList(md, start, end, ordered = false) {
  const bullet = ordered ? "1." : "-";
  const before = md.slice(0, start);
  const selected = md.slice(start, end) || "item";
  const after = md.slice(end);
  const transformed = selected.replace(/^/gm, `${bullet} `);
  const text = before + transformed + after;
  return {
    text,
    selectionStart: before.length,
    selectionEnd: before.length + transformed.length,
  };
}

export function insertTable(md, pos) {
  const header = "| Col 1 | Col 2 | Col 3 |";
  const sep = "| --- | --- | --- |";
  const row = "| Val 1 | Val 2 | Val 3 |";
  const table = `\n\n${header}\n${sep}\n${row}\n${row}\n${row}\n\n`;
  const before = md.slice(0, pos);
  const after = md.slice(pos);
  const text = before + table + after;
  const cursor = before.length + table.length;
  return { text, selectionStart: cursor, selectionEnd: cursor };
}

export function insertEmoji(md, start, end, emoji) {
  const before = md.slice(0, start);
  const after = md.slice(end);
  const text = before + emoji + after;
  const cursor = before.length + emoji.length;
  return { text, selectionStart: cursor, selectionEnd: cursor };
}

export function insertEmbedHtml(md, pos, html) {
  const before = md.slice(0, pos);
  const after = md.slice(pos);
  const block = `\n\n${html}\n\n`;
  const text = before + block + after;
  const cursor = before.length + block.length;
  return { text, selectionStart: cursor, selectionEnd: cursor };
}

export function insertHeading(md, start, end, level) {
  const hashes = "#".repeat(Math.min(6, Math.max(1, level)));
  return applyLinePrefix(md, start, end, `${hashes} `, `Heading ${level}`);
}

// Simple dispatcher for slash commands.
export function slashCommand(md, pos, cmd) {
  // cmd is without leading slash
  switch (cmd) {
    case "h1":
      return insertHeading(md, pos, pos, 1);
    case "h2":
      return insertHeading(md, pos, pos, 2);
    case "h3":
      return insertHeading(md, pos, pos, 3);
    case "table":
      return insertTable(md, pos);
    case "code":
      return insertCodeBlock(md, pos, pos);
    case "quote":
      return applyLinePrefix(md, pos, pos, "> ", "quote");
    default:
      return null;
  }
}
