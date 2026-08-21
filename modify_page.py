import re

file_path = 'f:/NGJA/Mining map/src/pages/ExtendRecordPage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: ඉඩමේ කපන ලද පතල් තිබේද?
p1 = r'<Field label="ඉඩමේ කපන ලද පතල් තිබේද\?">.*?</Field>'
r1 = '''<Field label="දැනට කපා ඇති පතල් වලවල්වල වර්ග ප්‍රමාණය (මතුපිට)">
                  <input
                    type="text"
                    className={inputClass}
                    value={form.existingPitsArea || ""}
                    onChange={handleChange("existingPitsArea")}
                  />
                </Field>'''
content = re.sub(p1, r1, content, flags=re.DOTALL)

# Remove the conditional for Previous license history
# find: {form.existingPits === "yes" && ( \n <section ...
# replace with: <section ...
content = re.sub(r'\{form\.existingPits === "yes" && \(\s*(<section className="flex flex-col gap-5">\s*<h3 className="font-sinhala text-sm font-semibold uppercase tracking-wide text-teal">\s*පෙර බලපත්‍රය පිළිබඳ තොරතුරු)', r'\1', content)

# Remove the closing brace for that section
content = re.sub(r'(</section>)\s*\)}', r'\1', content)

# Replacement 2: කලින් නිකුත් කර ඇති සාම්ප්‍රදායික පතල් බලපත්‍රය, පළමුව නිකුත් කළ දිනය
p2 = r'<Field label="කලින් නිකුත් කර ඇති සාම්ප්‍රදායික පතල් බලපත්‍රය, පළමුව නිකුත් කළ දිනය">.*?</Field>'
r2 = '''<Field label="රොන්මඩ වලවල් ලෙස පවත්වාගෙන යන වලවල්වල වර්ග ප්‍රමාණය (ව.අඩි)">
                    <input
                      type="text"
                      className={inputClass}
                      value={form.mudPitsArea || ""}
                      onChange={handleChange("mudPitsArea")}
                    />
                  </Field>'''
content = re.sub(p2, r2, content, flags=re.DOTALL)

# Replacement 3: මෙම බලපත්‍රය කී වතාවක් දීර්ඝ කර තිබේද?
p3 = r'<Field label="මෙම බලපත්‍රය කී වතාවක් දීර්ඝ කර තිබේද\?">.*?</Field>'
r3 = '''<Field label="ගැඹුර ප්‍රමාණය">
                    <input
                      type="text"
                      className={inputClass}
                      value={form.depthSize || ""}
                      onChange={handleChange("depthSize")}
                    />
                  </Field>'''
content = re.sub(p3, r3, content, flags=re.DOTALL)

# Replacement 4: එම කාල සීමාව තුළ කෑණීම් කරන ලද මැණික්වල වටිනාකම
p4 = r'<Field label="එම කාල සීමාව තුළ කෑණීම් කරන ලද මැණික්වල වටිනාකම">.*?</Field>'
r4 = '''<Field label="පසුගිය මාස 03 ඇතුලතදී කොන්දේසි කඩකිරීම් ඇත්නම්">
                    <input
                      type="text"
                      className={inputClass}
                      value={form.breachesInLast3Months || ""}
                      onChange={handleChange("breachesInLast3Months")}
                    />
                  </Field>'''
content = re.sub(p4, r4, content, flags=re.DOTALL)

# Replacement 5: එම කාලය තුළ කොන්දේසි කඩකිරීම් සිදුවී ඇත්ද? and සිදු වී ඇත්නම් ඒ පිළිබඳ විස්තර
p5 = r'<div className="sm:col-span-2 grid grid-cols-1 gap-5 sm:grid-cols-2">\s*<Field label="එම කාලය තුළ කොන්දේසි කඩකිරීම් සිදුවී ඇත්ද\?">.*?{form\.conditionBreach === "yes" && \(.*?\)}\s*</div>'
r5 = '''<div className="sm:col-span-2">
                    <Field label="අංක NGJA1/03/2025 දරන චක්‍රලේඛය මගින් නියම කර ඇති වාර්තා ඉදිරිපත් කර තිබේද?">
                      <div className="flex gap-4 pt-1">
                        {yesNo.map((opt) => (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 font-sinhala text-sm"
                          >
                            <input
                              type="radio"
                              name="reportsSubmitted"
                              value={opt.value}
                              checked={form.reportsSubmitted === opt.value}
                              onChange={handleChange("reportsSubmitted")}
                              className="accent-teal"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </Field>
                  </div>'''
content = re.sub(p5, r5, content, flags=re.DOTALL)

# Replacement 6: මෙම කාලය තුළ ඉඩමේ අයිතිය පිළිබඳ පැමිණිලි ලැබී තිබේද? and ලැබී ඇත්නම් ඒ පිළිබඳ විස්තර
p6 = r'<Field label="මෙම කාලය තුළ ඉඩමේ අයිතිය පිළිබඳ පැමිණිලි ලැබී තිබේද\?">.*?{form\.ownershipComplaint === "yes" && \(.*?\)}'
r6 = '''<div className="sm:col-span-2">
                    <Field label="පවත්වා ඇති මැණික් ගල් වෙන්දේසි සම්බන්ධ විස්තර :-">
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th colSpan="2" className="px-4 py-2 font-sinhala font-medium text-center border-b">පසුගිය මාස 12 තුළ විකුණූ මැණික් සම්බන්ධ විස්තර</th>
                            </tr>
                            <tr>
                              <th className="px-4 py-2 font-sinhala font-medium border-r w-1/2">විකිණීමේ ස්වභාවය (පුද්ගලික/වෙන්දේසි)</th>
                              <th className="px-4 py-2 font-sinhala font-medium w-1/2">විකුණුම් වටිනාකම (රු.)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="px-4 py-2 font-sinhala border-r">පුද්ගලික</td>
                              <td className="px-4 py-2">
                                <input type="number" className="w-full bg-transparent outline-none" value={form.privateSaleValue || ""} onChange={handleChange("privateSaleValue")} />
                              </td>
                            </tr>
                            <tr className="border-b">
                              <td className="px-4 py-2 font-sinhala border-r">වෙන්දේසි</td>
                              <td className="px-4 py-2">
                                <input type="number" className="w-full bg-transparent outline-none" value={form.auctionSaleValue || ""} onChange={handleChange("auctionSaleValue")} />
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 font-sinhala font-medium border-r">මුළු එකතුව</td>
                              <td className="px-4 py-2">
                                <input type="number" className="w-full bg-transparent outline-none font-semibold" value={(Number(form.privateSaleValue || 0) + Number(form.auctionSaleValue || 0)) || ""} readOnly />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </Field>
                  </div>'''
content = re.sub(p6, r6, content, flags=re.DOTALL)

# Replacement 7: පතල් කැපීමට යෝජිත ගැඹුර ප්‍රමාණය (පොළොව මතුපිට සිට අඩි)
p7 = r'<Field label="පතල් කැපීමට යෝජිත ගැඹුර ප්‍රමාණය \(පොළොව මතුපිට සිට අඩි\)">.*?</Field>'
r7 = ''
content = re.sub(p7, r7, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
