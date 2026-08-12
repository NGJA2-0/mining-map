export default function Modal({ open, onClose, title, eyebrow, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-line bg-surface shadow-xl [animation:modalIn_180ms_ease-out]">
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            {eyebrow && (
              <p className="font-mono text-[11px] uppercase tracking-widest text-copper">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                id="modal-title"
                className="mt-1 font-display text-lg font-semibold text-ink"
              >
                {title}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
