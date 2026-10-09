import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import TopoBackground from "../../../components/common/TopoBackground";
import Button from "../../../components/common/Button";
import StudentRecordSearch from "./StudentRecordSearch";

export default function StudentReportPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
    }
    if (profileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center justify-between px-4 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/minisahana/payments")}
              aria-label="Back to Payments dashboard"
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
              <img src="/logo.jpg" alt="Mini Sahana logo" className="h-9 w-9 rounded-md object-cover sm:h-12 sm:w-12" />
              <h1 className="font-display text-lg font-semibold sm:text-2xl">Student Report</h1>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              id="profile-menu-button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((p) => !p)}
              style={{
                width: "46px", height: "46px", borderRadius: "50%",
                background: "var(--color-copper, #b85a29)", color: "#fff",
                border: "none", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
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
                  position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: "220px",
                  background: "var(--color-surface, #fff)", border: "1px solid var(--color-line, #e5e7eb)",
                  borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100,
                  overflow: "hidden", animation: "dropdownIn 150ms ease-out",
                }}
              >
                <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--color-line, #e5e7eb)" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                      width: "100%", padding: "9px 10px", background: "transparent", border: "none",
                      borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      color: "#dc2626", textAlign: "left", fontFamily: "inherit",
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── main (split layout, same look as the dashboard) ── */}
      <main className="flex flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
        <style>{`
          @keyframes zoomOutCard {
            from { opacity: 0.6; transform: scale(1.06); }
            to   { opacity: 1;   transform: scale(1); }
          }
          @keyframes zoomOutCardLg {
            from { opacity: 0.6; transform: scale(1.02); }
            to   { opacity: 1;   transform: scale(0.75); }
          }
          .pay-card-zoom { animation: zoomOutCard 350ms ease-out; }
          @media (min-width: 1024px) {
            .pay-card-zoom {
              transform: scale(0.75);
              transform-origin: center center;
              animation-name: zoomOutCardLg;
              filter: blur(1.5px);
              transition: filter 250ms ease-out;
            }
            .pay-card-zoom:hover { filter: none; }
          }
        `}</style>

        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:gap-12">
          {/* Left: blurred / zoomed-out card */}
          <div className="lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-8rem)] lg:min-h-[30rem] lg:items-center">
            <div
              className="pay-card-zoom relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-line/70 bg-surface/80 p-6 text-center backdrop-blur-md sm:p-8 lg:mx-0 lg:max-w-none"
              style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05), 0 28px 60px -20px rgba(184,90,41,0.35)" }}
            >
              <TopoBackground className="text-teal/15" />
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-copper via-copper/70 to-copper/20" />

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
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/minisahana/payments", { state: { panel: "pay" } })}
                  >
                    Pay
                  </Button>

                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate("/minisahana/payments", { state: { panel: "summary" } })}
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

                  {/* Active on this page */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => {}}
                  >
                    Download Student Report
                  </Button>

                  <div className="flex items-center gap-3 py-1">
                    <span className="h-px flex-1 bg-line" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                      or
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/minisahana/payments", { replace: true, state: null })}
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
                </div>
              </div>
            </div>
          </div>

          {/* Right: empty container (build the student report here later) */}
          <div className="min-w-0">
            <div
              className="min-h-[20rem] rounded-2xl border border-line bg-surface p-4 sm:p-6"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
            >
              <div className="mb-5 sm:mb-6">
                <h2 className="font-display text-base font-bold sm:text-xl" style={{ letterSpacing: "-0.01em" }}>
                  Get a student record
                </h2>
                <p className="mt-1 text-xs text-ink-muted sm:text-[13px]">
                  Search by name, NIC, bank account number, grade or zone.
                </p>
              </div>

              <StudentRecordSearch onSelect={setSelectedStudent} />

              {selectedStudent && (
                <div className="mt-6 rounded-xl border border-line bg-page p-4 sm:p-5">
                  <p className="text-sm font-semibold">{selectedStudent.applicantFullNameSinhala}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-ink-muted">
                    NIC: {selectedStudent.nic}
                  </p>
                  {/* TODO: fetch GET /api/mini-sahana-form/${selectedStudent.id} and render the full record */}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}