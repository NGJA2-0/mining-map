const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ── DUMMY DATA ── replace these with your API responses later.
// Monthly shape: [{ month: "Jan", paid: number, unpaid: number } x 12]
// Annual shape:  [{ year: number, total: number } x 5]
const DUMMY_MONTHLY = [
  { month: "Jan", paid: 182000, unpaid: 24000 },
  { month: "Feb", paid: 156000, unpaid: 31000 },
  { month: "Mar", paid: 201000, unpaid: 18000 },
  { month: "Apr", paid: 143000, unpaid: 42000 },
  { month: "May", paid: 188000, unpaid: 22000 },
  { month: "Jun", paid: 214000, unpaid: 15000 },
  { month: "Jul", paid: 176000, unpaid: 38000 },
  { month: "Aug", paid: 195000, unpaid: 27000 },
  { month: "Sep", paid: 221000, unpaid: 12000 },
  { month: "Oct", paid: 130000, unpaid: 56000 },
  { month: "Nov", paid: 0, unpaid: 0 },
  { month: "Dec", paid: 0, unpaid: 0 },
];

const thisYear = new Date().getFullYear();
const DUMMY_ANNUAL = [1240000, 1385000, 1510000, 1675000, 1420000].map((total, i) => ({
  year: thisYear - 4 + i,
  total,
}));

const DONUT_COLORS = ["#d9b79c", "#64748b", "#2f7f7a", "#e8a23c", "#b85a29"];

function compact(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function rs(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-US")}`;
}

const cardStyle = {
  boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px -12px rgba(0,0,0,0.10)",
};

/* ───────────────────────── Monthly (stacked bars) ───────────────────────── */
function MonthlyChart({ data }) {
  const maxTotal = Math.max(...data.map((d) => d.paid + d.unpaid), 1);
  const max = Math.ceil(maxTotal / 50000) * 50000;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const totalPaid = data.reduce((s, d) => s + d.paid, 0);
  const totalUnpaid = data.reduce((s, d) => s + d.unpaid, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 sm:p-8" style={cardStyle}>
      <div className="flex flex-col gap-3 border-b border-line/70 pb-5 min-[1800px]:flex-row min-[1800px]:items-start min-[1800px]:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Monthly payments
          </p>
          <h3 className="font-display text-lg font-bold text-ink sm:text-xl" style={{ letterSpacing: "-0.01em" }}>
            {thisYear} overview
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "linear-gradient(#e8a23c,#b85a29)" }} />
            Paid <span className="font-semibold text-ink">{rs(totalPaid)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-300" />
            Unpaid <span className="font-semibold text-red-600">{rs(totalUnpaid)}</span>
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-1 items-center gap-3">
        {/* Y axis */}
        <div className="relative h-56 w-10 shrink-0 self-start text-[10px] text-ink-muted sm:h-72">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2"
              style={{ bottom: `${t * 100}%` }}
            >
              {compact(max * t)}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div className="min-w-0 flex-1 self-start">
          <div className="relative h-56 sm:h-72">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t border-dashed border-line"
                style={{ bottom: `${t * 100}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-1 sm:gap-2.5">
              {data.map((d, i) => {
                const total = d.paid + d.unpaid;
                const h = (total / max) * 100;
                const unpaidShare = total ? (d.unpaid / total) * 100 : 0;
                return (
                  <div
                    key={d.month}
                    tabIndex={0}
                    className="group relative flex h-full flex-1 flex-col justify-end outline-none"
                  >
                    {total > 0 && (
                      <div
                        className="pointer-events-none absolute left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-3 py-2 text-[11px] leading-relaxed text-white shadow-lg group-hover:block group-focus:block"
                        style={{ bottom: `calc(${h}% + 8px)` }}
                      >
                        <p className="font-semibold">{d.month} {thisYear}</p>
                        <p>Paid: {rs(d.paid)}</p>
                        <p>Unpaid: {rs(d.unpaid)}</p>
                      </div>
                    )}

                    <div
                      className="flex w-full origin-bottom flex-col justify-end overflow-hidden rounded-t-md transition-[filter] duration-200 group-hover:brightness-110 group-focus:brightness-110"
                      style={{
                        height: `${h}%`,
                        animation: "barGrow 600ms cubic-bezier(.2,.8,.2,1) both",
                        animationDelay: `${i * 40}ms`,
                      }}
                    >
                      <div className="bg-red-300/80" style={{ height: `${unpaidShare}%` }} />
                      <div
                        className="flex-1"
                        style={{ background: "linear-gradient(to top, #b85a29, #e8a23c)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis labels */}
          <div className="mt-2 flex gap-1 sm:gap-2.5">
            {data.map((d) => (
              <span key={d.month} className="flex-1 text-center text-[9px] font-medium text-ink-muted sm:text-xs">
                {d.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Annual (donut) ───────────────────────── */
function AnnualChart({ data, onReportClick, menuOpen }) {
  const total = data.reduce((s, d) => s + d.total, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  const GAP = 3;

  let offset = 0;
  const segments = data.map((d, i) => {
    const len = (d.total / total) * C;
    const seg = {
      ...d,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
      dash: `${Math.max(len - GAP, 0)} ${C - Math.max(len - GAP, 0)}`,
      offset: -offset,
      pct: (d.total / total) * 100,
    };
    offset += len;
    return seg;
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 sm:p-8" style={cardStyle}>
      <div className="border-b border-line/70 pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Annual payments
        </p>
        <h3 className="font-display text-lg font-bold text-ink sm:text-xl" style={{ letterSpacing: "-0.01em" }}>
          Past 5 years
        </h3>
      </div>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row-reverse sm:gap-6">
        {/* Donut */}
        <div className="relative h-40 w-40 shrink-0 sm:h-44 sm:w-44">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle cx="100" cy="100" r={R} fill="none" stroke="#e5e7eb" strokeWidth="22" opacity="0.5" />
            {segments.map((s) => (
              <circle
                key={s.year}
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="22"
                strokeLinecap="butt"
                strokeDasharray={s.dash}
                strokeDashoffset={s.offset}
                style={{ animation: "donutFade 700ms ease-out both" }}
              >
                <title>{`${s.year}: ${rs(s.total)}`}</title>
              </circle>
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Total</span>
            <span className="font-display text-xl font-bold text-ink">Rs. {compact(total)}</span>
          </div>
        </div>

        {/* Legend */}
        <ul className="flex w-full min-w-0 flex-col gap-2 sm:flex-1">
          {[...segments].reverse().map((s) => (
            <li
              key={s.year}
              className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2.5 transition-colors hover:border-copper/40 hover:bg-copper/5"
            >
              <span className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="text-sm font-semibold text-ink">{s.year}</span>
              </span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="text-sm font-medium text-ink">Rs. {compact(s.total)}</span>
                <span className="text-[11px] text-ink-muted">{s.pct.toFixed(0)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {onReportClick && (
        <button
          type="button"
          onClick={onReportClick}
          aria-expanded={!!menuOpen}
          className="group mt-8 flex w-full items-center justify-center gap-2.5 rounded-xl bg-copper px-5 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(184,90,41,0.6)] transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-copper/40"
        >
          Report and Payments
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${menuOpen ? "rotate-180" : "group-hover:translate-x-0.5"}`}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Wrapper ───────────────────────── */
export default function PaymentsCharts({
  monthlyData = DUMMY_MONTHLY,
  annualData = DUMMY_ANNUAL,
  onReportClick,
  menuOpen,
}) {
  return (
    <section className="grid w-full min-w-0 items-stretch gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:gap-8">
      <style>{`
        @keyframes barGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes donutFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <MonthlyChart data={monthlyData} />
      <AnnualChart data={annualData} onReportClick={onReportClick} menuOpen={menuOpen} />
    </section>
  );
}