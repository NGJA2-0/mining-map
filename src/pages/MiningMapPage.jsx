import { useState, useEffect, useMemo, useCallback } from "react";
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
  const point = mine.gpsPoints?.[0];
  if (!point) return null;
  const lat = Number(point.latitude);
  const lng = Number(point.longitude);
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

function MineListItem({ mine, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: active ? "var(--color-teal, #0d9488)11" : "var(--color-surface, #fff)",
        border: "1px solid var(--color-line, #e5e7eb)",
        borderLeft: `3px solid ${active ? "var(--color-teal, #0d9488)" : "var(--color-line, #e5e7eb)"}`,
        borderRadius: "8px", padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: "4px",
        fontFamily: "inherit", transition: "background 0.15s, border-color 0.15s",
      }}
    >
      <span style={{ fontWeight: "700", fontSize: "13px", color: "var(--color-ink, #1a1a1a)" }}>
        {mine.applicantName || "—"}
      </span>
      <span style={{ fontSize: "11px", color: "var(--color-ink-muted, #6b7280)" }}>
        {mine.landName || "—"} · {mine.village || "—"}, {mine.district || "—"}
      </span>
      <span style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--color-ink-muted, #6b7280)" }}>
        GML {mine.gmlNumber || "—"} · TIN {mine.tin || "—"}
      </span>
    </button>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function MiningMapPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [mapView, setMapView] = useState("street"); // "street" | "satellite"
  const [allMines, setAllMines] = useState([]);   // unfiltered, fetched once — powers dropdowns
  const [mines, setMines] = useState([]);          // currently displayed set
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMine, setSelectedMine] = useState(null);

  const [district, setDistrict] = useState("");
  const [regionalOffice, setRegionalOffice] = useState("");
  const [search, setSearch] = useState(""); // matched against tin / nic / gmlNumber / landName

  const fetchMines = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (params.district) qs.set("district", params.district);
      if (params.regionalOffice) qs.set("regionalOffice", params.regionalOffice);
      if (params.search) qs.set("q", params.search);
      const url = `${BASE_URL}/api/mining-licenses/map${qs.toString() ? `?${qs}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Error ${res.status}`);
      }
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      setError(err.message || "Failed to load mines.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load — unfiltered, used both as the default map view and as the
  // source for dropdown options.
  useEffect(() => {
    (async () => {
      const data = await fetchMines();
      setAllMines(data);
      setMines(data);
    })();
  }, [fetchMines]);

  const districtOptions = useMemo(
    () => [...new Set(allMines.map((m) => m.district).filter(Boolean))].sort(),
    [allMines]
  );
  const regionalOfficeOptions = useMemo(
    () => [...new Set(allMines.map((m) => m.regionalOffice).filter(Boolean))].sort(),
    [allMines]
  );

  const handleSearch = async () => {
    setSelectedMine(null);
    const data = await fetchMines({ district, regionalOffice, search: search.trim() });
    setMines(data);
  };

  const handleClear = async () => {
    setDistrict("");
    setRegionalOffice("");
    setSearch("");
    setSelectedMine(null);
    const data = await fetchMines();
    setMines(data);
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: "6px", fontSize: "13px",
    border: "1px solid var(--color-line, #e5e7eb)",
    background: "var(--color-surface, #fff)", color: "var(--color-ink, #1a1a1a)",
    fontFamily: "inherit", outline: "none",
  };

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

  return (
    <div className="min-h-screen bg-base text-ink">
      {/* header */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "600", color: "var(--color-ink-muted, #6b7280)",
              fontFamily: "inherit",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            Back to dashboard
          </button>
          <h1 className="font-display text-lg font-semibold sm:text-xl">Mine locations</h1>
          <div style={{ width: "140px" }} /> {/* spacer to balance the back button */}
        </div>
      </header>

            {/* map + list */}
      <div
        className="px-4 pb-0 pt-4 sm:px-6"
        style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
      >
        {/* list panel */}
        <div style={{
          flex: "1 1 280px", maxWidth: "420px", maxHeight: "calc(100vh - 96px)", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "8px",
        }}>
          {/* filter bar */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <select
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setVillage(""); }}
              style={inputStyle}
            >
              <option value="">All districts</option>
              {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            <select
              value={regionalOffice}
              onChange={(e) => setRegionalOffice(e.target.value)}
              style={inputStyle}
            >
              <option value="">All regional offices</option>
              {regionalOfficeOptions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>

            <input
              type="text"
              placeholder="Search TIN / NIC / GML / land name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{ ...inputStyle, width: "100%" }}
            />

            <Button variant="primary" size="md" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching…" : "Search"}
            </Button>
            <Button className="!text-ink" variant="secondary" size="md" onClick={handleClear} disabled={loading}>
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
          </div>

          {error && (
            <p style={{ fontSize: "13px", color: "#dc2626" }}>{error}</p>
          )}
          {!loading && !error && (
            <p style={{ fontSize: "12px", color: "var(--color-ink-muted, #6b7280)" }}>
              {mines.length} mine{mines.length !== 1 ? "s" : ""} shown
            </p>
          )}

          {mines.map((mine) => (
            <MineListItem
              key={mine.id || mine._id}
              mine={mine}
              active={selectedMine && (selectedMine.id || selectedMine._id) === (mine.id || mine._id)}
              onClick={() => setSelectedMine(mine)}
            />
          ))}
          {!loading && mines.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--color-ink-muted, #6b7280)", padding: "12px 4px" }}>
              No mines match these filters.
            </p>
          )}
        </div>

        {/* map */}
        <div style={{ flex: "2 1 480px", minWidth: "300px", height: "calc(100vh - 96px)", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-line, #e5e7eb)" }}>
          <MapContainer center={SRI_LANKA_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
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
                <Marker
                  key={mine.id || mine._id}
                  position={latLng}
                  eventHandlers={{ click: () => setSelectedMine(mine) }}
                >
                  <Tooltip direction="top" offset={[0, -38]} opacity={1} className="mine-tooltip">
                    <div style={{ width: "220px", fontFamily: "inherit" }}>
                      {/* header strip */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px",
                        background: "linear-gradient(135deg, var(--color-teal, #0d9488), var(--color-copper, #b85a29))",
                        borderRadius: "8px 8px 0 0",
                      }}>
                        <div style={{
                          width: "30px", height: "30px", borderRadius: "50%",
                          background: "rgba(255,255,255,0.22)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "700", fontSize: "12px", flexShrink: 0,
                        }}>
                          {(mine.applicantName || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: "700", fontSize: "13px", color: "#fff", lineHeight: "1.2" }}>
                          {mine.applicantName || "—"}
                        </span>
                      </div>

                      {/* details */}
                      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {[
                          { label: "NIC", value: mine.nic },
                          { label: "TIN", value: mine.tin },
                          { label: "GML", value: mine.gmlNumber },
                          { label: "License type", value: mine.licenseeType },
                          { label: "Cultivation", value: mine.landCultivation },
                        ].filter((r) => r.value).map((r) => (
                          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                            <span style={{
                              fontSize: "10px", fontWeight: "700", letterSpacing: "0.05em",
                              textTransform: "uppercase", color: "var(--color-ink-muted, #6b7280)",
                              whiteSpace: "nowrap",
                            }}>
                              {r.label}
                            </span>
                            <span style={{
                              fontSize: "12px", fontWeight: "600", color: "var(--color-ink, #1a1a1a)",
                              textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {r.value}
                            </span>
                          </div>
                        ))}
                      </div>
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