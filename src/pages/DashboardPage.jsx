import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopoBackground from "../components/common/TopoBackground";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────── helpers ─────────────────────────── */

const STATUS_CFG = {
  draft: { label: "Draft", bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
  submitted: { label: "Submitted", bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.12)", color: "#059669" },
  rejected: { label: "Rejected", bg: "rgba(220,38,38,0.12)", color: "#dc2626" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: "999px",
      fontSize: "10px", fontWeight: "700",
      letterSpacing: "0.07em", textTransform: "uppercase",
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}22`,
    }}>
      {cfg.label}
    </span>
  );
}

function ResultCard({ record, onClick }) {
  const date = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    })
    : "—";

  const statusColor =
    (STATUS_CFG[record.status?.toLowerCase()] || STATUS_CFG.draft).color;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: "var(--color-surface, #fff)",
        border: "1px solid var(--color-line, #e5e7eb)",
        borderLeft: `3px solid ${statusColor}`,
        borderRadius: "10px", padding: "16px 20px",
        display: "flex", flexDirection: "column", gap: "10px",
        fontFamily: "inherit",
        transition: "box-shadow 0.18s, transform 0.12s, border-color 0.18s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--color-ink, #1a1a1a)" }}>
          {record.applicantName || "—"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <StatusBadge status={record.status} />
          <span style={{ fontSize: "11px", color: "var(--color-ink-muted, #6b7280)", fontFamily: "monospace" }}>
            {date}
          </span>
        </div>
      </div>

      {/* Meta pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {[
          { key: "TIN", val: record.tin },
          { key: "GML", val: record.gmlNumber },
          { key: "NIC", val: record.nic },
          { key: "District", val: record.district },
          { key: "Village", val: record.village },
          { key: "Land", val: record.landName },
        ].filter(f => f.val).map(({ key, val }) => (
          <span key={key} style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "3px 10px", borderRadius: "6px",
            background: "var(--color-base, #f9fafb)",
            border: "1px solid var(--color-line, #e5e7eb)",
            fontSize: "11px", color: "var(--color-ink-muted, #6b7280)",
          }}>
            <span style={{ fontWeight: "700", fontFamily: "monospace", color: "var(--color-ink, #1a1a1a)", fontSize: "10px" }}>{key}</span>
            {val}
          </span>
        ))}
      </div>

      {/* Footer arrow */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span style={{
          fontSize: "11px", fontWeight: "600",
          color: "var(--color-teal, #0d9488)",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          View &amp; edit
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      border: "1px solid var(--color-line, #e5e7eb)",
      borderLeft: "3px solid var(--color-line, #e5e7eb)",
      borderRadius: "10px", padding: "16px 20px",
      display: "flex", flexDirection: "column", gap: "10px",
      animation: "pulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ height: "16px", width: "180px", borderRadius: "4px", background: "var(--color-line, #e5e7eb)" }} />
        <div style={{ height: "16px", width: "70px", borderRadius: "999px", background: "var(--color-line, #e5e7eb)" }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {[80, 100, 120, 90].map((w, i) => (
          <div key={i} style={{ height: "22px", width: `${w}px`, borderRadius: "6px", background: "var(--color-line, #e5e7eb)" }} />
        ))}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  })();

  const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: "32px", height: "32px", padding: "0 6px",
    borderRadius: "6px", fontSize: "13px", fontWeight: "600",
    border: "1px solid var(--color-line, #e5e7eb)",
    cursor: "pointer", fontFamily: "inherit",
    transition: "background 0.13s, border-color 0.13s, color 0.13s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "wrap", marginTop: "20px" }}>
      <button
        style={{ ...btnBase, background: page === 1 ? "var(--color-line)" : "var(--color-surface)", color: page === 1 ? "var(--color-ink-muted)" : "var(--color-ink)", cursor: page === 1 ? "default" : "pointer" }}
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>

      {pages.map((p, i) => p === "…" ? (
        <span key={`ellipsis-${i}`} style={{ minWidth: "32px", textAlign: "center", fontSize: "13px", color: "var(--color-ink-muted)" }}>…</span>
      ) : (
        <button
          key={p}
          style={{
            ...btnBase,
            background: p === page ? "var(--color-teal, #0d9488)" : "var(--color-surface)",
            color: p === page ? "#fff" : "var(--color-ink)",
            borderColor: p === page ? "var(--color-teal, #0d9488)" : "var(--color-line)",
          }}
          onClick={() => onPage(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        style={{ ...btnBase, background: page === totalPages ? "var(--color-line)" : "var(--color-surface)", color: page === totalPages ? "var(--color-ink-muted)" : "var(--color-ink)", cursor: page === totalPages ? "default" : "pointer" }}
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // ── search state ──
  const [tinInput, setTinInput] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // the TIN that was actually searched
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // ── fetch helper ──
  const fetchResults = useCallback(async (tin, pg, limit) => {
    if (!tin) return;
    setLoading(true);
    setError("");
    try {
      const url = `${BASE_URL}/api/mining-licenses/tin/${encodeURIComponent(tin)}?page=${pg}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Error ${res.status}`);
      }
      const json = await res.json();
      const d = json.data;
      setResults(d.data || []);
      setTotal(d.total ?? 0);
      setTotalPages(d.totalPages ?? 1);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Re-fetch when page / pageSize changes (only after an active search)
  useEffect(() => {
    if (hasSearched && activeSearch) {
      fetchResults(activeSearch, page, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = () => {
    const tin = tinInput.trim();
    if (!tin) return;
    setPage(1);
    setActiveSearch(tin);
    setHasSearched(true);
    fetchResults(tin, 1, pageSize);
  };

  const handleSignOutRequest = () => {
    setProfileOpen(false);
    setConfirmSignOut(true);
  };

  const handleConfirmSignOut = () => {
    setConfirmSignOut(false);
    logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-base text-ink">
      {/* ── keyframes ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Mining Map logo"
              className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
            />
            <h1 className="font-display text-xl font-semibold sm:text-2xl">
              Mining Map
            </h1>
          </div>

          {/* Profile avatar + dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                id="profile-menu-button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen((prev) => !prev)}
                style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  background: "var(--color-copper, #b85a29)", color: "#fff",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit", transition: "opacity 0.15s", flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-labelledby="profile-menu-button"
                  style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    minWidth: "220px", background: "var(--color-surface, #fff)",
                    border: "1px solid var(--color-line, #e5e7eb)", borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100,
                    overflow: "hidden", animation: "dropdownIn 150ms ease-out",
                  }}
                >
                  <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--color-line, #e5e7eb)" }}>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "var(--color-ink, #1a1a1a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.name}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: "11px", fontFamily: "monospace", color: "var(--color-ink-muted, #6b7280)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      NIC: {user?.nic}
                    </p>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <button
                      role="menuitem"
                      onClick={handleSignOutRequest}
                      style={{
                        width: "100%", padding: "9px 10px", background: "transparent",
                        border: "none", borderRadius: "6px", cursor: "pointer",
                        fontSize: "13px", fontWeight: "600", color: "#dc2626",
                        textAlign: "left", display: "flex", alignItems: "center", gap: "8px",
                        transition: "background 0.12s", fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.07)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── main ── */}
      <main className="px-4 py-10">

        {/* Hero card wrapper */}
        <div className="relative mx-auto w-full lg:w-1/2">
          <div className="mb-3 flex justify-end">
            <Button
              onClick={() => setOpen(true)}
              size="md"
              className="!text-ink"
            >
              Add / Update record
            </Button>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface p-8 sm:p-12"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
          >
            <TopoBackground className="text-teal/15" />

            <div className="relative z-10 flex flex-col items-start gap-4">

              <h2 className="font-display text-3xl font-bold sm:text-4xl" style={{ letterSpacing: "-0.02em" }}>
                Site Records
              </h2>
              <p className="max-w-md text-sm text-ink-muted">
                Search for an existing record by TIN number, or log a new survey entry.
              </p>

              {/* Search row */}
              <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="tin-search-input"
                    type="text"
                    placeholder="Search by TIN number"
                    value={tinInput}
                    onChange={(e) => setTinInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-md border border-line bg-base py-2.5 pl-10 pr-4 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  />
                </div>

                <Button
                  id="tin-search-btn"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching…" : "Search"}
                </Button>

              </div>
              <button
                onClick={() => navigate("/dashboard/map")}
                style={{
                  position: "absolute", top: "20px", right: "20px", zIndex: 20,
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "999px",
                  background: "var(--color-ink, #1a1a1a)", color: "#fff",
                  fontSize: "12px", fontWeight: "700", letterSpacing: "0.03em",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  transition: "transform 0.15s, opacity 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = "1"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                View map
              </button>
            </div>
          </div>
        </div>

        {/* ── search results section ── */}
        {hasSearched && (
          <div style={{ marginTop: "32px", animation: "fadeSlideUp 0.25s ease-out" }}>

            {/* Results header */}
            <div style={{
              display: "flex", alignItems: "flex-end", justifyContent: "space-between",
              marginBottom: "16px", flexWrap: "wrap", gap: "12px",
              paddingBottom: "12px", borderBottom: "1px solid var(--color-line, #e5e7eb)",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)" }}>
                  TIN · {activeSearch}
                </p>
                <h3 style={{ margin: "4px 0 0", fontWeight: "700", fontSize: "18px", color: "var(--color-ink, #1a1a1a)" }}>
                  {loading
                    ? "Searching…"
                    : error
                      ? "Search error"
                      : `${total} record${total !== 1 ? "s" : ""} found`}
                </h3>
              </div>

              {/* Per-page selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label
                  htmlFor="page-size-select"
                  style={{ fontSize: "12px", color: "var(--color-ink-muted, #6b7280)", whiteSpace: "nowrap" }}
                >
                  Per page:
                </label>
                <select
                  id="page-size-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{
                    padding: "5px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600",
                    border: "1px solid var(--color-line, #e5e7eb)",
                    background: "var(--color-surface, #fff)", color: "var(--color-ink, #1a1a1a)",
                    cursor: "pointer", fontFamily: "inherit", outline: "none",
                  }}
                >
                  {[10, 15, 20].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error state */}
            {error && !loading && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                padding: "40px 20px", textAlign: "center",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  background: "rgba(220,38,38,0.10)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p style={{ fontWeight: "600", color: "var(--color-ink, #1a1a1a)", margin: 0 }}>Failed to load results</p>
                <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", margin: 0 }}>{error}</p>
                <button
                  onClick={() => fetchResults(activeSearch, page, pageSize)}
                  style={{
                    marginTop: "4px", padding: "8px 18px", borderRadius: "6px",
                    border: "1px solid var(--color-line)", background: "var(--color-surface)",
                    fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                    color: "var(--color-ink)",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Array.from({ length: pageSize > 10 ? 5 : 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && results.length === 0 && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
                padding: "60px 20px", textAlign: "center",
              }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: "var(--color-line, #e5e7eb)", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "var(--color-ink, #1a1a1a)" }}>
                    No records found
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--color-ink-muted, #6b7280)" }}>
                    No mining license applications matched TIN <span style={{ fontFamily: "monospace", fontWeight: "700" }}>"{activeSearch}"</span>
                  </p>
                </div>
              </div>
            )}

            {/* Results list */}
            {!loading && !error && results.length > 0 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {results.map((record) => (
                    <ResultCard
                      key={record.id}
                      record={record}
                      onClick={() => navigate("/dashboard/search-result", { state: { record } })}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ marginTop: "8px" }}>
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPage={(p) => setPage(p)}
                    />
                    <p style={{
                      textAlign: "center", marginTop: "8px",
                      fontSize: "11px", color: "var(--color-ink-muted, #6b7280)",
                      fontFamily: "monospace",
                    }}>
                      Page {page} of {totalPages} · {total} total record{total !== 1 ? "s" : ""}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Actions modal ── */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Site record"
        title="Choose an action"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" className="flex-1" onClick={() => navigate("/dashboard/new")}>
            New
          </Button>
          <Button variant="copper" className="flex-1" onClick={() => navigate("/dashboard/update")}>
            Update
          </Button>
        </div>
      </Modal>

      {/* ── Sign-out confirmation modal ── */}
      <Modal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        eyebrow="Account"
        title="Sign out?"
      >
        <p className="mb-6 text-sm text-ink-muted">
          Are you sure you want to sign out of your account?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmSignOut(false)}>
            Cancel
          </Button>
          <button
            onClick={handleConfirmSignOut}
            style={{
              flex: 1, padding: "10px 16px", background: "#dc2626",
              color: "#fff", border: "none", borderRadius: "6px",
              fontSize: "14px", fontWeight: "600", cursor: "pointer",
              fontFamily: "inherit", transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.87")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Yes, sign out
          </button>
        </div>
      </Modal>
    </div>
  );
}
