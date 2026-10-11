import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function StudentRecordSearch({ onSelect }) {
  const { token } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // debounced live search
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/mini-sahana-form/search?q=${encodeURIComponent(q)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || data.message || "Search failed. Please try again.");
        }
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setActiveIndex(-1);
        setOpen(true);
      } catch (err) {
        if (err.name === "AbortError") return;
        setResults([]);
        setError(err.message || "Search failed. Please try again.");
        setOpen(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, token]);

  function handleSelect(item) {
    setQuery("");
    setResults([]);
    setOpen(false);
    onSelect?.(item);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    }
  }

  const showEmpty = open && !loading && !error && query.trim() && results.length === 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* ── input ── */}
      <div
        className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 transition-all focus-within:border-copper/50 focus-within:ring-4 focus-within:ring-copper/10 sm:px-5 sm:py-4"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 10px 28px -14px rgba(184,90,41,0.35)" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-ink-muted transition-colors group-focus-within:text-copper"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (results.length > 0 || error) && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by name, NIC, account no., grade or zone"
          aria-label="Search student records"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none sm:text-base"
        />

        {loading && (
          <span
            aria-label="Searching"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-copper/25 border-t-copper"
          />
        )}

        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 rounded-full p-1 text-ink-muted transition-colors hover:bg-line/60 hover:text-ink"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ── dropdown ── */}
      {open && (error || results.length > 0 || showEmpty) && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[22rem] overflow-y-auto rounded-2xl border border-line bg-surface"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "dropdownIn 150ms ease-out" }}
        >
          {error && <p className="px-4 py-4 text-sm text-red-600">{error}</p>}

          {showEmpty && (
            <p className="px-4 py-6 text-center text-sm text-ink-muted">
              No records found for “{query.trim()}”
            </p>
          )}

          {results.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => handleSelect(item)}
              className={`flex w-full flex-col gap-1.5 border-b border-line/60 px-4 py-3 text-left transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                i === activeIndex ? "bg-copper/10" : "hover:bg-line/40"
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {item.applicantFullNameSinhala || "—"}
                </p>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                  NIC: {item.nic || "—"}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                {item.bankAccountNumber && (
                  <span className="rounded-md bg-line/60 px-2 py-1 font-mono text-ink-muted">
                    A/C {item.bankAccountNumber}
                  </span>
                )}
                {item.grade && (
                  <span className="rounded-md bg-copper/10 px-2 py-1 font-semibold text-copper">
                    Grade {item.grade}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}