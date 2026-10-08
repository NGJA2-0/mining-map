import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function formatAmount(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return value ?? "—";
  return `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ReportCardsGradeTable({ grade }) {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    (async () => {
      try {
        const qs = grade ? `?grade=${encodeURIComponent(grade)}` : "";
        const res = await fetch(`${API_BASE_URL}/api/report-cards/${qs}`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (res.status === 401) {
          logout();
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load submissions");
        }

        const data = await res.json();
        setRecords(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Couldn't load submissions.");
          setRecords([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [grade, token, logout, navigate]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-surface"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.14)" }}
    >
      <div className="border-b border-line bg-gradient-to-r from-copper/5 to-transparent px-5 py-4 sm:px-7 sm:py-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-copper">
          {grade ? `Grade ${grade}` : "All Grades"} · This Year
        </p>
        <h3 className="mt-0.5 font-display text-lg font-bold sm:text-xl">
          Report Card Submissions
        </h3>
      </div>

      <div className="overflow-x-auto">
        {loading && (
          <p className="p-6 text-center text-sm text-ink-muted">Loading…</p>
        )}

        {!loading && error && (
          <p className="p-6 text-center text-sm text-red-600">{error}</p>
        )}

        {!loading && !error && records.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-muted">
            No submissions found.
          </p>
        )}

        {/* Mobile: card list */}
        {!loading && !error && records.length > 0 && (
          <ul className="divide-y divide-line md:hidden">
            {records.map((r) => (
              <li key={r.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{r.fullName || "—"}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink-muted">{r.nic || "—"}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-copper/10 px-2 py-0.5 text-xs font-semibold text-copper">
                    {r.currentGrade || "—"}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <dt className="text-ink-muted">Start Date</dt>
                    <dd className="font-medium text-ink">{formatDate(r.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">End Date</dt>
                    <dd className="font-medium text-ink">{formatDate(r.endDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Duration</dt>
                    <dd className="font-medium text-ink">{r.totalDuration ?? "—"} mo</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Total Amount</dt>
                    <dd className="font-semibold text-ink">{formatAmount(r.totalAmount)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}

        {/* Desktop / tablet: table */}
        {!loading && !error && records.length > 0 && (
          <table className="hidden w-full min-w-[720px] text-left text-sm md:table">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 sm:px-7">Full Name</th>
                <th className="px-5 py-3 sm:px-7">NIC</th>
                <th className="px-5 py-3 sm:px-7">Current Grade</th>
                <th className="px-5 py-3 sm:px-7">Start Date</th>
                <th className="px-5 py-3 sm:px-7">End Date</th>
                <th className="px-5 py-3 sm:px-7">Duration</th>
                <th className="px-5 py-3 sm:px-7">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0 hover:bg-copper/5">
                  <td className="px-5 py-3 font-semibold text-ink sm:px-7">{r.fullName || "—"}</td>
                  <td className="px-5 py-3 font-mono text-ink-muted sm:px-7">{r.nic || "—"}</td>
                  <td className="px-5 py-3 text-ink sm:px-7">{r.currentGrade || "—"}</td>
                  <td className="px-5 py-3 text-ink sm:px-7">{formatDate(r.startDate)}</td>
                  <td className="px-5 py-3 text-ink sm:px-7">{formatDate(r.endDate)}</td>
                  <td className="px-5 py-3 text-ink sm:px-7">{r.totalDuration ?? "—"} mo</td>
                  <td className="px-5 py-3 font-semibold text-ink sm:px-7">{formatAmount(r.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}