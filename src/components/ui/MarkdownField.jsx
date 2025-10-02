import { useState, useRef, useEffect } from "react";
import MarkdownToolbar from "./MarkdownToolbar";
import { slashCommand } from "../../utils/markdownInsert";

let markedRender; // lazy loaded
let DOMPurify; // lazy loaded

/** Corrected MarkdownField with preview + slash command palette */
export default function MarkdownField({
  id,
  value,
  onChange,
  onUploadImage,
  headingLevels,
  textareaClassName = "",
  toolbarClassName = "mb-2",
  placeholder = "Write in Markdown...",
  disabled = false,
}) {
  const [preview, setPreview] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashPos, setSlashPos] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (preview && (!markedRender || !DOMPurify)) {
      (async () => {
        const [{ marked }, purify] = await Promise.all([
          import("marked"),
          import("dompurify"),
        ]);
        markedRender = marked;
        DOMPurify = purify.default;
      })();
    }
  }, [preview]);

  const slashActions = [
    { cmd: "h1", label: "Heading 1" },
    { cmd: "h2", label: "Heading 2" },
    { cmd: "h3", label: "Heading 3" },
    { cmd: "table", label: "Table" },
    { cmd: "code", label: "Code Block" },
    { cmd: "quote", label: "Blockquote" },
  ];
  const filteredActions = slashQuery
    ? slashActions.filter((a) => a.cmd.startsWith(slashQuery.toLowerCase()))
    : slashActions;

  const applySlash = (action) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = value.slice(0, pos).replace(/\/[\w]*$/, "");
    const after = value.slice(pos);
    const base = before + after;
    const insertPos = before.length;
    const res = slashCommand(base, insertPos, action.cmd);
    if (res) {
      onChange(res.text);
      queueMicrotask(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = res.selectionEnd;
      });
    } else {
      onChange(base);
    }
    setShowSlash(false);
    setSlashQuery("");
  };

  const handleKeyDown = (e) => {
    if (showSlash) {
      if (e.key === "Escape") {
        setShowSlash(false);
        setSlashQuery("");
      } else if (e.key === "Enter") {
        e.preventDefault();
        const first = filteredActions[0];
        if (first) applySlash(first);
      }
    } else if (e.key === "/") {
      const ta = textareaRef.current;
      if (!ta) return;
      const rect = ta.getBoundingClientRect();
      setSlashPos({ x: rect.left + 20, y: rect.top + 30 + window.scrollY });
      setShowSlash(true);
      setSlashQuery("");
    }
  };

  const handleChange = (e) => {
    const next = e.target.value;
    if (showSlash) {
      const m = /\/(\w*)$/.exec(next.slice(0, e.target.selectionStart));
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
          disabled={disabled}
          className={`w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg font-mono text-sm min-h-[240px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${textareaClassName}`}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      )}
      {preview && (
        <div className="prose max-w-none border border-border-accent/20 rounded-lg p-3 bg-surface">
          {markedRender && DOMPurify ? (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(markedRender.parse(value || "")),
              }}
            />
          ) : (
            <div className="text-xs opacity-60">Loading preview...</div>
          )}
        </div>
      )}
      {showSlash && filteredActions.length > 0 && (
        <div
          className="absolute z-50 bg-surface border border-border-accent/40 rounded shadow-md text-sm"
          style={{ left: slashPos.x, top: slashPos.y }}
        >
          {filteredActions.map((a) => (
            <button
              type="button"
              key={a.cmd}
              onClick={() => applySlash(a)}
              className="block w-full text-left px-3 py-1 hover:bg-surface-alt"
            >
              /{a.cmd} <span className="opacity-70 ml-1">{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
