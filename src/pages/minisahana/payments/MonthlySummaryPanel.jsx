import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import GlassSelect from "./GlassSelect";
import { downloadMonthlyReportPdf } from "./downloadMonthlyReportPdf";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: i + 1, label: m }));
const LIMIT_OPTIONS = [10, 15, 20].map((n) => ({ value: n, label: `${n} rows` }));

// All three amounts use this colour. Change it here if you want a different one.
const amountClass = "text-red-600";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Paid-at is an ISO timestamp, shown in GMT+5:30 (Asia/Colombo)
function formatPaidAt(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-US")}`;
}

export default function MonthlySummaryPanel() {
  const { token } = useAuth();

  const currentYear = new Date().getFullYear();
  const yearSelectOptions = Array.from({ length: 8 }, (_, i) => {
    const y = currentYear - 5 + i;
    return { value: y, label: String(y) };
  });

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(""); // intentionally empty
  const [limit, setLimit] = useState(10);

  const [applied, setApplied] = useState(null);
  const [report, setReport] = useState(null);
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  async function handleDownload() {
    if (!applied || downloading) return;
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadMonthlyReportPdf({ year: applied.year, month: applied.month, token });
    } catch (err) {
      setDownloadError(err.message || "Failed to download report.");
    } finally {
      setDownloading(false);
    }
  }

  async function fetchReport(filters, page = 1, pageLimit = limit) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        year: String(filters.year),
        month: String(filters.month),
        page: String(page),
        limit: String(pageLimit),
      });
      const res = await fetch(`${BASE_URL}/api/report-cards/monthly-report?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || body.message || "Failed to load monthly summary.");

      setReport(body);
      setPageInfo({
        page: body.page || page,
        totalPages: body.totalPages || 1,
      });
    } catch (err) {
      setReport(null);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    if (!month) return;
    const filters = { year, month };
    setApplied(filters);
    setDownloadError("");
    fetchReport(filters, 1, limit);
  }

  function handleLimitChange(value) {
    setLimit(value);
    if (applied) fetchReport(applied, 1, value);
  }

  function goToPage(p) {
    if (!applied || p < 1 || p > pageInfo.totalPages || loading) return;
    fetchReport(applied, p, limit);
  }

  const rows = report?.data || [];
  const summary = report?.summary;

  return (
    <section className="flex min-w-0 flex-col gap-5">
      {/* ── Filters ── */}
      <div
        className="rounded-2xl border border-line bg-surface p-4 sm:p-6"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
      >
        <h3 className="font-display text-lg font-semibold text-ink">Monthly summary</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Select a year and month, then press search.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-4">
          <GlassSelect
            label="Year"
            value={year}
            onChange={setYear}
            options={yearSelectOptions}
          />

          {/* Month dropdown appears once a year is selected */}
          {year && (
            <GlassSelect
              label="Month"
              value={month}
              onChange={setMonth}
              options={MONTH_OPTIONS}
              placeholder="Select month"
            />
          )}

          {/* Search icon appears once a month is selected */}
          {year && month && (
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              aria-label="Search monthly summary"
              title="Search"
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-copper px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[46px] sm:px-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="sm:hidden">Search</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Download error ── */}
      {downloadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {downloadError}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8 text-sm text-ink-muted">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-copper" />
          Loading monthly summary...
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && applied && !error && report && rows.length === 0 && (
        <p className="py-6 text-center text-sm text-ink-muted">
          No report cards found for {report.monthLabel || "the selected month"}.
        </p>
      )}

      {/* ── Results ── */}
      {!loading && report && rows.length > 0 && (
        <div
          className="overflow-hidden rounded-2xl border border-line bg-surface"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.16)" }}
        >
          {/* Table header: month label + download */}
          <div className="flex flex-col gap-3 border-b border-line bg-gradient-to-r from-copper/10 via-copper/5 to-transparent px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Monthly report
              </p>
              <h3 className="font-display text-xl font-bold text-ink sm:text-2xl" style={{ letterSpacing: "-0.01em" }}>
                {report.monthLabel}
              </h3>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-copper px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {downloading ? "Preparing PDF..." : "Download report"}
            </button>
          </div>

          {/* Amount summary */}
          {summary && (
            <div className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { label: "Total amount", value: summary.totalAmount },
                { label: "Paid amount", value: summary.paidAmount },
                { label: "Unpaid amount", value: summary.unpaidAmount },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between px-5 py-4 sm:block">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {s.label}
                  </p>
                  <p className={`font-display text-lg font-bold sm:mt-1 sm:text-xl ${amountClass}`}>
                    {formatAmount(s.value)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <table className="block w-full text-left md:table">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-line bg-line/30">
                {["Full name", "Acc number", "Current grade", "Start date", "End date", "Paid at (GMT+5:30)"].map((h) => (
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
              {rows.map((item) => (
                <tr
                  key={item.id}
                  className="block border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-line/20 md:table-row md:px-0 md:py-0"
                >
                  <td className="block pb-3 md:table-cell md:px-5 md:py-4 md:align-middle md:pb-4">
                    <p className="font-display text-base font-semibold text-ink md:max-w-[220px]">
                      {item.fullName}
                    </p>
                  </td>

                  <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-middle">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                      Acc number
                    </span>
                    <span className="font-mono text-xs uppercase tracking-wider text-ink">
                      {item.accNumber}
                    </span>
                  </td>

                  <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-middle">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                      Current grade
                    </span>
                    <span className="inline-block whitespace-nowrap rounded-full bg-copper/10 px-3 py-1 text-xs font-semibold text-copper">
                      Grade {item.currentGrade}
                    </span>
                  </td>

                  <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-middle">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                      Start date
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatDate(item.startDate)}
                    </span>
                  </td>

                  <td className="flex items-center justify-between gap-3 py-1.5 md:table-cell md:px-5 md:py-4 md:align-middle">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                      End date
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatDate(item.endDate)}
                    </span>
                  </td>

                  <td className="flex items-center justify-between gap-3 pt-1.5 md:table-cell md:px-5 md:py-4 md:align-middle">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted md:hidden">
                      Paid at (GMT+5:30)
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatPaidAt(item.month?.paidAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer: rows per page + pagination */}
          <div className="flex flex-col gap-4 border-t border-line bg-line/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-40">
              <GlassSelect
                label="Rows per page"
                value={limit}
                onChange={handleLimitChange}
                options={LIMIT_OPTIONS}
              />
            </div>

            <nav className="flex items-center justify-between gap-3 sm:justify-end" aria-label="Pagination">
              <button
                type="button"
                onClick={() => goToPage(pageInfo.page - 1)}
                disabled={pageInfo.page <= 1}
                className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-ink-muted">
                <span className="font-semibold text-ink">{pageInfo.page}</span> / {pageInfo.totalPages}
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
          </div>
        </div>
      )}
    </section>
  );
}