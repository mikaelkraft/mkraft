import { useRef } from "react";
import Button from "./Button";
import {
  parseYouTubeId,
  parseVimeoId,
  parseSpotify,
  buildYouTubeEmbed,
  buildVimeoEmbed,
  buildSpotifyEmbed,
} from "../../utils/markdownEmbeds";

/**
 * Reusable Markdown editing toolbar.
 *
 * Contract:
 * - Props:
 *   - textareaId: id of the target <textarea> element whose selection will be wrapped/modified.
 *   - value: current markdown string (required for fallbacks when no DOM textarea present).
 *   - onChange(next: string): called with updated markdown after an action.
 *   - onUploadImage?(file: File): optional async function returning { url } or a string URL.
 *   - enableImageUpload: show image button when true (default true if onUploadImage provided).
 *   - headingLevels: array of heading levels to show (default [1,2,3]).
 *   - className: optional extra classes for wrapper.
 *
 * Notes:
 * - All actions attempt to respect current selection. If no selection, they insert placeholder text.
 * - Keeps focus on textarea after action.
 */
export default function MarkdownToolbar({
  textareaId,
  value,
  onChange,
  onUploadImage,
  enableImageUpload = undefined,
  headingLevels = [1, 2, 3, 4, 5, 6],
  className = "",
}) {
  const fileInputRef = useRef(null);
  const canImage = (enableImageUpload ?? !!onUploadImage) === true;

  const getTA = () => (textareaId ? document.getElementById(textareaId) : null);

  const applyAround = (prefix, suffix = prefix, placeholder = "text") => {
    const ta = getTA();
    if (!ta) {
      onChange((value || "") + `${prefix}${placeholder}${suffix}`);
      return;
    }
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || placeholder;
    const after = value.slice(end);
    const next = `${before}${prefix}${selected}${suffix}${after}`;
    onChange(next);
    queueMicrotask(() => ta.focus());
  };

  const applyLinePrefix = (prefix, placeholder = "text") => {
    const ta = getTA();
    if (!ta) {
      onChange((value || "") + `\n${prefix}${placeholder}`);
      return;
    }
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || placeholder;
    const after = value.slice(end);
    const block = selected.replace(/^/gm, prefix);
    onChange(before + block + after);
    queueMicrotask(() => ta.focus());
  };

  const insertCodeBlock = () => {
    const ta = getTA();
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || "code";
    const after = value.slice(end);
    const snippet = `\n\n\
\n${selected}\n\
\n\n`;
    onChange(before + snippet + after);
    queueMicrotask(() => ta?.focus());
  };

  const insertPreformatted = () => {
    const ta = getTA();
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || "preformatted text";
    const after = value.slice(end);
    const block = `\n\n<pre>\n${selected}\n</pre>\n\n`;
    onChange(before + block + after);
    queueMicrotask(() => ta?.focus());
  };

  const insertList = (ordered = false) => {
    const ta = getTA();
    const bullet = ordered ? "1." : "-";
    if (!ta) {
      onChange(`${value || ""}\n${bullet} item`);
      return;
    }
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = value.slice(0, start);
    const selected = value.slice(start, end) || "item";
    const after = value.slice(end);
    const transformed = selected.replace(/^/gm, `${bullet} `);
    onChange(`${before}${transformed}${after}`);
    queueMicrotask(() => ta.focus());
  };

  const insertLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    applyAround("[", `](${url})`, "link text");
  };

  const insertHeading = (level) => {
    const hashes = "#".repeat(Math.min(6, Math.max(1, level)));
    applyLinePrefix(`${hashes} `, `Heading ${level}`);
  };

  // ---------- Embed helpers (now imported) ----------
  const insertEmbed = (html) => {
    const ta = getTA();
    const pos = ta?.selectionStart ?? value.length;
    const before = value.slice(0, pos);
    const after = value.slice(pos);
    onChange(`${before}\n\n${html}\n\n${after}`);
    queueMicrotask(() => ta?.focus());
  };
  const handleYouTube = () => {
    const url = prompt("YouTube URL");
    if (!url) return;
    const id = parseYouTubeId(url.trim());
    if (!id) return alert("Invalid YouTube URL");
    const html = buildYouTubeEmbed(id);
    insertEmbed(html);
  };
  const handleVimeo = () => {
    const url = prompt("Vimeo URL");
    if (!url) return;
    const id = parseVimeoId(url.trim());
    if (!id) return alert("Invalid Vimeo URL");
    const html = buildVimeoEmbed(id);
    insertEmbed(html);
  };
  const handleSpotify = () => {
    const url = prompt("Spotify URL");
    if (!url) return;
    const parsed = parseSpotify(url.trim());
    if (!parsed) return alert("Invalid Spotify URL");
    const { type, id } = parsed;
    const html = buildSpotifyEmbed(type, id);
    insertEmbed(html);
  };

  const onPickImage = () => fileInputRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      let url;
      if (onUploadImage) {
        const res = await onUploadImage(file);
        url = typeof res === "string" ? res : res?.url;
      }
      if (url) {
        const ta = getTA();
        const pos = ta?.selectionStart ?? value.length;
        const before = value.slice(0, pos);
        const after = value.slice(pos);
        onChange(`${before}![image](${url})${after}`);
        queueMicrotask(() => ta?.focus());
      }
    } catch (err) {
      console.error("Image upload failed", err); // Log for debugging
      alert("Image upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const buttons = [
    {
      label: "B",
      title: "Bold",
      action: () => applyAround("**"),
      icon: "Bold",
    },
    {
      label: "I",
      title: "Italic",
      action: () => applyAround("*"),
      icon: "Italic",
    },
    {
      label: "Code",
      title: "Inline code",
      action: () => applyAround("`", "`", "code"),
      icon: "Code",
    },
    {
      label: "Block",
      title: "Code block",
      action: insertCodeBlock,
      icon: "SquareCode",
    },
    {
      label: "Pre",
      title: "Preformatted block",
      action: insertPreformatted,
      icon: "Braces",
    },
    {
      label: ">",
      title: "Blockquote",
      action: () => applyLinePrefix("> "),
      icon: "Quote",
    },
    {
      label: "UL",
      title: "Bullet list",
      action: () => insertList(false),
      icon: "List",
    },
    {
      label: "OL",
      title: "Numbered list",
      action: () => insertList(true),
      icon: "ListOrdered",
    },
    { label: "Link", title: "Insert link", action: insertLink, icon: "Link" },
    {
      label: "YT",
      title: "YouTube embed",
      action: handleYouTube,
      icon: "Youtube",
    },
    { label: "Vim", title: "Vimeo embed", action: handleVimeo, icon: "Video" },
    {
      label: "Spot",
      title: "Spotify embed",
      action: handleSpotify,
      icon: "Music",
    },
  ];

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {headingLevels.map((lvl) => (
        <Button
          key={lvl}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => insertHeading(lvl)}
          title={`Heading ${lvl}`}
        >
          H{lvl}
        </Button>
      ))}
      {buttons.map((b) => (
        <Button
          key={b.title}
          type="button"
          size="sm"
          variant="outline"
          title={b.title}
          onClick={b.action}
          iconName={b.icon}
        >
          {b.label}
        </Button>
      ))}
      {canImage && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onPickImage}
          title="Insert image"
          iconName="Image"
        >
          Img
        </Button>
      )}
      {canImage && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      )}
    </div>
  );
}
