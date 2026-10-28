import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ReportCardSummary from "./ReportCardSummary";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function ReportCardDashboardSearch({ selectedRecord, onSelect }) {
  const { token } = useAuth();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Whenever a record is selected (from the dropdown OR the table),
  // show its name in the search box and close the dropdown.
  useEffect(() => {
    if (selectedRecord) {
      setSearch(
        selectedRecord.fullName || selectedRecord.accNumber || selectedRecord.nic || ""
      );
      setDropdownOpen(false);
    }
  }, [selectedRecord]);

  // Debounced search across fullName, accNumber and nic.
  useEffect(() => {
    // A record is selected, so don't search for its own name
    if (selectedRecord) {
      setLoading(false);
      return;
    }

    const query = search.trim();

    if (!query) {
      setResults([]);
      setLoading(false);
      setError("");
      setDropdownOpen(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/report-cards/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setDropdownOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Couldn't load results. Try again.");
          setResults([]);
          setDropdownOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, token, selectedRecord]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleClose = () => {
    onSelect(null);
    setSearch("");
    setResults([]);
    setDropdownOpen(false);
  };

  return (
    <>
      <div className="relative mb-8 w-full" ref={wrapperRef}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSelect(null); // typing clears the current selection
          }}
          onFocus={() => {
            if (results.length > 0 && !selectedRecord) setDropdownOpen(true);
          }}
          placeholder="Search by name, account no., NIC or regional office..."
          className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-copper/20"
        />

        {dropdownOpen && (
          <div
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          >
            {loading && <p className="p-4 text-center text-sm text-ink-muted">Searching…</p>}
            {!loading && error && <p className="p-4 text-center text-sm text-red-600">{error}</p>}
            {!loading && !error && results.length === 0 && (
              <p className="p-4 text-center text-sm text-ink-muted">No report cards found.</p>
            )}
            {!loading && !error && results.length > 0 && (
              <ul className="max-h-72 divide-y divide-line overflow-y-auto">
                {results.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-copper/5"
                    >
                      <span className="truncate text-sm font-semibold text-ink">{item.fullName}</span>
                      <span className="truncate font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                        NIC: {item.nic} · A/C: {item.accNumber}
                      </span>
                      {item.regionalOffice && (
                        <span className="truncate font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                          Office: {item.regionalOffice}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {selectedRecord && (
        <div className="mb-8">
          <ReportCardSummary record={selectedRecord} onClose={handleClose} />
        </div>
      )}
    </>
  );
}