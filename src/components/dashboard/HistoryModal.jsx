import { useEffect } from "react";

/* ─────────────────────────── helpers ─────────────────────────── */

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* ─────────────────────────── sub components ─────────────────────────── */

function SaleTypeBadge({ privateSaleValue }) {
  const isNew = privateSaleValue === null || privateSaleValue === undefined;
  const label = isNew ? "New" : "Extended";
  const bg = isNew ? "rgba(37,99,235,0.12)" : "rgba(217,119,6,0.12)";
  const color = isNew ? "#2563eb" : "#d97706";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: "999px",
      fontSize: "10px", fontWeight: "700",
      letterSpacing: "0.07em", textTransform: "uppercase",
      background: bg, color: color,
      border: `1px solid ${color}22`,
    }}>
      {label}
    </span>
  );
}

function HistoryCard({ record }) {
  return (
    <div
      style={{
        width: "100%",
        background: "var(--color-surface, #fff)",
        border: "1px solid var(--color-line, #e5e7eb)",
        borderLeft: "3px solid var(--color-teal, #0d9488)",
        borderRadius: "10px", padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: "10px",
        fontFamily: "inherit",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--color-ink, #1a1a1a)" }}>
          {record.applicantName || "—"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <SaleTypeBadge privateSaleValue={record.privateSaleValue} />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "3px 10px", borderRadius: "6px",
            background: "var(--color-base, #f9fafb)",
            border: "1px solid var(--color-line, #e5e7eb)",
            fontSize: "11px", fontFamily: "monospace", fontWeight: "700",
            color: "var(--color-teal, #0d9488)",
          }}>
            {record.referenceNumber}
          </span>
        </div>
      </div>

      {/* Meta grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "10px",
      }}>
        <div>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)" }}>
            Created by
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: "var(--color-ink, #1a1a1a)" }}>
            {record.createdBy || "—"}
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)" }}>
            Created at
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "13px", fontFamily: "monospace", color: "var(--color-ink, #1a1a1a)" }}>
            {formatDateTime(record.createdAt)}
          </p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)" }}>
            Updated at
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "13px", fontFamily: "monospace", color: "var(--color-ink, #1a1a1a)" }}>
            {formatDateTime(record.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      border: "1px solid var(--color-line, #e5e7eb)",
      borderLeft: "3px solid var(--color-line, #e5e7eb)",
      borderRadius: "10px", padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: "10px",
      animation: "hmPulse 1.5s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ height: "16px", width: "160px", borderRadius: "4px", background: "var(--color-line, #e5e7eb)" }} />
        <div style={{ height: "16px", width: "80px", borderRadius: "6px", background: "var(--color-line, #e5e7eb)" }} />
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[120, 140, 140].map((w, i) => (
          <div key={i} style={{ height: "28px", width: `${w}px`, borderRadius: "4px", background: "var(--color-line, #e5e7eb)" }} />
        ))}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  const pages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3) return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  })();

  const btnBase = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: "32px", height: "32px", padding: "0 6px",
    borderRadius: "6px", fontSize: "13px", fontWeight: "600",
    border: "1px solid var(--color-line, #e5e7eb)",
    cursor: "pointer", fontFamily: "inherit",
    transition: "background 0.13s, border-color 0.13s, color 0.13s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", flexWrap: "wrap" }}>
      <button
        style={{ ...btnBase, background: page === 1 ? "var(--color-line)" : "var(--color-surface)", color: page === 1 ? "var(--color-ink-muted)" : "var(--color-ink)", cursor: page === 1 ? "default" : "pointer" }}
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        aria-label="Previous page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>

      {pages.map((p, i) => p === "…" ? (
        <span key={`ellipsis-${i}`} style={{ minWidth: "32px", textAlign: "center", fontSize: "13px", color: "var(--color-ink-muted)" }}>…</span>
      ) : (
        <button
          key={p}
          style={{
            ...btnBase,
            background: p === page ? "var(--color-teal, #0d9488)" : "var(--color-surface)",
            color: p === page ? "#fff" : "var(--color-ink)",
            borderColor: p === page ? "var(--color-teal, #0d9488)" : "var(--color-line)",
          }}
          onClick={() => onPage(p)}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      <button
        style={{ ...btnBase, background: page === totalPages ? "var(--color-line)" : "var(--color-surface)", color: page === totalPages ? "var(--color-ink-muted)" : "var(--color-ink)", cursor: page === totalPages ? "default" : "pointer" }}
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Next page"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
      </button>
    </div>
  );
}

/* ─────────────────────────── modal ─────────────────────────── */

export default function HistoryModal({
  open,
  onClose,
  referenceNumber,
  loading,
  error,
  results,
  total,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRetry,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1100,
        background: "rgba(17,17,20,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "hmFadeIn 0.18s ease-out",
      }}
    >
      <style>{`
        @keyframes hmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes hmSlideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes hmSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes hmPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .hm-panel {
          animation: hmSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 1024px) {
          .hm-panel-width { max-width: 700px !important; }
        }

        @media (max-width: 640px) {
          .hm-overlay { padding: 0 !important; align-items: flex-end !important; }
          .hm-panel {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 88vh !important;
            border-radius: 16px 16px 0 0 !important;
            animation: hmSheetUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }
      `}</style>

      <div
        className="hm-panel hm-panel-width"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "600px", maxHeight: "85vh",
          background: "var(--color-surface, #fff)",
          borderRadius: "16px",
          boxShadow: "0 24px 64px -12px rgba(0,0,0,0.35)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: "12px", padding: "20px 24px 16px",
          borderBottom: "1px solid var(--color-line, #e5e7eb)",
          flexShrink: 0,
        }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)" }}>
              REF · {referenceNumber}
            </p>
            <h3 style={{ margin: "4px 0 0", fontWeight: "700", fontSize: "18px", color: "var(--color-ink, #1a1a1a)" }}>
              {loading
                ? "Loading history…"
                : error
                  ? "History error"
                  : `${total} entr${total !== 1 ? "ies" : "y"}`}
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {!loading && !error && results.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <label htmlFor="hm-page-size" style={{ fontSize: "12px", color: "var(--color-ink-muted, #6b7280)", whiteSpace: "nowrap" }}>
                  Per page:
                </label>
                <select
                  id="hm-page-size"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  style={{
                    padding: "5px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: "600",
                    border: "1px solid var(--color-line, #e5e7eb)",
                    background: "var(--color-surface, #fff)", color: "var(--color-ink, #1a1a1a)",
                    cursor: "pointer", fontFamily: "inherit", outline: "none",
                  }}
                >
                  {[10, 15, 20].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--color-base, #f9fafb)", border: "1px solid var(--color-line, #e5e7eb)",
                cursor: "pointer", flexShrink: 0, color: "var(--color-ink, #1a1a1a)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Error state */}
          {error && !loading && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
              padding: "40px 20px", textAlign: "center",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: "rgba(220,38,38,0.10)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p style={{ fontWeight: "600", color: "var(--color-ink, #1a1a1a)", margin: 0 }}>Failed to load history</p>
              <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", margin: 0 }}>{error}</p>
              <button
                onClick={onRetry}
                style={{
                  marginTop: "4px", padding: "8px 18px", borderRadius: "6px",
                  border: "1px solid var(--color-line)", background: "var(--color-surface)",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
                  color: "var(--color-ink)",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {Array.from({ length: pageSize > 10 ? 5 : 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && results.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "12px",
              padding: "50px 20px", textAlign: "center",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: "var(--color-line, #e5e7eb)", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 2.6-6.3" /><path d="M3 5v6h6" /><path d="M12 7v5l3 3" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "var(--color-ink, #1a1a1a)" }}>
                  No history found
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--color-ink-muted, #6b7280)" }}>
                  No records exist for reference <span style={{ fontFamily: "monospace", fontWeight: "700" }}>"{referenceNumber}"</span>
                </p>
              </div>
            </div>
          )}

          {/* Results list */}
          {!loading && !error && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {results.map((record) => (
                <HistoryCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </div>

        {/* Footer pagination (sticky) */}
        {!loading && !error && results.length > 0 && totalPages > 1 && (
          <div style={{
            padding: "14px 24px", borderTop: "1px solid var(--color-line, #e5e7eb)",
            flexShrink: 0, background: "var(--color-surface, #fff)",
          }}>
            <Pagination page={page} totalPages={totalPages} onPage={onPageChange} />
            <p style={{
              textAlign: "center", marginTop: "8px", marginBottom: 0,
              fontSize: "11px", color: "var(--color-ink-muted, #6b7280)",
              fontFamily: "monospace",
            }}>
              Page {page} of {totalPages} · {total} total entr{total !== 1 ? "ies" : "y"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}