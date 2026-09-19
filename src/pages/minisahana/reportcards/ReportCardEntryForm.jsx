import { useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import ReportCardSummary from "./ReportCardSummary";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export default function ReportCardEntryForm({ student, onBack }) {
  const { token } = useAuth();
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [savedAccNumber, setSavedAccNumber] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") return;
    setFileName(file.name);
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedFile) {
      setSubmitError("Please attach the report card PDF.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("applicationId", student?.id || "");
      formData.append("fullName", student?.applicantFullNameSinhala || "");
      formData.append("accNumber", student?.bankAccountNumber || "");
      formData.append("nic", student?.nic || "");
      formData.append("grade", student?.grade || "");
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("amount", monthlyAmount);
      formData.append("pdf", selectedFile);

      const res = await fetch(`${API_BASE_URL}/api/report-cards`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to submit report card");
      }

      // Success — reset form fields and switch to the summary view.
      setStartDate("");
      setEndDate("");
      setMonthlyAmount("");
      setFileName("");
      setSelectedFile(null);
      setSavedAccNumber(student?.bankAccountNumber || "");
    } catch (err) {
      console.error(err);
      setSubmitError("Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (savedAccNumber) {
    const refreshPage = () => window.location.reload();

    return (
      <ReportCardSummary
        accNumber={savedAccNumber}
        token={token}
        onDone={refreshPage}
        onClose={refreshPage}
      />
    );
  }

  return (
    <div
      className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.14)" }}
    >
      {/* Header */}
      <div className="border-b border-line bg-gradient-to-r from-copper/5 to-transparent px-5 py-4 sm:px-7 sm:py-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-ink-muted transition-colors hover:text-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Report Card History
          </button>
        )}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-copper">
          New Report Card
        </p>
        <h3 className="mt-0.5 truncate font-display text-lg font-bold sm:text-xl">
          {student?.applicantFullNameSinhala}
        </h3>
        {student?.nic && (
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-muted sm:text-xs">
            NIC: {student.nic}
          </p>
        )}
        {student?.bankAccountNumber && (
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-muted sm:text-xs">
            A/C: {student.bankAccountNumber}
          </p>
        )}
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-col gap-6">
          {/* PDF upload container */}
          <div className="w-full">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Report Card PDF
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              className={`flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors sm:h-full sm:min-h-[168px]
                ${isDragging ? "border-copper bg-copper/5" : "border-line bg-page hover:border-copper/50 hover:bg-copper/5"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                className={fileName ? "text-teal" : "text-ink-muted"}
              >
                {fileName ? (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="m9 15 2 2 4-4" />
                  </>
                ) : (
                  <>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </>
                )}
              </svg>

              {fileName ? (
                <p className="max-w-full truncate text-xs font-semibold text-ink">
                  {fileName}
                </p>
              ) : (
                <>
                  <p className="text-xs font-semibold text-ink">
                    Drop PDF here or click to browse
                  </p>
                  <p className="text-[11px] text-ink-muted">PDF only</p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="hidden"
              />
            </div>
          </div>

          {/* Fields */}
          <div className="flex flex-1 flex-col">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-w-[150px] rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-ink focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20 [&::-webkit-calendar-picker-indicator]:ml-2"
                />
              </div>

              <div>
                <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full min-w-[150px] rounded-lg border border-line bg-page px-3 py-2.5 text-sm text-ink focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20 [&::-webkit-calendar-picker-indicator]:ml-2"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-1.5 block whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted">
                    Rs.
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-line bg-page py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-copper focus:outline-none focus:ring-2 focus:ring-copper/20"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
              {submitError && (
                <p className="text-xs font-medium text-red-600">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-copper px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-copper/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}