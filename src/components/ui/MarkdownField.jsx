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
  return (
    <div className="markdown-field">
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
        placeholder={placeholder}
      />
    </div>
  );
}
