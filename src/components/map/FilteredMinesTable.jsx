const statusColors = {
  draft: { bg: "linear-gradient(135deg, #fde68a, #fbbf24)", fg: "#78350f" },
  approved: { bg: "linear-gradient(135deg, #6ee7b7, #34d399)", fg: "#064e3b" },
  rejected: { bg: "linear-gradient(135deg, #fca5a5, #f87171)", fg: "#7f1d1d" },
};

function StatusBadge({ status }) {
  if (!status) return <span>—</span>;
  const style = statusColors[status.toLowerCase()] || {
    bg: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
    fg: "#374151",
  };
  return (
    <span
      style={{
        fontSize: "10px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "4px 10px",
        borderRadius: "999px",
        background: style.bg,
        color: style.fg,
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
      }}
    >
      {status}
    </span>
  );
}

function initialsOf(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const pagerButtonStyle = (disabled) => ({
  padding: "6px 14px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "700",
  border: "1px solid var(--color-line, #e5e7eb)",
  background: disabled ? "var(--color-base, #f3f4f6)" : "var(--color-surface, #fff)",
  color: disabled ? "var(--color-ink-muted, #9ca3af)" : "var(--color-ink, #1a1a1a)",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
});

function MineCard({ mine }) {
  return (
    <div
      style={{
        border: "1px solid var(--color-line, #e5e7eb)",
        borderRadius: "14px",
        background: "var(--color-surface, #fff)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 20px -12px rgba(0,0,0,0.15)",
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06), 0 14px 28px -12px rgba(0,0,0,0.2)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04), 0 8px 20px -12px rgba(0,0,0,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "14px 16px",
          background: "linear-gradient(135deg, #ccfbf1, #fde8d7)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.75)",
              color: "var(--color-teal, #0d9488)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "13px",
              flexShrink: 0,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)",
            }}
          >
            {initialsOf(mine.applicantName)}
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "var(--color-ink, #1a1a1a)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {mine.applicantName || "—"}
          </span>
        </div>
        <StatusBadge status={mine.status} />
      </div>

      {/* details */}
      <div style={{ padding: "4px 16px 14px" }}>
        {[
          { label: "Phone", value: mine.applicantPhone },
          { label: "TIN", value: mine.tin },
          { label: "GML", value: mine.gmlNumber },
        ].map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "grid",
              gridTemplateColumns: "72px 1fr",
              gap: "12px",
              padding: "9px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--color-line, #f1f2f4)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-ink-muted, #6b7280)",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-ink, #1a1a1a)",
                wordBreak: "break-word",
              }}
            >
              {row.value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FilteredMinesTable({
  results = [],
  loading,
  error,
  total = 0,
  page = 1,
  limit = 10,
  totalPages = 1,
  onPageChange,
  onLimitChange,
}) {
  return (
    <div
      style={{
        border: "1px solid var(--color-line, #e5e7eb)",
        borderRadius: "12px",
        background: "var(--color-surface, #fff)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-line, #e5e7eb)",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--color-ink, #1a1a1a)" }}>
          Filtered results {typeof total === "number" ? `(${total})` : ""}
        </span>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            color: "var(--color-ink-muted, #6b7280)",
          }}
        >
          Per page
          <select
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            style={{
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "12px",
              border: "1px solid var(--color-line, #e5e7eb)",
              background: "var(--color-surface, #fff)",
              color: "var(--color-ink, #1a1a1a)",
              fontFamily: "inherit",
              outline: "none",
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>

      {loading && (
        <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", padding: "16px" }}>
          Loading results…
        </p>
      )}

      {!loading && error && (
        <p style={{ fontSize: "13px", color: "#dc2626", padding: "16px" }}>{error}</p>
      )}

      {!loading && !error && results.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", padding: "16px" }}>
          No results match the selected filters.
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <>
         <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "14px",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            {results.map((mine) => (
              <MineCard key={mine.id} mine={mine} />
            ))}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "12px 16px",
                borderTop: "1px solid var(--color-line, #e5e7eb)",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                style={pagerButtonStyle(page <= 1)}
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: "12px", color: "var(--color-ink-muted, #6b7280)" }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                style={pagerButtonStyle(page >= totalPages)}
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}