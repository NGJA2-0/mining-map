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
                    <Field label="වියදම් පාර්ශවයක් සිටී නම් , නම, ලිපිනය, දුරකථන අංකය" full>
                      <textarea
                        rows={2}
                        className={inputClass}
                        value={form.expenseName}
                        onChange={handleChange("expenseName")}
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
                  <input
                    type="text"
                    className={inputClass}
                    value={form.district}
                    onChange={handleChange("district")}
                  />
                </Field>
                <Field label="ගම">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.village}
                    onChange={handleChange("village")}
                  />
                </Field>
                <Field label="ප්‍රාදේශීය කාර්යාලය">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.regionalOffice}
                    onChange={handleChange("regionalOffice")}
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