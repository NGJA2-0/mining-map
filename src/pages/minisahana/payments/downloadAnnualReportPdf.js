const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class UnauthorizedError extends Error {
  constructor() {
    super("Session expired");
    this.name = "UnauthorizedError";
  }
}

export function annualReportFileName(year, grade) {
  return grade
    ? `annual-report-${year}-grade-${grade}.pdf`
    : `annual-report-${year}.pdf`;
}

/**
 * Downloads the annual report PDF (all report cards for the year).
 * Throws UnauthorizedError on 401, or Error(message) for any other failure.
 */
export async function downloadAnnualReportPdf({ year, grade, token }) {
  const params = new URLSearchParams({ year: String(year) });
  if (grade) params.set("grade", String(grade)); // omitted for "All grades"

  const res = await fetch(`${BASE_URL}/api/annual-reports/pdf?${params}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) throw new UnauthorizedError();

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to download the report.");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = annualReportFileName(year, grade);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}