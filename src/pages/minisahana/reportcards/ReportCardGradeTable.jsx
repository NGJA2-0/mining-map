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
          navigate("/login");
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
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface"
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

        {!loading && !error && records.length > 0 && (
          <table className="w-full min-w-[720px] text-left text-sm">
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