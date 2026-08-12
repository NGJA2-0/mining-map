import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

function Field({ label, children, full = false }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <label className="font-sinhala text-sm text-ink-muted">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-base px-3 py-2 font-sinhala text-sm text-ink placeholder:text-ink-muted/60 outline-none transition focus:border-teal focus:ring-1 focus:ring-teal";

export default function NewRecordPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCheckboxChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleDistrictChange = (e) => {
    const { value } = e.target;
    // reset the DS division since it depends on the selected district
    setForm((prev) => ({ ...prev, district: value, regionalOffice: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: wire up to backend endpoint
      console.log("New record submission:", form);
      navigate("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
              Signed in as {user?.email}
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

          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-10">
            {/* Header block */}
            <div className="text-center">
              <p className="font-sinhala text-sm text-ink-muted">
                ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය
              </p>
              <h2 className="mt-1 font-sinhala text-lg font-semibold sm:text-xl">
                යාන්ත්‍රික මැණික් පතල් කැණීමේ අවසරය දීර්ඝ කිරීම (නව)
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
              </div>
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
                    <option value="">තෝරන්න</option>
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
                    <option value="">තෝරන්න</option>
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
                <Field
                  label="බලපත්‍රලාභියා ඉඩම් හිමිකරු ද? බදු ගැණුම්කරු ද? රජයේ ඉඩමක් ද? වෙන්දේසි ඉඩමක් ද?"
                  full
                >
                  <input
                    type="text"
                    className={inputClass}
                    value={form.licenseeType}
                    onChange={handleChange("licenseeType")}
                  />
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

                <Field label="ඉඩමේ වගාව">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.landCultivation}
                    onChange={handleChange("landCultivation")}
                  />
                </Field>
              </div>
            </section>

            {/* Previous license history */}
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
                <Field label="සිදු වී ඇත්නම් ඒ පිළිබඳ විස්තර">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.conditionBreachDetails}
                    onChange={handleChange("conditionBreachDetails")}
                  />
                </Field>

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
                <Field label="ලැබී ඇත්නම් ඒ පිළිබඳ විස්තර">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.complaintDetails}
                    onChange={handleChange("complaintDetails")}
                  />
                </Field>
              </div>
            </section>

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
                <Field label="කැපීමට අදහස් කරන පතල් ප්‍රමාණය (ව.අ.)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.proposedExtent}
                    onChange={handleChange("proposedExtent")}
                  />
                </Field>
                <Field label="ආපසු මුදල් සේවා ගාස්තුව">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="NGJA/16.2/2018/Backhoe III චක්‍රලේඛය ප්‍රකාරව"
                    value={form.refundServiceFee}
                    onChange={handleChange("refundServiceFee")}
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
            </section>

            {/* Recommendation */}
            <section className="flex flex-col gap-5">
              <h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">
                නිර්දේශය
              </h3>
              <Field label="නිර්දේශය">
                <textarea
                  rows={4}
                  className={inputClass}
                  value={form.recommendation}
                  onChange={handleChange("recommendation")}
                />
              </Field>
            </section>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/dashboard")}
              >
                අවලංගු කරන්න
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "සුරකිමින්..." : "සුරකින්න"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}