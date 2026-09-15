import { useNavigate } from "react-router-dom";

export default function MiniSahanaFormHeader() {
  const navigate = useNavigate();

  return (
    <header>
      <div className="flex items-center justify-between px-4 py-5 sm:px-10 lg:px-16">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/minisahana/applications")}
            aria-label="Back to Applications"
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
              Mini Sahana
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}