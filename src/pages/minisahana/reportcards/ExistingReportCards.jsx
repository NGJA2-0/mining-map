import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const LIMIT_OPTIONS = [5, 10, 15];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ExistingReportCards({ applicationId, onLoaded, onAddNew, showAddButton }) {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!applicationId) return;

    const controller = new AbortController();
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/report-cards/by-application/${applicationId}?page=${page}&limit=${limit}`,
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
          throw new Error("Failed to load report cards");
        }

        const data = await res.json();
        setRecords(Array.isArray(data.data) ? data.data : []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        onLoaded?.(data.total ?? 0);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Couldn't load previous report cards.");
          setRecords([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [applicationId, page, limit, token, logout, navigate]);

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.14)" }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-line bg-gradient-to-r from-teal/5 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal">
            Report Card History
          </p>
          <h3 className="mt-0.5 font-display text-lg font-bold sm:text-xl">
            Previous Submissions
            {total > 0 && (
              <span className="ml-2 text-sm font-medium text-ink-muted">
                ({total})
              </span>
            )}
          </h3>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Show
          <select
            value={limit}
            onChange={handleLimitChange}
            className="rounded-lg border border-line bg-page px-2.5 py-1.5 text-xs font-semibold text-ink focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Body */}
      <div className="px-5 py-6 sm:px-7 sm:py-7">
        {loading && (
          <p className="rounded-lg border border-line bg-page p-4 text-center text-sm text-ink-muted">
            Loading previous report cards…
          </p>
        )}

        {!loading && error && (
          <p className="rounded-lg border border-line bg-page p-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && records.length === 0 && (
          <p className="rounded-lg border border-line bg-page p-4 text-center text-sm text-ink-muted">
            No previous report cards found for this student.
          </p>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="flex flex-col gap-5 sm:gap-6">
            {records.map((r, idx) => (
              <div
                key={r.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition-shadow hover:shadow-md"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 20px -12px rgba(0,0,0,0.12)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-page px-4 py-3 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-copper/10 text-[10px] font-bold text-copper">
                      {idx + 1}
                    </span>
                    <span className="rounded-full bg-copper/10 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-copper">
                      {r.refNumber || "—"}
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted">
                    Submitted {formatDate(r.createdAt)}
                  </span>
                </div>

                <div className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="mb-4 flex flex-col gap-0.5 border-b border-line pb-4">
                    <span className="truncate text-sm font-semibold text-ink">
                      {r.fullName || "—"}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                      NIC: {r.nic || "—"}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                      A/C: {r.accNumber || "—"}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                      Applied Grade: {r.appliedGrade || "—"}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
                      Current Grade: {r.currentGrade || "—"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    <div>
                      <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Start Date
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={formatDate(r.startDate)}
                        className="w-full cursor-not-allowed rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-ink-muted"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        End Date
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={formatDate(r.endDate)}
                        className="w-full cursor-not-allowed rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-ink-muted"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Monthly Amount
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={formatAmount(r.amount)}
                        className="w-full cursor-not-allowed rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-ink-muted"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                        Total Amount
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={formatAmount(r.totalAmount)}
                        className="w-full cursor-not-allowed rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-ink-muted"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <span className="text-xs text-ink-muted">
                      Duration:{" "}
                      <span className="font-semibold text-ink">
                        {r.totalDuration ?? "—"} month(s)
                      </span>
                    </span>

                    {r.pdfUrl && (
                      <a
                        href={`${API_BASE_URL}/${r.pdfUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-page px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-copper/40 hover:text-copper"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        View PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && showAddButton && (
          <div className="mt-5 flex justify-end border-t border-line pt-5">
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-copper px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-copper/30 sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Report Card
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-line bg-page px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-copper/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-ink-muted">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-line bg-page px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-copper/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}