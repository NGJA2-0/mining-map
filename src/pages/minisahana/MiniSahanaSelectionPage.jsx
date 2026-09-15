import { useNavigate } from "react-router-dom";
import TopoBackground from "../../components/common/TopoBackground";
import Button from "../../components/common/Button";

export default function MiniSahanaSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center gap-3 px-6 py-5 sm:px-10 lg:px-16">
          <button
            type="button"
            onClick={() => navigate("/select-app")}
            className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink focus:outline-none"
          >
            ← ආපසු
          </button>
        </div>
      </header>

      {/* ── main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-12 text-center"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)" }}
        >
          <TopoBackground className="text-teal/15" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-4xl" style={{ letterSpacing: "-0.02em" }}>
                Mini Sahana
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Please select an option to continue.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate("/minisahana/applications")}
              >
                Applications
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => {}}
              >
                Report Cards
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}