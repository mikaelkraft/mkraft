import { useState, useRef, useEffect } from "react";
import { sanitizeClientHtml } from "../../utils/markdownSanitizeClient";
import MarkdownToolbar from "./MarkdownToolbar";

const slashCommand = (cmd, label, insert) => ({ cmd, label, insert });

// Clean MarkdownField (purged legacy dynamic imports and duplicate code)
export default function MarkdownField({
  id,
  value,
  onChange,
  onUploadImage,
  placeholder = "Write markdown...",
  disabled = false,
  headingLevels = [1, 2, 3, 4, 5, 6],
  toolbarClassName = "",
  textareaClassName = "",
}) {
  const textareaRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashPos, setSlashPos] = useState({ x: 0, y: 0 });
  const [slashIndex, setSlashIndex] = useState(0);

  const actions = [
    slashCommand("h1", "Heading 1", (t) => `# ${t}`),
    slashCommand("h2", "Heading 2", (t) => `## ${t}`),
    slashCommand("bold", "Bold", (t) => `**${t}**`),
    slashCommand("italic", "Italic", (t) => `_${t}_`),
    slashCommand("code", "Code Block", (t) => `\n\n\`\`\`\n${t}\n\`\`\`\n\n`),
    slashCommand(
      "ul",
      "Bulleted List",
      () => `\n- Item 1\n- Item 2\n- Item 3\n`,
    ),
    slashCommand(
      "img",
      "Image",
      () => `\n![alt text](https://example.com/image.png)\n`,
    ),
    slashCommand("link", "Link", () => `[title](https://example.com)`),
  ];
  const filteredActions = actions.filter((a) =>
    a.cmd.startsWith(slashQuery.toLowerCase()),
  );
  useEffect(() => {
    if (slashIndex >= filteredActions.length) setSlashIndex(0);
  }, [filteredActions.length, slashIndex]);

  const applySlash = (action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = (value || "").slice(0, start);
    const after = (value || "").slice(end);
    const tokenMatch = /\/([\w]*)$/.exec(before);
    const insertion = action.insert("");
    if (tokenMatch) {
      const tokenStart = start - tokenMatch[0].length;
      const newValue = before.slice(0, tokenStart) + insertion + after;
      onChange(newValue);
      requestAnimationFrame(() => {
        const ta2 = textareaRef.current;
        if (!ta2) return;
        ta2.focus();
        const pos = tokenStart + insertion.length;
        ta2.selectionStart = ta2.selectionEnd = pos;
      });
    } else {
      onChange(before + insertion + after);
    }
    setShowSlash(false);
    setSlashQuery("");
  };

  const handleKeyDown = (e) => {
    if (showSlash) {
      if (e.key === "Escape") {
        setShowSlash(false);
        setSlashQuery("");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSlashIndex((i) => (i + 1) % filteredActions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSlashIndex(
          (i) => (i - 1 + filteredActions.length) % filteredActions.length,
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const chosen = filteredActions[slashIndex] || filteredActions[0];
        if (chosen) applySlash(chosen);
        return;
      }
    }
    if (e.key === "/") {
      const ta = textareaRef.current;
      if (!ta) return;
      const rect = ta.getBoundingClientRect();
      setSlashPos({ x: rect.left + 20, y: rect.top + 30 + window.scrollY });
      setShowSlash(true);
      setSlashQuery("");
      setSlashIndex(0);
    }
  };

  const handleChange = (e) => {
    const next = e.target.value;
    if (showSlash) {
      const m = /\/([\w]*)$/.exec(next.slice(0, e.target.selectionStart));
      if (m) setSlashQuery(m[1]);
      else {
        setShowSlash(false);
        setSlashQuery("");
      }
    }
    onChange(next);
  };

  const handleDrop = async (e) => {
    if (!onUploadImage) return;
    e.preventDefault();
    const file = [...(e.dataTransfer?.files || [])].find((f) =>
      f.type.startsWith("image/"),
    );
    if (!file) return;
    try {
      const res = await onUploadImage(file);
      const url = typeof res === "string" ? res : res?.url;
      if (url) onChange((value || "") + `\n![image](${url})`);
    } catch (err) {
      console.error("Drag upload failed", err);
    }
  };

  const handlePaste = async (e) => {
    if (!onUploadImage) return;
    const item = [...(e.clipboardData?.items || [])].find((i) =>
      i.type.startsWith("image/"),
    );
    if (!item) return;
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    try {
      const res = await onUploadImage(file);
      const url = typeof res === "string" ? res : res?.url;
      if (url) onChange((value || "") + `\n![image](${url})`);
    } catch (err) {
      console.error("Paste upload failed", err);
    }
  };

  const prevent = (e) => {
    if (onUploadImage && (e.type === "dragenter" || e.type === "dragover")) {
      e.preventDefault();
    }
  };

  return (
    <div
      className="markdown-field relative"
      onDragEnter={prevent}
      onDragOver={prevent}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2">
        <MarkdownToolbar
          textareaId={id}
          value={value}
          onChange={onChange}
          onUploadImage={onUploadImage}
          headingLevels={headingLevels}
          className={toolbarClassName + " flex-1"}
        />
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="px-2 py-1 text-xs border border-border-accent/40 rounded hover:bg-surface-alt"
          title="Toggle preview"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {!preview && (
        <textarea
          ref={textareaRef}
          id={id}
          aria-label="Markdown editor"
          className={`w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg font-mono text-sm min-h-[220px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${textareaClassName}`}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {preview && <SimplePreview value={value} />}
      {showSlash && filteredActions.length > 0 && (
        <div
          className="absolute z-50 bg-surface border border-border-accent/40 rounded shadow-md text-sm"
          style={{ left: slashPos.x, top: slashPos.y }}
          role="listbox"
          aria-label="Slash commands"
        >
          {filteredActions.map((a, i) => (
            <button
              type="button"
              key={a.cmd}
              onClick={() => applySlash(a)}
              className={`block w-full text-left px-3 py-1 hover:bg-surface-alt ${i === slashIndex ? "bg-primary/20" : ""}`}
              role="option"
              aria-selected={i === slashIndex}
            >
              /{a.cmd} <span className="opacity-70 ml-1">{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SimplePreview({ value }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    const esc = (s) =>
      s.replace(
        /[&<>]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
      );
    let out = esc(value || "");
    out = out
      .replace(/^###### (.*)$/gm, "<h6>$1</h6>")
      .replace(/^##### (.*)$/gm, "<h5>$1</h5>")
      .replace(/^#### (.*)$/gm, "<h4>$1</h4>")
      .replace(/^### (.*)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
    setHtml(sanitizeClientHtml(out));
  }, [value]);
  return (
    <div className="prose prose-invert max-w-none border border-border-accent/20 rounded-lg p-3 bg-surface">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
