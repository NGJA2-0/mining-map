import React, { useRef } from 'react';

// Sinhala grapheme clustering: keeps consonant + virama + ZWJ + ර/ය
// (rakaransaya/yansaya conjuncts, e.g. ප්‍ර, ද්‍ර) fused as one unit,
// since Intl.Segmenter doesn't reliably preserve these across browsers.
const SINHALA_BASE = '\u0D85-\u0D96\u0D9A-\u0DC6\u0DCE';
const SINHALA_VOWEL_SIGN = '\u0DCF-\u0DDF\u0DF2\u0DF3';
const SINHALA_VIRAMA = '\u0DCA';
const ZWJ = '\u200D';
const SIGN = '\u0D82\u0D83';

const GRAPHEME_REGEX = new RegExp(
  `[${SINHALA_BASE}](?:${SINHALA_VIRAMA}${ZWJ}[${SINHALA_BASE}])*(?:${SINHALA_VIRAMA})?(?:[${SINHALA_VOWEL_SIGN}])?[${SIGN}]?|.`,
  'gu'
);

const splitGraphemes = (text) => text.match(GRAPHEME_REGEX) || [];

const CharGrid = ({
  length,
  rows = 1,
  className = "",
  example = "",
  fitWidth = false,
  readOnly = false,
}) => {
  // Splits the example text across rows, `length` characters per row
  const exampleRows = example
    ? Array.from({ length: rows }).map((_, r) => example.slice(r * length, r * length + length))
    : [];

  // Flat ref array so we can jump focus between boxes, including across rows
  const inputRefs = useRef([]);
  const totalBoxes = rows * length;

  // Tracks which boxes currently hold a character, so filled boxes can be styled differently
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
    // Keep the last visual character together, including Sinhala conjuncts
    // like ප්‍ර / ද්‍ර that Intl.Segmenter doesn't reliably preserve.
    const graphemes = splitGraphemes(e.target.value);
    const val = graphemes[graphemes.length - 1] ?? '';
    e.target.value = val;
    setBoxFilled(index, val.length > 0);
    if (val && index < totalBoxes - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    const target = e.target;
    if (e.key === 'Backspace' && !target.value && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
      const prev = inputRefs.current[index - 1];
      if (prev) prev.value = '';
      setBoxFilled(index - 1, false);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < totalBoxes - 1) {
      e.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    // Strip whitespace/newlines so pasted names/numbers fill boxes cleanly
    const cleaned = pasted.replace(/\s/g, '');
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
      newlyFilled.forEach((i) => { next[i] = true; });
      return next;
    });

    // Move focus to the box right after the last one filled, or stay on the last box if at the end
    const nextIndex = Math.min(lastFilledIndex + 1, totalBoxes - 1);
    focusBox(nextIndex);
  };



  return (
    <div className={`flex flex-col py-1 ${fitWidth ? '' : 'overflow-x-auto'} ${className}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={fitWidth ? "grid" : "flex min-w-max"}
          style={fitWidth ? { gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` } : undefined}
        >
          {Array.from({ length }).map((_, i) => {
            const char = exampleRows[r]?.[i];
            const flatIndex = r * length + i;
                        const isFilled = !readOnly && filled[flatIndex];
            return (
              <input
                key={i}
                ref={(el) => { if (!readOnly) inputRefs.current[flatIndex] = el; }}
                maxLength={1}
                readOnly={readOnly}
                tabIndex={readOnly ? -1 : 0}
                value={readOnly ? (char && char !== " " ? char : "") : undefined}
                onChange={readOnly ? undefined : (e) => handleChange(flatIndex, e)}
                onKeyDown={readOnly ? undefined : (e) => handleKeyDown(flatIndex, e)}
                onPaste={readOnly ? undefined : (e) => handlePaste(flatIndex, e)}
                onFocus={readOnly ? undefined : (e) => e.target.select()}
                className={`
                  font-sinhala p-0 leading-none
                  ${fitWidth ? "w-full min-w-0 aspect-square text-xs sm:text-sm" : "w-5 sm:w-6 h-6 sm:h-7 text-xs sm:text-sm"}
                  text-center uppercase focus:outline-none font-medium
                  transition-all duration-150 ease-out relative z-0 focus:z-10
                  ${i > 0 ? '-ml-px' : ''} ${r > 0 ? '-mt-px' : ''}
                  ${readOnly
                    ? 'border border-black bg-gray-50 text-gray-500 cursor-default'
                    : isFilled
                      ? 'border border-slate-300 bg-slate-50 text-slate-900 font-semibold shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:border-blue-400 focus:bg-blue-50 focus:shadow-[0_0_0_2px_rgba(96,165,250,0.35)]'
                      : 'border border-black bg-white text-black focus:bg-blue-100 focus:border-blue-400 focus:shadow-[0_0_0_2px_rgba(96,165,250,0.35)]'
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

const MiniSahanaForm = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
    <h1 className="text-lg sm:text-xl font-bold mb-1 flex flex-wrap items-baseline gap-1">
      <span>මිණිපහන ශිෂ්‍යත්ව අයදුම්පත -20</span>
      <input
        type="text"
        maxLength={1}
        inputMode="numeric"
        aria-label="අවුරුද්ද - පළමු අංකය"
        className="w-6 sm:w-7 border-b-2 border-black text-center focus:outline-none focus:bg-blue-100 bg-transparent"
      />
      <input
        type="text"
        maxLength={1}
        inputMode="numeric"
        aria-label="අවුරුද්ද - දෙවන අංකය"
        className="w-6 sm:w-7 border-b-2 border-black text-center focus:outline-none focus:bg-blue-100 bg-transparent"
      />
    </h1>
    <h2 className="text-base font-semibold">ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය</h2>
  </div>
  <input
    type="text"
    placeholder="කාර්යාලීය ප්‍රයෝජනය සඳහා"
    className="border border-black p-2 w-full sm:w-48 text-center text-xs focus:outline-none focus:bg-blue-100 cursor-text"
  />
      </div>

      {/* Main Form Container */}
      <div className="border-2 border-black flex flex-col text-xs sm:text-sm">
        
        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            1. අයදුම්කරුගේ සම්පූර්ණ නම (ශිෂ්‍ය/ශිෂ්‍යාව)
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            2. සම්පූර්ණ නම (ඉංග්‍රීසි කැපිටල් අකුරෙන්)(නමේ කොටස් අතර එක් කොටුවක් හිස්ව තබමින් එක් අකුරකට එක් කොටුවක් භාවිතා කරන්න.)
          </div>
          <div className="sm:w-[75%] p-2 flex flex-col gap-2">
            {/* Example reference row - read only, shown as a guide */}
            <div>
                <span className="text-[10px] sm:text-xs text-gray-500 italic block mb-0.5">උදාහරණය / Example:</span>
                <CharGrid length={32} rows={2} example="GAMAGE ARUNA DE SILVA" fitWidth readOnly />
            </div>
            {/* Actual input rows for the applicant to fill */}
            <CharGrid length={32} rows={2} fitWidth />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            3. මුලකුරු සමඟ නම ඉංග්‍රීසියෙන්
          </div>
          <div className="sm:w-[75%] p-2">
            <CharGrid length={32} rows={2} fitWidth />
          </div>
        </div>

        {/* Row 4 & 5 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[60%] flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              4. උපන් දිනය (DD/MM/YYYY)
            </div>
            <div className="sm:w-1/2 p-2 flex flex-wrap items-center gap-1 sm:gap-2">
              <CharGrid length={2} /> <CharGrid length={2} /> <CharGrid length={4} />
            </div>
          </div>
          <div className="sm:w-[40%] flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              5. ස්ත්‍රී/පුරුෂ
            </div>
            <div className="sm:w-[55%] p-2 flex items-center justify-around">
               <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" /> ස්ත්‍රී</label>
               <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" /> පුරුෂ</label>
            </div>
          </div>
        </div>

        {/* Row 6 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            6. ඉගෙනුම ලබන පාසල
          </div>

          <div className="sm:w-[60%] p-2">
            
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Row 7 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            7. ඉගෙනුම ලබන ශ්‍රේණිය
          </div>
          <div className="sm:w-[60%] flex flex-row flex-wrap w-full">
            {['6 වසර', '7 වසර', '8 වසර', '9 වසර', '10 වසර', '11 වසර', '12 වසර', '13 වසර'].map((grade, idx, arr) => (
              <div key={idx} className={`w-[25%] sm:w-[12.5%] flex flex-col ${idx !== arr.length - 1 ? 'border-r border-black' : ''}`}>
                <div className="p-1 text-center text-[10px] sm:text-xs font-medium border-b border-black h-10 flex items-center justify-center whitespace-nowrap">{grade}</div>
                <div className="p-2 flex-1 flex items-center justify-center">
                  <input type="radio" name="grade" className="w-4 h-4 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 8 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            8. පාසලේ ලිපිනය සහ දුරකථන අංකය
          </div>
          <div className="sm:w-[60%] p-2">
            <textarea className="w-full h-16 focus:outline-none bg-transparent resize-none" />
          </div>
        </div>

        {/* Row 9 (Header) */}
        <div className="border-b border-black p-2 font-medium bg-gray-50 text-sm">
          9. ශිෂ්‍යත්ව මුදල් බැර කිරීම සඳහා ආසන්නතම ලංකා බැංකු ශාඛාවේ අයදුම්කරුගේ නමින් විවෘත කරන ලද ළමා ඉතුරුම් ගිණුම විස්තර 
          <span className="font-bold"> ( *** වැදගත් - මෙය අනිවාර්යයෙන් සම්පූර්ණ කළ යුතු වන අතර පාස් පොතෙහි පැහැදිලි ඡායා පිටපතක් මේ සමග අමුණා එවිය යුතුය. )</span>
        </div>

        {/* Row 10 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            10. ගිණුමේ සඳහන් ආකාරයට නම (පාස් පොතෙහි සඳහන් නම)
          </div>
          <div className="sm:w-[75%] p-2">
             <CharGrid length={32} rows={2} fitWidth />
          </div>
        </div>

        {/* Row 11 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            11. ලංකා බැංකු ශාඛාව
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Row 12 */}
         <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            12. ගිණුම් අංකය
          </div>
          <div className="sm:w-[60%] p-2">
            <CharGrid length={20} fitWidth />
          </div>
        </div>

        {/* Row 13 - Eligibility Header */}
        <div className="border-b border-black p-2 font-medium bg-gray-50">
          13. ඔබ කුමන කාණ්ඩයක් යටතේ මෙම වැඩසටහනට අයත් වන්නේද?
        </div>

        {/* Row 13 Options */}
        <div className="flex flex-col border-b border-black">
          {[
            { id: 'a', text: 'a) මැණික් පතල් කර්මාන්තයේ නියැලෙන්නෙකුගේ දරුවෙකි.' },
            { id: 'b', text: 'b) මැණික් පතල් කර්මාන්තය සිදු කෙරෙන ප්‍රදේශ ආශ්‍රිතව ජීවත්වන්නෙකි.' },
            { id: 'c', text: 'c) ජාතික මට්ටමෙන් විශේෂ දක්ෂතා දැක්වූ දරුවෙකි.' }
          ].map((item, idx, arr) => (
            <div key={item.id} className={`flex flex-row ${idx !== arr.length - 1 ? 'border-b border-black' : ''}`}>
              <div className="w-[85%] sm:w-[90%] p-2 border-r border-black">{item.text}</div>
              <div className="w-[15%] sm:w-[10%] flex items-center justify-center p-2">
                <input type="checkbox" className="w-5 h-5 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* Row 14 - Parent Info Header */}
        <div className="border-b border-black p-2 font-medium bg-gray-50">
          14. දෙමාපිය/භාරකරු පිළිබඳ තොරතුරු
        </div>

        {/* Row 15 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            15. මව/පියා/භාරකරුගේ නම
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Row 16 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            16. ස්ථීර ලිපිනය
          </div>
          <div className="sm:w-[60%] p-2">
            <textarea className="w-full h-12 focus:outline-none bg-transparent resize-none" />
          </div>
        </div>

        {/* Row 17 & 18 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                17. දුරකථන අංකය
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="tel" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                18. ජාතික හැඳුනුම්පත් අංකය
              </div>
              <div className="sm:w-[55%] p-2">
                 <CharGrid length={12} fitWidth />
              </div>
           </div>
        </div>

        {/* Row 19 & 20 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                19. වයස
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                20. රැකියාව
              </div>
              <div className="sm:w-[55%] p-2">
                 <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
        </div>

        {/* Row 21 & 22 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                21. මාසික ආදායම
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                22. විවාහක/අවිවාහක
              </div>
              <div className="sm:w-[55%] p-2 flex items-center justify-around">
                 <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="marital" /> විවාහක</label>
                 <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="marital" /> අවිවාහක</label>
              </div>
           </div>
        </div>

        {/* Row 23 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            23. ස්වාමිපුරුෂයා/බිරිඳගේ නම
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Row 24 & 25 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-2/3 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                24. රැකියාව
              </div>
              <div className="sm:w-[60%] sm:w-1/2 p-2">
                 <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
           <div className="sm:w-1/3 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                25. දරුවන් ගණන
              </div>
              <div className="sm:w-[55%] p-2">
                 <input type="number" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
        </div>

        {/* Row 26 & 27 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                26. බලපත්‍ර අංකය
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                27. ලිපිගොනු අංකය
              </div>
              <div className="sm:w-[55%] p-2">
                 <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
              </div>
           </div>
        </div>

        {/* Row 28 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            28. බලපත්‍රයට අදාළ ප්‍රාදේශීය කාර්යාලය හා කලාපය
          </div>
          <div className="sm:w-1/2 p-2">
            <input type="text" className="w-full h-full focus:outline-none bg-transparent" />
          </div>
        </div>

        {/* Attachments Table */}
        <div className="flex flex-col text-sm border-b border-black">
           <div className="flex flex-row border-b border-black font-medium bg-gray-50 text-center text-xs sm:text-sm">
             <div className="w-[10%] p-2 border-r border-black flex items-center justify-center">අංකය</div>
             <div className="w-[50%] p-2 border-r border-black text-left flex items-center">ඇමුණුම</div>
             <div className="w-[13.3%] p-2 border-r border-black flex items-center justify-center">ඇත</div>
             <div className="w-[13.3%] p-2 border-r border-black flex items-center justify-center">නැත</div>
             <div className="w-[13.3%] p-2 flex items-center justify-center">වෙනත්</div>
           </div>
           
           <div className="flex flex-row border-b border-black text-xs sm:text-sm">
             <div className="w-[10%] p-2 border-r border-black flex items-center justify-center">01</div>
             <div className="w-[50%] p-2 border-r border-black">බැංකු පාස් පොතෙහි ගිණුම් අංකය පැහැදිලිව පෙනෙන සේ ගන්නා ලද පිටපතක්.</div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 flex justify-center items-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></div>
           </div>

           <div className="flex flex-row text-xs sm:text-sm">
             <div className="w-[10%] p-2 border-r border-black flex items-center justify-center">02</div>
             <div className="w-[50%] p-2 border-r border-black">ග්‍රාම නිලධාරී සහතික කරන ලද උප්පැන්න සහතිකයේ පිටපතක්</div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 flex justify-center items-center"><input type="checkbox" className="w-4 h-4 cursor-pointer" /></div>
           </div>
        </div>

        {/* Declaration */}
        <div className="p-4 sm:p-8 flex flex-col gap-12 bg-white">
          <p className="font-medium">ඉහත දක්වා ඇති තොරතුරු සත්‍ය තොරතුරු බව සනාථ කරමි.</p>
          
          <div className="flex flex-row justify-between pt-8 px-4 sm:px-12">
             <div className="flex flex-col items-center">
                <div className="border-b-2 border-dotted border-black w-32 sm:w-56 mb-2"></div>
                <span className="text-sm">අයදුම්කරුගේ අත්සන</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="border-b-2 border-dotted border-black w-24 sm:w-40 mb-2"></div>
                <span className="text-sm">දිනය</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MiniSahanaForm;