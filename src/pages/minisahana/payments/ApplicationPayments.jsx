import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PAGE_SIZES = [10, 15, 20];

const money = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

function formatPaidAt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function SummaryCard({ label, value, tone }) {
  const tones = {
    paid: "text-emerald-600",
    unpaid: "text-copper",
    neutral: "text-ink",
  };
  return (
    <div
      className="rounded-xl border border-line bg-surface p-3.5 sm:p-4"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted sm:text-[11px]">
        {label}
      </p>
      <p className={`mt-1.5 truncate font-display text-lg font-bold sm:text-2xl ${tones[tone]}`}>
        {value}
      </p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-line/60" />
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-xl bg-line/40" />
      ))}
    </div>
  );
}

export default function ApplicationPayments({ student, onClear }) {
  const { token, logout } = useAuth();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${BASE_URL}/api/application-payments/${encodeURIComponent(student.id)}?page=${page}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` }, signal }
        );
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            res.status === 400
              ? body.error || "Missing application id."
              : body.error || body.message || "Something went wrong. Please try again."
          );
        }
        setResult(await res.json());
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Something went wrong. Please try again.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [student.id, page, limit, token, logout]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const summary = result?.summary;
  const groups = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const isEmpty = result && groups.length === 0;

  return (
    <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
      {/* ── student header ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-page p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold sm:text-base">
            {student.applicantFullNameSinhala || "—"}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
            <span className="font-mono uppercase tracking-wider text-ink-muted">
              NIC: {student.nic || "—"}
            </span>
            {student.bankAccountNumber && (
              <span className="rounded-md bg-line/60 px-2 py-0.5 font-mono text-ink-muted">
                A/C {student.bankAccountNumber}
              </span>
            )}
            {student.grade && (
              <span className="rounded-md bg-copper/10 px-2 py-0.5 font-semibold text-copper">
                Grade {student.grade}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="self-start rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition-colors hover:border-copper/40 hover:bg-copper/10 hover:text-copper focus:outline-none focus:ring-2 focus:ring-copper/30 sm:self-auto"
        >
          Clear
        </button>
      </div>

      {/* ── title ── */}
      <h3 className="font-display text-base font-bold sm:text-xl" style={{ letterSpacing: "-0.01em" }}>
        Application Payments
      </h3>

      {/* ── first load ── */}
      {loading && !result && <Skeleton />}

      {/* ── error ── */}
      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="self-start rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 sm:self-auto"
          >
            Retry
          </button>
        </div>
      )}

      {result && (
        <div className={`space-y-5 transition-opacity sm:space-y-6 ${loading ? "opacity-50" : "opacity-100"}`}>
          {/* ── summary (covers ALL months) ── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SummaryCard label="Paid amount" value={money(summary?.paidAmount)} tone="paid" />
            <SummaryCard label="Unpaid amount" value={money(summary?.unpaidAmount)} tone="unpaid" />
            <SummaryCard label="Paid months" value={summary?.paidMonths ?? 0} tone="neutral" />
            <SummaryCard label="Unpaid months" value={summary?.unpaidMonths ?? 0} tone="neutral" />
          </div>

          {/* ── empty ── */}
          {isEmpty && (
            <div className="rounded-xl border border-dashed border-line px-4 py-10 text-center">
              <p className="text-sm font-semibold">No payment records</p>
              <p className="mt-1 text-xs text-ink-muted">
                This application has no report cards yet.
              </p>
            </div>
          )}

          {/* ── years ── */}
          {groups.map((group) => (
            <section key={group.year}>
              <div className="mb-2.5 flex items-center gap-3">
                <h4 className="font-display text-sm font-bold sm:text-base">{group.year}</h4>
                <span className="h-px flex-1 bg-line" />
              </div>

              <ul className="space-y-2.5">
                {group.months.map((m) => (
                  <li
                    key={`${m.cardId}-${m.year}-${m.month}`}
                    className="flex flex-col gap-2.5 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-copper/30 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                        {m.refNumber}
                        {m.currentGrade ? ` · Grade ${m.currentGrade}` : ""}
                      </p>
                      {m.paid && (m.paidBy || m.paidAt) && (
                        <p className="mt-1.5 text-xs text-ink-muted">
                          Paid{m.paidBy ? ` by ${m.paidBy}` : ""}
                          {m.paidAt ? ` on ${formatPaidAt(m.paidAt)}` : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="font-mono text-sm font-semibold">{money(m.amount)}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          m.paid
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-copper/10 text-copper"
                        }`}
                      >
                        {m.paid ? "Paid" : "Unpaid"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {/* ── pagination ── */}
          {!isEmpty && (
            <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-xs text-ink-muted">
                Rows per page
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-copper/30"
                >
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="ml-1">· {result.total} months</span>
              </label>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-copper/40 hover:text-copper disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 text-xs text-ink-muted">
                  Page <strong className="text-ink">{page}</strong> of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-copper/40 hover:text-copper disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}