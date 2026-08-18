import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import TopoBackground from "../components/common/TopoBackground";
import A4PreviewSheet from "../components/common/A4PreviewSheet";
import Button from "../components/common/Button";

/* ─────────────────────── constants (same as NewRecordPage) ─────────────────────── */

const SRI_LANKA_DISTRICTS = [
  "අම්පාර", "අනුරාධපුරය", "බදුල්ල", "මඩකලපුව", "කොළඹ", "ගාල්ල", "ගම්පහ",
  "හම්බන්තොට", "යාපනය", "කළුතර", "මහනුවර", "කෑගල්ල", "කිලිනොච්චිය",
  "කුරුණෑගල", "මන්නාරම", "මාතලේ", "මාතර", "මොණරාගල", "මුලතිව්",
  "නුවරඑළිය", "පොළොන්නරුව", "පුත්තලම", "රත්නපුර", "ත්‍රිකුණාමලය", "වවුනියාව",
];

const DS_DIVISIONS_BY_DISTRICT = {
  "කොළඹ": ["කොළඹ", "තිඹිරිගස්යාය", "කොලොන්නාව", "කඩුවෙල", "කැස්බෑව", "මහරගම", "හෝමාගම", "ශ්‍රී ජයවර්ධනපුර කෝට්ටේ", "දෙහිවල-ගල්කිස්ස", "මොරටුව", "පාදුක්ක", "සීතාවක", "රත්මලාන"],
  "ගම්පහ": ["ගම්පහ", "මීගමුව", "ජා-ඇල", "වත්තල", "කටාන", "දිවුලපිටිය", "මිරිගම", "මිනුවන්ගොඩ", "අත්තනගල්ල", "දොම්පේ", "බියගම", "කැලණිය", "මහර"],
  "කළුතර": ["කළුතර", "බේරුවල", "පානදුර", "බණ්ඩාරගම", "හෝරණ", "බුලත්සිංහල", "මිල්ලනිය", "පැලින්දනුවර", "අගලවත්ත", "මතුගම", "වලල්ලාවිට", "ඉංගිරිය", "දොඩංගොඩ", "මදුරාවෙල"],
  "මහනුවර": ["මහනුවර හතරගම් කෝරළය", "ගඟවට කෝරළය", "පාතදුම්බර", "උඩුනුවර", "යටිනුවර", "හාරිස්පත්තුව", "උඩපළාත", "අකුරණ", "දොළුව", "පන්විල", "මිනිපේ", "මැදදුම්බර", "හතරලියද්ද", "දෙල්තොට", "කුණ්ඩසාලේ", "තුම්පනේ", "පතහේවහෙට", "ගඟ ඉහළ කෝරළය", "පූජාපිටිය", "වත්තේගම"],
  "මාතලේ": ["මාතලේ", "රත්තොට", "උකුවෙල", "පල්ලේපොල", "යටවත්ත", "නාඑල", "ගලේවෙල", "දඹුල්ල", "විල්ගමුව", "අඹන්ගඟ කෝරළය", "ලග්ගල-පල්ලේගම"],
  "නුවරඑළිය": ["නුවරඑළිය", "හඟුරන්කෙත", "වලපනේ", "කොත්මලේ", "අඹගමුව"],
  "ගාල්ල": ["ගාල්ල හතරගම් කෝරළය", "බෝප-පොද්දල", "අක්මීමන", "යක්කලමුල්ල", "බද්දේගම", "එල්පිටිය", "නාගොඩ", "නෙළුව", "තවලම", "බෙන්තොට", "බලපිටිය", "අම්බලන්ගොඩ", "කරන්දෙණිය", "හබරාදුව", "ඉමදුව", "වැලිවිටිය-දිවිතුර", "හික්කඩුව", "ගොනාපිනුවල", "නියාගම"],
  "මාතර": ["මාතර හතරගම් කෝරළය", "දෙවිනුවර", "වැලිගම", "අකුරැස්ස", "කඹුරුපිටිය", "කොටපොල", "පස්ගොඩ", "පිටබැද්දර", "මාලිම්බඩ", "මුලටියන", "අතුරලිය", "හක්මන", "තිහගොඩ", "දික්වැල්ල", "කිරින්ද පුහුල්වැල්ල", "වැලිපිටිය"],
  "හම්බන්තොට": ["හම්බන්තොට", "තංගල්ල", "තිස්සමහාරාමය", "අම්බලන්තොට", "බෙලිඅත්ත", "වලස්මුල්ල", "වීරකැටිය", "අඟුණකොලපැලැස්ස", "සූරියවැව", "ලුණුගම්වෙහෙර", "කටුවන", "තණමල්විල"],
  "යාපනය": ["යාපනය", "නල්ලූර්", "කොපායි", "උඩුවිල්", "තෙල්ලිප්පලෙයි", "සන්දිලිප්පායි", "චාවකච්චේරිය", "පොයින්ට් පේද්‍රෝ", "කාරයිනගර්", "කයිට්ස්", "වේලනෛ", "ඩෙල්ෆ්ට්", "උතුරු වඩමාරච්චිය", "නැගෙනහිර වඩමාරච්චිය", "තෙන්මරච්චිය"],
  "කිලිනොච්චිය": ["කිලිනොච්චිය", "කරච්චි", "පච්චිලෛපල්ලි", "පූනාකරි"],
  "මන්නාරම": ["මන්නාරම නගරය", "බටහිර මන්තෙයි", "නානට්ටාන්", "මඩු", "මුසලි"],
  "වවුනියාව": ["වවුනියාව", "උතුරු වවුනියාව", "දකුණු වවුනියාව", "වෙන්ගලච්චෙට්ටිකුලම්"],
  "මුලතිව්": ["නැගෙනහිර මන්තෙයි", "මරිතයිම්පට්ටු", "ඔද්දුසුඩාන්", "පුතුක්කුඩියිරුප්පු", "තුනුක්කායි"],
  "මඩකලපුව": ["උතුරු මන්මුනෛ", "මන්මුනෛ පත්තු", "දකුණු මන්මුනෛ සහ එරුවිල් පත්තු", "බටහිර මන්මුනෛ", "නිරිතදිග මන්මුනෛ", "කෝරළෛ පත්තු", "උතුරු කෝරළෛ පත්තු", "දකුණු කෝරළෛ පත්තු", "බටහිර කෝරළෛ පත්තු", "මධ්‍යම කෝරළෛ පත්තු", "එරාවුර් පත්තු", "එරාවුර් නගරය", "පොරතිවු පත්තු", "කත්තන්කුඩි"],
  "අම්පාර": ["අම්පාර", "උහන", "දමන", "මහඔය", "පඩියතලාව", "දෙහිආටකන්දිය", "අද්දාලච්චේන", "අක්කරෙයිපත්තුව", "සයින්දමරුදු", "නින්තාවූර්", "කල්මුණේ", "කරෛතිවු", "සම්මන්තුරේ", "අලෙයාඩිවෙම්බු", "තිරුක්කෝවිල්", "පොත්තුවිල්", "ලාහුගල", "නාවිතන්වෙලි"],
  "ත්‍රිකුණාමලය": ["ත්‍රිකුණාමලය නගරය සහ ග්‍රාවට්ස්", "කින්නියා", "මුතූර්", "කුච්චවේලි", "ගෝමරන්කඩවල", "මොරවැව", "තඹලගමුව", "කන්තලේ", "සේරුවිල", "පදවි ශ්‍රී පුර", "වේරුගල්"],
  "කුරුණෑගල": ["කුරුණෑගල", "මල්ලවපිටිය", "මාවතගම", "පොල්ගහවෙල", "වාරියපොල", "පන්නල", "රිදීගම", "ඉබ්බාගමුව", "අලව්ව", "බිංගිරිය", "නැගෙනහිර කුලියාපිටිය", "බටහිර කුලියාපිටිය", "බමුණකොටුව", "කටුපොත", "නැගෙනහිර පඬුවස්නුවර", "බටහිර පඬුවස්නුවර", "නිකවැරටිය", "මහව", "ගල්ගමුව", "ගනේවත්ත", "ගිරිබාව", "එහෙටුවෙව", "පොල්පිතිගම", "රස්නායකපුර", "වේරඹුගෙදර", "කොටවෙහෙර", "මාස්පොත", "නාරම්මල", "කොබෙයිගනේ", "අඹන්පොල"],
  "පුත්තලම": ["පුත්තලම", "කල්පිටිය", "වනාතවිල්ලුව", "කරුවලගස්වැව", "අනමඩුව", "නාත්තණ්ඩිය", "මුන්දලම", "චිලාව", "අරච්චිකට්ටුව", "මාදම්පේ", "වෙන්නප්පුව", "මහව්ව"],
  "අනුරාධපුරය": ["නුවරගම් පළාත නැගෙනහිර", "නුවරගම් පළාත මධ්‍යම", "කැකිරාව", "පලාගල", "තලාව", "මිහින්තලේ", "රඹෑව", "ගලෙන්බිඳුනුවැව", "කහටගස්දිගිලිය", "හොරොව්පොතාන", "මහාවිලච්චිය", "මැදවච්චිය", "පදවිය", "ගල්නෑව", "ඉපලෝගම", "නාච්චාදුව", "තිරප්පනේ", "කැබිතිගොල්ලෑව", "රාජාංගණය", "එප්පාවල", "නොච්චියාගම", "පලුගස්වැව"],
  "පොළොන්නරුව": ["තාමන්කඩුව", "හිඟුරක්ගොඩ", "මැදිරිගිරිය", "ලංකාපුර", "ඇලහැර", "දිඹුලාගල", "වැලිකන්ද"],
  "බදුල්ල": ["බදුල්ල", "බණ්ඩාරවෙල", "හපුතලේ", "ඇල්ල", "ලුණුගල", "මහියංගනය", "මීගහකිවුල", "පස්සර", "රිදීමාලියද්ද", "සොරණාතොට", "උව-පරණගම", "වැලිමඩ", "කන්දකැටිය", "හල්දුම්මුල්ල", "හාලි-ඇල"],
  "මොණරාගල": ["මොණරාගල", "වැල්ලවාය", "බුත්තල", "කතරගම", "බිබිල", "මැදගම", "මඩුල්ල", "සියඹලාණ්ඩුව", "බදල්කුඹුර", "සෙවනගල", "තණමල්විල"],
  "රත්නපුර": ["රත්නපුර", "බලංගොඩ", "එහෙළියගොඩ", "කලවාන", "කුරුවිට", "නිවිතිගල", "පැල්මඩුල්ල", "කොලොන්න", "කහවත්ත", "එලපාත", "අයගම", "ගොඩකවෙල", "ඉඹුල්පේ", "ඕපනායක", "වැලිගෙපොල", "කිරිඇල්ල"],
  "කෑගල්ල": ["කෑගල්ල", "මාවනැල්ල", "රඹුක්කන", "වරකාපොල", "රුවන්වැල්ල", "යටියන්තොට", "දෙරණියගල", "ගාලිගමුව", "බුලත්කොහුපිටිය", "දෙහිඕවිට", "අරණායක"],
};

const yesNo = [
  { value: "yes", label: "ඔව්" },
  { value: "no", label: "නැත" },
];

const NUMERIC_FIELDS = ["extensionCount", "proposedDepth"];

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

export default function SearchResultPage() {
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
      if (form.conditionBreach === "yes" && !form.conditionBreachDetails) errors.push("conditionBreachDetails");
      if (form.ownershipComplaint === "yes" && !form.complaintDetails) errors.push("complaintDetails");
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
              Review &amp; Resubmit
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
                යාන්ත්‍රික මැණික් පතල් කැණීමේ අවසරය ලබා ගැනීම (නැවත ඉදිරිපත් කිරීම)
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
                  <div className={inputClass}>{form.applicantName}</div>
                </Field>
                <Field label="ඉල්ලුම්කරුගේ ලිපිනය">
                  <div className={inputClass}>{form.applicantAddress}</div>
                </Field>
                <Field label="ඉල්ලුම්කරුගේ දුරකථන අංකය">
                  <div className={inputClass}>{form.applicantPhone}</div>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="ඉල්ලුම්කරුගේ හැඳුනුම්පත් අංකය">
                  <div className={inputClass}>{form.nic}</div>
                </Field>
                <Field label="දේශීය ආදායම් දෙපාර්තමේන්තුවෙන් ලබාගත් බදු ගෙවන්නන් සඳහා හඳුනාගැනීමේ අංකය (TIN)">
                  <div className={inputClass}>{form.tin}</div>
                </Field>
                <Field label="වියදම් පාර්ශවයක් සිටී නම්" full>
                  <label className="flex items-center gap-2 font-sinhala text-sm">
                    <input
                      type="checkbox"
                      checked={form.hasExpenseParty}
                      readOnly disabled
                      className="accent-teal"
                    />
                    ඔව්
                  </label>
                </Field>

                {form.hasExpenseParty && (
                  <>
                    <Field label="වියදම් පාර්ශවයේ නම" full>
                      <div className={inputClass}>{form.expenseName}</div>
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ ලිපිනය" full>
                      <div className={inputClass}>{form.expenseAddress}</div>
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ දුරකථන අංකය" full>
                      <div className={inputClass}>{form.expensePhone}</div>
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ බදු ගෙවන්නන් හඳුනාගැනීමේ අංකය (TIN)">
                      <div className={inputClass}>{form.expenseTin}</div>
                    </Field>
                  </>
                )}

                <Field label="මැණික් ගැරීමේ බලපත්‍ර අංකය (GML)">
                  <div className={inputClass}>{form.gmlNumber}</div>
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
                            <div className={inputClass}>{point.latitude}</div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-sinhala text-xs text-ink-muted">දේශාංෂ</label>
                            <div className={inputClass}>{point.longitude}</div>
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
                  <div className={inputClass}>{form.landName}</div>
                </Field>

                <Field label="ඉඩමේ ස්වභාවය" full>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 font-sinhala text-sm">
                      <input type="radio" name="landNature" value="goda" checked={form.landNature === "goda"} readOnly disabled className="accent-teal" />
                      ගොඩ ඉඩමක්
                    </label>
                    <label className="flex items-center gap-2 font-sinhala text-sm">
                      <input type="radio" name="landNature" value="kumbura" checked={form.landNature === "kumbura"} readOnly disabled className="accent-teal" />
                      කුඹුරු ඉඩමක්
                    </label>
                  </div>
                </Field>

                {(form.landNature === "goda" || form.landNature === "kumbura") && (
                  <Field label="ඉඩම රත්නපුර දිස්ත්‍රික්කයේ පිහිටා ඇත්ද?" full>
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                          <input type="radio" name="isRatnapuraLand" value={opt.value} checked={form.isRatnapuraLand === opt.value} readOnly disabled className="accent-teal" />
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
                          <input type="file" className={inputClass} disabled />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">දිවුරුම් ප්‍රකාශය</label>
                          <input type="file" className={inputClass} disabled />
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
                  <div className={inputClass}>{form.district}</div>
                </Field>
                <Field label="ප්‍රාදේශීය කාර්යාලය">
                  <div className={inputClass}>{form.regionalOffice}</div>
                </Field>
                <Field label="ගම">
                  <div className={inputClass}>{form.village}</div>
                </Field>
                <Field label="ඉඩමේ වපසරිය">
                  <div className={inputClass}>{form.landExtent}</div>
                </Field>
                <Field label="බලපත්‍රලාභියා" full>
                  <div className={inputClass}>{form.licenseeType}</div>
                </Field>

                <Field label="ඉඩම් හිමිකරු නොවේ නම්, කැමැත්ත ප්‍රකාශිත ලිපියක් අමුණා තිබේද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                        <input type="radio" name="consentLetterAttached" value={opt.value} checked={form.consentLetterAttached === opt.value} readOnly disabled className="accent-teal" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="ගොවිජන සේවා, විහාර දේවාලගම් සන්තක හා ඉඩම් සංවර්ධන ආඥා පනත යටතේ දෙන ලද ඉඩම් ද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                        <input type="radio" name="govLandAct" value={opt.value} checked={form.govLandAct === opt.value} readOnly disabled className="accent-teal" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="ඉඩමේ කපන ලද පතල් තිබේද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                        <input type="radio" name="existingPits" value={opt.value} checked={form.existingPits === opt.value} readOnly disabled className="accent-teal" />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </section>

            {/* Previous license history */}
            {form.existingPits === "yes" && (
              <section className="flex flex-col gap-5">
                <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                  පෙර බලපත්‍රය පිළිබඳ තොරතුරු
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="කලින් නිකුත් කර ඇති සාම්ප්‍රදායික පතල් බලපත්‍රය, පළමුව නිකුත් කළ දිනය">
                    <div className={inputClass}>{form.prevLicenseFirstDate}</div>
                  </Field>
                  <Field label="මෙම බලපත්‍රය කී වතාවක් දීර්ඝ කර තිබේද?">
                    <div className={inputClass}>{form.extensionCount}</div>
                  </Field>
                  <Field label="එම කාල සීමාව තුළ කෑණීම් කරන ලද මැණික්වල වටිනාකම">
                    <div className={inputClass}>{form.minedGemValue}</div>
                  </Field>

                  <div className="sm:col-span-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="එම කාලය තුළ කොන්දේසි කඩකිරීම් සිදුවී ඇත්ද?">
                      <div className="flex gap-4 pt-1">
                        {yesNo.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                            <input type="radio" name="conditionBreach" value={opt.value} checked={form.conditionBreach === opt.value} readOnly disabled className="accent-teal" />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </Field>
                    {form.conditionBreach === "yes" && (
                      <Field label="සිදු වී ඇත්නම් ඒ පිළිබඳ විස්තර">
                        <div className={inputClass}>{form.conditionBreachDetails}</div>
                      </Field>
                    )}
                  </div>

                  <Field label="මෙම කාලය තුළ ඉඩමේ අයිතිය පිළිබඳ පැමිණිලි ලැබී තිබේද?">
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                          <input type="radio" name="ownershipComplaint" value={opt.value} checked={form.ownershipComplaint === opt.value} readOnly disabled className="accent-teal" />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </Field>
                  {form.ownershipComplaint === "yes" && (
                    <Field label="ලැබී ඇත්නම් ඒ පිළිබඳ විස්තර">
                      <div className={inputClass}>{form.complaintDetails}</div>
                    </Field>
                  )}
                </div>
              </section>
            )}

            {/* Mining proposal */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                කැණීම් යෝජනාව
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="පතල් කැපීමට යෝජිත ගැඹුර ප්‍රමාණය (පොළොව මතුපිට සිට අඩි)">
                  <div className={inputClass}>{form.proposedDepth}</div>
                </Field>
                <Field label="ඉඩමේ වගාව">
                  <div className={inputClass}>{form.landCultivation}</div>
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
                    <div className={inputClass}>{form[field]}</div>
                  </Field>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="කැපීමට අදහස් කරන පතල් ප්‍රමාණය (ව.අ.)">
                  <div className={inputClass}>{form.proposedExtent}</div>
                </Field>
                <Field label="ඇප මුදල් සේවා ගාස්තුව">
                  <div className={inputClass}>{form.refundServiceFee}</div>
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
                <span className={inlineInputClass}>{form.ngjaRefNumber}</span>
                ) යටත්ව වරකට උපරිමය ව.අ
                <span className={inlineInputClass}>{form.maxExtentVA}</span>
                ක් දක්වා පතසක් කෑණීම සිදුකිරීම සඳහා උපරිමය PC
                <span className={inlineInputClass}>{form.maxPcCount}</span>
                ක් දක්වා වන බැකෝ යන්ත්‍ර
                <span className={inlineInputClass}>{form.backhoeCount}</span>
                ක් යොදා ගැනීමටත් ගැරීම සඳහා ගැරුම් යන්ත්‍ර
                <span className={inlineInputClass}>{form.gerumCount}</span>
                ක් යොදා ගැනීමටත් ඇදුම් යන්ත්‍ර
                <span className={inlineInputClass}>{form.adumMachineCount}</span>
                යොදා ගැනීමටත්, රොන් මඩ වලවල් පවත්වා ගැනීමට ව.අ.
                <span className={inlineInputClass}>{form.silageExtent}</span>
                කට ඇප මුදල්
                <span className={inlineInputClass}>{form.depositAmount}</span>
                ක් තැන්පත් කර ඇත. තවද, ඉවුරු කඩා වැටීම වැළැක්වීම සඳහා
                <span className={inlineInputClass}>{form.riverbankProtectionAmount}</span>
                ක ඇප මුදලක් වෙන් කර ඇත. මීට අමතරව විශේශ අවස්ථා සඳහා
                <span className={inlineInputClass}>{form.specialCaseAmount}</span>
                ඇප මුදලක් වෙන් කර ඇත. තවද, අවශ්‍ය පරිදි ජල පොම්ප යොදා
                ගැනීමටත් අවසර ලබා දීම සුදුසු බවට නිර්දේශ කොට කාරුණික
                අනුමැතියට ඉදිරිපත් කරමි.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-sinhala text-sm text-ink">
                  ඉහත නිර්දේශය
                </p>
                <div className={inputClass}>{form.directorApproval}</div>
              </div>

              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Field label="දිනය:-" className="sm:w-48">
                  <div className={inputClass}>{form.recommendationDate}</div>
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
                <div className={inputClass}>{form.chairmanApproval}</div>
              </div>

              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Field label="දිනය:-" className="sm:w-48">
                  <div className={inputClass}>{form.chairmanApprovalDate}</div>
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
              <Button type="button" variant="primary" id="edit-btn">
                Edit
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
