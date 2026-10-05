import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import A4PreviewSheet from "./A4PreviewSheet";
import ExtendRecordPreviewSheet from "./ExtendRecordPreviewSheet";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function DownloadButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        width: "100%", padding: "12px 16px", borderRadius: "8px",
        fontSize: "14px", fontWeight: "700", cursor: "pointer",
        fontFamily: "inherit", lineHeight: "1.4",
        background: "var(--color-teal, #0d9488)", border: "none",
        color: "#fff", transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#0b7d73")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-teal, #0d9488)")}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" />
      </svg>
      {label}
    </button>
  );
}

export default function DownloadRecordModal({ open, onClose, type, record }) {
  const { token } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [printForm, setPrintForm] = useState(null);

  useEffect(() => {
    if (!open) {
      setPrintForm(null);
      setError("");
      setBusy(false);
    }
  }, [open]);

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

  const authFetch = async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  // Latest version of this record
  const downloadLatest = async () => {
    if (!record?.id) return;
    setBusy(true);
    setError("");
    try {
      const json = await authFetch(`/api/mining-licenses/${record.id}`);
      setPrintForm(json.data);
    } catch {
      setError("Failed to load the record. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // The version just before this one (REF_8.2 -> REF_8.1, REF_8.1 -> REF_8)
  const downloadPrevious = async () => {
    if (!record?.id) return;
    setBusy(true);
    setError("");
    try {
      const full = (await authFetch(`/api/mining-licenses/${record.id}`)).data;
      const [base, ver] = (full.referenceNumber || "").split(".");
      if (ver === undefined) throw new Error("no previous");
      const v = parseInt(ver, 10);
      const prevRef = v <= 1 ? base : `${base}.${v - 1}`;

      const history = await authFetch(
        `/api/mining-licenses/reference/${encodeURIComponent(base)}?page=1&limit=100`
      );
      const prev = (history.data?.data || []).find((r) => r.referenceNumber === prevRef);
      if (!prev) throw new Error("no previous");

      const prevFull = (await authFetch(`/api/mining-licenses/${prev.id}`)).data;
      setPrintForm(prevFull);
    } catch {
      setError("Could not find the previous version of this record.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const isNew = type?.toLowerCase() === "new";
  const isExtended = type?.toLowerCase() === "extended";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          background: "rgba(17,17,20,0.45)",
          backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
          animation: "drmFadeIn 0.18s ease-out",
        }}
      >
        <style>{`
          @keyframes drmFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes drmSlideUp { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes drmSheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .drm-panel { animation: drmSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
          @media (max-width: 640px) {
            .drm-panel {
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 16px 16px 0 0 !important;
              animation: drmSheetUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
          }
        `}</style>

        <div
          className="drm-panel"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "440px",
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
            gap: "12px", padding: "18px 20px",
            borderBottom: "1px solid var(--color-line, #e5e7eb)",
            flexShrink: 0,
          }}>
            <h3 style={{ margin: 0, fontWeight: "700", fontSize: "16px", color: "var(--color-ink, #1a1a1a)" }}>
              Download
            </h3>
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

          {/* Body */}
          <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {busy && <p style={{ margin: 0, fontSize: "13px" }}>Loading…</p>}
            {error && <p style={{ margin: 0, fontSize: "13px", color: "#dc2626" }}>{error}</p>}

            {isNew && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--color-ink, #1a1a1a)" }}>
                  නව රෙකෝඩයේ නවතම පිටපත බාගත කරගන්න
                </p>
                <DownloadButton label="Download" onClick={downloadLatest} />
              </div>
            )}

            {isExtended && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", fontWeight: "700", color: "var(--color-ink, #1a1a1a)" }}>
                    මෙය දීර්ඝ කරන ලද රෙකෝඩයකි
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--color-ink, #1a1a1a)" }}>
                    දීර්ඝ කරන ලද නවතම රෙකෝඩය මෙතනින් බාගත කරගන්න
                  </p>
                  <DownloadButton label="Download" onClick={downloadLatest} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", color: "var(--color-ink, #1a1a1a)" }}>
                    ඔබට දීර්ඝ කිරීමට පෙර රෙකෝඩයේ පිටපත බාගත කර ගැනීමට අවශ්‍ය නම් මෙතනින් බාගත කරගන්න
                  </p>
                  <DownloadButton label="Download" onClick={downloadPrevious} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Print view, rendered straight into <body> */}
      {printForm &&
        createPortal(
          <div
            id="download-print-root"
            style={{
              position: "fixed", inset: 0, zIndex: 1200,
              background: "var(--color-base, #f7f7f5)", overflowY: "auto",
            }}
          >
            <style>{`
              @media print {
                body > *:not(#download-print-root) { display: none !important; }
                #download-print-root { position: static !important; overflow: visible !important; }
                .drm-no-print { display: none !important; }
              }
            `}</style>

            <div
              className="drm-no-print"
              style={{
                position: "sticky", top: 0, zIndex: 1,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px", background: "var(--color-surface, #fff)",
                borderBottom: "1px solid var(--color-line, #e5e7eb)",
              }}
            >
              <button
                onClick={() => setPrintForm(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                ← Back
              </button>
              <button
                onClick={() => window.print()}
                style={{
                  padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: "var(--color-ink, #1a1a1a)", color: "#fff", fontWeight: 600, fontSize: 13,
                }}
              >
                Download PDF
              </button>
            </div>

            <div style={{ padding: 20 }}>
              {printForm.privateSaleValue || printForm.auctionSaleValue ? (
                <ExtendRecordPreviewSheet form={printForm} />
              ) : (
                <A4PreviewSheet form={printForm} />
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}