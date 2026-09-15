import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopoBackground from "../../components/common/TopoBackground";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────── hardcoded placeholder data ───────────────────────────
   TODO: replace with real API data once backend endpoints are ready.
*/
const STATS = {
  total: 428,
  byYear: [
    { year: 2026, count: 62 },
    { year: 2025, count: 118 },
    { year: 2024, count: 97 },
    { year: 2023, count: 84 },
    { year: 2022, count: 67 },
  ],
};

export default function MiniSahanaDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-4 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/minisahana")}
              aria-label="Back to Mini Sahana selection"
              className="flex items-center gap-1.5 rounded-md p-2 text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden text-sm font-medium sm:inline">Back</span>
            </button>

            <div className="hidden h-6 w-px bg-line sm:block" />

            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Mini Sahana logo"
                className="h-9 w-9 rounded-md object-cover sm:h-12 sm:w-12"
              />
              <h1 className="font-display text-lg font-semibold sm:text-2xl">
                Mini Sahana
              </h1>
            </div>
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
                      onClick={() => logout()}
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
      <main className="flex-1 px-4 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-6">

          {/* Title + search + add button row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ letterSpacing: "-0.02em" }}>
                Applications
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Overview of scholarship applications.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => navigate("/minisahana/applications/new")}
            >
              + Add new application
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-sm">
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
              type="text"
              placeholder="Search applications"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-md border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
            />
          </div>

          {/* Total applications card */}
          <div
            className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
          >
            <TopoBackground className="text-teal/15" />
            <div className="relative z-10">
              <p className="text-sm text-ink-muted">Total applications</p>
              <p className="mt-1 font-display text-4xl font-bold sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
                {STATS.total.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Per-year breakdown cards */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink-muted">Applications by year</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {STATS.byYear.map((row) => (
                <div
                  key={row.year}
                  className="rounded-xl border border-line bg-surface p-4"
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
                >
                  <p className="text-xs font-mono uppercase tracking-wide text-ink-muted">{row.year}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{row.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}