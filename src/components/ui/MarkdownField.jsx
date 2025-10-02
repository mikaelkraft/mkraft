import MarkdownToolbar from "./MarkdownToolbar";

/**
 * MarkdownField combines a MarkdownToolbar with a textarea.
 *
 * Props:
 *  - id: id for the textarea (required for toolbar to target)
 *  - value: current markdown content
 *  - onChange(next: string): change handler
 *  - onUploadImage?(file): optional async image uploader returning url or {url}
 *  - headingLevels?: array of heading levels to show (defaults to toolbar default)
 *  - textareaClassName?: extra classes for textarea
 *  - toolbarClassName?: extra classes for toolbar wrapper
 *  - placeholder?: placeholder text for textarea
 *  - disabled?: disable textarea editing
 */
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
      className="markdown-field"
      onDragEnter={prevent}
      onDragOver={prevent}
      onDrop={handleDrop}
    >
      <MarkdownToolbar
        textareaId={id}
        value={value}
        onChange={onChange}
        onUploadImage={onUploadImage}
        headingLevels={headingLevels}
        className={toolbarClassName}
      />
      <textarea
        id={id}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-surface border border-border-accent/20 rounded-lg font-mono text-sm min-h-[240px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${textareaClassName}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        placeholder={placeholder}
      />
    </div>
  );
}
