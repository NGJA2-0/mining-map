import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

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

function formatCurrency(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "—";
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReportCardSummary({ accNumber, token, record: providedRecord, onDone, onClose }) {
  const [record, setRecord] = useState(providedRecord || null);
  const [loading, setLoading] = useState(!providedRecord);
  const [error, setError] = useState("");

  useEffect(() => {
    // If the caller already has the full record (e.g. picked from a search
    // dropdown), use it directly and skip the network round-trip.
    if (providedRecord) {
      setRecord(providedRecord);
      setLoading(false);
      setError("");
      return;
    }

    if (!accNumber) {
      setLoading(false);
      setError("No account number available for this record.");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/report-cards/search?q=${encodeURIComponent(accNumber)}`,
          {
            method: "GET",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error("Search failed");
        }

        const data = await res.json();
        const match = Array.isArray(data) ? data[0] : null;

        if (!match) {
          setError("Saved, but couldn't find the record to display.");
          setRecord(null);
        } else {
          setRecord(match);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Saved, but couldn't load the summary. Try searching again.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [accNumber, token, providedRecord]);

  const fields = record
    ? [
        { label: "Full Name", value: record.fullName || "—" },
        { label: "Account Number", value: record.accNumber || "—" },
        { label: "NIC", value: record.nic || "—" },
        { label: "Grade", value: record.grade || "—" },
        { label: "Start Date", value: formatDate(record.startDate) },
        { label: "End Date", value: formatDate(record.endDate) },
        { label: "Monthly Amount", value: formatCurrency(record.amount) },
      ]
    : [];

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.14)" }}
    >
      {/* Header */}
      <div className="border-b border-line bg-gradient-to-r from-teal/10 to-transparent px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal">
                Report Card Saved
              </p>
              <h3 className="truncate font-display text-lg font-bold sm:text-xl">
                {record?.fullName || "Summary"}
              </h3>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-6 sm:px-7 sm:py-7">
        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-muted">
            <svg className="h-4 w-4 animate-spin text-copper" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Loading summary…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-line bg-page p-4 text-center text-sm text-ink-muted">
            {error}
          </div>
        )}

        {!loading && record && (
          <div className="flex flex-col gap-6">
            {/* Detail fields */}
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    {f.label}
                  </dt>
                  <dd className="mt-1 truncate text-sm font-medium text-ink sm:text-base">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Highlighted totals */}
            <div className="grid grid-cols-1 gap-3 border-t border-line pt-5 sm:grid-cols-2">
              <div className="rounded-xl border border-copper/25 bg-copper/5 px-4 py-4 sm:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-copper">
                  Total Duration
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
                  {record.totalDuration ?? "—"}
                  <span className="ml-1.5 text-sm font-medium text-ink-muted">months</span>
                </p>
              </div>
              <div className="rounded-xl border border-teal/25 bg-teal/5 px-4 py-4 sm:px-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-teal">
                  Total Amount
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
                  {formatCurrency(record.totalAmount)}
                </p>
              </div>
            </div>

            {onDone && (
              <div className="flex justify-end border-t border-line pt-5">
                <button
                  type="button"
                  onClick={onDone}
                  className="w-full rounded-lg border border-line bg-page px-8 py-2.5 text-sm font-semibold text-ink transition-all hover:border-copper/40 hover:bg-copper/5 focus:outline-none focus:ring-2 focus:ring-copper/20 sm:w-auto"
                >
                  Add Another Report Card
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}