function Row({ label, value }) {
    return (
        <div className="a4-row">
            <span className="a4-row-label">{label}</span>
            <strong className="a4-row-value">{value || "—"}</strong>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="a4-section">
            <h3 className="a4-section-title">{title}</h3>
            <div className="a4-grid">{children}</div>
        </div>
    );
}

const yesNoLabel = (v) => (v === "yes" ? "ඔව්" : v === "no" ? "නැත" : "—");
const fileLabel = (f) => (f?.name ? f.name : "—");
const blank = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? v : "________");

export default function A4PreviewSheet({ form, isResubmit = false }) {
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
                <Row label="ඉල්ලුම්කරුගේ නම" value={form.applicantName} />
                <Row label="ඉල්ලුම්කරුගේ ලිපිනය" value={form.applicantAddress} />
                <Row label="ඉල්ලුම්කරුගේ දුරකථන අංකය" value={form.applicantPhone} />
                <Row label="හැඳුනුම්පත් අංකය" value={form.nic} />
                <Row label="TIN" value={form.tin} />
                <Row label="වියදම් පාර්ශවයක් සිටී" value={form.hasExpenseParty ? "ඔව්" : "නැත"} />
                {form.hasExpenseParty && (
                    <>
                        <Row label="වියදම් පාර්ශවයේ නම" value={form.expenseName} />
                        <Row label="වියදම් පාර්ශවයේ ලිපිනය" value={form.expenseAddress} />
                        <Row label="වියදම් පාර්ශවයේ දුරකථන අංකය" value={form.expensePhone} />
                        <Row label="වියදම් පාර්ශවයේ TIN" value={form.expenseTin} />
                    </>
                )}
                <Row label="GML අංකය" value={form.gmlNumber} />
                <Row label="ඉඩමේ නම" value={form.landName} />
            </Section>

            {(form.landNature === "goda" || form.landNature === "kumbura") && (
                <Section title="ඉඩමේ ස්වභාවය">
                    <Row
                        label="ඉඩමේ ස්වභාවය"
                        value={form.landNature === "goda" ? "ගොඩ ඉඩමක්" : "කුඹුරු ඉඩමක්"}
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
                    />
                ))}
            </Section>

            <Section title="මැණික් ගැරීමේ බලපත්‍රලත් ඉඩම පිහිටි">
                <Row label="දිස්ත්‍රික්කය" value={form.district} />
                <Row label="ප්‍රාදේශීය කාර්යාලය" value={form.regionalOffice} />
                <Row label="ගම" value={form.village} />
                <Row label="ඉඩමේ වපසරිය" value={form.landExtent} />
                <Row label="බලපත්‍රලාභියා" value={form.licenseeType} />
                <Row label="කැමැත්ත ප්‍රකාශිත ලිපිය අමුණා ඇත" value={yesNoLabel(form.consentLetterAttached)} />
                <Row label="ගොවිජන සේවා/විහාර/ඉඩම් සංවර්ධන ආඥා පනත" value={yesNoLabel(form.govLandAct)} />
                <Row label="කපන ලද පතල් තිබේ" value={yesNoLabel(form.existingPits)} />
            </Section>

            {form.existingPits === "yes" && (
                <Section title="පෙර බලපත්‍රය පිළිබඳ තොරතුරු">
                    <Row label="පළමුව නිකුත් කළ දිනය" value={form.prevLicenseFirstDate} />
                    <Row label="දීර්ඝ කළ වාර ගණන" value={form.extensionCount} />
                    <Row label="කැණූ මැණික්වල වටිනාකම" value={form.minedGemValue} />
                    <Row label="කොන්දේසි කඩකිරීම්" value={yesNoLabel(form.conditionBreach)} />
                    {form.conditionBreach === "yes" && (
                        <Row label="කඩකිරීම් විස්තර" value={form.conditionBreachDetails} />
                    )}
                    <Row label="අයිතිය පිළිබඳ පැමිණිලි" value={yesNoLabel(form.ownershipComplaint)} />
                    {form.ownershipComplaint === "yes" && (
                        <Row label="පැමිණිලි විස්තර" value={form.complaintDetails} />
                    )}
                </Section>
            )}

            <Section title="කැණීම් යෝජනාව">
                <Row label="යෝජිත ගැඹුර (අඩි)" value={form.proposedDepth} />
                <Row label="ඉඩමේ වගාව" value={form.landCultivation} />
                <Row label="උතුරට (අඩි)" value={form.boundaryNorth} />
                <Row label="දකුණට (අඩි)" value={form.boundarySouth} />
                <Row label="නැගෙනහිරට (අඩි)" value={form.boundaryEast} />
                <Row label="බස්නාහිරට (අඩි)" value={form.boundaryWest} />
                <Row label="නිවාසවලට (අඩි)" value={form.boundaryHouses} />
                <Row label="විදුලි කණුවලට (අඩි)" value={form.boundaryElectricPoles} />
                <Row label="ගංගා/ජල දෙහයන්ට (අඩි)" value={form.boundaryWater} />
                <Row label="මාර්ගවලට (අඩි)" value={form.boundaryRoads} />
                <Row label="වෙනත්" value={form.boundaryOther} />
                <Row label="යෝජිත පතල් ප්‍රමාණය (ව.අ.)" value={form.proposedExtent} />
                <Row label="ඇප මුදල් සේවා ගාස්තුව" value={form.refundServiceFee} />
            </Section>

            <div className="a4-section">
                <h3 className="a4-section-title">නිර්දේශය</h3>
                <p className="a4-paragraph">
                    කෑණීම් ඉංජිනේරු නිර්දේශයන්ට (NGJA/16.2/Backhoe/MER/{blank(form.ngjaRefNumber)}) යටත්ව
                    වරකට උපරිමය ව.අ {blank(form.maxExtentVA)} ක් දක්වා පතසක් කෑණීම සිදුකිරීම සඳහා
                    උපරිමය PC {blank(form.maxPcCount)} ක් දක්වා වන බැකෝ යන්ත්‍ර {blank(form.backhoeCount)} ක්
                    යොදා ගැනීමටත් ගැරීම සඳහා ගැරුම් යන්ත්‍ර {blank(form.gerumCount)} ක් යොදා ගැනීමටත්
                    ඇදුම් යන්ත්‍ර {blank(form.adumMachineCount)} යොදා ගැනීමටත්, රොන් මඩ වලවල් පවත්වා
                    ගැනීමට ව.අ. {blank(form.silageExtent)} කට ඇප මුදල් {blank(form.depositAmount)} ක් තැන්පත්
                    කර ඇත. තවද, ඉවුරු කඩා වැටීම වැළැක්වීම සඳහා {blank(form.riverbankProtectionAmount)} ක
                    ඇප මුදලක් වෙන් කර ඇත. මීට අමතරව විශේශ අවස්ථා සඳහා {blank(form.specialCaseAmount)} ඇප
                    මුදලක් වෙන් කර ඇත. තවද, අවශ්‍ය පරිදි ජල පොම්ප යොදා ගැනීමටත් අවසර ලබා දීම සුදුසු බවට
                    නිර්දේශ කොට කාරුණික අනුමැතියට ඉදිරිපත් කරමි.
                </p>
            </div>

            <Section title="අධ්‍යක්ෂ (ඉඩම්/කැණීම්/පරිසර) අනුමැතිය">
                <Row label="අනුමැතිය" value={form.directorApproval} />
                <Row label="දිනය" value={form.recommendationDate} />
            </Section>

            <Section title="සභාපති හා ප්‍රධාන විධායක නිලධාරි අනුමැතිය">
                <Row label="අනුමැතිය" value={form.chairmanApproval} />
                <Row label="දිනය" value={form.chairmanApprovalDate} />
            </Section>
        </div>
    );
}