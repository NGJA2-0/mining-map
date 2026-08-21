import { useEffect, useLayoutEffect, useRef, useState } from "react";
import A4PreviewSheet from "../common/A4PreviewSheet";
import ExtendRecordPreviewSheet from "../common/ExtendRecordPreviewSheet";

/* ─────────────────────────── scaled sheet wrapper ─────────────────────────── */
/* The A4 sheets are a fixed print width — this measures the sheet and the
   available container width, then scales it down to fit on small screens
   instead of letting it overflow. On large screens the scale is simply 1. */

function ScaledSheet({ children }) {
  const wrapperRef = useRef(null);
  const sheetRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState(null);

  useLayoutEffect(() => {
    function recalc() {
      if (!wrapperRef.current || !sheetRef.current) return;
      const containerWidth = wrapperRef.current.clientWidth;
      const sheetWidth = sheetRef.current.scrollWidth;
      const sheetHeight = sheetRef.current.scrollHeight;
      const nextScale = sheetWidth > containerWidth ? containerWidth / sheetWidth : 1;
      setScale(nextScale);
      setScaledHeight(sheetHeight * nextScale);
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [children]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", overflow: "hidden" }}>
      <div style={{ height: scaledHeight ?? "auto" }}>
        <div
          ref={sheetRef}
          style={{
            display: "inline-block",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── skeleton ─────────────────────────── */

function PreviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px" }}>
      <div style={{ height: "22px", width: "60%", borderRadius: "4px", background: "var(--color-line, #e5e7eb)", animation: "rpPulse 1.5s ease-in-out infinite" }} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "12px" }}>
          <div style={{ height: "14px", width: "35%", borderRadius: "4px", background: "var(--color-line, #e5e7eb)", animation: "rpPulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: "14px", width: "45%", borderRadius: "4px", background: "var(--color-line, #e5e7eb)", animation: "rpPulse 1.5s ease-in-out infinite" }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── modal ─────────────────────────── */

export default function RecordPreviewModal({
  open,
  onBack,
  onClose,
  loading,
  error,
  data,
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

  const isExtended = data?.privateSaleValue !== null && data?.privateSaleValue !== undefined;

  return (
    <div
      onClick={onClose}
      className="rp-overlay"
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(17,17,20,0.5)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
        animation: "rpFadeIn 0.18s ease-out",
      }}
    >
      <style>{`
        @keyframes rpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rpSlideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes rpSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes rpPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .rp-panel {
          animation: rpSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 1024px) {
          .rp-panel-width { max-width: 900px !important; }
        }

        @media (max-width: 640px) {
          .rp-overlay { padding: 0 !important; align-items: flex-end !important; }
          .rp-panel {
            width: 100% !important;
            max-width: 100% !important;
            max-height: 92vh !important;
            border-radius: 16px 16px 0 0 !important;
            animation: rpSheetUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
        }
      `}</style>

      <div
        className="rp-panel rp-panel-width"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "760px", maxHeight: "90vh",
          background: "var(--color-surface, #fff)",
          borderRadius: "16px",
          boxShadow: "0 24px 64px -12px rgba(0,0,0,0.35)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "12px", padding: "16px 20px",
          borderBottom: "1px solid var(--color-line, #e5e7eb)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <button
              onClick={onBack}
              aria-label="Back to history"
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--color-base, #f9fafb)", border: "1px solid var(--color-line, #e5e7eb)",
                cursor: "pointer", flexShrink: 0, color: "var(--color-ink, #1a1a1a)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: "11px", fontFamily: "monospace", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)" }}>
                {loading ? "Loading record" : error ? "Record error" : isExtended ? "Extend record" : "New record"}
              </p>
              <h3 style={{
                margin: "4px 0 0", fontWeight: "700", fontSize: "16px", color: "var(--color-ink, #1a1a1a)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {data?.applicantName || (loading ? "Please wait…" : "—")}
              </h3>
            </div>
          </div>

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

        {/* Body (scrollable) */}
        <div style={{ padding: "18px", overflowY: "auto", flex: 1, background: "var(--color-base, #f4f4f5)" }}>
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
              <p style={{ fontWeight: "600", color: "var(--color-ink, #1a1a1a)", margin: 0 }}>Failed to load record</p>
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

          {/* Loading */}
          {loading && (
            <div style={{
              background: "var(--color-surface, #fff)", borderRadius: "10px",
              border: "1px solid var(--color-line, #e5e7eb)", padding: "20px",
            }}>
              <PreviewSkeleton />
            </div>
          )}

          {/* Loaded preview sheet */}
          {!loading && !error && data && (
            <div style={{
              background: "var(--color-surface, #fff)", borderRadius: "10px",
              border: "1px solid var(--color-line, #e5e7eb)", padding: "16px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}>
              <ScaledSheet>
                {isExtended
                  ? <ExtendRecordPreviewSheet form={data} isResubmit={Boolean(data.isResubmit)} />
                  : <A4PreviewSheet form={data} isResubmit={Boolean(data.isResubmit)} />
                }
              </ScaledSheet>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}