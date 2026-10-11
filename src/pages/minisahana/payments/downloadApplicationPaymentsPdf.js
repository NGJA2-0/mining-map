const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class PdfDownloadError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * Downloads the full payments PDF (all months) for one application.
 * Throws PdfDownloadError with the HTTP status so the caller can handle 401 / 404.
 */
export default async function downloadApplicationPaymentsPdf(applicationId, token) {
  const res = await fetch(
    `${BASE_URL}/api/application-payments/${encodeURIComponent(applicationId)}/pdf`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    // errors come back as JSON, success comes back as a PDF
    const data = await res.json().catch(() => ({}));
    throw new PdfDownloadError(data.error || "Failed to download PDF", res.status);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `application-payments-${applicationId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}