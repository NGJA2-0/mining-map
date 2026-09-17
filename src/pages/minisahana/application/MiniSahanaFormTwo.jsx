import React, { useState } from "react";

const Blank = ({ widthClass = "w-32 sm:w-48" }) => (
  <input
    type="text"
    className={`inline-block ${widthClass} border-b border-black bg-transparent focus:outline-none focus:bg-blue-100 mx-1 px-1 text-center`}
  />
);

const ToggleStrike = ({ children }) => {
  const [struck, setStruck] = useState(false);
  return (
    <span
      onClick={() => setStruck(!struck)}
      className={`cursor-pointer select-none ${
        struck ? "line-through text-gray-400" : ""
      }`}
    >
      {children}
    </span>
  );
};

const SignatureBlock = ({ label, sub, align = "left", widthClass = "w-48 sm:w-64" }) => (
  <div
    className={`flex flex-col ${
      align === "right" ? "items-start sm:items-end sm:text-right" : "items-start"
    }`}
  >
    <div className={`border-b-2 border-dotted border-black ${widthClass} mb-1`}></div>
    <span className="text-xs sm:text-sm">{label}</span>
    {sub && <span className="text-xs sm:text-sm">{sub}</span>}
  </div>
);

const MiniSahanaFormTwo = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala text-sm sm:text-base">
      {/* Paragraph 1 */}
      <p className="text-justify leading-relaxed mb-8">
        ඉහත නම සඳහන් <ToggleStrike>ශිෂ්‍ය</ToggleStrike>/<ToggleStrike>ශිෂ්‍යාව</ToggleStrike>{" "}
        <Blank widthClass="w-32 sm:w-56" /> දින වන විට මෙම පාසලේ{" "}
        <Blank widthClass="w-32 sm:w-56" /> ශ්‍රේණියේ ඉගෙනුම ලබන බව සනාථ කරන අතර{" "}
        <ToggleStrike>ඇයට</ToggleStrike>/<ToggleStrike>ඔහුට</ToggleStrike> මෙම
        වැඩසටහන යටතේ ශිෂ්‍යත්වයක් ලබාදීම සුදුසු බවට නිර්දේශ කරමි.
      </p>

      {/* Class teacher & principal recommendations */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-8 mb-8">
        <SignatureBlock
          label="පන්තිභාර ගුරුතුමාගේ/ගුරුතුමියගේ නිර්දේශය"
          sub="(අත්සන හා දිනය)"
        />
        <SignatureBlock
          label="විදුහල්පතිතුමාගේ නිර්දේශය"
          sub="(අත්සන/ දිනය හා නිල මුද්‍රාව)"
          align="right"
        />
      </div>

      {/* Category b note */}
      <p className="font-medium mb-8">
        ඉහත b කාණ්ඩය යටතේ මෙම වැඩසටහනට අයදුම්පත් ඉදිරිපත් කරන්නන් හට පමණි.
      </p>

      {/* Grama Niladari section */}
      <h3 className="font-semibold mb-2">ග්‍රාම නිලධාරී නිර්දේශය</h3>
      <p className="text-justify leading-relaxed mb-6">
        ඉහත නම සඳහන් ශිෂ්‍යත්ව අයදුම්කරු මාගේ බලප්‍රදේශයේ ස්ථිර පදිංචි සිටින බවත් මැණික් පතල්
        ක්‍රියාත්මක වන ප්‍රදේශයක් ආශ්‍රිතව / ආසන්නයේ ජීවත්වන බවත් සහතික කරමි.
      </p>

      <div className="mb-8">
        <SignatureBlock label="(අත්සන/ දිනය හා නිල මුද්‍රාව)" widthClass="w-56 sm:w-72" />
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-black mb-8" />

      {/* Office use section */}
      <h3 className="font-semibold mb-2">කාර්යාලීය ප්‍රයෝජනය සඳහා</h3>
      <p className="text-justify leading-relaxed mb-8">
        ඉහත අයදුම්පතෙහි අදාල සියලු තොරතුරු නිසි ආකාරයෙන් සම්පූර්ණ කොට{" "}
        <ToggleStrike>ඇති</ToggleStrike>/<ToggleStrike>නැති</ToggleStrike> බැවින්
        ක්‍රියාත්මක නිලධාරී නිර්දේශය සඳහා ඉදිරිපත්{" "}
        <ToggleStrike>කරමි</ToggleStrike>/<ToggleStrike>නොකරමි</ToggleStrike>.
      </p>

      <h3 className="font-semibold mb-2">පරීක්ෂා කළෙමි (වි.ලි)</h3>
      <p className="text-justify leading-relaxed mb-8">
        ඉහත අයදුම්කරු මැණික් පතල් කර්මාන්තයේ නියැලෙන්නෙකුගේ දරුවෙක් වන අතර ඉහත සඳහන් අංක දරණ
        බලපත්‍රය යටතේ පියා රැකියාවේ නියුතුවන බව සහතික කරමින් අදාල අයදුම්පත ශිෂ්‍යත්ව වැඩසටහන
        සඳහා ඇතුලත් කිරීම සුදුසු බව නිර්දේශ කරමි.
      </p>

      {/* Special notes */}
      <div className="mb-8">
        <h3 className="font-semibold mb-3">විශේෂ සටහන් (ඇත්නම් පමණි)</h3>
        <div className="flex flex-col gap-5">
          <input
            type="text"
            className="w-full border-b border-dotted border-black bg-transparent focus:outline-none focus:bg-blue-100 pb-1"
          />
          <input
            type="text"
            className="w-full border-b border-dotted border-black bg-transparent focus:outline-none focus:bg-blue-100 pb-1"
          />
        </div>
      </div>

      <div className="mb-8">
        <SignatureBlock
          label="ක්‍රියාත්මක නිලධාරී නිර්දේශය"
          sub="(අත්සන/ දිනය හා නිල මුද්‍රාව)"
          widthClass="w-56 sm:w-72"
        />
      </div>

      {/* Final recommendation line */}
      <p className="text-justify leading-relaxed mb-8">
        මෙම අයදුම්පත මිණි සහන ශිෂ්‍යත්ව වැඩසටහන සඳහා
        <Blank widthClass="w-32 sm:w-56" />
        කාණ්ඩය යටතේ සලකා බැලීමට සුදුසු බව නිර්දේශ කරමි.
      </p>

      <div className="mb-4">
        <SignatureBlock
          label="නියෝජ්‍ය/සහකාර අධ්‍යක්ෂ (ක්‍රියාත්මක හා ප්‍රාදේශීය සංවර්ධන)"
          sub="(අත්සන/ දිනය හා නිල මුද්‍රාව)"
          widthClass="w-56 sm:w-72"
        />
      </div>
    </div>
  );
};

export default MiniSahanaFormTwo;