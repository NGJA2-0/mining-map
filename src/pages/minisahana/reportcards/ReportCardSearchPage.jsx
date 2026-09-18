import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STUDENTS = [
  { id: 1, name: "Ashen Perera", nic: "200412345678", grade: "9" },
  { id: 2, name: "Dilki Fernando", nic: "200501234567", grade: "10" },
  { id: 3, name: "Nethmi Silva", nic: "200612345098", grade: "8" },
  { id: 4, name: "Kavindu Jayasuriya", nic: "200711223344", grade: "11" },
];

export default function ReportCardSearchPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return STUDENTS;
    return STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nic.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-page text-ink flex flex-col">
      {/* ── header ── */}
      <header className="border-b border-line">
        <div className="flex items-center gap-2 px-4 py-5 sm:gap-4 sm:px-10 lg:px-16">
          <button
            type="button"
            onClick={() => navigate("/minisahana/report-cards")}
            aria-label="Back to Report Cards"
            className="flex items-center gap-1.5 rounded-md p-2 text-ink-muted transition-colors hover:bg-line/60 hover:text-ink focus:outline-none focus:ring-2 focus:ring-copper/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="hidden text-sm font-medium sm:inline">Back</span>
          </button>

          <div className="hidden h-6 w-px bg-line sm:block" />

          <h1 className="font-display text-lg font-semibold sm:text-2xl">
            Find Student
          </h1>
        </div>
      </header>

      {/* ── main ── */}
      <main className="flex-1 px-4 py-8 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold sm:text-3xl" style={{ letterSpacing: "-0.02em" }}>
              Search Student
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Search by student name or NIC to create a new report card.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-6 w-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or NIC..."
              autoFocus
              className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-copper/20"
            />
          </div>

          {/* Results */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {filtered.length === 0 && (
              <p className="rounded-lg border border-line bg-surface p-4 text-center text-sm text-ink-muted">
                No students found.
              </p>
            )}

            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => navigate(`/minisahana/report-cards/new?studentId=${s.id}`)}
                className="group flex items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-md sm:p-4"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold sm:text-base">
                    {s.name}
                  </span>
                  <span className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-wide text-ink-muted sm:text-xs">
                    NIC: {s.nic}
                  </span>
                </div>
                <span className="shrink-0 rounded-md bg-teal/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal">
                  Grade {s.grade}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}