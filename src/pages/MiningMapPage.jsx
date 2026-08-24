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

function MineDetailPanel({ mine, loading, error }) {
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
    { label: "Status", value: mine.status },
    { label: "Phone", value: mine.applicantPhone },
    { label: "TIN", value: mine.tin },
    { label: "GML", value: mine.gmlNumber },
    { label: "GPS", value: point ? `${point.latitude}, ${point.longitude}` : null },
    { label: "Created by", value: mine.createdBy },
    { label: "Created at", value: mine.createdAt && new Date(mine.createdAt).toLocaleString() },
    { label: "Updated at", value: mine.updatedAt && new Date(mine.updatedAt).toLocaleString() },
  ];

  return (
    <div
      style={{
        border: "1px solid var(--color-line, #e5e7eb)",
        borderRadius: "10px",
        background: "var(--color-surface, #fff)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h2 style={{ fontSize: "15px", fontWeight: "700", color: "var(--color-ink, #1a1a1a)" }}>
        {mine.applicantName || "—"}
      </h2>
      {rows
        .filter((r) => r.value)
        .map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-ink-muted, #6b7280)",
                whiteSpace: "nowrap",
              }}
            >
              {r.label}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--color-ink, #1a1a1a)",
                textAlign: "right",
              }}
            >
              {r.value}
            </span>
          </div>
        ))}
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
            <Button
              variant="secondary"
              className="!text-ink"
              size="md"
              onClick={() => setMapView((v) => (v === "street" ? "satellite" : "street"))}
            >
              {mapView === "street" ? "Satellite view" : "Street view"}
            </Button>
            <Button
              variant="secondary"
              className="!text-ink"
              size="md"
              onClick={() => mapRef.current?.flyTo(SRI_LANKA_CENTER, DEFAULT_ZOOM, { duration: 0.8 })}
            >
              Reset view
            </Button>
          </div>

          {error && <p style={{ fontSize: "13px", color: "#dc2626" }}>{error}</p>}
          {!loading && !error && (
            <p style={{ fontSize: "12px", color: "var(--color-ink-muted, #6b7280)" }}>
              {mines.length} mine{mines.length !== 1 ? "s" : ""} on map
            </p>
          )}

          <MineDetailPanel mine={selectedDetails} loading={detailLoading} error={detailError} />
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
    </div>
  );
}