import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ReportCardEntryForm from "./ReportCardEntryForm";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function ReportCardSearchPage() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const skipNextSearch = useRef(false);

  // Debounced search: fires ~300ms after the user stops typing.
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
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
          `${API_BASE_URL}/api/mini-sahana-form/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          }
        );

        if (res.status === 401) {
          logout();
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Search failed");
        }

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
  }, [search, token, logout, navigate]);

  const getDisplayValue = (item) =>
    item?.applicantFullNameSinhala || item?.nic || "";

  const handleSelectStudent = (s) => {
    skipNextSearch.current = true;
    setSelectedStudent(s);
    setSearch(getDisplayValue(s));
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center gap-2 px-4 py-5 sm:gap-4 sm:px-10 lg:px-16">
          <button
            type="button"
            onClick={() => navigate("/minisahana/report-cards")}
            aria-label="Back to Report Cards"
            className="flex items-center gap-1.5 rounded-md p-2 text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="hidden text-sm font-medium sm:inline">Back</span>
          </button>

          <div className="hidden h-6 w-px bg-line sm:block" />

          <h1 className="font-display text-lg font-semibold sm:text-2xl">
            Find Student
          </h1>
        </div>
      </header>

      {/* ── main ── */}
      <main className="flex-1 px-4 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ letterSpacing: "-0.02em" }}>
              Search Student
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Search by student name or NIC to create a new report card.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6 w-full">
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
                setSelectedStudent(null);
              }}
              onFocus={() => {
                if (results.length > 0 && !selectedStudent) setDropdownOpen(true);
              }}
              placeholder="Search by student name or NIC..."
              autoFocus
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-copper/20"
            />
          </div>

          {/* Results dropdown */}
          {dropdownOpen && (
            <div className="flex flex-col gap-2 sm:gap-3">
              {loading && (
                <p className="rounded-lg border border-line bg-surface p-4 text-center text-sm text-ink-muted">
                  Searching…
                </p>
              )}

              {!loading && error && (
                <p className="rounded-lg border border-line bg-surface p-4 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              {!loading && !error && search.trim() && results.length === 0 && (
                <p className="rounded-lg border border-line bg-surface p-4 text-center text-sm text-ink-muted">
                  No students found.
                </p>
              )}

              {!loading && !error && results.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectStudent(s)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-md sm:p-4"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold sm:text-base">
                      {s.applicantFullNameSinhala}
                    </span>
                    <span className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-ink-muted sm:text-xs">
                      NIC: {s.nic}
                    </span>
                    <span className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-ink-muted sm:text-xs">
                      A/C: {s.bankAccountNumber}
                    </span>
                  </div>
                  {s.grade && (
                    <span className="shrink-0 rounded-md bg-teal/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal">
                      Grade {s.grade}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedStudent && <ReportCardEntryForm student={selectedStudent} />}
        </div>
      </main>
    </div>
  );
}