import { useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const CloseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PayIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const DownloadIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ITEMS = [
  { key: "pay", label: "Pay", hint: "Record a payment", path: "/minisahana/payments", state: { panel: "pay" }, Icon: PayIcon },
  { key: "summary", label: "Monthly Summary", hint: "Download this month", path: "/minisahana/payments", state: { panel: "summary" }, Icon: DownloadIcon },
  { key: "annual", label: "Annual Report", hint: "Download full year", path: "/minisahana/payments/annual-report", Icon: DownloadIcon },
  { key: "student", label: "Student Report", hint: "Download per student", path: "/minisahana/payments/student-report", Icon: DownloadIcon },
];

/**
 * Secondary panel that floats right next to the main SideNav drawer.
 * - sm and up: a compact floating card beside the main drawer (height fits content)
 * - below sm: a bottom sheet that slides up over the main drawer
 */
export default function PaymentsSubNav({ open, anchor, onClose, onNavigate }) {
  const location = useLocation();
  const panelRef = useRef(null);
  const [tops, setTops] = useState({
    desktop: anchor?.top ?? 96,
    mobile: (anchor?.bottom ?? 140) + 8,
  });

  // desktop: card top lines up with the Payments row (beside the drawer)
  // mobile:  card drops in right under the Payments row (inside the drawer)
  // both are kept fully on screen
  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const height = panelRef.current.offsetHeight;
    const maxTop = window.innerHeight - height - 12;
    const fit = (value) => Math.max(12, Math.min(value, maxTop));
    setTops({
      desktop: fit(anchor?.top ?? 96),
      mobile: fit((anchor?.bottom ?? 140) + 8),
    });
  }, [open, anchor?.top, anchor?.bottom]);

  const isActive = (item) => {
    if (location.pathname !== item.path) return false;
    if (!item.state) return true;
    return location.state?.panel === item.state.panel;
  };

  return (
    <aside
      ref={panelRef}
      aria-hidden={!open}
      aria-label="Payments menu"
      style={{
        "--sub-top": `${tops.desktop}px`,
        "--sub-top-m": `${tops.mobile}px`,
        "--sub-left": `${anchor?.left ?? 312}px`,
      }}
      className={`fixed z-[60] flex flex-col overflow-hidden border border-line bg-surface rounded-2xl
        transition-[transform,opacity] duration-300 ease-out max-h-[calc(100vh-24px)]
        top-[var(--sub-top-m)] left-3 w-[calc(min(82vw,300px)-1.5rem)] shadow-[0_12px_32px_rgba(0,0,0,0.2)]
        sm:top-[var(--sub-top)] sm:left-[var(--sub-left)] sm:w-[260px] sm:shadow-[0_12px_40px_rgba(0,0,0,0.18)]
        ${open
          ? "translate-y-0 opacity-100 pointer-events-auto sm:translate-x-0"
          : "-translate-y-2 opacity-0 pointer-events-none sm:translate-y-0 sm:-translate-x-4"}`}
    >
      {/* Accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-copper via-copper/60 to-teal" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">Mini Sahana</p>
          <h3 className="font-display text-lg font-semibold leading-tight text-ink">Payments</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close payments menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Items */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">
        <ul className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.path, item.state ? { state: item.state } : undefined)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-150
                    focus:outline-none focus:ring-2 focus:ring-copper/20
                    ${active ? "bg-copper/10" : "hover:bg-line/50"}`}
                >
                  {active && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-copper" />
                  )}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors
                      ${active ? "bg-copper text-white shadow-sm" : "bg-teal/10 text-teal group-hover:bg-teal/15"}`}
                  >
                    <item.Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-medium ${active ? "text-ink" : "text-ink"}`}>
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-ink-muted">{item.hint}</span>
                  </span>
                  <ArrowIcon
                    className={`shrink-0 transition-all duration-150
                      ${active ? "text-copper" : "text-ink-muted/50 group-hover:translate-x-0.5 group-hover:text-ink-muted"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}