import { useEffect, useRef, useState } from "react";

const ChevronDown = ({ open }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`shrink-0 text-ink-muted transition-transform duration-200 ${open ? "rotate-180 text-copper" : ""}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function GlassSelect({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Highlight the selected item and scroll it into view when opening
  useEffect(() => {
    if (!open) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    requestAnimationFrame(() => {
      listRef.current
        ?.querySelector(`[data-index="${selectedIndex}"]`)
        ?.scrollIntoView({ block: "nearest" });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the keyboard-highlighted item visible
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(opt) {
    onChange(opt.value);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) =>
        e.key === "ArrowDown" ? Math.min(i + 1, options.length - 1) : Math.max(i - 1, 0)
      );
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (options[active]) choose(options[active]);
    }
  }

  return (
    <div className="flex flex-col gap-1.5" ref={wrapRef}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {label}
      </span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-surface px-3.5 py-3 text-left text-sm text-ink transition-all focus:outline-none focus:ring-2 focus:ring-copper/20 ${
            open ? "border-copper ring-2 ring-copper/20" : "border-line hover:border-copper/40"
          }`}
        >
          <span className="truncate">{selected ? selected.label : "Select"}</span>
          <ChevronDown open={open} />
        </button>

        {open && (
          <ul
            ref={listRef}
            role="listbox"
            aria-label={label}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 max-h-60 overflow-y-auto rounded-2xl border border-white/60 bg-white/65 p-1.5 backdrop-blur-xl backdrop-saturate-150"
            style={{
              boxShadow:
                "0 12px 40px -8px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.7)",
              animation: "dropdownIn 150ms ease-out",
            }}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === active;
              return (
                <li
                  key={opt.value}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(opt)}
                  className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-copper/15 font-semibold text-copper"
                      : isActive
                      ? "bg-white/70 text-ink"
                      : "text-ink"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}