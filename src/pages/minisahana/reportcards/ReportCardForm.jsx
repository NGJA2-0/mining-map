import React, { useRef } from "react";

// Sinhala grapheme clustering: keeps consonant + virama + ZWJ + ර/ය
// (rakaransaya/yansaya conjuncts, e.g. ප්‍ර, ද්‍ර) fused as one unit,
// since Intl.Segmenter doesn't reliably preserve these across browsers.
const SINHALA_BASE = "\u0D85-\u0D96\u0D9A-\u0DC6\u0DCE";
const SINHALA_VOWEL_SIGN = "\u0DCF-\u0DDF\u0DF2\u0DF3";
const SINHALA_VIRAMA = "\u0DCA";
const ZWJ = "\u200D";
const SIGN = "\u0D82\u0D83";

const GRAPHEME_REGEX = new RegExp(
  `[${SINHALA_BASE}](?:${SINHALA_VIRAMA}${ZWJ}[${SINHALA_BASE}])*(?:${SINHALA_VIRAMA})?(?:[${SINHALA_VOWEL_SIGN}])?[${SIGN}]?|.`,
  "gu"
);

const splitGraphemes = (text) => text.match(GRAPHEME_REGEX) || [];

const CharGrid = ({ length, rows = 1, className = "", fitWidth = false }) => {
  const inputRefs = useRef([]);
  const totalBoxes = rows * length;

  const [filled, setFilled] = React.useState(() => Array(totalBoxes).fill(false));

  const setBoxFilled = (index, isFilled) => {
    setFilled((prev) => {
      if (prev[index] === isFilled) return prev;
      const next = [...prev];
      next[index] = isFilled;
      return next;
    });
  };

  const focusBox = (index) => {
    const el = inputRefs.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, e) => {
    const graphemes = splitGraphemes(e.target.value);
    const val = graphemes[graphemes.length - 1] ?? "";
    e.target.value = val;
    setBoxFilled(index, val.length > 0);
    if (val && index < totalBoxes - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    const target = e.target;
    if (e.key === "Backspace" && !target.value && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
      const prev = inputRefs.current[index - 1];
      if (prev) prev.value = "";
      setBoxFilled(index - 1, false);
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < totalBoxes - 1) {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted.replace(/\s/g, "");
    const chars = splitGraphemes(cleaned);
    if (chars.length === 0) return;

    let lastFilledIndex = index;
    const newlyFilled = [];
    chars.forEach((char, offset) => {
      const targetIndex = index + offset;
      if (targetIndex >= totalBoxes) return;
      const el = inputRefs.current[targetIndex];
      if (el) {
        el.value = char;
        lastFilledIndex = targetIndex;
        newlyFilled.push(targetIndex);
      }
    });
    setFilled((prev) => {
      const next = [...prev];
      newlyFilled.forEach((i) => {
        next[i] = true;
      });
      return next;
    });

    const nextIndex = Math.min(lastFilledIndex + 1, totalBoxes - 1);
    focusBox(nextIndex);
  };

  return (
    <div className={`flex flex-col py-1 ${fitWidth ? "" : "overflow-x-auto"} ${className}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={fitWidth ? "grid" : "flex min-w-max"}
          style={fitWidth ? { gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` } : undefined}
        >
          {Array.from({ length }).map((_, i) => {
            const flatIndex = r * length + i;
            const isFilled = filled[flatIndex];
            return (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[flatIndex] = el;
                }}
                maxLength={1}
                tabIndex={0}
                onChange={(e) => handleChange(flatIndex, e)}
                onKeyDown={(e) => handleKeyDown(flatIndex, e)}
                onPaste={(e) => handlePaste(flatIndex, e)}
                onFocus={(e) => e.target.select()}
                className={`
                  font-sinhala p-0 leading-none
                  ${fitWidth ? "w-full min-w-0 aspect-square text-xs sm:text-sm" : "w-5 sm:w-6 h-6 sm:h-7 text-xs sm:text-sm"}
                  text-center uppercase focus:outline-none font-medium
                  transition-all duration-150 ease-out relative z-0 focus:z-10
                  ${i > 0 ? "-ml-px" : ""} ${r > 0 ? "-mt-px" : ""}
                  ${
                    isFilled
                      ? "border border-slate-300 bg-slate-50 text-slate-900 font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:border-blue-400 focus:bg-blue-50 focus:shadow-[0_0_0_2px_rgba(96,165,250,0.35)]"
                      : "border border-black bg-white text-black focus:bg-blue-100 focus:border-blue-400 focus:shadow-[0_0_0_2px_rgba(96,165,250,0.35)]"
                  }
                `}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const RATING_ROWS = [
  "පැමිණීම",
  "හැසිරීම",
  "අධ්‍යාපන කටයුතු පිළිබඳ උනන්දුව",
  "අධ්‍යාපන කටයුතු වල ප්‍රගතිය",
];

const RATING_COLUMNS = ["ඉතා හොඳයි", "හොඳයි", "සාමාන්‍යයි", "දුර්වලයි"];

const OFFICE_USE_ROWS = [
  {
    text: "ඉහත ප්‍රගතිවාර්තාවේ අදාළ සියලු තොරතුරු නිසි ආකාරයෙන් සම්පූර්ණකොට ඇති/නැති බැවින් ක්‍රියාත්මක නිලධාරී නිර්දේශය සඳහා ඉදිරිපත් කරමි/නොකරමි.",
    label: "විෂයභාර නිලධාරී / කළමනාකරණ සහකාර අත්සන හා දිනය",
  },
  {
    text: "ඉහත දක්වා ඇති තොරතුරු අනුව අදාළ ශිෂ්‍යත්වලාභියාට එම ශිෂ්‍යත්ව මුදල් ලබාදීම සුදුසු බව නිර්දේශ කරමි.",
    label: "ක්‍රියාත්මක නිලධාරී (අත්සන/දිනය/නිල මුද්‍රාව)",
  },
  {
    text: "ඉහත දක්වා ඇති තොරතුරු අනුව හා ක්‍රියාත්මක නිලධාරී නිර්දේශ ප්‍රකාරව අදාළ ශිෂ්‍යත්වලාභියාට එම ශිෂ්‍යත්ව මුදල් ලබාදීම සුදුසු බව නිර්දේශකොට අනුමත කරමි.",
    label: "නියෝජ්‍ය/සහකාර අධ්‍යක්ෂ (ක්‍රියාත්මක හා ප්‍රදේශීය සංවර්ධන) (අත්සන/දිනය/නිල මුද්‍රාව)",
  },
];

const ReportCardForm = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala text-xs sm:text-sm">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-sm sm:text-lg font-bold leading-snug">
          &ldquo;මිණි සහන&rdquo; ශිෂ්‍යත්ව වැඩසටහන - ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය
        </h1>
        <p className="text-xs sm:text-base font-medium mt-1">
          ශිෂ්‍යත්ව මුදල් ලබාගැනීම සඳහා සම්පූර්ණ කලයුතු ප්‍රගති වාර්තාව
        </p>
      </div>

      <div className="border-2 border-black flex flex-col">
        {/* 01 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            01. ශිෂ්‍යත්වලාභියාගේ නම
          </div>
          <div className="sm:w-[75%] p-2">
            <CharGrid length={32} rows={1} fitWidth />
          </div>
        </div>

        {/* 02 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            02. පාසල
          </div>
          <div className="sm:w-[75%] p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* 03 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            03. ශ්‍රේණිය
          </div>
          <div className="sm:w-[75%] p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* 04 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            04. ශිෂ්‍යත්ව වැඩසටහන සඳහා ඇතුළත් වූ වර්ෂය හා ශ්‍රේණිය
          </div>
          <div className="sm:w-[55%] flex flex-col sm:flex-row">
            <div className="sm:w-1/2 flex flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="w-1/2 p-2 border-r border-black font-medium flex items-center">වර්ෂය</div>
              <div className="w-1/2 p-2">
                <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
            </div>
            <div className="sm:w-1/2 flex flex-row">
              <div className="w-1/2 p-2 border-r border-black font-medium flex items-center">ශ්‍රේණිය</div>
              <div className="w-1/2 p-2">
                <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* 05 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            05. පෙනීසිටින වර්ෂය
          </div>
          <div className="sm:w-[55%] flex flex-col">
            <div className="flex flex-row border-b border-black">
              <div className="w-2/3 sm:w-1/2 p-2 border-r border-black font-medium">
                අ.පො.ස සා.පෙළ සඳහා පෙනීසිටින වර්ෂය
              </div>
              <div className="flex-1 p-2">
                <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
            </div>
            <div className="flex flex-row">
              <div className="w-2/3 sm:w-1/2 p-2 border-r border-black font-medium">
                අ.පො.ස උ.පෙළ සඳහා පෙනීසිටින වර්ෂය
              </div>
              <div className="flex-1 p-2">
                <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* 06 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            06. පෞද්ගලික ලිපිනය
          </div>
          <div className="sm:w-[75%] p-2">
            <textarea className="w-full h-16 focus:outline-none bg-transparent resize-none" />
          </div>
        </div>

        {/* 07 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            07. දුරකථන අංකය
          </div>
          <div className="sm:w-[75%] flex flex-col gap-3 p-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="font-medium w-16 shrink-0">ජංගම</span>
              <CharGrid length={10} rows={1} fitWidth className="w-full max-w-[220px]" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span className="font-medium w-16 shrink-0">ස්ථාවර</span>
              <CharGrid length={10} rows={1} fitWidth className="w-full max-w-[220px]" />
            </div>
          </div>
        </div>

        {/* 08 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            08. විද්‍යුත් තැපෑල
          </div>
          <div className="sm:w-[75%] p-2">
            <input type="email" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Important notes */}
        <div className="border-b border-black p-2 text-[10px] sm:text-xs leading-relaxed font-semibold underline">
          ***ඉතා වැදගත් - අ.පො.ස උ.පෙළ සඳහා සුදුසුකම් ලබා ඇති ශිෂ්‍යත්වලාභීන් අ.පො.ස සා.පෙළ ප්‍රතිඵල
          ලේඛනයේ පිටපතක් විදුහල්පතිතුමා විසින් සහතික කරන ලද පිටපතක් බවට සහතික කොට මෙම වාර්තාව සමඟ
          යොමු කිරීම අනිවාර්යය වේ.
        </div>
        <div className="border-b border-black p-2 text-[10px] sm:text-xs leading-relaxed">
          *** පළමු වරට ප්‍රගති වාර්තා යොමු කරනු ලබන නව ශිෂ්‍යත්වලාභීන් විසින් ශිෂ්‍යත්ව මුදල්
          ලබාගැනීම සඳහා සිය නමින් විවෘත කරන ලද ළමා ඉතුරුම් ගිණුමේ විස්තර පහත අංක 09 හි දැක්වෙන
          පරිදි <span className="font-semibold underline">අනිවාර්යයෙන්</span> සම්පූර්ණ කලයුතු
          අතර බැංකු පොතෙහි{" "}
          <span className="font-semibold underline">
            ගිණුම් අංකය හා ගිණුම් හිමියාගේ නම පැහැදිළිව පෙනෙන සේ
          </span>{" "}
          ගත්තා ලද ඡායා පිටපතක් අමුණන්න.
        </div>

        {/* 09 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            09. ළමා ඉතුරුම් ගිණුමේ ගිණුම් අංකය
          </div>
          <div className="sm:w-[75%] p-2 flex flex-col">
            <CharGrid length={20} rows={1} fitWidth />
            <div className="flex flex-col sm:flex-row border-t border-black mt-2 -mx-2">
              <div className="sm:w-1/2 flex flex-row border-b sm:border-b-0 sm:border-r border-black">
                <div className="w-1/3 p-2 border-r border-black font-medium flex items-center">
                  බැංකුව
                </div>
                <div className="flex-1 p-2">
                  <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
                </div>
              </div>
              <div className="sm:w-1/2 flex flex-row">
                <div className="w-1/3 p-2 border-r border-black font-medium flex items-center">
                  ශාඛාව
                </div>
                <div className="flex-1 p-2">
                  <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 10 header */}
        <div className="border-b border-black p-2 font-medium bg-gray-50">
          10. පන්තිභාර ගුරුතුමාගේ/ගුරුතුමියගේ නිර්දේශය -
        </div>

        {/* Rating table */}
        <div className="border-b border-black overflow-x-auto">
          <table className="w-full text-center text-[10px] sm:text-xs border-collapse min-w-[520px]">
            <thead>
              <tr>
                <th className="p-2 border-b border-r border-black text-left font-medium w-2/5">
                  ඇගයීම් ක්ෂේත්‍රය
                </th>
                {RATING_COLUMNS.map((col) => (
                  <th key={col} className="p-2 border-b border-r border-black font-medium last:border-r-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATING_ROWS.map((label, idx, arr) => (
                <tr key={label}>
                  <td
                    className={`p-2 border-r border-black text-left ${
                      idx !== arr.length - 1 ? "border-b" : ""
                    }`}
                  >
                    {label}
                  </td>
                  {RATING_COLUMNS.map((col) => (
                    <td
                      key={col}
                      className={`p-2 border-r border-black last:border-r-0 ${
                        idx !== arr.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <input type="radio" name={`rating-${idx}`} className="w-4 h-4 cursor-pointer" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Class teacher declaration + signature */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[65%] p-2 border-b sm:border-b-0 sm:border-r border-black text-justify leading-relaxed">
            <span className="font-medium block mb-1">නිර්දේශිත සටහන:</span>
            ඉහත නම් සඳහන් ශිෂ්‍ය/ශිෂ්‍යාව මෙම විද්‍යාලයේ{" "}
            <input
              type="text"
              className="inline-block w-24 sm:w-32 border-b border-black bg-transparent focus:outline-none text-center mx-1"
            />{" "}
            දින වන විට{" "}
            <input
              type="text"
              className="inline-block w-24 sm:w-32 border-b border-black bg-transparent focus:outline-none text-center mx-1"
            />{" "}
            ශ්‍රේණියේ මා භාරයේ ඇති පන්තියේ ඉගෙනුම ලබන බවත්, ඔහු/ ඇය වෙත අදාළ ශිෂ්‍යත්ව මුදල් ලබාදීම
            සුදුසු බවත් නිර්දේශ කරමි.
          </div>
          <div className="sm:w-[35%] p-2 flex items-end">
            <div className="flex flex-col w-full">
              <div className="border-b-2 border-dotted border-black w-full mb-1 h-10"></div>
              <span className="text-[10px] sm:text-xs">
                පන්තිභාර ගුරුතුමා/ගුරුතුමියගේ අත්සන / දිනය
              </span>
            </div>
          </div>
        </div>

        {/* 11 header */}
        <div className="border-b border-black p-2 font-medium bg-gray-50">
          11. විදුහල්පති නිර්දේශය:
        </div>

        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[65%] p-2 border-b sm:border-b-0 sm:border-r border-black text-justify leading-relaxed">
            <span className="font-medium block mb-1">සටහන:</span>
            ඉහත නම් සඳහන් ශිෂ්‍යයාගේ/ශිෂ්‍යාවගේ ප්‍රගතිය සම්බන්ධයෙන් පන්තිභාර ගුරුතුමා/ගුරුතුමිය විසින්
            ලබා දී ඇති නිර්දේශ හා තොරතුරු මත පදනම්ව අදාළ ශිෂ්‍යත්වලාභියාට එම ශිෂ්‍යත්ව මුදල් ලබාදීම
            අනුමත කොට ඉදිරි කටයුතු සඳහා ඉදිරිපත් කරමි.
          </div>
          <div className="sm:w-[35%] p-2 flex items-end">
            <div className="flex flex-col w-full">
              <div className="border-b-2 border-dotted border-black w-full mb-1 h-10"></div>
              <span className="text-[10px] sm:text-xs">
                විදුහල්පති අත්සන / දිනය හා නිල මුද්‍රාව
              </span>
            </div>
          </div>
        </div>

        {/* Office use header */}
        <div className="border-b border-black p-2 font-semibold text-center underline bg-gray-50">
          කාර්යාලීය ප්‍රයෝජනය සඳහා (For Office Use Only)
        </div>

        {/* Office use rows */}
        {OFFICE_USE_ROWS.map((row, idx, arr) => (
          <div
            key={row.label}
            className={`flex flex-col sm:flex-row ${idx !== arr.length - 1 ? "border-b border-black" : ""}`}
          >
            <div className="sm:w-[60%] p-2 border-b sm:border-b-0 sm:border-r border-black text-justify leading-relaxed">
              {row.text}
            </div>
            <div className="sm:w-[40%] p-2 flex flex-col justify-end gap-2">
              <span className="text-[10px] sm:text-xs">{row.label}</span>
              <input
                type="text"
                className="w-full border-b border-black bg-transparent focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportCardForm;