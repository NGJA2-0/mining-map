import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopoBackground from "../../../components/common/TopoBackground";
import Button from "../../../components/common/Button";
import { useAuth } from "../../../context/AuthContext";
import MonthlySummaryPanel from "./MonthlySummaryPanel";
import PaymentsPage from "./PaymentsPage";
import PaymentsCharts from "./PaymentsCharts";

export default function PaymentsDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showSummary, setShowSummary] = useState(location.state?.panel === "summary");
  const [showPay, setShowPay] = useState(location.state?.panel === "pay");
  const [showMenu, setShowMenu] = useState(false); // button card hidden until "Report and Payments" is clicked
  const split = showSummary || showPay; // true when the screen is split

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-4 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/minisahana")}
              aria-label="Back to Mini Sahana"
              className="flex items-center gap-1.5 rounded-md p-2 text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden text-sm font-medium sm:inline">Back</span>
            </button>

            <div className="hidden h-6 w-px bg-line sm:block" />

            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Mini Sahana logo"
                className="h-9 w-9 rounded-md object-cover sm:h-12 sm:w-12"
              />
              <h1 className="font-display text-lg font-semibold sm:text-2xl">
                Payments
              </h1>
            </div>
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
                      onClick={() => logout()}
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
            {/* ── main ── */}
      <main
        className={`flex flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8 ${
          split ? "" : "sm:px-10 sm:py-12 lg:px-16"
        }`}
      >
        {/* Zoom-out + blur for the button card */}
        <style>{`
          @keyframes zoomOutCard {
            from { opacity: 0.6; transform: scale(1.06); }
            to   { opacity: 1;   transform: scale(1); }
          }
          @keyframes zoomOutCardLg {
            from { opacity: 0.6; transform: scale(1.02); }
            to   { opacity: 1;   transform: scale(0.75); }
          }
          @keyframes popupFade {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes popupIn {
            from { opacity: 0; transform: translateY(14px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          .popup-overlay { animation: popupFade 200ms ease-out; }
          .popup-in { animation: popupIn 280ms cubic-bezier(.2,.8,.2,1); }
          .pay-card-zoom { animation: zoomOutCard 350ms ease-out; }
          @media (min-width: 1024px) {
            .pay-card-zoom {
              transform: scale(0.75);
              transform-origin: center center;
              animation-name: zoomOutCardLg;
              filter: blur(1.5px);
              transition: filter 250ms ease-out;
            }
            .pay-card-zoom:hover {
              filter: none;
            }
          }
        `}</style>

        <div
          className={`w-full ${
            split
              ? "grid gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:gap-12"
              : "grid grid-cols-1 items-start gap-8"
          }`}
        >
          {/* Buttons card (right column on the initial dashboard) */}
          <div
            onClick={() => {
              if (!split) setShowMenu(false); // click outside the popup closes it
            }}
            className={
              split
                ? "lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-8rem)] lg:min-h-[30rem] lg:items-center"
                : showMenu
                  ? "popup-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md"
                  : "hidden"
            }
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-lg rounded-2xl border text-center ${
                split
                  ? "pay-card-zoom mx-auto overflow-hidden border-line/70 bg-surface/80 p-6 backdrop-blur-md sm:p-8 lg:mx-0 lg:max-w-none"
                  : "popup-in max-h-[90vh] overflow-y-auto border-line bg-surface p-6 sm:p-10"
              }`}
              style={{
                boxShadow: split
                  ? "0 2px 4px rgba(0,0,0,0.05), 0 28px 60px -20px rgba(184,90,41,0.35)"
                  : "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)",
              }}
            >
              <TopoBackground className="text-teal/15" />

              {/* Copper accent bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-copper via-copper/70 to-copper/20" />

              {/* Close button (popup only) */}
              {!split && (
                <button
                  type="button"
                  onClick={() => setShowMenu(false)}
                  aria-label="Close"
                  className="absolute right-3 top-4 z-20 rounded-md p-2 text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              <div className="relative z-10 flex flex-col items-center gap-8">
                <div>
                  <h2 className="font-display text-2xl font-bold sm:text-4xl" style={{ letterSpacing: "-0.02em" }}>
                    Payments
                  </h2>
                  <p className="mt-2 text-sm text-ink-muted">
                    Please select an option to continue.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-4">
                  <Button
                    variant={showSummary ? "secondary" : "primary"}
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setShowPay(true);
                      setShowSummary(false);
                    }}
                  >
                    Pay
                  </Button>

                  <Button
                    variant={showSummary ? "primary" : "secondary"}
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      setShowSummary(true);
                      setShowPay(false);
                    }}
                  >
                    Download Monthly Summary
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/minisahana/payments/annual-report")}
                  >
                    Download Annual Report
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/minisahana/payments/student-report")}
                  >
                    Download Student Report
                  </Button>

                  {/* Divider + Refresh (only once the screen is split) */}
                  {split && (
                    <>
                      <div className="flex items-center gap-3 py-1">
                        <span className="h-px flex-1 bg-line" />
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                          or
                        </span>
                        <span className="h-px flex-1 bg-line" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowSummary(false);
                          setShowPay(false);
                          setShowMenu(false);
                          navigate("/minisahana/payments", { replace: true, state: null });
                        }}
                        aria-label="Refresh page"
                        className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface/80 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition-all hover:border-copper/40 hover:bg-copper/10 hover:text-copper focus:outline-none focus:ring-2 focus:ring-copper/30"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-transform duration-500 group-hover:rotate-180"
                        >
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
                        </svg>
                        Refresh
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right (split mode): Monthly summary OR the Pay page */}
          {showSummary && (
            <div className="min-w-0">
              <MonthlySummaryPanel />
            </div>
          )}
          {showPay && (
            <div className="min-w-0">
              <PaymentsPage embedded />
            </div>
          )}

          {/* Charts (initial dashboard only, left column) */}
          {!split && (
            <div className="order-2 w-full min-w-0 lg:col-start-1 lg:row-start-1">
              <div className="mb-5 flex items-center gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                  Overview
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-line to-transparent" />
              </div>
              <PaymentsCharts
                onReportClick={() => setShowMenu((prev) => !prev)}
                menuOpen={showMenu}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}