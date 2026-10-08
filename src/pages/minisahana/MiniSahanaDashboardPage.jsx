import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopoBackground from "../../components/common/TopoBackground";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

/* ─────────────────────────── hardcoded placeholder data ───────────────────────────
   TODO: replace with real API data once backend endpoints are ready.
*/

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const CHART_COLORS = ["#0f766e", "#4f46e5", "#0ea5e9", "#ec4899", "#10b981"];

/* Donut chart: per-year split, with the all-years total in the centre */
function YearDonutChart({ total, byYear, loading }) {
  const [active, setActive] = useState(null);

  const size = 200;
  const stroke = 26;
  const r = (size - stroke - 10) / 2;
  const C = 2 * Math.PI * r;
  const gap = 3;

  const rows = (byYear ?? []).map((row, i) => ({
    label: String(row.year),
    count: row.count,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const sum = rows.reduce((a, r2) => a + r2.count, 0);
  const other = Math.max(0, (total ?? 0) - sum);
  if (other > 0) rows.push({ label: "Other", count: other, color: "#cbd5e1" });
  const denom = sum + other;

  let acc = 0;
  const segs = rows.map((row) => {
    const frac = denom ? row.count / denom : 0;
    const len = frac * C;
    const seg = { ...row, frac, len, offset: acc };
    acc += len;
    return seg;
  });

  const activeRow = active != null ? rows[active] : null;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <div className="relative h-[200px] w-[200px] shrink-0 sm:h-[220px] sm:w-[220px]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90 overflow-visible">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceae6" strokeWidth={stroke} />
          {segs.map((s, i) =>
            s.count > 0 ? (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={active === i ? stroke + 6 : stroke}
                strokeDashoffset={-s.offset}
                strokeLinecap="butt"
                style={{
                  strokeDasharray: `${Math.max(s.len - gap, 0.5)} ${C}`,
                  animation: `donut-fill 1800ms cubic-bezier(0.45, 0, 0.2, 1) ${i * 250}ms both`,
                  transition: "stroke-width 200ms ease, opacity 200ms ease",
                  cursor: "pointer",
                  opacity: active == null || active === i ? 1 : 0.45,
                }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
              />
            ) : null
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            {activeRow ? activeRow.label : "All years total"}
          </p>
          <p className="font-display text-4xl font-bold leading-tight sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
            {loading ? "—" : (activeRow ? activeRow.count : total ?? 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-ink-muted">applications</p>
        </div>
      </div>

      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1">
        {rows.map((row, i) => (
          <li
            key={row.label}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-line/50"
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.color }} />
              <span className="font-mono text-xs text-ink-muted">{row.label}</span>
            </span>
            <span className="font-semibold">
              {row.count.toLocaleString()}
              <span className="ml-1.5 text-xs font-normal text-ink-muted">
                {denom ? Math.round((row.count / denom) * 100) : 0}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Bar chart: per-grade counts */
function GradeBarChart({ byGrade }) {
  const data = byGrade ?? [];
  const max = Math.max(1, ...data.map((d) => d.count));
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const ticks = [4, 3, 2, 1, 0].map((n) => Math.round((niceMax / 4) * n));

  return (
    <div className="flex gap-2 sm:gap-3">
      {/* y-axis labels */}
      <div className="flex h-[220px] flex-col justify-between pb-0 text-[11px] font-mono text-ink-muted">
        {ticks.map((t) => (
          <span key={t} className="leading-none">{t}</span>
        ))}
      </div>

      <div className="flex-1">
        <div className="relative h-[220px]">
          {/* gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className="border-t border-dashed border-line" />
            ))}
          </div>

          {/* bars */}
          <div className="relative flex h-full items-end gap-1.5 sm:gap-3">
            {data.map((row, i) => {
                   const pct = (row.count / niceMax) * 100;
              return (
                <div key={row.grade} className="group flex h-full flex-1 flex-col items-center justify-end" title={`Grade ${row.grade}: ${row.count}`}>
                  <span className="mb-1 text-xs font-semibold text-ink opacity-80 group-hover:opacity-100">
                    {row.count}
                  </span>
                  <div
                    className="w-full max-w-[44px] rounded-t-md group-hover:brightness-110"
                    style={{
                      height: `${pct}%`,
                      animation: `bar-grow 1400ms cubic-bezier(0.45, 0, 0.2, 1) ${i * 120}ms both`,
                      minHeight: row.count > 0 ? "6px" : "3px",
                      background: row.count > 0
                        ? "linear-gradient(180deg, var(--color-copper, #b85a29), #e0a030)"
                        : "#e5e2dc",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* x-axis labels */}
        <div className="mt-2 flex gap-1.5 sm:gap-3">
          {data.map((row) => (
            <span key={row.grade} className="flex-1 text-center font-mono text-[11px] text-ink-muted">
              {row.grade}
            </span>
          ))}
        </div>
        <p className="mt-1 text-center text-[11px] uppercase tracking-wider text-ink-muted">Grade</p>
      </div>
    </div>
  );
}

export default function MiniSahanaDashboardPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/mini-sahana-form/stats`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          signal: controller.signal,
        });
        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }
        if (!res.ok) throw new Error("Failed to load stats");
        setStats(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setStatsError("Couldn't load summary data.");
        }
      } finally {
        setStatsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [token, logout, navigate]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    if (profileOpen || searchOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen, searchOpen]);

  // Debounced search: fires ~300ms after the user stops typing.
  useEffect(() => {
    const query = searchInput.trim();

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      setSearchOpen(false);
      return;
    }

    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError("");

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
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          throw new Error("Search failed");
        }

        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
        setSearchOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setSearchError("Couldn't load results. Try again.");
          setSearchResults([]);
          setSearchOpen(true);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchInput, token, logout, navigate]);

  // Given a search result item, find which field matched the typed query,
  // and return just that value to display (per the "no other data" requirement).
  const getMatchedValue = (item, query) => {
    const q = query.trim().toLowerCase();
    const fieldsInPriorityOrder = ["nic", "bankAccountNumber", "applicantFullNameSinhala"];
    for (const field of fieldsInPriorityOrder) {
      const val = item?.[field];
      if (val && String(val).toLowerCase().includes(q)) {
        return String(val);
      }
    }
    // Fallback: shouldn't normally happen since the backend already filtered by q.
    return item?.applicantFullNameSinhala || item?.nic || item?.bankAccountNumber || "";
  };

  const handleSelectResult = async (id) => {
    setSearchOpen(false);
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/mini-sahana-form/${id}`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load record");
      }

      const record = await res.json();
      // NOTE: adjust this route to wherever you want the full record to land.
      navigate(`/minisahana/applications/${id}`, { state: { record } });
    } catch (err) {
      console.error(err);
      alert("Couldn't load that application. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

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
          <div className="relative w-full sm:max-w-sm" ref={searchRef}>
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
              onFocus={() => {
                if (searchResults.length > 0 || searchError) setSearchOpen(true);
              }}
              className="w-full rounded-md border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
            />

            {searchOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-md border border-line bg-surface"
                style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              >
                {searchLoading && (
                  <div className="px-4 py-3 text-sm text-ink-muted">Searching…</div>
                )}

                {!searchLoading && searchError && (
                  <div className="px-4 py-3 text-sm text-red-600">{searchError}</div>
                )}

                {!searchLoading && !searchError && searchResults.length === 0 && (
                  <div className="px-4 py-3 text-sm text-ink-muted">No matches found.</div>
                )}

                {!searchLoading && !searchError && searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    onClick={() => handleSelectResult(item.id)}
                    className="block w-full truncate px-4 py-2.5 text-left text-sm text-ink hover:bg-line/50 focus:bg-line/50 focus:outline-none"
                  >
                    {getMatchedValue(item, searchInput)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {statsError && <p className="text-sm text-red-600">{statsError}</p>}

          {/* Charts */}
          <style>{`
            @keyframes donut-fill { from { stroke-dasharray: 0 1000; } }
            @keyframes bar-grow { from { height: 0; min-height: 0; } }
          `}</style>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {/* Year donut (with all-years total in centre) */}
            <div
              className="relative overflow-hidden rounded-2xl border border-line bg-surface p-5 sm:p-7"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
            >
              <TopoBackground className="text-teal/15" />
              <div className="relative z-10">
                <h3 className="font-display text-lg font-semibold">Applications by year</h3>
                <p className="mb-5 mt-0.5 text-sm text-ink-muted">All years total shown in the centre</p>
                <YearDonutChart
                  total={stats?.total ?? 0}
                  byYear={stats?.byYear ?? []}
                  loading={statsLoading}
                />
              </div>
            </div>

            {/* Grade bar chart */}
            <div
              className="rounded-2xl border border-line bg-surface p-5 sm:p-7"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
            >
              <h3 className="font-display text-lg font-semibold">
                Applications by grade ({new Date().getFullYear()})
              </h3>
              <p className="mb-5 mt-0.5 text-sm text-ink-muted">Number of applications per grade</p>
              <GradeBarChart byGrade={stats?.byGrade ?? []} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}