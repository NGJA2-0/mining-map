import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import A4PreviewSheet from "../components/common/A4PreviewSheet";
import ExtendRecordPreviewSheet from "../components/common/ExtendRecordPreviewSheet";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SRI_LANKA_CENTER = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

/* ─────────────────────────── helpers ─────────────────────────── */

function getLatLng(mine) {
  const lat = Number(String(mine.latitude).trim());
  const lng = Number(String(mine.longitude).trim());
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

// Pans/zooms the map whenever `mine` changes. Must live inside <MapContainer>.
function FlyToMine({ mine }) {
  const map = useMap();
  useEffect(() => {
    if (!mine) return;
    const latLng = getLatLng(mine);
    if (latLng) map.flyTo(latLng, 13, { duration: 0.8 });
  }, [mine, map]);
  return null;
}

// Adds a native Leaflet control button that toggles street/satellite tiles,
// stacking directly below the default zoom control. Must live inside <MapContainer>.
function ToggleViewControl({ mapView, setMapView }) {
  const map = useMap();
  const viewRef = useRef(mapView);
  const buttonRef = useRef(null);

  useEffect(() => {
    viewRef.current = mapView;
  }, [mapView]);

  useEffect(() => {
        const control = L.control({ position: "topleft" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      const button = L.DomUtil.create("a", "", container);
      buttonRef.current = button;
      button.href = "#";
      button.style.display = "flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.width = "30px";
      button.style.height = "30px";

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (e) => {
        L.DomEvent.preventDefault(e);
        setMapView(viewRef.current === "street" ? "satellite" : "street");
      });

      return container;
    };

    control.addTo(map);
    return () => control.remove();
  }, [map, setMapView]);

  // Keep the icon/title in sync with the current view without rebuilding the control.
  useEffect(() => {
    if (!buttonRef.current) return;
    const satelliteIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 7 5 5-8.5 8.5a3.54 3.54 0 1 1-5-5L13 7Z"/><path d="m18 2 4 4"/><path d="m17 7-3-3"/><path d="M6.5 12.5 4 15a3.54 3.54 0 1 0 5 5l2.5-2.5"/></svg>`;
    const mapIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`;
    buttonRef.current.innerHTML = mapView === "street" ? satelliteIcon : mapIcon;
    buttonRef.current.title = mapView === "street" ? "Satellite view" : "Street view";
    buttonRef.current.setAttribute("aria-label", buttonRef.current.title);
  }, [mapView]);

  return null;
}

// Adds a native Leaflet control button, positioned in the same corner as
// (and stacking directly below) the default zoom control. Must live inside <MapContainer>.
function ResetViewControl() {
  const map = useMap();
  useEffect(() => {
    const control = L.control({ position: "topleft" });

    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      const button = L.DomUtil.create("a", "", container);
      button.href = "#";
      button.title = "Reset view";
      button.setAttribute("aria-label", "Reset view");
      button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
      button.style.display = "flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";
      button.style.width = "30px";
      button.style.height = "30px";

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (e) => {
        L.DomEvent.preventDefault(e);
        map.flyTo(SRI_LANKA_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
      });

      return container;
    };

    control.addTo(map);
    return () => control.remove();
  }, [map]);

  return null;
}

function MineDetailPanel({ mine, loading, error, onPreview }) {
  if (loading) {
    return (
      <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", padding: "12px 4px" }}>
        Loading details…
      </p>
    );
  }
  if (error) {
    return <p style={{ fontSize: "13px", color: "#dc2626", padding: "12px 4px" }}>{error}</p>;
  }
  if (!mine) {
    return (
      <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", padding: "12px 4px" }}>
        Click a marker on the map to view mine details.
      </p>
    );
  }

  const point = mine.gpsPoints?.[0];
  const rows = [
    { label: "Applicant", value: mine.applicantName },
    { label: "Phone", value: mine.applicantPhone },
    { label: "TIN", value: mine.tin },
    { label: "GML", value: mine.gmlNumber },
    { label: "GPS", value: point ? `${point.latitude}, ${point.longitude}` : null },
    { label: "Created by", value: mine.createdBy },
    { label: "Created at", value: mine.createdAt && new Date(mine.createdAt).toLocaleString() },
    { label: "Updated at", value: mine.updatedAt && new Date(mine.updatedAt).toLocaleString() },
  ].filter((r) => r.value);

  const statusColors = {
    draft: { bg: "#fef3c7", fg: "#92400e" },
    approved: { bg: "#d1fae5", fg: "#065f46" },
    rejected: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const statusStyle = statusColors[mine.status?.toLowerCase()] || { bg: "#e5e7eb", fg: "#374151" };

  return (
    <div
      style={{
        border: "1px solid var(--color-line, #e5e7eb)",
        borderRadius: "12px",
        background: "var(--color-surface, #fff)",
        overflow: "hidden",
      }}
    >
      {/* header */}
            <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "16px",
          background: "linear-gradient(135deg, #ccfbf1, #fde8d7)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.7)",
            color: "var(--color-teal, #0d9488)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          {(mine.applicantName || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
          <span
            style={{
              fontSize: "15px",
              fontWeight: "700",
              color: "var(--color-ink, #1a1a1a)",
              lineHeight: "1.2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {mine.applicantName || "—"}
          </span>
          {mine.status && (
            <span
              style={{
                alignSelf: "flex-start",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: "2px 8px",
                borderRadius: "999px",
                background: statusStyle.bg,
                color: statusStyle.fg,
              }}
            >
              {mine.status}
            </span>
          )}
        </div>
      </div>

            {/* details */}
      <div style={{ padding: "6px 16px 12px" }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: "grid",
              gridTemplateColumns: "88px 1fr",
              gap: "12px",
              padding: "10px 0",
              borderTop: i === 0 ? "none" : "1px solid var(--color-line, #f1f2f4)",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-ink-muted, #6b7280)",
              }}
            >
              {r.label}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-ink, #1a1a1a)",
                wordBreak: "break-word",
              }}
            >
              {r.value}
            </span>
          </div>
        ))}

        {onPreview && (
          <Button
            variant="primary"
            size="md"
            onClick={onPreview}
            style={{
              width: "100%",
              marginTop: "10px",
              background: "linear-gradient(135deg, #bfdbfe, #ffffff)",
              color: "var(--color-ink, #1a1a1a)",
              border: "1px solid #93c5fd",
            }}
          >
            View full application
          </Button>
        )}
      </div>
    </div>
  );
}

function PreviewOverlay({ open, loading, error, form, isExtend, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--color-base, #f7f7f5)",
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 20px",
          background: "var(--color-surface, #fff)",
          borderBottom: "1px solid var(--color-line, #e5e7eb)",
          zIndex: 1,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            color: "var(--color-ink-muted, #6b7280)",
            fontFamily: "inherit",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to map
        </button>
      </div>

      <div style={{ padding: "20px" }}>
        {loading && (
          <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)" }}>Loading application…</p>
        )}
        {error && <p style={{ fontSize: "13px", color: "#dc2626" }}>{error}</p>}
        {!loading && !error && form && (
          isExtend ? <ExtendRecordPreviewSheet form={form} /> : <A4PreviewSheet form={form} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function MiningMapPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [mapView, setMapView] = useState("street"); // "street" | "satellite"
  const [mines, setMines] = useState([]); // pins from /latest
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMine, setSelectedMine] = useState(null); // clicked pin summary (drives flyTo)
  const [selectedDetails, setSelectedDetails] = useState(null); // full record from /:id
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewForm, setPreviewForm] = useState(null);
  const [previewIsExtend, setPreviewIsExtend] = useState(false);

  // UI-only filter state — kept for layout purposes; not wired to any fetch/filter logic.
  const [district, setDistrict] = useState("");
  const [regionalOffice, setRegionalOffice] = useState("");
  const [search, setSearch] = useState("");

  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    border: "1px solid var(--color-line, #e5e7eb)",
    background: "var(--color-surface, #fff)",
    color: "var(--color-ink, #1a1a1a)",
    fontFamily: "inherit",
    outline: "none",
  };

  const fetchMines = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/api/mining-licenses/latest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Error ${res.status}`);
      }
      const json = await res.json();
      return Array.isArray(json) ? json : json.data || [];
    } catch (err) {
      setError(err.message || "Failed to load mines.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    (async () => {
      const data = await fetchMines();
      setMines(data);
    })();
  }, [fetchMines]);

  const handleMarkerClick = useCallback(
    async (mine) => {
      setSelectedMine(mine);
      setSelectedDetails(null);
      setDetailError("");
      setDetailLoading(true);

      // Fly directly, since setSelectedMine may pass the same object
      // reference as before (e.g. after a reset), which would otherwise
      // skip FlyToMine's effect and leave the map un-zoomed.
      const latLng = getLatLng(mine);
      if (latLng) mapRef.current?.flyTo(latLng, 13, { duration: 0.8 });

      try {
        const res = await fetch(`${BASE_URL}/api/mining-licenses/${mine.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Error ${res.status}`);
        }
        const json = await res.json();
        setSelectedDetails(json.data || null);
      } catch (err) {
        setDetailError(err.message || "Failed to load mine details.");
      } finally {
        setDetailLoading(false);
      }
    },
    [token]
  );

    const handleOpenPreview = useCallback(
    async (id) => {
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewError("");
      setPreviewForm(null);
      try {
        const res = await fetch(`${BASE_URL}/api/mining-licenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Error ${res.status}`);
        }
        const json = await res.json();
        const record = json.data || null;
        setPreviewIsExtend(Boolean(record?.privateSaleValue || record?.auctionSaleValue));
        setPreviewForm(record);
      } catch (err) {
        setPreviewError(err.message || "Failed to load application.");
      } finally {
        setPreviewLoading(false);
      }
    },
    [token]
  );

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewForm(null);
    setPreviewError("");
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <style>{`
        .leaflet-tooltip.mine-tooltip {
          background: #ffffff;
          border: 1px solid var(--color-line, #e5e7eb);
          border-radius: 10px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
          font-family: inherit;
        }
        .leaflet-tooltip.mine-tooltip::before {
          border-top-color: var(--color-line, #e5e7eb);
        }
      `}</style>

      {/* header */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--color-ink-muted, #6b7280)",
              fontFamily: "inherit",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to dashboard
          </button>
          <h1 className="font-display text-lg font-semibold sm:text-xl">Mine locations</h1>
          <div style={{ width: "140px" }} /> {/* spacer to balance the back button */}
        </div>
      </header>

      {/* map + detail panel */}
      <div className="px-4 pb-0 pt-4 sm:px-6" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* detail panel */}
        <div
          style={{
            flex: "1 1 280px",
            maxWidth: "420px",
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* filter bar (UI only — not wired to any filtering logic) */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} style={inputStyle}>
              <option value="">All districts</option>
            </select>

            <select value={regionalOffice} onChange={(e) => setRegionalOffice(e.target.value)} style={inputStyle}>
              <option value="">All regional offices</option>
            </select>

            <input
              type="text"
              placeholder="Search TIN / NIC / GML / land name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: "100%" }}
            />

            <Button variant="primary" size="md">
              Search
            </Button>
            <Button
              className="!text-ink"
              variant="secondary"
              size="md"
              onClick={() => {
                setDistrict("");
                setRegionalOffice("");
                setSearch("");
              }}
            >
              Clear
            </Button>
            </div>

          {error && <p style={{ fontSize: "13px", color: "#dc2626" }}>{error}</p>}
          {!loading && !error && (
            <p style={{ fontSize: "12px", color: "var(--color-ink-muted, #6b7280)" }}>
              {mines.length} mine{mines.length !== 1 ? "s" : ""} on map
            </p>
          )}

          <MineDetailPanel
            mine={selectedDetails}
            loading={detailLoading}
            error={detailError}
            onPreview={() => selectedDetails?.id && handleOpenPreview(selectedDetails.id)}
          />
        </div>

        {/* map */}
        <div
          style={{
            flex: "2 1 480px",
            minWidth: "300px",
            height: "calc(100vh - 96px)",
            borderRadius: "10px",
            overflow: "hidden",
            border: "1px solid var(--color-line, #e5e7eb)",
          }}
        >
          <MapContainer ref={mapRef} center={SRI_LANKA_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
            {mapView === "street" ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}
            <FlyToMine mine={selectedMine} />
            <ToggleViewControl mapView={mapView} setMapView={setMapView} />
            <ResetViewControl />
            {mines.map((mine) => {
              const latLng = getLatLng(mine);
              if (!latLng) return null;
              return (
                <Marker key={mine.id} position={latLng} eventHandlers={{ click: () => handleMarkerClick(mine) }}>
                  <Tooltip direction="top" offset={[0, -38]} opacity={1} className="mine-tooltip">
                    <div
                      style={{
                        width: "200px",
                        fontFamily: "inherit",
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--color-ink, #1a1a1a)" }}>
                        {mine.applicantName || "—"}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-ink-muted, #6b7280)" }}>
                        Status: {mine.status || "—"}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-ink-muted, #6b7280)" }}>
                        Lat: {mine.latitude}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-ink-muted, #6b7280)" }}>
                        Lng: {mine.longitude}
                      </span>
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
                </div>
      </div>

      <PreviewOverlay
        open={previewOpen}
        loading={previewLoading}
        error={previewError}
        form={previewForm}
        isExtend={previewIsExtend}
        onClose={handleClosePreview}
      />
    </div>
  );
}