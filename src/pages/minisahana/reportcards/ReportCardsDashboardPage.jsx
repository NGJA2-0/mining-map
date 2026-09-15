import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";

const GRADE_DATA = [
  { grade: "6", students: 24 },
  { grade: "7", students: 31 },
  { grade: "8", students: 28 },
  { grade: "9", students: 19 },
  { grade: "10", students: 22 },
  { grade: "11", students: 17 },
  { grade: "12", students: 12 },
  { grade: "13", students: 9 },
];

export default function ReportCardsDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

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
              aria-label="Back to Mini Sahana menu"
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
      <main className="flex-1 px-4 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          {/* Title */}
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ letterSpacing: "-0.02em" }}>
              Report Cards
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Browse student report cards by grade, or search for a specific student.
            </p>
          </div>

          {/* Search bar + Add button */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or NIC..."
                className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-copper/20"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {}}
            >
              + Add New Report Card
            </Button>
          </div>

          {/* Grade cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
            {GRADE_DATA.map((item) => (
              <button
                key={item.grade}
                type="button"
                onClick={() => {}}
                className="group flex flex-col items-start gap-2 rounded-xl border border-line bg-surface p-4 text-left transition-all hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-md sm:p-5"
              >
                <span className="rounded-md bg-teal/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal">
                  Grade {item.grade}
                </span>
                <span className="font-display text-3xl font-bold sm:text-4xl">
                  {item.students}
                </span>
                <span className="text-xs text-ink-muted">Students</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}