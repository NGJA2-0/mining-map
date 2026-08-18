import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import TopoBackground from "../components/common/TopoBackground";
import A4PreviewSheet from "../components/common/A4PreviewSheet";
import Button from "../components/common/Button";
import GemSaleDetailsTable from "./GemSaleDetailsTable";
import { SRI_LANKA_DISTRICTS, DS_DIVISIONS_BY_DISTRICT } from "./NewRecordPage";

const yesNo = [
  { value: "yes", label: "ඔව්" },
  { value: "no", label: "නැත" },
];

const NUMERIC_FIELDS = ["extensionCount"];

const toNumberOrUndefined = (value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? value : n;
};

/* ─── map API record → form state ─── */
const mapRecordToForm = (r) => ({
  applicantName: r.applicantName || "",
  applicantAddress: r.applicantAddress || "",
  applicantPhone: r.applicantPhone || "",
  nic: r.nic || "",
  tin: r.tin || "",
  expenseName: r.expenseName || "",
  expenseAddress: r.expenseAddress || "",
  expensePhone: r.expensePhone || "",
  expenseTin: r.expenseTin || "",
  gmlNumber: r.gmlNumber || "",
  gpsPoints:
    Array.isArray(r.gpsPoints) && r.gpsPoints.length > 0
      ? r.gpsPoints
      : [
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
        { latitude: "", longitude: "" },
      ],
  landName: r.landName || "",
  landNature: r.landNature || "",
  isRatnapuraLand: r.isRatnapuraLand || "",
  writtenEvidenceAttachment: null,
  affidavitAttachment: null,
  hasExpenseParty: r.hasExpenseParty || false,
  district: r.district || "",
  village: r.village || "",
  regionalOffice: r.regionalOffice || "",
  licenseeType: r.licenseeType || "",
  consentLetterAttached: r.consentLetterAttached || "",
  govLandAct: r.govLandAct || "",
  landExtent: r.landExtent || "",
  existingPits: r.existingPits || "",
  prevLicenseFirstDate: r.prevLicenseFirstDate || "",
  extensionCount: r.extensionCount != null ? String(r.extensionCount) : "",
  minedGemValue: r.minedGemValue || "",
  conditionBreach: r.conditionBreach || "",
  conditionBreachDetails: r.conditionBreachDetails || "",
  ownershipComplaint: r.ownershipComplaint || "",
  complaintDetails: r.complaintDetails || "",
  proposedDepth: r.proposedDepth != null ? String(r.proposedDepth) : "",
  landCultivation: r.landCultivation || "",
  boundaryNorth: r.boundaryNorth || "",
  boundarySouth: r.boundarySouth || "",
  boundaryEast: r.boundaryEast || "",
  boundaryWest: r.boundaryWest || "",
  boundaryHouses: r.boundaryHouses || "",
  boundaryElectricPoles: r.boundaryElectricPoles || "",
  boundaryWater: r.boundaryWater || "",
  boundaryOther: r.boundaryOther || "",
  boundaryRoads: r.boundaryRoads || "",
  proposedExtent: r.proposedExtent || "",
  refundServiceFee: r.refundServiceFee || "",
  recommendation: r.recommendation || "",
  ngjaRefNumber: r.ngjaRefNumber || "",
  maxExtentVA: r.maxExtentVA || "",
  maxPcCount: r.maxPcCount || "",
  backhoeCount: r.backhoeCount || "",
  gerumCount: r.gerumCount || "",
  adumMachineCount: r.adumMachineCount || "",
  silageExtent: r.silageExtent || "",
  depositAmount: r.depositAmount || "",
  riverbankProtectionAmount: r.riverbankProtectionAmount || "",
  specialCaseAmount: r.specialCaseAmount || "",
  directorApproval: r.directorApproval || "",
  recommendationDate: r.recommendationDate || "",
  chairmanApproval: r.chairmanApproval || "",
  chairmanApprovalDate: r.chairmanApprovalDate || "",
  gemSaleDetails: r.gemSaleDetails || { privateValue: "", auctionValue: "" },
});

/* ─────────────────────── UI helpers ─────────────────────── */

function Field({ label, children, full = false, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""} ${className}`}>
      <label className="font-sinhala text-sm text-ink-muted">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-base px-3 py-2 font-sinhala text-sm text-ink placeholder:text-ink-muted/60 outline-none transition focus:border-teal focus:ring-1 focus:ring-teal";

const inlineInputClass =
  "mx-1 inline-block w-24 rounded border border-line bg-base px-2 py-0.5 align-baseline font-sinhala text-sm text-ink outline-none transition focus:border-teal focus:ring-1 focus:ring-teal";

const STATUS_CFG = {
  draft: { label: "Draft", bg: "rgba(107,114,128,0.12)", color: "#6b7280" },
  submitted: { label: "Submitted", bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.12)", color: "#059669" },
  rejected: { label: "Rejected", bg: "rgba(220,38,38,0.12)", color: "#dc2626" },
};

/* ─────────────────────── page component ─────────────────────── */

export default function EditRecordPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const record = location.state?.record;

  // Redirect if no record data was passed
  useEffect(() => {
    if (!record) navigate("/dashboard", { replace: true });
  }, [record, navigate]);

  const [form, setForm] = useState(() =>
    record ? mapRecordToForm(record) : {}
  );
  const [saving, setSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!record) return null; // while redirecting

  const statusCfg = STATUS_CFG[record.status?.toLowerCase()] || STATUS_CFG.draft;
  const createdDate = record.createdAt
    ? new Date(record.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  /* ── handlers (same pattern as NewRecordPage) ── */
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckboxChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleFileChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.files?.[0] || null }));
  };

  const handleGpsChange = (index, field) => (e) => {
    const { value } = e.target;
    setForm((prev) => {
      const gpsPoints = prev.gpsPoints.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      );
      return { ...prev, gpsPoints };
    });
  };

  const addGpsPoint = () => {
    setForm((prev) => {
      if (prev.gpsPoints.length >= 4) return prev;
      return { ...prev, gpsPoints: [...prev.gpsPoints, { latitude: "", longitude: "" }] };
    });
  };

  const removeGpsPoint = (index) => {
    setForm((prev) => ({
      ...prev,
      gpsPoints: prev.gpsPoints.filter((_, i) => i !== index),
    }));
  };

  const handleDistrictChange = (e) => {
    const { value } = e.target;
    setForm((prev) => ({ ...prev, district: value, regionalOffice: "" }));
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/api/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    const data = await res.json();
    return data.url;
  };

  const validateForm = () => {
    const errors = [];
    const requiredAlways = [
      "applicantName", "applicantAddress", "applicantPhone", "nic",
      "gmlNumber", "landName", "landNature", "isRatnapuraLand",
      "district", "regionalOffice", "licenseeType", "existingPits",
    ];
    requiredAlways.forEach((f) => {
      if (!form[f] || String(form[f]).trim() === "") errors.push(f);
    });
    if (!form.gpsPoints.some((p) => p.latitude && p.longitude)) errors.push("gpsPoints");
    if (form.hasExpenseParty) {
      ["expenseName", "expenseAddress", "expensePhone"].forEach((f) => {
        if (!form[f]) errors.push(f);
      });
    }
    if (form.isRatnapuraLand === "yes") {
      if (!form.writtenEvidenceAttachment) errors.push("writtenEvidenceAttachment");
      if (!form.affidavitAttachment) errors.push("affidavitAttachment");
    }
    if (form.existingPits === "yes") {
      ["prevLicenseFirstDate", "extensionCount", "minedGemValue", "conditionBreach", "ownershipComplaint"].forEach((f) => {
        if (!form[f] && form[f] !== 0) errors.push(f);
      });
     // conditionBreachDetails / ownershipComplaint / complaintDetails no longer exist
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert("කරුණාකර අවශ්‍ය සියලුම ක්ෂේත්‍ර පුරවන්න.");
      console.warn("Missing/invalid fields:", errors);
      return;
    }

    setSaving(true);
    try {
      let writtenEvidenceAttachmentUrl;
      let affidavitAttachmentUrl;

      if (form.isRatnapuraLand === "yes") {
        if (form.writtenEvidenceAttachment) {
          [writtenEvidenceAttachmentUrl, affidavitAttachmentUrl] = await Promise.all([
            uploadFile(form.writtenEvidenceAttachment),
            uploadFile(form.affidavitAttachment),
          ]);
        }
      }

      const payload = {
        ...form,
        gpsPoints: form.gpsPoints.filter((p) => p.latitude && p.longitude),
        writtenEvidenceAttachmentUrl,
        affidavitAttachmentUrl,
      };

      NUMERIC_FIELDS.forEach((field) => {
        payload[field] = toNumberOrUndefined(payload[field]);
      });
      delete payload.writtenEvidenceAttachment;
      delete payload.affidavitAttachment;

      const res = await fetch(`${BASE_URL}/api/mining-licenses/${record.id}/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to resubmit record");
      }

      setSubmitSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong while resubmitting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      {/* ── header ── */}
      <header className="print-hide border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Signed in as {user?.nic}
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              Edit Site Record
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            ← Back
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">

        {/* ── record metadata banner ── */}
        <div className="print-hide" style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: "12px", padding: "14px 20px", marginBottom: "20px",
          borderRadius: "10px", background: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderLeft: `4px solid ${statusCfg.color}`,
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {[
              { key: "Record ID", val: record.id },
              { key: "TIN", val: record.tin },
              { key: "GML", val: record.gmlNumber },
              { key: "Created", val: createdDate },
              { key: "By", val: record.createdBy },
            ].filter(f => f.val).map(({ key, val }) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "10px", fontFamily: "monospace", letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--color-ink-muted)" }}>{key}</span>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--color-ink)" }}>{val}</span>
              </div>
            ))}
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center",
            padding: "4px 12px", borderRadius: "999px",
            fontSize: "11px", fontWeight: "700",
            letterSpacing: "0.07em", textTransform: "uppercase",
            background: statusCfg.bg, color: statusCfg.color,
            border: `1px solid ${statusCfg.color}22`,
          }}>
            {statusCfg.label}
          </span>
        </div>

        {/* ── success banner ── */}
        {submitSuccess && (
          <div className="print-hide" style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "14px 20px", borderRadius: "10px", marginBottom: "20px",
            background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.3)",
            color: "#059669", fontWeight: "600", fontSize: "14px",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Record resubmitted successfully! Redirecting to dashboard…
          </div>
        )}

        {/* ── form card ── */}
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 sm:p-10">
          <TopoBackground className="text-teal/15" />

          <form onSubmit={handleSubmit} className="print-hide relative z-10 flex flex-col gap-10">
            {/* Header block */}
            <div className="text-center">
              <p className="font-sinhala text-sm text-ink-muted">
                ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය
              </p>
             <h2 className="mt-1 font-sinhala text-lg font-semibold sm:text-xl">
                යාන්ත්‍රික මැණික් පතල් කැණීමේ අවසරය ලබා ගැනීම (සංස්කරණය)
              </h2>
              <p className="mt-1 font-sinhala text-xs text-ink-muted">
                අධ්‍යක්ෂ (ඉඩම්/කැණීම්/පරිසර) නිර්දේශය
              </p>
            </div>

            {/* Applicant details */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                අයදුම්කරු පිළිබඳ තොරතුරු
              </h3>
                            <div className="flex flex-col gap-5">
                <Field label="ඉල්ලුම්කරුගේ නම">
                  <input type="text" className={inputClass} value={form.applicantName} onChange={handleChange("applicantName")} />
                </Field>
                <Field label="ඉල්ලුම්කරුගේ ලිපිනය">
                  <input type="text" className={inputClass} value={form.applicantAddress} onChange={handleChange("applicantAddress")} />
                </Field>
                <Field label="ඉල්ලුම්කරුගේ දුරකථන අංකය">
                  <input type="tel" className={inputClass} value={form.applicantPhone} onChange={handleChange("applicantPhone")} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="ඉල්ලුම්කරුගේ හැඳුනුම්පත් අංකය">
                  <input type="text" className={inputClass} value={form.nic} onChange={handleChange("nic")} />
                </Field>
                <Field label="දේශීය ආදායම් දෙපාර්තමේන්තුවෙන් ලබාගත් බදු ගෙවන්නන් සඳහා හඳුනාගැනීමේ අංකය (TIN)">
                  <input type="text" className={inputClass} value={form.tin} onChange={handleChange("tin")} />
                </Field>
                <Field label="වියදම් පාර්ශවයක් සිටී නම්" full>
                  <label className="flex items-center gap-2 font-sinhala text-sm">
                    <input
                      type="checkbox"
                      checked={form.hasExpenseParty}
                      onChange={handleCheckboxChange("hasExpenseParty")}
                      className="accent-teal"
                    />
                    ඔව්
                  </label>
                </Field>

                {form.hasExpenseParty && (
                  <>
                    <Field label="වියදම් පාර්ශවයේ නම" full>
                      <input type="text" className={inputClass} value={form.expenseName} onChange={handleChange("expenseName")} />
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ ලිපිනය" full>
                      <input type="text" className={inputClass} value={form.expenseAddress} onChange={handleChange("expenseAddress")} />
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ දුරකථන අංකය" full>
                      <input type="tel" className={inputClass} value={form.expensePhone} onChange={handleChange("expensePhone")} />
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ බදු ගෙවන්නන් හඳුනාගැනීමේ අංකය (TIN)">
                      <input type="text" className={inputClass} value={form.expenseTin} onChange={handleChange("expenseTin")} />
                    </Field>
                  </>
                )}

                <Field label="මැණික් ගැරීමේ බලපත්‍ර අංකය (GML)">
                  <input type="text" className={inputClass} value={form.gmlNumber} onChange={handleChange("gmlNumber")} />
                </Field>

                <Field label="G. P. S." full>
                  <div className="flex flex-col gap-3">
                    {form.gpsPoints.map((point, index) => (
                      <div key={index} className="flex flex-col gap-3 rounded-lg border border-line bg-base/60 p-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 sm:w-24 shrink-0">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 font-mono text-xs font-semibold text-teal">
                            {index + 1}
                          </span>
                          <span className="font-sinhala text-xs text-ink-muted">
                            {index === 0 ? <span className="text-red-500">අවශ්‍යයි</span> : "විකල්ප"}
                          </span>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="font-sinhala text-xs text-ink-muted">අක්ෂාංශ</label>
                            <input
                              type="text"
                              className={inputClass}
                              required={index === 0}
                              value={point.latitude}
                              onChange={handleGpsChange(index, "latitude")}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-sinhala text-xs text-ink-muted">දේශාංෂ</label>
                            <input
                              type="text"
                              className={inputClass}
                              required={index === 0}
                              value={point.longitude}
                              onChange={handleGpsChange(index, "longitude")}
                            />
                          </div>
                        </div>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => removeGpsPoint(index)}
                            className="self-start font-sinhala text-xs text-ink-muted transition hover:text-red-500 sm:self-center"
                          >
                            ඉවත් කරන්න
                          </button>
                        )}
                      </div>
                    ))}
                    {form.gpsPoints.length < 4 && (
                      <button
                        type="button"
                        onClick={addGpsPoint}
                        className="self-start font-sinhala text-sm font-medium text-teal transition hover:underline"
                      >
                        + තවත් ලක්ෂ්‍යයක් එකතු කරන්න
                      </button>
                    )}
                  </div>
                </Field>

                <Field label="ඉඩමේ නම" full>
                  <input type="text" className={inputClass} value={form.landName} onChange={handleChange("landName")} />
                </Field>

                <Field label="ඉඩමේ ස්වභාවය" full>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 font-sinhala text-sm">
                      <input type="radio" name="landNature" value="goda" checked={form.landNature === "goda"} onChange={handleChange("landNature")} className="accent-teal" />
                      ගොඩ ඉඩමක්
                    </label>
                    <label className="flex items-center gap-2 font-sinhala text-sm">
                      <input type="radio" name="landNature" value="kumbura" checked={form.landNature === "kumbura"} onChange={handleChange("landNature")} className="accent-teal" />
                      කුඹුරු ඉඩමක්
                    </label>
                  </div>
                </Field>

                {(form.landNature === "goda" || form.landNature === "kumbura") && (
                  <Field label="ඉඩම රත්නපුර දිස්ත්‍රික්කයේ පිහිටා ඇත්ද?" full>
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                          <input type="radio" name="isRatnapuraLand" value={opt.value} checked={form.isRatnapuraLand === opt.value} onChange={handleChange("isRatnapuraLand")} className="accent-teal" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    {form.isRatnapuraLand === "yes" && (
                      <div className="mt-3 flex flex-col gap-4">
                        <p className="font-sinhala text-sm text-ink">
                          {form.landNature === "goda"
                            ? "බලපත්‍රය අවුරුදු 03 ක් පැරණි රත්නපුර පිහිටි ඉඩමක් නම් ලිඛිත සාක්ෂි ද, නැතිනම් දිවුරුම් ප්‍රකාශයක් ද ඉදිරිපත් කරන්න."
                            : "බලපත්‍රය අවුරුදු 05 ක් පැරණි රත්නපුර පිහිටි ඉඩමක් නම් ලිඛිත සාක්ෂි ද, නැතිනම් දිවුරුම් ප්‍රකාශයක් ද ඉදිරිපත් කරන්න."}
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">ලිඛිත සාක්ෂි</label>
                          <input type="file" className={inputClass} onChange={handleFileChange("writtenEvidenceAttachment")} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">දිවුරුම් ප්‍රකාශය</label>
                          <input type="file" className={inputClass} onChange={handleFileChange("affidavitAttachment")} />
                        </div>
                      </div>
                    )}
                  </Field>
                )}
              </div>
            </section>

            {/* Land details */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                මැණික් ගැරීමේ බලපත්‍රලත් ඉඩම පිහිටි
              </h3>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="දිස්ත්‍රික්කය">
                  <select className={inputClass} value={form.district} onChange={handleDistrictChange}>
                    <option value="" hidden></option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
                <Field label="ප්‍රාදේශීය කාර්යාලය">
                  <select className={inputClass} value={form.regionalOffice} onChange={handleChange("regionalOffice")} disabled={!form.district}>
                    <option value="" hidden></option>
                    {(DS_DIVISIONS_BY_DISTRICT[form.district] || []).map((ds) => (
                      <option key={ds} value={ds}>{ds}</option>
                    ))}
                  </select>
                </Field>
                <Field label="ගම">
                  <input type="text" className={inputClass} value={form.village} onChange={handleChange("village")} />
                </Field>
                <Field label="ඉඩමේ වපසරිය">
                  <input type="text" className={inputClass} value={form.landExtent} onChange={handleChange("landExtent")} />
                </Field>
                <Field label="බලපත්‍රලාභියා" full>
                  <select className={inputClass} value={form.licenseeType} onChange={handleChange("licenseeType")}>
                    <option value="" hidden></option>
                    <option value="ඉඩම් හිමිකරු">ඉඩම් හිමිකරු</option>
                    <option value="බදු ගැණුම්කරු">බදු ගැණුම්කරු</option>
                    <option value="රජයේ ඉඩමක්">රජයේ ඉඩමක්</option>
                    <option value="වෙන්දේසි ඉඩමක්">වෙන්දේසි ඉඩමක්</option>
                  </select>
                </Field>

                <Field label="ඉඩම් හිමිකරු නොවේ නම්, කැමැත්ත ප්‍රකාශිත ලිපියක් අමුණා තිබේද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                        <input type="radio" name="consentLetterAttached" value={opt.value} checked={form.consentLetterAttached === opt.value} onChange={handleChange("consentLetterAttached")} className="accent-teal" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="ගොවිජන සේවා, විහාර දේවාලගම් සන්තක හා ඉඩම් සංවර්ධන ආඥා පනත යටතේ දෙන ලද ඉඩම් ද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                        <input type="radio" name="govLandAct" value={opt.value} checked={form.govLandAct === opt.value} onChange={handleChange("govLandAct")} className="accent-teal" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="දැනට කපා ඇති පතල් වලවල්වල වර්ග ප්‍රමාණය (මතුපිට)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.existingPits}
                    onChange={handleChange("existingPits")}
                  />
                </Field>
              </div>
            </section>

            {/* Previous license history */}
            {form.existingPits && form.existingPits.trim() !== "" && (
              <section className="flex flex-col gap-5">
                <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                  පෙර බලපත්‍රය පිළිබඳ තොරතුරු
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="රොන්මඩ වලවල් ලෙස පවත්වාගෙන යන වලවල්වල වර්ග ප්‍රමාණය (ව.අඩි)">
                    <input
                      type="text"
                      className={inputClass}
                      value={form.prevLicenseFirstDate}
                      onChange={handleChange("prevLicenseFirstDate")}
                    />
                  </Field>
                  <Field label="ගැඹුර ප්‍රමාණය">
                    <input
                      type="number"
                      className={inputClass}
                      value={form.extensionCount}
                      onChange={handleChange("extensionCount")}
                    />
                  </Field>
                  <Field label="පසුගිය මාස 03 ඇතුලතදී කොන්දේසි කඩකිරීම් ඇත්නම්">
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                          <input
                            type="radio"
                            name="minedGemValue"
                            value={opt.value}
                            checked={form.minedGemValue === opt.value}
                            onChange={handleChange("minedGemValue")}
                            className="accent-teal"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="අංක NGJA1/03/2025 දරන වක්‍රලේඛය මගින් නියම කර ඇති වාර්තා ඉදිරිපත් කර තිබේද?">
                      <div className="flex gap-4 pt-1">
                        {yesNo.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                            <input
                              type="radio"
                              name="conditionBreach"
                              value={opt.value}
                              checked={form.conditionBreach === opt.value}
                              onChange={handleChange("conditionBreach")}
                              className="accent-teal"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </Field>
                  </div>
                  <Field label="පවත්වා ඇති මැණික් ගල් වෙන්දේසි සම්බන්ධ විස්තර :-" full>
                    <GemSaleDetailsTable
                      value={form.gemSaleDetails}
                      onChange={(next) => setForm((prev) => ({ ...prev, gemSaleDetails: next }))}
                    />
                  </Field>

                </div>
              </section>
            )}

            {/* Mining proposal */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                කැණීම් යෝජනාව
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="ඉඩමේ වගාව">
                  <input type="text" className={inputClass} value={form.landCultivation} onChange={handleChange("landCultivation")} />
                </Field>
              </div>

              <h4 className="mt-2 font-sinhala text-sm font-medium text-ink-muted">
                යන්ත්‍ර යොදා පතල් කැපීමේ දී තැබිය යුතු රක්ෂිත
              </h4>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { field: "boundaryNorth", label: "උතුරට (අඩි)" },
                  { field: "boundarySouth", label: "දකුණට (අඩි)" },
                  { field: "boundaryEast", label: "නැගෙනහිරට (අඩි)" },
                  { field: "boundaryWest", label: "බස්නාහිරට (අඩි)" },
                  { field: "boundaryHouses", label: "නිවාසවලට (අඩි)" },
                  { field: "boundaryElectricPoles", label: "විදුලි කණුවලට (අඩි)" },
                  { field: "boundaryWater", label: "ගංගා සහ ජල දෙහයන්ට (අඩි)" },
                  { field: "boundaryRoads", label: "මාර්ගවලට (අඩි)" },
                  { field: "boundaryOther", label: "වෙනත්" },
                 ].map(({ field, label }) => (
                  <Field key={field} label={label}>
                    <input type="text" className={inputClass} value={form[field]} onChange={handleChange(field)} />
                  </Field>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="කැපීමට අදහස් කරන පතල් ප්‍රමාණය (ව.අ.)">
                  <input type="text" className={inputClass} value={form.proposedExtent} onChange={handleChange("proposedExtent")} />
                </Field>
                <Field label="ඇප මුදල් සේවා ගාස්තුව">
                  <input type="text" className={inputClass} value={form.refundServiceFee} onChange={handleChange("refundServiceFee")} />
                </Field>
              </div>
            </section>

            {/* Recommendation paragraph */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                නිර්දේශය
              </h3>
             <p className="font-sinhala text-sm leading-8 text-ink">
                කෑණීම් ඉංජිනේරු නිර්දේශයන්ට (NGJA/16.2/Backhoe/MER/
                <input type="text" className={inlineInputClass} value={form.ngjaRefNumber} onChange={handleChange("ngjaRefNumber")} />
                ) යටත්ව වරකට උපරිමය ව.අ
                <input type="number" step="0.01" className={inlineInputClass} value={form.maxExtentVA} onChange={handleChange("maxExtentVA")} />
                ක් දක්වා පතසක් කෑණීම සිදුකිරීම සඳහා උපරිමය PC
                <input type="text" inputMode="numeric" className={inlineInputClass} value={form.maxPcCount} onChange={handleChange("maxPcCount")} />
                ක් දක්වා වන බැකෝ යන්ත්‍ර
                <input type="text" inputMode="numeric" className={inlineInputClass} value={form.backhoeCount} onChange={handleChange("backhoeCount")} />
                ක් යොදා ගැනීමටත් ගැරීම සඳහා ගැරුම් යන්ත්‍ර
                <input type="text" inputMode="numeric" className={inlineInputClass} value={form.gerumCount} onChange={handleChange("gerumCount")} />
                ක් යොදා ගැනීමටත් ඇදුම් යන්ත්‍ර
                <input type="text" inputMode="numeric" className={inlineInputClass} value={form.adumMachineCount} onChange={handleChange("adumMachineCount")} />
                යොදා ගැනීමටත්, රොන් මඩ වලවල් පවත්වා ගැනීමට ව.අ.
                <input type="text" className={inlineInputClass} value={form.silageExtent} onChange={handleChange("silageExtent")} />
                කට ඇප මුදල්
                <input type="text" className={inlineInputClass} value={form.depositAmount} onChange={handleChange("depositAmount")} />
                ක් තැන්පත් කර ඇත. තවද, ඉවුරු කඩා වැටීම වැළැක්වීම සඳහා
                <input type="text" className={inlineInputClass} value={form.riverbankProtectionAmount} onChange={handleChange("riverbankProtectionAmount")} />
                ක ඇප මුදලක් වෙන් කර ඇත. මීට අමතරව විශේශ අවස්ථා සඳහා
                <input type="text" className={inlineInputClass} value={form.specialCaseAmount} onChange={handleChange("specialCaseAmount")} />
                ඇප මුදලක් වෙන් කර ඇත. තවද, අවශ්‍ය පරිදි ජල පොම්ප යොදා
                ගැනීමටත් අවසර ලබා දීම සුදුසු බවට නිර්දේශ කොට කාරුණික
                අනුමැතියට ඉදිරිපත් කරමි.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-sinhala text-sm text-ink">
                  ඉහත නිර්දේශය
                </p>
                <select className={`${inputClass} w-40`} value={form.directorApproval} onChange={handleChange("directorApproval")}>
                  <option value="" hidden></option>
                  <option value="අනුමත කරමි">අනුමත කරමි</option>
                  <option value="අනුමත නොකරමි">අනුමත නොකරමි</option>
                </select>
              </div>

              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Field label="දිනය:-" className="sm:w-48">
                  <input type="date" className={inputClass} value={form.recommendationDate} onChange={handleChange("recommendationDate")} />
                </Field>
                <div className="flex flex-col items-center gap-1 sm:items-end">
                  <div className="h-12 w-56 border-b border-ink" />
                  <p className="font-sinhala text-sm text-ink-muted">අධ්‍යක්ෂ (ඉඩම්/කැණීම්/පරිසර)</p>
                </div>
              </div>
            </section>

            {/* Chairman approval */}
            <section className="flex flex-col gap-5">
              <p className="font-sinhala text-sm font-semibold text-ink">
                සභාපති හා ප්‍රධාන විධායක නිලධාරි අනුමැතිය
              </p>
              <div className="border-t border-ink" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-sinhala text-sm text-ink">ඉහත නිර්දේශය අනුමත</p>
                <select className={`${inputClass} w-32`} value={form.chairmanApproval} onChange={handleChange("chairmanApproval")}>
                  <option value="" hidden></option>
                  <option value="කරමි">කරමි</option>
                  <option value="නොකරමි">නොකරමි</option>
                </select>
              </div>

              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Field label="දිනය:-" className="sm:w-48">
                  <input type="date" className={inputClass} value={form.chairmanApprovalDate} onChange={handleChange("chairmanApprovalDate")} />
                </Field>
                <div className="flex flex-col items-center gap-1 sm:items-end">
                  <div className="h-12 w-56 border-b border-ink" />
                  <p className="font-sinhala text-sm text-ink-muted">සභාපති හා ප්‍රධාන විධායක නිලධාරි</p>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="border border-line !text-ink hover:!bg-line/20"
                onClick={() => navigate("/dashboard")}
              >
                අවලංගු කරන්න
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="border border-line !text-ink hover:!bg-line/20"
                onClick={() => setShowPreview((prev) => !prev)}
              >
                {showPreview ? "පෙරදසුන සඟවන්න" : "පෙරදසුන"}
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "සුරකිමින්..." : "සුරකින්න"}
              </Button>
            </div>
          </form>
          {showPreview && (
            <div className="mt-8 a4-preview-wrapper">
              <div className="mb-4 flex justify-end print:hidden">
                <Button type="button" variant="primary" onClick={() => window.print()}>
                  මුද්‍රණය කරන්න / PDF බාගන්න
                </Button>
              </div>
              <A4PreviewSheet form={form} isResubmit />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
