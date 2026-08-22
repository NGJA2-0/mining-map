import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopoBackground from "../components/common/TopoBackground";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import SearchResultsModal from "../components/dashboard/SearchResultsModal";
import HistoryModal from "../components/dashboard/HistoryModal";
import RecordPreviewModal from "../components/dashboard/RecordPreviewModal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ─────────────────────────── page ─────────────────────────── */

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const tinInputRef = useRef(null);

  // ── search state ──
  const [tinInput, setTinInput] = useState("");
  const [activeSearch, setActiveSearch] = useState(""); // the TIN that was actually searched
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // ── history state ──
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRef, setHistoryRef] = useState("");
  const [historyResults, setHistoryResults] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // ── record detail (view) state ──
  const [recordDetailOpen, setRecordDetailOpen] = useState(false);
  const [recordDetailLoading, setRecordDetailLoading] = useState(false);
  const [recordDetailError, setRecordDetailError] = useState("");
  const [recordDetailData, setRecordDetailData] = useState(null);
  const [recordDetailId, setRecordDetailId] = useState(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  // ── fetch helper ──
  const fetchResults = useCallback(async (tin, pg, limit) => {
    if (!tin) return;
    setLoading(true);
    setError("");
    try {
      const url = `${BASE_URL}/api/mining-licenses/tin/${encodeURIComponent(tin)}?page=${pg}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Error ${res.status}`);
      }
      const json = await res.json();
      const d = json.data;
      setResults(d.data || []);
      setTotal(d.total ?? 0);
      setTotalPages(d.totalPages ?? 1);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

    // Re-fetch when page / pageSize changes (only after an active search)
  useEffect(() => {
    if (hasSearched && activeSearch) {
      fetchResults(activeSearch, page, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // ── history fetch helper ──
  const fetchHistory = useCallback(async (refNumber, pg, limit) => {
    if (!refNumber) return;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const url = `${BASE_URL}/api/mining-licenses/reference/${encodeURIComponent(refNumber)}?page=${pg}&limit=${limit}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Error ${res.status}`);
      }
      const json = await res.json();
      const d = json.data;
      setHistoryResults(d.data || []);
      setHistoryTotal(d.total ?? 0);
      setHistoryTotalPages(d.totalPages ?? 1);
    } catch (err) {
      setHistoryError(err.message || "Something went wrong. Please try again.");
      setHistoryResults([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

    // Re-fetch history when its page / pageSize changes
  useEffect(() => {
    if (historyOpen && historyRef) {
      fetchHistory(historyRef, historyPage, historyPageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyPage, historyPageSize]);

  // ── record detail fetch helper ──
  const fetchRecordDetail = useCallback(async (id) => {
    if (!id) return;
    setRecordDetailLoading(true);
    setRecordDetailError("");
    try {
      const url = `${BASE_URL}/api/mining-licenses/${encodeURIComponent(id)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || `Error ${res.status}`);
      }
      const json = await res.json();
      setRecordDetailData(json.data || null);
    } catch (err) {
      setRecordDetailError(err.message || "Something went wrong. Please try again.");
      setRecordDetailData(null);
    } finally {
      setRecordDetailLoading(false);
    }
  }, [token]);

  const handleSelectHistoryRecord = (id) => {
    setRecordDetailId(id);
    setRecordDetailOpen(true);
    fetchRecordDetail(id);
  };

  const handleSearch = () => {
    const tin = tinInput.trim();
    if (!tin) return;
    setPage(1);
    setActiveSearch(tin);
    setHasSearched(true);
    fetchResults(tin, 1, pageSize);
  };

  const handleViewHistory = (record) => {
    const refNumber = record.referenceNumber;
    setHistoryRef(refNumber);
    setHistoryPage(1);
    setHistoryOpen(true);
    fetchHistory(refNumber, 1, historyPageSize);
  };

    const handleUpdateClick = () => {
    setOpen(false);
    setTimeout(() => {
      tinInputRef.current?.focus();
      tinInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleSignOutRequest = () => {
    setProfileOpen(false);
    setConfirmSignOut(true);
  };

  const handleConfirmSignOut = () => {
    setConfirmSignOut(false);
    logout();
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen bg-base text-ink">
      {/* ── keyframes ── */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Mining Map logo"
              className="h-10 w-10 rounded-md object-cover sm:h-12 sm:w-12"
            />
            <h1 className="font-display text-xl font-semibold sm:text-2xl">
              Mining Map
            </h1>
          </div>

          {/* Profile avatar + dropdown */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                id="profile-menu-button"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={() => setProfileOpen((prev) => !prev)}
                style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  background: "var(--color-copper, #b85a29)", color: "#fff",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "inherit", transition: "opacity 0.15s", flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  aria-labelledby="profile-menu-button"
                  style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    minWidth: "220px", background: "var(--color-surface, #fff)",
                    border: "1px solid var(--color-line, #e5e7eb)", borderRadius: "10px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100,
                    overflow: "hidden", animation: "dropdownIn 150ms ease-out",
                  }}
                >
                  <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--color-line, #e5e7eb)" }}>
                    <p style={{ margin: 0, fontWeight: "700", fontSize: "14px", color: "var(--color-ink, #1a1a1a)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user?.name}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: "11px", fontFamily: "monospace", color: "var(--color-ink-muted, #6b7280)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      NIC: {user?.nic}
                    </p>
                  </div>
                  <div style={{ padding: "8px" }}>
                    <button
                      role="menuitem"
                      onClick={handleSignOutRequest}
                      style={{
                        width: "100%", padding: "9px 10px", background: "transparent",
                        border: "none", borderRadius: "6px", cursor: "pointer",
                        fontSize: "13px", fontWeight: "600", color: "#dc2626",
                        textAlign: "left", display: "flex", alignItems: "center", gap: "8px",
                        transition: "background 0.12s", fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.07)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── main ── */}
      <main className="px-4 py-10">

        {/* Hero card wrapper */}
        <div className="relative mx-auto w-full lg:w-1/2">
          <div className="mb-3 flex justify-end">
            <Button
              onClick={() => setOpen(true)}
              size="md"
              className="!text-ink"
            >
              Add / Update record
            </Button>
          </div>

          <div
            className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface p-8 sm:p-12"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
          >
            <TopoBackground className="text-teal/15" />

            <div className="relative z-10 flex flex-col items-start gap-4">

              <h2 className="font-display text-3xl font-bold sm:text-4xl" style={{ letterSpacing: "-0.02em" }}>
                Site Records
              </h2>
              <p className="max-w-md text-sm text-ink-muted">
                Search for an existing record by TIN number, or log a new survey entry.
              </p>

              {/* Search row */}
              <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    id="tin-search-input"
                    ref={tinInputRef}
                    type="text"
                    placeholder="Search by TIN number"
                    value={tinInput}
                    onChange={(e) => setTinInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full rounded-md border border-line bg-base py-2.5 pl-10 pr-4 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-muted focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  />
                </div>

                <Button
                  id="tin-search-btn"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching…" : "Search"}
                </Button>

              </div>
              <button
                onClick={() => navigate("/dashboard/map")}
                style={{
                  position: "absolute", top: "20px", right: "20px", zIndex: 20,
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "999px",
                  background: "var(--color-ink, #1a1a1a)", color: "#fff",
                  fontSize: "12px", fontWeight: "700", letterSpacing: "0.03em",
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                  transition: "transform 0.15s, opacity 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = "1"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                View map
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── search results popup ── */}
      <SearchResultsModal
        open={hasSearched}
        onClose={() => setHasSearched(false)}
        activeSearch={activeSearch}
        loading={loading}
        error={error}
        results={results}
        total={total}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onRetry={() => fetchResults(activeSearch, page, pageSize)}
        onSelectRecord={(record) => navigate("/dashboard/search-result", { state: { record } })}
        onViewHistory={handleViewHistory}
      />

      {/* ── history popup ── */}
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        referenceNumber={historyRef}
        loading={historyLoading}
        error={historyError}
        results={historyResults}
        total={historyTotal}
        totalPages={historyTotalPages}
        page={historyPage}
        pageSize={historyPageSize}
        onPageChange={(p) => setHistoryPage(p)}
        onPageSizeChange={(size) => { setHistoryPageSize(size); setHistoryPage(1); }}
        onRetry={() => fetchHistory(historyRef, historyPage, historyPageSize)}
        onSelectRecord={handleSelectHistoryRecord}
      />

      {/* ── record detail popup ── */}
      <RecordPreviewModal
        open={recordDetailOpen}
        onBack={() => setRecordDetailOpen(false)}
        onClose={() => setRecordDetailOpen(false)}
        loading={recordDetailLoading}
        error={recordDetailError}
        data={recordDetailData}
        onRetry={() => fetchRecordDetail(recordDetailId)}
      />

      {/* ── Actions modal ── */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Site record"
        title="Choose an action"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" className="flex-1" onClick={() => navigate("/dashboard/new")}>
            New
          </Button>
          <Button variant="copper" className="flex-1" onClick={handleUpdateClick}>
            Update
          </Button>
        </div>
      </Modal>

      {/* ── Sign-out confirmation modal ── */}
      <Modal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        eyebrow="Account"
        title="Sign out?"
      >
        <p className="mb-6 text-sm text-ink-muted">
          Are you sure you want to sign out of your account?
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmSignOut(false)}>
            Cancel
          </Button>
          <button
            onClick={handleConfirmSignOut}
            style={{
              flex: 1, padding: "10px 16px", background: "#dc2626",
              color: "#fff", border: "none", borderRadius: "6px",
              fontSize: "14px", fontWeight: "600", cursor: "pointer",
              fontFamily: "inherit", transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.87")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Yes, sign out
          </button>
        </div>
      </Modal>
    </div>
  );
}