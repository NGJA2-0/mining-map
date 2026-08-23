function Row({ label, value, highlight }) {
    return (
        <div
            className={`a4-row${highlight ? " a4-row-highlight" : ""}`}
            style={highlight ? { background: "#fef9c3", borderRadius: "6px" } : undefined}
        >
            <span className="a4-row-label">{label}</span>
            <strong className="a4-row-value">{value || "—"}</strong>
        </div>
    );
}

function Section({ title, children, columns = 2 }) {
    return (
        <div className="a4-section">
            <h3 className="a4-section-title">{title}</h3>
           <div className={`a4-grid a4-grid-${columns}`}>{children}</div>
        </div>
    );
}

const yesNoLabel = (v) => (v === "yes" ? "ඔව්" : v === "no" ? "නැත" : "—");
const fileLabel = (f) => (f?.name ? f.name : "—");
const blank = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? v : "________");

export default function A4PreviewSheet({ form, isResubmit = false, highlightFields = [] }) {
    const isChanged = (field) => highlightFields.includes(field);

    return (
        <div id="a4-preview-sheet" className="a4-sheet">
            <div className="a4-header">
                <p>ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය</p>
                <h2>
                  යාන්ත්‍රික මැණික් පතල් කැණීමේ අවසරය ලබා ගැනීම
                  {isResubmit ? " (නැවත ඉදිරිපත් කිරීම)" : " (නව)"}
                </h2>
                <p>අධ්‍යක්ෂ (ඉඩම්/කැණීම්/පරිසර) නිර්දේශය</p>
            </div>

            <Section title="අයදුම්කරු පිළිබඳ තොරතුරු">
                <Row label="ඉල්ලුම්කරුගේ නම" value={form.applicantName} highlight={isChanged("applicantName")} />
                <Row label="ඉල්ලුම්කරුගේ ලිපිනය" value={form.applicantAddress} highlight={isChanged("applicantAddress")} />
                <Row label="ඉල්ලුම්කරුගේ දුරකථන අංකය" value={form.applicantPhone} highlight={isChanged("applicantPhone")} />
                <Row label="හැඳුනුම්පත් අංකය" value={form.nic} highlight={isChanged("nic")} />
                <Row label="TIN" value={form.tin} highlight={isChanged("tin")} />
                <Row label="වියදම් පාර්ශවයක් සිටී" value={form.hasExpenseParty ? "ඔව්" : "නැත"} highlight={isChanged("hasExpenseParty")} />
                {form.hasExpenseParty && (
                    <>
                        <Row label="වියදම් පාර්ශවයේ නම" value={form.expenseName} highlight={isChanged("expenseName")} />
                        <Row label="වියදම් පාර්ශවයේ ලිපිනය" value={form.expenseAddress} highlight={isChanged("expenseAddress")} />
                        <Row label="වියදම් පාර්ශවයේ දුරකථන අංකය" value={form.expensePhone} highlight={isChanged("expensePhone")} />
                        <Row label="වියදම් පාර්ශවයේ TIN" value={form.expenseTin} highlight={isChanged("expenseTin")} />
                    </>
                )}
                <Row label="GML අංකය" value={form.gmlNumber} highlight={isChanged("gmlNumber")} />
                <Row label="ඉඩමේ නම" value={form.landName} highlight={isChanged("landName")} />
            </Section>

            {(form.landNature === "goda" || form.landNature === "kumbura") && (
                <Section title="ඉඩමේ ස්වභාවය">
                    <Row
                        label="ඉඩමේ ස්වභාවය"
                        value={form.landNature === "goda" ? "ගොඩ ඉඩමක්" : "කුඹුරු ඉඩමක්"}
                        highlight={isChanged("landNature")}
                    />
                    {form.isRatnapuraLand === "yes" && (
                        <p className="a4-note">
                            රත්නපුර පිහිටි ඉඩමේ බලපත්‍රය පිළිබඳ ලිඛිත සාක්ෂි හෝ දිවුරුම් ප්‍රකාශයක් ඉදිරිපත් කර ඇත.
                        </p>
                    )}
                </Section>
            )}

            <Section title="G.P.S. ලක්ෂ්‍ය">
                {form.gpsPoints?.map((p, i) => (
                    <Row
                        key={i}
                        label={`ලක්ෂ්‍ය ${i + 1}`}
                        value={p.latitude || p.longitude ? `${p.latitude || "—"} / ${p.longitude || "—"}` : "—"}
                        highlight={isChanged("gpsPoints")}
                    />
                ))}
            </Section>

             <Section title="මැණික් ගැරීමේ බලපත්‍රලත් ඉඩම පිහිටි">
                <Row label="දිස්ත්‍රික්කය" value={form.district} highlight={isChanged("district")} />
                <Row label="ප්‍රාදේශීය කාර්යාලය" value={form.regionalOffice} highlight={isChanged("regionalOffice")} />
                <Row label="ගම" value={form.village} highlight={isChanged("village")} />
                <Row label="ඉඩමේ වපසරිය" value={form.landExtent} highlight={isChanged("landExtent")} />
                <Row label="බලපත්‍රලාභියා" value={form.licenseeType} highlight={isChanged("licenseeType")} />
                <Row label="කැමැත්ත ප්‍රකාශිත ලිපිය අමුණා ඇත" value={yesNoLabel(form.consentLetterAttached)} highlight={isChanged("consentLetterAttached")} />
                <Row label="ගොවිජන සේවා/විහාර/ඉඩම් සංවර්ධන ආඥා පනත" value={yesNoLabel(form.govLandAct)} highlight={isChanged("govLandAct")} />
                <Row label="කපන ලද පතල් තිබේ" value={yesNoLabel(form.existingPits)} highlight={isChanged("existingPits")} />
            </Section>

            {form.existingPits === "yes" && (
                <Section title="පෙර බලපත්‍රය පිළිබඳ තොරතුරු">
                    <Row label="පළමුව නිකුත් කළ දිනය" value={form.prevLicenseFirstDate} highlight={isChanged("prevLicenseFirstDate")} />
                    <Row label="දීර්ඝ කළ වාර ගණන" value={form.extensionCount} highlight={isChanged("extensionCount")} />
                    <Row label="කැණූ මැණික්වල වටිනාකම" value={form.minedGemValue} highlight={isChanged("minedGemValue")} />
                    <Row label="කොන්දේසි කඩකිරීම්" value={yesNoLabel(form.conditionBreach)} highlight={isChanged("conditionBreach")} />
                    {form.conditionBreach === "yes" && (
                        <Row label="කඩකිරීම් විස්තර" value={form.conditionBreachDetails} highlight={isChanged("conditionBreachDetails")} />
                    )}
                    <Row label="අයිතිය පිළිබඳ පැමිණිලි" value={yesNoLabel(form.ownershipComplaint)} highlight={isChanged("ownershipComplaint")} />
                    {form.ownershipComplaint === "yes" && (
                        <Row label="පැමිණිලි විස්තර" value={form.complaintDetails} highlight={isChanged("complaintDetails")} />
                    )}
                </Section>
            )}

            <Section title="කැණීම් යෝජනාව" columns={3}>
                <Row label="යෝජිත ගැඹුර (අඩි)" value={form.proposedDepth} highlight={isChanged("proposedDepth")} />
                <Row label="ඉඩමේ වගාව" value={form.landCultivation} highlight={isChanged("landCultivation")} />
                <Row label="උතුරට (අඩි)" value={form.boundaryNorth} highlight={isChanged("boundaryNorth")} />
                <Row label="දකුණට (අඩි)" value={form.boundarySouth} highlight={isChanged("boundarySouth")} />
                <Row label="නැගෙනහිරට (අඩි)" value={form.boundaryEast} highlight={isChanged("boundaryEast")} />
                <Row label="බස්නාහිරට (අඩි)" value={form.boundaryWest} highlight={isChanged("boundaryWest")} />
                <Row label="නිවාසවලට (අඩි)" value={form.boundaryHouses} highlight={isChanged("boundaryHouses")} />
                <Row label="විදුලි කණුවලට (අඩි)" value={form.boundaryElectricPoles} highlight={isChanged("boundaryElectricPoles")} />
                <Row label="ගංගා/ජල දෙහයන්ට (අඩි)" value={form.boundaryWater} highlight={isChanged("boundaryWater")} />
                <Row label="මාර්ගවලට (අඩි)" value={form.boundaryRoads} highlight={isChanged("boundaryRoads")} />
                <Row label="වෙනත්" value={form.boundaryOther} highlight={isChanged("boundaryOther")} />
                <Row label="යෝජිත පතල් ප්‍රමාණය (ව.අ.)" value={form.proposedExtent} highlight={isChanged("proposedExtent")} />
                <Row label="ඇප මුදල් සේවා ගාස්තුව" value={form.refundServiceFee} highlight={isChanged("refundServiceFee")} />
            </Section>

            <div className="a4-section">
                <h3 className="a4-section-title">නිර්දේශය</h3>
                <p className="a4-paragraph">
                    කෑණීම් ඉංජිනේරු නිර්දේශයන්ට (NGJA/16.2/Backhoe/MER/{blank(form.ngjaRefNumber)}) යටත්ව
                    වරකට උපරිමය ව.අ {blank(form.maxExtentVA)} ක් දක්වා පතසක් කෑණීම සිදුකිරීම සඳහා
                    උපරිමය PC {blank(form.maxPcCount)} ක් දක්වා වන බැකෝ යන්ත්‍ර {blank(form.backhoeCount)} ක් දක්වා
                    යොදා ගැනීමටත් ගැරීම සඳහා ගැරුම් යන්ත්‍ර {blank(form.gerumCount)} ක් යොදා ගැනීමටත්
                    අවශ්‍ය පරිදි ජල පොම්ප යොදා ගැනීමටත් අවසර ලබා දීම සුදුසු බවට
                    නිර්දේශ කොට තාක්ෂණික අනුමැතියට ඉදිරිපත් කරමි.
                </p>
            </div>

            <Section title="අධ්‍යක්ෂ (ඉඩම්/කැණීම්/පරිසර) අනුමැතිය">
                <Row label="අනුමැතිය" value={form.directorApproval} highlight={isChanged("directorApproval")} />
                <Row label="දිනය" value={form.recommendationDate} highlight={isChanged("recommendationDate")} />
            </Section>

            <Section title="සභාපති හා ප්‍රධාන විධායක නිලධාරි අනුමැතිය">
                <Row label="අනුමැතිය" value={form.chairmanApproval} highlight={isChanged("chairmanApproval")} />
                <Row label="දිනය" value={form.chairmanApprovalDate} highlight={isChanged("chairmanApprovalDate")} />
            </Section>
        </div>
    );
}