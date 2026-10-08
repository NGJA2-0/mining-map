const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const COPPER = "#b85a29";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";
const RED = "#dc2626";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Paid-at is an ISO timestamp, shown in GMT+5:30 (Asia/Colombo)
function formatPaidAt(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Colombo",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatAmount(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-US")}`;
}

function buildHtml(report) {
  const rows = report.data || [];
  const s = report.summary || {};

  const th = (label) =>
    `<th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};background:#f3f4f6;border-bottom:1px solid ${LINE};">${label}</th>`;

  const td = (content, extra = "") =>
    `<td style="padding:10px 12px;font-size:12px;color:${INK};border-bottom:1px solid ${LINE};vertical-align:middle;${extra}">${content}</td>`;

  const bodyRows = rows
    .map(
      (item) => `
      <tr style="page-break-inside:avoid;">
        ${td(`<strong>${esc(item.fullName)}</strong>`)}
        ${td(esc(item.accNumber), "font-family:monospace;")}
        ${td(`<span style="display:inline-block;padding:2px 10px;border-radius:999px;background:#f7e9e1;color:${COPPER};font-weight:700;font-size:11px;white-space:nowrap;">Grade ${esc(item.currentGrade)}</span>`)}
        ${td(esc(formatDate(item.startDate)), "white-space:nowrap;")}
        ${td(esc(formatDate(item.endDate)), "white-space:nowrap;")}
        ${td(esc(formatPaidAt(item.month?.paidAt)), "white-space:nowrap;")}
        ${td(esc(item.month?.paidBy || "—"))}
      </tr>`
    )
    .join("");

  const stat = (label, value, color = INK) => `
    <div style="flex:1;padding:14px 18px;border-right:1px solid ${LINE};">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">${label}</div>
      <div style="margin-top:4px;font-size:18px;font-weight:700;color:${color};">${formatAmount(value)}</div>
    </div>`;

  return `
    <div style="width:1080px;background:#ffffff;font-family:Arial,'Noto Sans Sinhala','Iskoola Pota',sans-serif;color:${INK};">
      <div style="padding:22px 24px;border-bottom:3px solid ${COPPER};">
        <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Monthly report</div>
        <div style="margin-top:4px;font-size:26px;font-weight:700;">${esc(report.monthLabel)}</div>
      </div>

      <div style="display:flex;border-bottom:1px solid ${LINE};background:#fafafa;">
        ${stat("Total amount", s.totalAmount)}
        ${stat("Paid amount", s.paidAmount)}
        ${stat("Unpaid amount", s.unpaidAmount, RED)}
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            ${th("Full name")}
            ${th("Acc number")}
            ${th("Current grade")}
            ${th("Start date")}
            ${th("End date")}
            ${th("Paid at (GMT+5:30)")}
            ${th("Paid by")}
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>

      <div style="padding:12px 24px;font-size:10px;color:${MUTED};">
        Generated on ${esc(new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" }))} (GMT+5:30)
      </div>
    </div>`;
}

export async function downloadMonthlyReportPdf({ year, month, token }) {
  // 1. Fetch the full month (no pagination)
  const params = new URLSearchParams({ year: String(year), month: String(month) });
  const res = await fetch(`${BASE_URL}/api/report-cards/monthly-report/all?${params}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  const report = await res.json();
  if (!res.ok) throw new Error(report.error || report.message || "Failed to load report.");
  if (!report.data || report.data.length === 0) throw new Error("No records found for this month.");

  // 2. Render it off-screen (inline hex colours only, so PDF capture stays reliable)
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;";
  holder.innerHTML = buildHtml(report);
  document.body.appendChild(holder);

  try {
    // 3. Convert to PDF and save to the device
    const { default: html2pdf } = await import("html2pdf.js");
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename: `Monthly-Report-${report.monthLabel || `${year}-${month}`}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
        pagebreak: { mode: ["css", "legacy"], avoid: "tr" },
      })
      .from(holder.firstElementChild)
      .save();
  } finally {
    document.body.removeChild(holder);
  }
}