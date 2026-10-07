import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayConfirmModal({ record, filters, onClose, onPaid }) {
  const { token } = useAuth();

  // "confirm" -> "loading" -> "success"
  const [status, setStatus] = useState("confirm");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const busy = status === "loading";

  // Escape closes (not while paying) and page scroll is locked while open
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [busy, onClose]);

  async function handlePay() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/report-cards/${record.id}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year: filters.year,
          fromMonth: filters.fromMonth,
          toMonth: filters.toMonth,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || body.message || "Payment failed. Please try again.");

      setResult(body.result || null);
      setStatus("success");
      onPaid?.();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("confirm");
    }
  }

  const rangeLabel = `${MONTHS[filters.fromMonth - 1]} – ${MONTHS[filters.toMonth - 1]} ${filters.year}`;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />

      <div
        className="relative w-full overflow-hidden rounded-t-3xl border border-line bg-surface sm:max-w-md sm:rounded-2xl"
        style={{ boxShadow: "0 24px 60px -12px rgba(0,0,0,0.35)" }}
      >
        {status !== "success" ? (
          /* ── Warning / confirm ── */
          <div className="px-5 pb-6 pt-6 text-center sm:px-8 sm:pb-8 sm:pt-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 id="pay-modal-title" className="mt-5 font-display text-xl font-semibold text-ink">
              Confirm payment
            </h3>
            <p className="mt-2 text-sm font-semibold text-red-600">
              This action cannot be undone.
            </p>

            <div className="mt-5 rounded-xl border border-line bg-line/30 px-4 py-3 text-left">
              <p className="truncate text-sm font-semibold text-ink">{record.fullName}</p>
              <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-ink-muted">
                Acc No: {record.accNumber}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                Period: <span className="font-semibold text-ink">{rangeLabel}</span>
              </p>
            </div>

            {error && (
              <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-copper/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-copper px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {busy ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        ) : (
          /* ── Success ── */
          <div className="px-5 pb-6 pt-6 text-center sm:px-8 sm:pb-8 sm:pt-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h3 id="pay-modal-title" className="mt-5 font-display text-xl font-semibold text-ink">
              Payment successful
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              The payment for <span className="font-semibold text-ink">{record.fullName}</span> has been recorded.
            </p>

            {result && (
              <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line">
                <div className="bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Newly paid</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">{result.paidCount ?? 0}</p>
                </div>
                <div className="bg-surface px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Already paid</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{result.alreadyPaidCount ?? 0}</p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-copper px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-copper/30"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}