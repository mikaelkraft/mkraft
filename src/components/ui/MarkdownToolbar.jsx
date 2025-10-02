import { useRef, useState } from "react";
import Button from "./Button";
import {
  parseYouTubeId,
  parseVimeoId,
  parseSpotify,
  buildYouTubeEmbed,
  buildVimeoEmbed,
  buildSpotifyEmbed,
} from "../../utils/markdownEmbeds";
import {
  wrapInline,
  applyLinePrefix as utilApplyLinePrefix,
  insertCodeBlock as utilInsertCodeBlock,
  insertPre as utilInsertPre,
  insertList as utilInsertList,
  insertTable as utilInsertTable,
  insertEmoji as utilInsertEmoji,
  insertEmbedHtml,
  insertHeading as utilInsertHeading,
} from "../../utils/markdownInsert";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const canImage = (enableImageUpload ?? !!onUploadImage) === true;

  const getTA = () => (textareaId ? document.getElementById(textareaId) : null);

  const getSelection = () => {
    const ta = getTA();
    return {
      ta,
      start: ta?.selectionStart ?? value.length,
      end: ta?.selectionEnd ?? value.length,
    };
  };

  const applyAround = (prefix, suffix = prefix, placeholder = "text") => {
    const { ta, start, end } = getSelection();
    const { text } = wrapInline(value, start, end, prefix, suffix, placeholder);
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const applyLinePrefix = (prefix, placeholder = "text") => {
    const { ta, start, end } = getSelection();
    const { text } = utilApplyLinePrefix(
      value,
      start,
      end,
      prefix,
      placeholder,
    );
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const insertCodeBlock = () => {
    const { ta, start, end } = getSelection();
    const { text } = utilInsertCodeBlock(value, start, end);
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const insertPreformatted = () => {
    const { ta, start, end } = getSelection();
    const { text } = utilInsertPre(value, start, end);
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const insertList = (ordered = false) => {
    const { ta, start, end } = getSelection();
    const { text } = utilInsertList(value, start, end, ordered);
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const insertLink = () => {
    const url = prompt("Enter URL");
    if (!url) return;
    applyAround("[", `](${url})`, "link text");
  };

  const insertHeading = (level) => {
    const { ta, start, end } = getSelection();
    const { text } = utilInsertHeading(value, start, end, level);
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const insertTable = () => {
    const { ta, start } = getSelection();
    const { text } = utilInsertTable(value, start);
    onChange(text);
    queueMicrotask(() => ta?.focus());
  };

  const emojiList = [
    "😀",
    "😅",
    "😂",
    "🙂",
    "😉",
    "😍",
    "🤔",
    "😎",
    "😭",
    "😡",
    "🔥",
    "🚀",
    "⭐",
    "✅",
    "⚠️",
    "❌",
    "💡",
    "📌",
    "📝",
    "📎",
    "🔗",
    "💻",
    "📱",
    "🧪",
    "🧠",
    "🛠️",
    "📦",
    "🐛",
    "✅",
    "🔍",
    "🎉",
  ];
  const insertEmoji = (emoji) => {
    const { ta, start, end } = getSelection();
    const { text } = utilInsertEmoji(value, start, end, emoji);
    onChange(text);
    queueMicrotask(() => {
      ta?.focus();
      setShowEmoji(false);
    });
  };

  // ---------- Embed helpers (now imported) ----------
  const insertEmbed = (html) => {
    const { ta, start } = getSelection();
    const { text } = insertEmbedHtml(value, start, html);
    onChange(text);
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

  const basicButtons = [
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
    { label: "Tbl", title: "Insert table", action: insertTable, icon: "Table" },
    {
      label: "😀",
      title: "Emoji picker",
      action: () => setShowEmoji((v) => !v),
      icon: "Smile",
    },
  ];

  const advancedButtons = [
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
      {basicButtons.map((b) => (
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
      <Button
        type="button"
        size="sm"
        variant={showAdvanced ? "primary" : "outline"}
        onClick={() => setShowAdvanced((v) => !v)}
        title="Toggle advanced embed tools"
        iconName="Settings2"
      >
        {showAdvanced ? "Adv-" : "Adv+"}
      </Button>
      {showAdvanced &&
        advancedButtons.map((b) => (
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
      {showEmoji && (
        <div className="w-full flex flex-wrap gap-1 p-2 border border-border-accent/30 rounded bg-surface/70">
          {emojiList.map((e) => (
            <button
              key={e}
              type="button"
              className="text-lg hover:scale-110 transition"
              onClick={() => insertEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
