import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const MenuIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronIcon = ({ open, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MiningIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 20l6-11 4 7 3-5 5 9H3z" />
    <circle cx="17" cy="5" r="2" />
  </svg>
);

const GraduationIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 10L12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
  </svg>
);

const FileIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CardIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [miniSahanaExpanded, setMiniSahanaExpanded] = useState(false);

  // Close the drawer automatically whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Allow closing with the Escape key
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const go = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Toggle tab — always visible, docked to the left edge */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        className={`fixed top-1/2 left-0 z-50 -translate-y-1/2 flex items-center justify-center
          h-12 w-9 rounded-r-xl border border-l-0 border-line bg-surface text-ink-muted
          shadow-[2px_0_10px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out
          hover:w-10 hover:text-copper hover:bg-line/50
          focus:outline-none focus:ring-2 focus:ring-copper/30
          ${open ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <MenuIcon />
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[300px] flex-col
          bg-surface border-r border-line shadow-2xl transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-5">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Portal logo" className="h-9 w-9 rounded-md object-cover" />
            <span className="font-display text-lg font-semibold text-ink">Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            <li>
              <button
                type="button"
                onClick={() => go("/dashboard")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-copper/20"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-copper/10 text-copper">
                  <MiningIcon />
                </span>
                Mining
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => setMiniSahanaExpanded((prev) => !prev)}
                aria-expanded={miniSahanaExpanded}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-ink transition-colors hover:bg-line/50 focus:outline-none focus:ring-2 focus:ring-copper/20"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-teal/10 text-teal">
                    <GraduationIcon />
                  </span>
                  Mini Sahana
                </span>
                <ChevronIcon open={miniSahanaExpanded} />
              </button>

              <div
                className={`grid overflow-hidden transition-all duration-200 ease-out
                  ${miniSahanaExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <ul className="ml-4 flex flex-col gap-1 border-l border-line pl-4">
                    <li>
                      <button
                        type="button"
                        onClick={() => go("/minisahana/applications")}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-line/50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
                      >
                        <FileIcon />
                        Applications
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => go("/minisahana/report-cards")}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-line/50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
                      >
                        <CardIcon />
                        Report Cards
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}