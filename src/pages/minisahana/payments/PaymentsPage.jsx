import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import PayConfirmModal from "./PayConfirmModal";
import GlassSelect from "./GlassSelect";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZE = 10;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: i + 1, label: m }));

const fieldClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PaymentsPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);
  const yearSelectOptions = yearOptions.map((y) => ({ value: y, label: String(y) }));

  const [year, setYear] = useState(currentYear);
  const [fromMonth, setFromMonth] = useState(1);
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [grade, setGrade] = useState("");

  const [appliedFilters, setAppliedFilters] = useState(null);
  const [results, setResults] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchReportCards(filters, page = 1) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        year: String(filters.year),
        fromMonth: String(filters.fromMonth),
        toMonth: String(filters.toMonth),
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (filters.grade) params.set("grade", filters.grade);

      const res = await fetch(`${BASE_URL}/api/report-cards/by-month?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.message || "Failed to load payments.");

      setResults(body.data || []);
      setPageInfo({
        page: body.page || page,
        totalPages: body.totalPages || 1,
        total: body.total || 0,
      });
    } catch (err) {
      setResults([]);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e) {
    e?.preventDefault();
    if (fromMonth > toMonth) {
      setError("Start month cannot be after end month.");
      return;
    }
    const filters = { year, fromMonth, toMonth, grade: grade.trim() };
    setAppliedFilters(filters);
    fetchReportCards(filters, 1);
  }

  function goToPage(p) {
    if (!appliedFilters || p < 1 || p > pageInfo.totalPages || loading) return;
    fetchReportCards(appliedFilters, p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [payTarget, setPayTarget] = useState(null);

  // Close the popup with Escape and lock page scroll while it is open
  useEffect(() => {
    if (!selected) return;
    function handleEscape(e) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected]);

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
              <img
                src="/logo.jpg"
                alt="Mini Sahana logo"
                className="h-9 w-9 rounded-md object-cover sm:h-12 sm:w-12"
              />
              <h1 className="font-display text-lg font-semibold sm:text-2xl">
                Payments
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
      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-10 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          {/* Filter bar */}
          <form
            onSubmit={handleFilter}
            className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[1fr_1.2fr_1.2fr_1fr_auto] lg:items-end">
              <GlassSelect
                label="Year"
                value={year}
                onChange={setYear}
                options={yearSelectOptions}
              />

              <GlassSelect
                label="From month"
                value={fromMonth}
                onChange={setFromMonth}
                options={MONTH_OPTIONS}
              />

              <GlassSelect
                label="To month"
                value={toMonth}
                onChange={setToMonth}
                options={MONTH_OPTIONS}
              />

              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                  Grade <span className="font-normal normal-case tracking-normal">(optional)</span>
                </span>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 10"
                  className={fieldClass}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                aria-label="Filter payments"
                title="Filter"
                className="col-span-2 flex h-[46px] items-center justify-center gap-2 rounded-xl bg-copper px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-1 lg:w-[46px] lg:px-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="lg:hidden">Filter</span>
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* States */}
          {loading && (
            <div className="mt-10 flex items-center justify-center gap-3 text-sm text-ink-muted">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-copper" />
              Loading payments...
            </div>
          )}

          {!loading && !appliedFilters && !error && (
            <p className="mt-10 text-center text-sm text-ink-muted">
              Select a year and month range, then press the search icon to view payments.
            </p>
          )}

          {!loading && appliedFilters && !error && results.length === 0 && (
            <p className="mt-10 text-center text-sm text-ink-muted">
              No report cards found for the selected filters.
            </p>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <>
              <p className="mt-6 text-sm text-ink-muted">
                Showing <span className="font-semibold text-ink">{results.length}</span> of{" "}
                <span className="font-semibold text-ink">{pageInfo.total}</span> records
              </p>

              <div
                className="mt-4 overflow-hidden rounded-2xl border border-line bg-surface"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 10px 28px -14px rgba(0,0,0,0.12)" }}
              >
                <table className="block w-full text-left md:table">
                  <thead className="hidden md:table-header-group">
                    <tr className="border-b border-line bg-line/30">
                      {["Student", "Grade", "Start date", "End date", "Monthly payments"].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="block md:table-row-group">
                    {results.map((item) => (
                      <tr
                        key={item.id}
                        className="block border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-line/20 md:table-row md:px-0 md:py-0"
                      >
                        {/* Student */}
                        <td className="block pb-3 md:table-cell md:px-5 md:py-4 md:align-top">
                          <p className="font-display text-base font-semibold text-ink md:max-w-[220px]">
                            {item.fullName}
                          </p>
                          <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
                            Acc No: {item.accNumber}
                          </p>
                        </td>

                        {/* Grade */}
                        <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-top">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                            Grade
                          </span>
                          <span className="inline-block whitespace-nowrap rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
                            Grade {item.currentGrade}
                          </span>
                        </td>

                        {/* Start date */}
                        <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-top">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                            Start date
                          </span>
                          <span className="whitespace-nowrap text-sm font-medium text-ink">
                            {formatDate(item.startDate)}
                          </span>
                        </td>

                        {/* End date */}
                        <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-top">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                            End date
                          </span>
                          <span className="whitespace-nowrap text-sm font-medium text-ink">
                            {formatDate(item.endDate)}
                          </span>
                        </td>

                        {/* Months */}
                        <td className="flex flex-wrap items-center justify-between gap-3 pt-3 md:table-cell md:px-5 md:py-4 md:align-top">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                            Monthly payments
                          </span>
                          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                            <span className="whitespace-nowrap text-xs text-ink-muted">
                              <span className="font-semibold text-emerald-700">
                                {(item.months || []).filter((m) => m.paid).length}
                              </span>
                              {" / "}
                              {(item.months || []).length} paid
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelected(item)}
                              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-copper/30 bg-copper/10 px-3.5 py-1.5 text-xs font-semibold text-copper transition-colors hover:bg-copper hover:text-white focus:outline-none focus:ring-2 focus:ring-copper/30"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                            {(item.months || []).some((m) => !m.paid) && (
                              <button
                                type="button"
                                onClick={() => setPayTarget(item)}
                                className="whitespace-nowrap rounded-lg bg-copper px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30"
                              >
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pageInfo.totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-between gap-3" aria-label="Pagination">
                  <button
                    type="button"
                    onClick={() => goToPage(pageInfo.page - 1)}
                    disabled={pageInfo.page <= 1}
                    className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-ink-muted">
                    Page <span className="font-semibold text-ink">{pageInfo.page}</span> of{" "}
                    <span className="font-semibold text-ink">{pageInfo.totalPages}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => goToPage(pageInfo.page + 1)}
                    disabled={pageInfo.page >= pageInfo.totalPages}
                    className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Months popup ── */}
      {selected && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="months-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />

          <div
            className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface sm:max-w-md sm:rounded-2xl"
            style={{ boxShadow: "0 24px 60px -12px rgba(0,0,0,0.35)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h3
                  id="months-modal-title"
                  className="font-display text-lg font-semibold text-ink"
                >
                  {selected.fullName}
                </h3>
                <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
                  Acc No: {selected.accNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between gap-3 bg-line/30 px-5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Monthly payments
              </p>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {(selected.months || []).filter((m) => m.paid).length} paid
                </span>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                  {(selected.months || []).filter((m) => !m.paid).length} unpaid
                </span>
              </div>
            </div>

            {/* Months list */}
            <ul className="flex flex-col gap-2 overflow-y-auto px-5 py-4 pb-6">
              {(selected.months || []).map((m) => (
                <li
                  key={m.label}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 ${
                    m.paid
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        m.paid ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`truncate text-sm font-semibold ${
                        m.paid ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {m.label}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Pay confirm / success popup ── */}
      {payTarget && appliedFilters && (
        <PayConfirmModal
          record={payTarget}
          filters={appliedFilters}
          onClose={() => setPayTarget(null)}
          onPaid={() => fetchReportCards(appliedFilters, pageInfo.page)}
        />
      )}
    </div>
  );
}