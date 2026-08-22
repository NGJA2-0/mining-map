import { useEffect, useLayoutEffect, useRef, useState } from "react";
import A4PreviewSheet from "../common/A4PreviewSheet";
import ExtendRecordPreviewSheet from "../common/ExtendRecordPreviewSheet";
import { useAuth } from "../../context/AuthContext";

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
      <div style={{ height: scaledHeight ?? "auto", display: "flex", justifyContent: "center" }}>
        <div
          ref={sheetRef}
          style={{
            display: "inline-block",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
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
  const { token } = useAuth();
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

  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  const [compareResult, setCompareResult] = useState(null); // { message, changes }
  const [noCompareNotice, setNoCompareNotice] = useState(false);

// Reset comparison whenever a different record is loaded
  useEffect(() => {
    setCompareResult(null);
    setCompareError(null);
    setCompareLoading(false);
    setNoCompareNotice(false);
  }, [data]);

  if (!open) return null;

  const isExtended = data?.privateSaleValue !== null && data?.privateSaleValue !== undefined;

  const isExtendedCompare = compareResult?.message === "The record was extended";

  // Every changed field except referenceNumber — that one is tracked by the API
  // but must never be shown or highlighted in the UI.
  const highlightFields = compareResult
    ? Object.keys(compareResult.changes || {}).filter((key) => key !== "referenceNumber")
    : [];

  // Reconstruct the "previous version" by taking the current record and
  // swapping in the old values for whatever changed.
  const oldFormData = compareResult
    ? {
        ...data,
        ...Object.fromEntries(
          highlightFields.map((key) => [key, compareResult.changes[key].old])
        ),
      }
    : null;

    async function handleCompare() {
    if (!data?.id) return;
    setCompareLoading(true);
    setCompareError(null);
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${BASE_URL}/api/mining-licenses/${data.id}/compare`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON response from compare API:", res.status, text.slice(0, 200));
        throw new Error(
          `Server returned ${res.status} ${res.statusText} (not JSON) — check the endpoint`
        );
      }

     const json = await res.json();
      if (!res.ok) {
        const backendMessage = json?.error || "Failed to compare";
        const translatedMessage =
          backendMessage === "No previous version exists to compare"
            ? "මෙය නව රෙකෝඩයක පලමු පිටපත බැවින් සංසන්දනය කිරීමට නොහැක."
            : backendMessage;
        throw new Error(translatedMessage);
      }

      // If this is the first version of an extended record, every changed
      // field (aside from referenceNumber, which is always tracked but
      // never shown) will have a null "old" value — meaning there's no
      // real previous version to compare against.
      const changedKeys = Object.keys(json.changes || {}).filter(
        (key) => key !== "referenceNumber"
      );
      const isFirstVersionOfExtendedRecord =
        json.message === "The record was extended" &&
        changedKeys.length > 0 &&
        changedKeys.every(
          (key) => json.changes[key]?.old === null || json.changes[key]?.old === undefined
        );

        if (isFirstVersionOfExtendedRecord) {
        setNoCompareNotice(true);
        return;
      }

      setCompareResult(json);
    } catch (err) {
      setCompareError(err.message || "Failed to compare");
    } finally {
      setCompareLoading(false);
    }
  }

  return (
    <div
      className="rp-page"
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "var(--color-surface, #fff)",
        display: "flex", flexDirection: "column",
        animation: "rpFadeIn 0.16s ease-out",
      }}
    >
      <style>{`
        @keyframes rpFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rpPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div
        style={{
          width: "100%", height: "100%",
          background: "var(--color-surface, #fff)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
                {/* Header */}
        <div style={{
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          padding: "20px 20px",
          borderBottom: "1px solid var(--color-line, #e5e7eb)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: "1 1 auto" }}>
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

            <h3 style={{
              margin: 0, fontWeight: "700", fontSize: "16px", color: "var(--color-ink, #1a1a1a)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {data?.applicantName || (loading ? "Please wait…" : "—")}
            </h3>
          </div>

         <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex", alignItems: "center", gap: "10px",
            pointerEvents: "none",
          }}>
            <p style={{ margin: 0, fontSize: "13px", fontFamily: "monospace", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)", whiteSpace: "nowrap" }}>
              {loading ? "Loading record" : error ? "Record error" : isExtended ? "Extend record" : "New record"}
            </p>
            {!loading && !error && data?.referenceNumber && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "4px 14px", borderRadius: "8px",
                background: "var(--color-base, #f9fafb)",
                border: "1px solid var(--color-line, #e5e7eb)",
                fontSize: "16px", fontFamily: "monospace", fontWeight: "700",
                letterSpacing: "0.03em",
                color: "var(--color-teal, #0d9488)",
                whiteSpace: "nowrap",
                pointerEvents: "auto",
              }}>
                {data.referenceNumber}
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {!loading && !error && data && (
              <button
                onClick={compareResult ? () => setCompareResult(null) : handleCompare}
                disabled={compareLoading}
                style={{
                  padding: "0 16px", height: "32px", borderRadius: "8px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  background: compareResult
                    ? "var(--color-teal, #0d9488)"
                    : "linear-gradient(180deg, #ffffff, #f9fafb)",
                  border: compareResult
                    ? "1px solid var(--color-teal, #0d9488)"
                    : "1px solid var(--color-line, #e5e7eb)",
                  boxShadow: compareResult
                    ? "0 1px 2px rgba(13,148,136,0.25)"
                    : "0 1px 2px rgba(0,0,0,0.04)",
                  color: compareResult ? "#fff" : "var(--color-ink, #1a1a1a)",
                  cursor: compareLoading ? "not-allowed" : "pointer",
                  fontSize: "16px", fontWeight: "700",
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3 4 7l4 4" /><path d="M4 7h11a4 4 0 0 1 4 4v1" />
                  <path d="m16 21 4-4-4-4" /><path d="M20 17H9a4 4 0 0 1-4-4v-1" />
                </svg>
                {compareLoading ? "සසඳමින්…" : compareResult ? "සැසඳුම වසන්න" : "පෙර පිටපත සමග සසදන්න"}
              </button>
            )}

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: "32px", height: "32px", borderRadius: "8px",
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

          {/* Compare error, e.g. "No previous version exists to compare" */}
                    {/* Loaded preview sheet(s) */}
          {!loading && !error && data && (
            compareResult ? (
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                  <p style={{
                    textAlign: "center", fontSize: "12px", fontWeight: "700",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    color: "var(--color-ink-muted, #6b7280)", margin: "0 0 8px",
                  }}>
                    Previous version
                  </p>
                  <div style={{
                    background: "var(--color-surface, #fff)", borderRadius: "10px",
                    border: "1px solid var(--color-line, #e5e7eb)", padding: "16px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}>
                    <ScaledSheet>
                      {isExtendedCompare
                        ? <ExtendRecordPreviewSheet form={oldFormData} isResubmit={Boolean(data.isResubmit)} highlightFields={highlightFields} />
                        : <A4PreviewSheet form={oldFormData} isResubmit={Boolean(data.isResubmit)} highlightFields={highlightFields} />
                      }
                    </ScaledSheet>
                  </div>
                </div>

                <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                  <p style={{
                    textAlign: "center", fontSize: "12px", fontWeight: "700",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    color: "var(--color-teal, #0d9488)", margin: "0 0 8px",
                  }}>
                    Current version
                  </p>
                  <div style={{
                    background: "var(--color-surface, #fff)", borderRadius: "10px",
                    border: "1px solid var(--color-line, #e5e7eb)", padding: "16px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  }}>
                    <ScaledSheet>
                      {isExtendedCompare
                        ? <ExtendRecordPreviewSheet form={data} isResubmit={Boolean(data.isResubmit)} highlightFields={highlightFields} />
                        : <A4PreviewSheet form={data} isResubmit={Boolean(data.isResubmit)} highlightFields={highlightFields} />
                      }
                    </ScaledSheet>
                  </div>
                </div>
              </div>
            ) : (
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
            )
                    )}
        </div>
      </div>

            {/* Compare error popup, e.g. "No previous version exists to compare" */}
      {compareError && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1300,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            animation: "rpFadeIn 0.15s ease-out",
          }}
          onClick={() => setCompareError(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 90vw)",
              background: "var(--color-surface, #fff)",
              borderRadius: "12px",
              border: "1px solid var(--color-line, #e5e7eb)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              padding: "24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
              textAlign: "center",
            }}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(220,38,38,0.10)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--color-ink, #1a1a1a)", fontWeight: "600" }}>
              {compareError}
            </p>
            <button
              onClick={() => setCompareError(null)}
              style={{
                padding: "8px 24px", borderRadius: "8px", border: "none",
                background: "#dc2626", color: "#fff",
                fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* No-compare notice popup */}
      {noCompareNotice && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1300,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            animation: "rpFadeIn 0.15s ease-out",
          }}
          onClick={() => setNoCompareNotice(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(420px, 90vw)",
              background: "var(--color-surface, #fff)",
              borderRadius: "12px",
              border: "1px solid var(--color-line, #e5e7eb)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              padding: "24px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
              textAlign: "center",
            }}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(13,148,136,0.10)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal, #0d9488)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--color-ink, #1a1a1a)" }}>
              මෙය දීර්ඝ කරන ලද රෙකෝඩයක පලමු පිටපත බැවින් සංසන්දනය කිරීමට නොහැක.
            </p>
            <button
              onClick={() => setNoCompareNotice(false)}
              style={{
                padding: "8px 24px", borderRadius: "8px", border: "none",
                background: "var(--color-teal, #0d9488)", color: "#fff",
                fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}