import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

  const [allMines, setAllMines] = useState([]);   // unfiltered, fetched once — powers dropdowns
  const [mines, setMines] = useState([]);          // currently displayed set
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMine, setSelectedMine] = useState(null);

  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [search, setSearch] = useState(""); // matched against tin / nic / gmlNumber / landName

  const fetchMines = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (params.district) qs.set("district", params.district);
      if (params.village) qs.set("village", params.village);
      if (params.search) {
        // Backend takes separate tin/nic/gmlNumber/landName params — send the
        // same search text on all four; each is an independent optional filter
        // so this works as an OR-ish "search anything" box in practice as long
        // as the backend doesn't AND them together. If it does AND them, swap
        // this for one field at a time or add a combined "q" param backend-side.
        qs.set("landName", params.search);
      }
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
  const villageOptions = useMemo(() => {
    const pool = district ? allMines.filter((m) => m.district === district) : allMines;
    return [...new Set(pool.map((m) => m.village).filter(Boolean))].sort();
  }, [allMines, district]);

  const handleSearch = async () => {
    setSelectedMine(null);
    const data = await fetchMines({ district, village, search: search.trim() });
    setMines(data);
  };

  const handleClear = async () => {
    setDistrict("");
    setVillage("");
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

  return (
    <div className="min-h-screen bg-base text-ink">
      {/* header */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: "600", color: "var(--color-ink-muted, #6b7280)",
              fontFamily: "inherit",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to dashboard
          </button>
          <h1 className="font-display text-lg font-semibold sm:text-xl">Mine locations</h1>
          <div style={{ width: "140px" }} /> {/* spacer to balance the back button */}
        </div>
      </header>

      {/* filter bar */}
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8">
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
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            style={inputStyle}
          >
            <option value="">All villages</option>
            {villageOptions.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>

          <input
            type="text"
            placeholder="Search TIN / NIC / GML / land name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ ...inputStyle, flex: "1 1 220px", minWidth: "200px" }}
          />

          <Button variant="primary" size="md" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
          <Button variant="secondary" size="md" onClick={handleClear} disabled={loading}>
            Clear
          </Button>
        </div>

        {error && (
          <p style={{ marginTop: "10px", fontSize: "13px", color: "#dc2626" }}>{error}</p>
        )}
        {!loading && !error && (
          <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--color-ink-muted, #6b7280)" }}>
            {mines.length} mine{mines.length !== 1 ? "s" : ""} shown
          </p>
        )}
      </div>

      {/* map + list */}
      <div
        className="mx-auto max-w-6xl px-4 pb-10 sm:px-8"
        style={{ display: "flex", gap: "16px", flexWrap: "wrap-reverse" }}
      >
        {/* list panel */}
        <div style={{
          flex: "1 1 280px", maxWidth: "340px", maxHeight: "70vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: "8px",
        }}>
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
        <div style={{ flex: "2 1 480px", minWidth: "300px", height: "70vh", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--color-line, #e5e7eb)" }}>
          <MapContainer center={SRI_LANKA_CENTER} zoom={DEFAULT_ZOOM} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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
                  <Popup>
                    <strong>{mine.applicantName || "—"}</strong><br />
                    Land: {mine.landName || "—"}<br />
                    GML: {mine.gmlNumber || "—"}<br />
                    TIN: {mine.tin || "—"}<br />
                    NIC: {mine.nic || "—"}<br />
                    District: {mine.district || "—"}<br />
                    Village: {mine.village || "—"}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}