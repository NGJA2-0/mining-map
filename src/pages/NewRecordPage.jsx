import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import A4PreviewSheet from "../components/common/A4PreviewSheet";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import TopoBackground from "../components/common/TopoBackground";
import Button from "../components/common/Button";

const initialState = {
  applicantName: "",
  applicantAddress: "",
  applicantPhone: "",
  nic: "",
  tin: "",
  expenseName: "",
  expenseAddress: "",
  expensePhone: "",
  expenseTin: "",
  gmlNumber: "",
  gpsPoints: [
    { latitude: "", longitude: "" },
    { latitude: "", longitude: "" },
    { latitude: "", longitude: "" },
    { latitude: "", longitude: "" },
  ],
  landName: "",
  landNature: "",
  isRatnapuraLand: "",
  writtenEvidenceAttachment: null,
  affidavitAttachment: null,
  hasExpenseParty: false,
  district: "",
  village: "",
  regionalOffice: "",
  licenseeType: "",
  consentLetterAttached: "",
  govLandAct: "",
  landExtent: "",
  existingPits: "",
  prevLicenseFirstDate: "",
  extensionCount: "",
  minedGemValue: "",
  conditionBreach: "",
  conditionBreachDetails: "",
  ownershipComplaint: "",
  complaintDetails: "",
  proposedDepth: "",
  landCultivation: "",
  boundaryNorth: "",
  boundarySouth: "",
  boundaryEast: "",
  boundaryWest: "",
  boundaryHouses: "",
  boundaryElectricPoles: "",
  boundaryWater: "",
  boundaryOther: "",
  boundaryRoads: "",
  proposedExtent: "",
  refundServiceFee: "",
  recommendation: "",
  ngjaRefNumber: "",
  maxExtentVA: "",
  maxPcCount: "",
  backhoeCount: "",
  gerumCount: "",
  adumMachineCount: "",
  silageExtent: "",
  depositAmount: "",
  riverbankProtectionAmount: "",
  specialCaseAmount: "",
  recommendationDate: "",
  chairmanApproval: "",
  chairmanApprovalDate: "",
};

const SRI_LANKA_DISTRICTS = [
  "අම්පාර", "අනුරාධපුරය", "බදුල්ල", "මඩකලපුව", "කොළඹ", "ගාල්ල", "ගම්පහ",
  "හම්බන්තොට", "යාපනය", "කළුතර", "මහනුවර", "කෑගල්ල", "කිලිනොච්චිය",
  "කුරුණෑගල", "මන්නාරම", "මාතලේ", "මාතර", "මොණරාගල", "මුලතිව්",
  "නුවරඑළිය", "පොළොන්නරුව", "පුත්තලම", "රත්නපුර", "ත්‍රිකුණාමලය", "වවුනියාව",
];

// DS divisions grouped by district (English names, as commonly used on official forms).
// NOTE: verify this list against the latest official DS division gazette before
// relying on it for production — a few divisions get renamed/split over time.
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

export default function NewRecordPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
    // reset the DS division since it depends on the selected district
    setForm((prev) => ({ ...prev, district: value, regionalOffice: "" }));
  };

  // Fields the backend expects as int/float64 rather than string.
  // If any of these turn out to be wrong, just remove them from this list.
  // Only these two are numeric in the Go struct (ExtensionCount *int, ProposedDepth *float64).
  // Every other "count"/"amount"/"boundary" field is a plain string on the backend — leave them as-is.
  const NUMERIC_FIELDS = ["extensionCount", "proposedDepth"];

  // Converts "" -> undefined (field omitted), "10" -> 10, leaves non-numeric strings untouched.
  const toNumberOrUndefined = (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
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
    return data.url; // adjust if your upload API returns a different field name
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

    if (!form.gpsPoints.some((p) => p.latitude && p.longitude)) {
      errors.push("gpsPoints");
    }

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
        [writtenEvidenceAttachmentUrl, affidavitAttachmentUrl] = await Promise.all([
          uploadFile(form.writtenEvidenceAttachment),
          uploadFile(form.affidavitAttachment),
        ]);
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

      const res = await fetch(`${BASE_URL}/api/mining-licenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to save record");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="print-hide border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Signed in as {user?.nic}
            </p>
            <h1 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              New Site Record
            </h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            ← Back
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 sm:p-10">
          <TopoBackground className="text-teal/15" />

          <form onSubmit={handleSubmit} className="print-hide relative z-10 flex flex-col gap-10">
            {/* Header block */}
            <div className="text-center">
              <p className="font-sinhala text-sm text-ink-muted">
                ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය
              </p>
              <h2 className="mt-1 font-sinhala text-lg font-semibold sm:text-xl">
                යාන්ත්‍රික මැණික් පතල් කැණීමේ අවසරය ලබා ගැනීම (නව)
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
                  <input
                    type="text"
                    className={inputClass}
                    value={form.applicantName}
                    onChange={handleChange("applicantName")}
                  />
                </Field>
                <Field label="ඉල්ලුම්කරුගේ ලිපිනය">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.applicantAddress}
                    onChange={handleChange("applicantAddress")}
                  />
                </Field>
                <Field label="ඉල්ලුම්කරුගේ දුරකථන අංකය">
                  <input
                    type="tel"
                    className={inputClass}
                    value={form.applicantPhone}
                    onChange={handleChange("applicantPhone")}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="ඉල්ලුම්කරුගේ හැඳුනුම්පත් අංකය">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.nic}
                    onChange={handleChange("nic")}
                  />
                </Field>
                <Field label="දේශීය ආදායම් දෙපාර්තමේන්තුවෙන් ලබාගත් බදු ගෙවන්නන් සඳහා හඳුනාගැනීමේ අංකය (TIN)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.tin}
                    onChange={handleChange("tin")}
                  />
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
                      <input
                        type="text"
                        className={inputClass}
                        value={form.expenseName}
                        onChange={handleChange("expenseName")}
                      />
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ ලිපිනය" full>
                      <input
                        type="text"
                        className={inputClass}
                        value={form.expenseAddress}
                        onChange={handleChange("expenseAddress")}
                      />
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ දුරකථන අංකය" full>
                      <input
                        type="tel"
                        className={inputClass}
                        value={form.expensePhone}
                        onChange={handleChange("expensePhone")}
                      />
                    </Field>
                    <Field label="වියදම් පාර්ශවයේ බදු ගෙවන්නන් හඳුනාගැනීමේ අංකය (TIN)">
                      <input
                        type="text"
                        className={inputClass}
                        value={form.expenseTin}
                        onChange={handleChange("expenseTin")}
                      />
                    </Field>
                  </>
                )}
                <Field label="මැණික් ගැරීමේ බලපත්‍ර අංකය (GML)">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="GML"
                    value={form.gmlNumber}
                    onChange={handleChange("gmlNumber")}
                  />
                </Field>

                <Field label="G. P. S." full>
                  <div className="flex flex-col gap-3">
                    {form.gpsPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex flex-col gap-3 rounded-lg border border-line bg-base/60 p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex items-center gap-2 sm:w-24 shrink-0">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal/10 font-mono text-xs font-semibold text-teal">
                            {index + 1}
                          </span>
                          <span className="font-sinhala text-xs text-ink-muted">
                            {index === 0 ? (
                              <span className="text-red-500">අවශ්‍යයි</span>
                            ) : (
                              "විකල්ප"
                            )}
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
                  <input
                    type="text"
                    className={inputClass}
                    value={form.landName}
                    onChange={handleChange("landName")}
                  />
                </Field>

                <Field label="ඉඩමේ ස්වභාවය" full>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 font-sinhala text-sm">
                      <input
                        type="radio"
                        name="landNature"
                        value="goda"
                        checked={form.landNature === "goda"}
                        onChange={handleChange("landNature")}
                        className="accent-teal"
                      />
                      ගොඩ ඉඩමක්
                    </label>
                    <label className="flex items-center gap-2 font-sinhala text-sm">
                      <input
                        type="radio"
                        name="landNature"
                        value="kumbura"
                        checked={form.landNature === "kumbura"}
                        onChange={handleChange("landNature")}
                        className="accent-teal"
                      />
                      කුඹුරු ඉඩමක්
                    </label>
                  </div>
                </Field>

                {form.landNature === "goda" && (
                  <Field label="ඉඩම රත්නපුර දිස්ත්‍රික්කයේ පිහිටා ඇත්ද?" full>
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                          <input
                            type="radio"
                            name="isRatnapuraLand"
                            value={opt.value}
                            checked={form.isRatnapuraLand === opt.value}
                            onChange={handleChange("isRatnapuraLand")}
                            className="accent-teal"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>

                    {form.isRatnapuraLand === "yes" && (
                      <div className="mt-3 flex flex-col gap-4">
                        <p className="font-sinhala text-sm text-ink">
                          බලපත්‍රය අවුරුදු 03 ක් පැරණි රත්නපුර පිහිටි ඉඩමක් නම් ලිඛිත සාක්ෂි ද, නැතිනම් දිවුරුම් ප්‍රකාශයක් ද ඉදිරිපත් කරන්න.
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">ලිඛිත සාක්ෂි</label>
                          <input
                            type="file"
                            className={inputClass}
                            onChange={handleFileChange("writtenEvidenceAttachment")}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">දිවුරුම් ප්‍රකාශය</label>
                          <input
                            type="file"
                            className={inputClass}
                            onChange={handleFileChange("affidavitAttachment")}
                          />
                        </div>
                      </div>
                    )}
                  </Field>
                )}

                {form.landNature === "kumbura" && (
                  <Field label="ඉඩම රත්නපුර දිස්ත්‍රික්කයේ පිහිටා ඇත්ද?" full>
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 font-sinhala text-sm">
                          <input
                            type="radio"
                            name="isRatnapuraLand"
                            value={opt.value}
                            checked={form.isRatnapuraLand === opt.value}
                            onChange={handleChange("isRatnapuraLand")}
                            className="accent-teal"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>

                    {form.isRatnapuraLand === "yes" && (
                      <div className="mt-3 flex flex-col gap-4">
                        <p className="font-sinhala text-sm text-ink">
                          බලපත්‍රය අවුරුදු 05 ක් පැරණි රත්නපුර පිහිටි ඉඩමක් නම් ලිඛිත සාක්ෂි ද, නැතිනම් දිවුරුම් ප්‍රකාශයක් ද ඉදිරිපත් කරන්න.
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">ලිඛිත සාක්ෂි</label>
                          <input
                            type="file"
                            className={inputClass}
                            onChange={handleFileChange("writtenEvidenceAttachment")}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sinhala text-sm text-ink-muted">දිවුරුම් ප්‍රකාශය</label>
                          <input
                            type="file"
                            className={inputClass}
                            onChange={handleFileChange("affidavitAttachment")}
                          />
                        </div>
                      </div>
                    )}
                  </Field>
                )}              </div>
            </section>

            {/* Land details */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                මැණික් ගැරීමේ බලපත්‍රලත් ඉඩම පිහිටි
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="දිස්ත්‍රික්කය">
                  <select
                    className={inputClass}
                    value={form.district}
                    onChange={handleDistrictChange}
                  >
                    <option value="" hidden></option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ප්‍රාදේශීය කාර්යාලය">
                  <select
                    className={inputClass}
                    value={form.regionalOffice}
                    onChange={handleChange("regionalOffice")}
                    disabled={!form.district}
                  >
                    <option value="" hidden></option>
                    {(DS_DIVISIONS_BY_DISTRICT[form.district] || []).map((ds) => (
                      <option key={ds} value={ds}>
                        {ds}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ගම">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.village}
                    onChange={handleChange("village")}
                  />
                </Field>
                <Field label="ඉඩමේ වපසරිය">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.landExtent}
                    onChange={handleChange("landExtent")}
                  />
                </Field>
                <Field label="බලපත්‍රලාභියා" full>
                  <select
                    className={inputClass}
                    value={form.licenseeType}
                    onChange={handleChange("licenseeType")}
                  >
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
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 font-sinhala text-sm"
                      >
                        <input
                          type="radio"
                          name="consentLetterAttached"
                          value={opt.value}
                          checked={form.consentLetterAttached === opt.value}
                          onChange={handleChange("consentLetterAttached")}
                          className="accent-teal"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="ගොවිජන සේවා, විහාර දේවාලගම් සන්තක හා ඉඩම් සංවර්ධන ආඥා පනත යටතේ දෙන ලද ඉඩම් ද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 font-sinhala text-sm"
                      >
                        <input
                          type="radio"
                          name="govLandAct"
                          value={opt.value}
                          checked={form.govLandAct === opt.value}
                          onChange={handleChange("govLandAct")}
                          className="accent-teal"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="ඉඩමේ කපන ලද පතල් තිබේද?">
                  <div className="flex gap-4 pt-1">
                    {yesNo.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 font-sinhala text-sm"
                      >
                        <input
                          type="radio"
                          name="existingPits"
                          value={opt.value}
                          checked={form.existingPits === opt.value}
                          onChange={handleChange("existingPits")}
                          className="accent-teal"
                        />
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
                    <input
                      type="date"
                      className={inputClass}
                      value={form.prevLicenseFirstDate}
                      onChange={handleChange("prevLicenseFirstDate")}
                    />
                  </Field>
                  <Field label="මෙම බලපත්‍රය කී වතාවක් දීර්ඝ කර තිබේද?">
                    <input
                      type="number"
                      min="0"
                      className={inputClass}
                      value={form.extensionCount}
                      onChange={handleChange("extensionCount")}
                    />
                  </Field>
                  <Field label="එම කාල සීමාව තුළ කෑණීම් කරන ලද මැණික්වල වටිනාකම">
                    <input
                      type="text"
                      className={inputClass}
                      value={form.minedGemValue}
                      onChange={handleChange("minedGemValue")}
                    />
                  </Field>

                  <div className="sm:col-span-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label="එම කාලය තුළ කොන්දේසි කඩකිරීම් සිදුවී ඇත්ද?">
                      <div className="flex gap-4 pt-1">
                        {yesNo.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 font-sinhala text-sm"
                          >
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
                    {form.conditionBreach === "yes" && (
                      <Field label="සිදු වී ඇත්නම් ඒ පිළිබඳ විස්තර">
                        <input
                          type="text"
                          className={inputClass}
                          value={form.conditionBreachDetails}
                          onChange={handleChange("conditionBreachDetails")}
                        />
                      </Field>
                    )}
                  </div>

                  <Field label="මෙම කාලය තුළ ඉඩමේ අයිතිය පිළිබඳ පැමිණිලි ලැබී තිබේද?">
                    <div className="flex gap-4 pt-1">
                      {yesNo.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 font-sinhala text-sm"
                        >
                          <input
                            type="radio"
                            name="ownershipComplaint"
                            value={opt.value}
                            checked={form.ownershipComplaint === opt.value}
                            onChange={handleChange("ownershipComplaint")}
                            className="accent-teal"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </Field>
                  {form.ownershipComplaint === "yes" && (
                    <Field label="ලැබී ඇත්නම් ඒ පිළිබඳ විස්තර">
                      <input
                        type="text"
                        className={inputClass}
                        value={form.complaintDetails}
                        onChange={handleChange("complaintDetails")}
                      />
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
                  <input
                    type="number"
                    className={inputClass}
                    value={form.proposedDepth}
                    onChange={handleChange("proposedDepth")}
                  />
                </Field>
                <Field label="ඉඩමේ වගාව">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.landCultivation}
                    onChange={handleChange("landCultivation")}
                  />
                </Field>
              </div>

              <h4 className="mt-2 font-sinhala text-sm font-medium text-ink-muted">
                යන්ත්‍ර යොදා පතල් කැපීමේ දී තැබිය යුතු රක්ෂිත
              </h4>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="උතුරට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryNorth}
                    onChange={handleChange("boundaryNorth")}
                  />
                </Field>
                <Field label="දකුණට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundarySouth}
                    onChange={handleChange("boundarySouth")}
                  />
                </Field>
                <Field label="නැගෙනහිරට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryEast}
                    onChange={handleChange("boundaryEast")}
                  />
                </Field>
                <Field label="බස්නාහිරට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryWest}
                    onChange={handleChange("boundaryWest")}
                  />
                </Field>
                <Field label="නිවාසවලට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryHouses}
                    onChange={handleChange("boundaryHouses")}
                  />
                </Field>
                <Field label="විදුලි කණුවලට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryElectricPoles}
                    onChange={handleChange("boundaryElectricPoles")}
                  />
                </Field>
                <Field label="ගංගා සහ ජල දෙහයන්ට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryWater}
                    onChange={handleChange("boundaryWater")}
                  />
                </Field>
                <Field label="මාර්ගවලට (අඩි)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryRoads}
                    onChange={handleChange("boundaryRoads")}
                  />
                </Field>
                <Field label="වෙනත්">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.boundaryOther}
                    onChange={handleChange("boundaryOther")}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="කැපීමට අදහස් කරන පතල් ප්‍රමාණය (ව.අ.)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.proposedExtent}
                    onChange={handleChange("proposedExtent")}
                  />
                </Field>
                <Field label="ඇප මුදල් සේවා ගාස්තුව">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="NGJA/16.2/2018/Backhoe III චක්‍රලේඛය ප්‍රකාරව"
                    value={form.refundServiceFee}
                    onChange={handleChange("refundServiceFee")}
                  />
                </Field>
              </div>
            </section>

            {/* Engineer's recommendation paragraph with inline inputs */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                නිර්දේශය
              </h3>
              <p className="font-sinhala text-sm leading-8 text-ink">
                කෑණීම් ඉංජිනේරු නිර්දේශයන්ට (NGJA/16.2/Backhoe/MER/
                <input
                  type="text"
                  className={inlineInputClass}
                  value={form.ngjaRefNumber}
                  onChange={handleChange("ngjaRefNumber")}
                />
                ) යටත්ව වරකට උපරිමය ව.අ
                <input
                  type="number"
                  step="0.01"
                  className={inlineInputClass}
                  value={form.maxExtentVA}
                  onChange={handleChange("maxExtentVA")}
                />
                ක් දක්වා පතසක් කෑණීම සිදුකිරීම සඳහා උපරිමය PC
                <input
                  type="text"
                  inputMode="numeric"
                  className={inlineInputClass}
                  value={form.maxPcCount}
                  onChange={handleChange("maxPcCount")}
                />
                ක් දක්වා වන බැකෝ යන්ත්‍ර
                <input
                  type="text"
                  inputMode="numeric"
                  className={inlineInputClass}
                  value={form.backhoeCount}
                  onChange={handleChange("backhoeCount")}
                />
                ක් යොදා ගැනීමටත් ගැරීම සඳහා ගැරුම් යන්ත්‍ර
                <input
                  type="text"
                  inputMode="numeric"
                  className={inlineInputClass}
                  value={form.gerumCount}
                  onChange={handleChange("gerumCount")}
                />
                ක් යොදා ගැනීමටත් ඇදුම් යන්ත්‍ර
                <input
                  type="text"
                  inputMode="numeric"
                  className={inlineInputClass}
                  value={form.adumMachineCount}
                  onChange={handleChange("adumMachineCount")}
                />
                යොදා ගැනීමටත්, රොන් මඩ වලවල් පවත්වා ගැනීමට ව.අ.
                <input
                  type="text"
                  className={inlineInputClass}
                  value={form.silageExtent}
                  onChange={handleChange("silageExtent")}
                />
                කට ඇප මුදල්
                <input
                  type="text"
                  className={inlineInputClass}
                  value={form.depositAmount}
                  onChange={handleChange("depositAmount")}
                />
                ක් තැන්පත් කර ඇත. තවද, ඉවුරු කඩා වැටීම වැළැක්වීම සඳහා
                <input
                  type="text"
                  className={inlineInputClass}
                  value={form.riverbankProtectionAmount}
                  onChange={handleChange("riverbankProtectionAmount")}
                />
                ක ඇප මුදලක් වෙන් කර ඇත. මීට අමතරව විශේශ අවස්ථා සඳහා
                <input
                  type="text"
                  className={inlineInputClass}
                  value={form.specialCaseAmount}
                  onChange={handleChange("specialCaseAmount")}
                />
                ඇප මුදලක් වෙන් කර ඇත. තවද, අවශ්‍ය පරිදි ජල පොම්ප යොදා
                ගැනීමටත් අවසර ලබා දීම සුදුසු බවට නිර්දේශ කොට කාරුණික
                අනුමැතියට ඉදිරිපත් කරමි.
              </p>

              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Field label="දිනය:-" className="sm:w-48">
                  <input
                    type="date"
                    className={inputClass}
                    value={form.recommendationDate}
                    onChange={handleChange("recommendationDate")}
                  />
                </Field>

                <div className="flex flex-col items-center gap-1 sm:items-end">
                  <div className="h-12 w-56 border-b border-ink" />
                  <p className="font-sinhala text-sm text-ink-muted">
                    අධ්‍යක්ෂ (ඉඩම්/කැණීම්/පරිසර)
                  </p>
                </div>
              </div>
            </section>

            {/* Chairman & CEO approval */}
            <section className="flex flex-col gap-5">
              <p className="font-sinhala text-sm font-semibold text-ink">
                සභාපති හා ප්‍රධාන විධායක නිලධාරි අනුමැතිය
              </p>
              <div className="border-t border-ink" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-sinhala text-sm text-ink">
                  ඉහත නිර්දේශය අනුමත
                </p>
                <select
                  className={`${inputClass} w-32`}
                  value={form.chairmanApproval}
                  onChange={handleChange("chairmanApproval")}
                >
                  <option value="" hidden></option>
                  <option value="කරමි">කරමි</option>
                  <option value="නොකරමි">නොකරමි</option>
                </select>
              </div>

              <div className="mt-4 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                <Field label="දිනය:-" className="sm:w-48">
                  <input
                    type="date"
                    className={inputClass}
                    value={form.chairmanApprovalDate}
                    onChange={handleChange("chairmanApprovalDate")}
                  />
                </Field>

                <div className="flex flex-col items-center gap-1 sm:items-end">
                  <div className="h-12 w-56 border-b border-ink" />
                  <p className="font-sinhala text-sm text-ink-muted">
                    සභාපති හා ප්‍රධාන විධායක නිලධාරි
                  </p>
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
            <div className="mt-8">
              <div className="mb-4 flex justify-end print:hidden">
                <Button type="button" variant="primary" onClick={() => window.print()}>
                  මුද්‍රණය කරන්න / PDF බාගන්න
                </Button>
              </div>
              <A4PreviewSheet form={form} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}