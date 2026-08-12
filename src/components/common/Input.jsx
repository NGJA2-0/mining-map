export default function Input({
  label,
  id,
  error,
  mono = false,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-xs uppercase tracking-widest text-ink-muted"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-md border bg-surface px-4 py-2.5 text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-amber ${
          mono ? "font-mono text-sm" : "font-body"
        } ${error ? "border-copper" : "border-line"} ${className}`}
        {...props}
      />
      {error && (
        <span className="font-mono text-xs text-copper">{error}</span>
      )}
    </div>
  );
}
