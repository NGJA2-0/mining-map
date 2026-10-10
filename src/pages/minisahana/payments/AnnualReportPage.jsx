import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import TopoBackground from "../../../components/common/TopoBackground";
import Button from "../../../components/common/Button";
import GlassSelect from "./GlassSelect";
import { downloadAnnualReportPdf, UnauthorizedError } from "./downloadAnnualReportPdf";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZES = [10, 15, 20];

const GRADE_OPTIONS = [
  { value: "", label: "All grades" },
  ...[6, 7, 8, 9, 10, 11, 12, 13].map((g) => ({ value: String(g), label: `Grade ${g}` })),
];

/* ── formatters ── */
function money(n) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── small presentational helpers ── */
const thClass =
  "px-4 py-4 text-[11px] font-semibold uppercase tracking-wider text-ink-muted whitespace-nowrap first:pl-6 last:pr-6 sm:px-5 sm:first:pl-8 sm:last:pr-8";
const tdClass =
  "px-4 py-4 text-sm text-ink whitespace-nowrap first:pl-6 last:pr-6 sm:px-5 sm:py-5 sm:first:pl-8 sm:last:pr-8";
const thNumClass = `${thClass} text-right`;
const tdNumClass = `${tdClass} text-right tabular-nums`;
const cardShadow = { boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 10px 28px -14px rgba(0,0,0,0.12)" };

function SectionTitle({ children }) {
  return (
    <div className="mb-4 mt-10 flex items-center gap-4 sm:mt-14">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
        {children}
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const toneClass =
    tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-600" : "text-ink";
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6" style={cardShadow}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className={`mt-2 break-words font-display text-lg font-semibold sm:text-xl ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function MonthsList({ months }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {(months || []).map((m) => (
        <li
          key={m.label}
          className={`rounded-2xl border px-4 py-3 ${
            m.paid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">{m.label}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                m.paid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
              }`}
            >
              {m.paid ? "Paid" : "Unpaid"}
            </span>
          </div>
          {m.paid && (
            <p className="mt-1.5 text-xs text-ink-muted">
              {formatDateTime(m.paidAt)}
              {m.paidBy ? ` · by ${m.paidBy}` : ""}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function TotalsTable({ rows, firstKey, firstLabel, showCards }) {
  const headers = [
    firstLabel,
    ...(showCards ? ["Cards"] : []),
    "Payments",
    "Paid",
    "Unpaid",
    "Total amount",
    "Paid amount",
    "Unpaid amount",
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface" style={cardShadow}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-line bg-line/30">
              {headers.map((h, i) => (
                <th key={h} className={i === 0 ? thClass : thNumClass}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[firstKey]} className="border-b border-line last:border-b-0 hover:bg-line/20">
                <td className={`${tdClass} font-semibold`}>
                  {firstKey === "grade" ? `Grade ${r.grade}` : r.monthLabel}
                </td>
                {showCards && <td className={tdNumClass}>{r.cards}</td>}
                <td className={tdNumClass}>{r.count}</td>
                <td className={`${tdNumClass} text-emerald-700`}>{r.paidCount}</td>
                <td className={`${tdNumClass} text-red-600`}>{r.unpaidCount}</td>
                <td className={tdNumClass}>{money(r.totalAmount)}</td>
                <td className={`${tdNumClass} text-emerald-700`}>{money(r.paidAmount)}</td>
                <td className={`${tdNumClass} text-red-600`}>{money(r.unpaidAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AnnualReportPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i).map((y) => ({
    value: y,
    label: String(y),
  }));

  const [year, setYear] = useState(currentYear);
  const [grade, setGrade] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { kind: "validation" | "server", message }
  const [expandedId, setExpandedId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const reqRef = useRef(0);

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  async function fetchReport(filters, page = 1, limit = pageSize) {
    const reqId = ++reqRef.current;
    setLoading(true);
    setError(null);
    setExpandedId(null);
    try {
      const params = new URLSearchParams({
        year: String(filters.year),
        page: String(page),
        limit: String(limit),
      });
      if (filters.grade) params.set("grade", filters.grade); // omitted for "All grades"

      const res = await fetch(`${BASE_URL}/api/annual-reports?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      let body = null;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      if (reqId !== reqRef.current) return; // a newer request replaced this one

      if (res.status === 400) {
        setReport(null);
        setError({ kind: "validation", message: body?.error || "Invalid request." });
        return;
      }
      if (!res.ok) throw new Error("server");

      setReport(body);
    } catch {
      if (reqId !== reqRef.current) return;
      setReport(null);
      setError({
        kind: "server",
        message: "Something went wrong while loading the annual report. Please try again.",
      });
    } finally {
      if (reqId === reqRef.current) setLoading(false);
    }
  }

  function handleSearch(e) {
    e?.preventDefault();
    if (!Number.isInteger(Number(year)) || year < 2000 || year > 2100) {
      setError({ kind: "validation", message: "Year must be between 2000 and 2100." });
      return;
    }
    const filters = { year, grade };
    setAppliedFilters(filters);
    fetchReport(filters, 1, pageSize);
  }

  function handleRetry() {
    if (appliedFilters) fetchReport(appliedFilters, report?.page || 1, pageSize);
  }

  function goToPage(p) {
    if (!appliedFilters || !report || p < 1 || p > report.totalPages || loading) return;
    fetchReport(appliedFilters, p, pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLimitChange(e) {
    const next = Number(e.target.value);
    setPageSize(next);
    if (appliedFilters) fetchReport(appliedFilters, 1, next); // resets to page 1
  }

  async function handleDownloadPdf() {
    // Uses the last SEARCHED filters, not the unsearched inputs.
    if (!appliedFilters?.year || downloading) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadAnnualReportPdf({
        year: appliedFilters.year,
        grade: appliedFilters.grade,
        token,
      });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      setError({
        kind: "download",
        message: err.message || "Failed to download the report.",
      });
    } finally {
      setDownloading(false);
    }
  }

  const summary = report?.summary;
  const data = report?.data || [];
  const isEmpty = report && data.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-4 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/minisahana/payments")}
              aria-label="Back to Payments dashboard"
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
              <img src="/logo.jpg" alt="Mini Sahana logo" className="h-9 w-9 rounded-md object-cover sm:h-12 sm:w-12" />
              <h1 className="font-display text-lg font-semibold sm:text-2xl">Annual Report</h1>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              id="profile-menu-button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((p) => !p)}
              style={{
                width: "46px", height: "46px", borderRadius: "50%",
                background: "var(--color-copper, #b85a29)", color: "#fff",
                border: "none", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
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
                  position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: "220px",
                  background: "var(--color-surface, #fff)", border: "1px solid var(--color-line, #e5e7eb)",
                  borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100,
                  overflow: "hidden", animation: "dropdownIn 150ms ease-out",
                }}
              >
                <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--color-line, #e5e7eb)" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                      width: "100%", padding: "9px 10px", background: "transparent", border: "none",
                      borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      color: "#dc2626", textAlign: "left", fontFamily: "inherit",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── main (split layout, same look as the dashboard) ── */}
      <main className="flex flex-1 flex-col pb-16 pl-12 pr-4 pt-6 sm:px-12 sm:pb-20 sm:pt-10 lg:px-16 lg:pt-12">
        <div className="w-full" style={{ maxWidth: 1200, marginLeft: "auto", marginRight: "auto" }}>
          {/* Right: filters + results */}
          <div className="min-w-0">
            {/* Filter bar */}
            <form
              onSubmit={handleSearch}
              className="rounded-3xl border border-line bg-surface p-5 sm:p-8"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
            >
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
                <GlassSelect label="Year" value={year} onChange={setYear} options={yearOptions} />

                <GlassSelect
                  label="Grade (optional)"
                  value={grade}
                  onChange={setGrade}
                  options={GRADE_OPTIONS}
                />

                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Search annual report"
                  title="Search"
                  className="col-span-2 flex h-[46px] items-center justify-center gap-2 rounded-xl bg-copper px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-1 lg:w-[46px] lg:px-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <span className="lg:hidden">Search</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={!report || !appliedFilters?.year || loading || downloading}
                  aria-busy={downloading}
                  className="col-span-2 flex h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-copper/30 bg-copper/10 px-5 text-sm font-semibold text-copper transition-colors hover:bg-copper hover:text-white focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-50 lg:col-span-1"
                >
                  {downloading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-copper/30 border-t-copper" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  {downloading ? "Generating..." : "Download PDF"}
                </button>
              </div>
            </form>

            {/* Error */}
            {error && (
              <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <span>{error.message}</span>
                {error.kind === "server" && appliedFilters && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="mt-14 flex items-center justify-center gap-3 text-sm text-ink-muted">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-copper" />
                Loading annual report...
              </div>
            )}

            {/* Idle hint */}
            {!loading && !report && !error && (
              <p className="mt-14 text-center text-sm text-ink-muted">
                Select a year and press search to view the annual report.
              </p>
            )}

            {/* Results */}
            {!loading && report && (
              <>
                {/* Summary cards (grand totals, straight from the API) */}
                <SectionTitle>Summary — {report.year}{report.grade ? ` · Grade ${report.grade}` : ""}</SectionTitle>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                  <StatCard label="Report cards" value={summary?.totalCards ?? 0} />
                  <StatCard label="Payments" value={summary?.count ?? 0} />
                  <StatCard label="Paid payments" value={summary?.paidCount ?? 0} tone="good" />
                  <StatCard label="Unpaid payments" value={summary?.unpaidCount ?? 0} tone="bad" />
                  <StatCard label="Total amount" value={money(summary?.totalAmount)} />
                  <StatCard label="Paid amount" value={money(summary?.paidAmount)} tone="good" />
                  <StatCard label="Unpaid amount" value={money(summary?.unpaidAmount)} tone="bad" />
                </div>

                {/* Month-wise totals */}
                <SectionTitle>Month-wise totals</SectionTitle>
                <TotalsTable rows={report.byMonth || []} firstKey="month" firstLabel="Month" />

                {/* Grade-wise totals */}
                <SectionTitle>Grade-wise totals</SectionTitle>
                {(report.byGrade || []).length === 0 ? (
                  <p className="rounded-3xl border border-line bg-surface px-5 py-10 text-center text-sm text-ink-muted">
                    No grade data for this year.
                  </p>
                ) : (
                  <TotalsTable rows={report.byGrade} firstKey="grade" firstLabel="Grade" showCards />
                )}

                {/* Report cards */}
                <SectionTitle>Report cards</SectionTitle>
                {isEmpty ? (
                  <p className="rounded-3xl border border-line bg-surface px-5 py-12 text-center text-sm text-ink-muted">
                    No report cards found for this year
                  </p>
                ) : (
                  <>
                  <div className="hidden overflow-hidden rounded-3xl border border-line bg-surface md:block" style={cardShadow}>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1000px] text-left">
                        <thead>
                          <tr className="border-b border-line bg-line/30">
                            <th className={thClass} aria-label="Expand" />
                            {[
                              "Ref No", "Full name", "NIC", "Grade", "Months", "Paid months",
                              "Unpaid months", "Monthly amount", "Year total", "Paid amount", "Unpaid amount",
                            ].map((h, i) => (
                              <th key={h} className={i >= 4 ? thNumClass : thClass}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((c) => {
                            const open = expandedId === c.id;
                            return (
                              <Fragment key={c.id}>
                                <tr className="border-b border-line hover:bg-line/20">
                                  <td className="py-4 pl-5 pr-1 sm:pl-8">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedId(open ? null : c.id)}
                                      aria-expanded={open}
                                      aria-label={open ? "Hide months" : "Show months"}
                                      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        className={`transition-transform ${open ? "rotate-90" : ""}`}
                                      >
                                        <polyline points="9 18 15 12 9 6" />
                                      </svg>
                                    </button>
                                  </td>
                                  <td className={`${tdClass} font-mono text-xs`}>{c.refNumber}</td>
                                  <td className={`${tdClass} font-semibold`}>{c.fullName}</td>
                                  <td className={`${tdClass} font-mono text-xs`}>{c.nic}</td>
                                  <td className={tdClass}>
                                    <span className="rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
                                      Grade {c.currentGrade}
                                    </span>
                                  </td>
                                  <td className={tdNumClass}>{c.monthsInYear}</td>
                                  <td className={`${tdNumClass} text-emerald-700`}>{c.paidMonths}</td>
                                  <td className={`${tdNumClass} text-red-600`}>{c.unpaidMonths}</td>
                                  <td className={tdNumClass}>{money(c.amount)}</td>
                                  <td className={tdNumClass}>{money(c.yearAmount)}</td>
                                  <td className={`${tdNumClass} text-emerald-700`}>{money(c.paidAmount)}</td>
                                  <td className={`${tdNumClass} text-red-600`}>{money(c.unpaidAmount)}</td>
                                </tr>

                                {open && (
                                  <tr className="border-b border-line bg-line/20">
                                    <td colSpan={12} className="px-5 py-5 sm:px-8 sm:py-6">
                                      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        {(c.months || []).map((m) => (
                                          <li
                                            key={m.label}
                                            className={`rounded-2xl border px-4 py-3 ${
                                              m.paid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-3">
                                              <span className="text-sm font-semibold text-ink">{m.label}</span>
                                              <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                  m.paid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                                                }`}
                                              >
                                                {m.paid ? "Paid" : "Unpaid"}
                                              </span>
                                            </div>
                                            {m.paid && (
                                              <p className="mt-1.5 text-xs text-ink-muted">
                                                {formatDateTime(m.paidAt)}
                                                {m.paidBy ? ` · by ${m.paidBy}` : ""}
                                              </p>
                                            )}
                                          </li>
                                        ))}
                                      </ul>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile cards (below md) */}
                  <ul className="flex flex-col gap-4 md:hidden">
                    {data.map((c) => {
                      const open = expandedId === c.id;
                      return (
                        <li
                          key={c.id}
                          className="overflow-hidden rounded-3xl border border-line bg-surface"
                          style={cardShadow}
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="break-words font-display text-base font-semibold text-ink">
                                  {c.fullName}
                                </p>
                                <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-muted">
                                  {c.refNumber}
                                </p>
                              </div>
                              <span className="shrink-0 rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
                                Grade {c.currentGrade}
                              </span>
                            </div>

                            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                              {[
                                { label: "NIC", value: c.nic, cls: "font-mono text-xs" },
                                { label: "Months", value: c.monthsInYear },
                                { label: "Paid months", value: c.paidMonths, cls: "text-emerald-700" },
                                { label: "Unpaid months", value: c.unpaidMonths, cls: "text-red-600" },
                                { label: "Monthly amount", value: money(c.amount) },
                                { label: "Year total", value: money(c.yearAmount) },
                                { label: "Paid amount", value: money(c.paidAmount), cls: "text-emerald-700" },
                                { label: "Unpaid amount", value: money(c.unpaidAmount), cls: "text-red-600" },
                              ].map((f) => (
                                <div key={f.label} className="min-w-0">
                                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                                    {f.label}
                                  </dt>
                                  <dd className={`mt-1 break-words text-sm font-medium text-ink ${f.cls || ""}`}>
                                    {f.value}
                                  </dd>
                                </div>
                              ))}
                            </dl>

                            <button
                              type="button"
                              onClick={() => setExpandedId(open ? null : c.id)}
                              aria-expanded={open}
                              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-copper/20"
                            >
                              {open ? "Hide months" : "Show months"}
                              <svg
                                xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className={`transition-transform ${open ? "rotate-90" : ""}`}
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          </div>

                          {open && (
                            <div className="border-t border-line bg-line/20 p-5">
                              <MonthsList months={c.months} />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  </>
                )}

                {/* Pagination + page size */}
                <nav
                  className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Pagination"
                >
                  <label className="flex items-center justify-between gap-2 text-sm text-ink-muted sm:justify-start">
                    Rows per page
                    <select
                      value={pageSize}
                      onChange={handleLimitChange}
                      className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                    >
                      {PAGE_SIZES.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => goToPage(report.page - 1)}
                      disabled={report.page <= 1}
                      className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-ink-muted">
                      Page <span className="font-semibold text-ink">{report.page}</span> of{" "}
                      <span className="font-semibold text-ink">{report.totalPages || 1}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => goToPage(report.page + 1)}
                      disabled={report.page >= (report.totalPages || 1)}
                      className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}