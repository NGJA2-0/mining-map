import { useMemo } from "react";

const cellInputClass =
  "w-full rounded-md border border-line bg-base px-2 py-1.5 font-sinhala text-sm text-ink outline-none transition focus:border-teal focus:ring-1 focus:ring-teal";

export default function GemSaleDetailsTable({ value, onChange }) {
  const { privateValue = "", auctionValue = "" } = value || {};

  const total = useMemo(() => {
    const p = parseFloat(privateValue) || 0;
    const a = parseFloat(auctionValue) || 0;
    return (p + a).toLocaleString("en-LK");
  }, [privateValue, auctionValue]);

  const update = (field) => (e) => {
    onChange({ ...value, [field]: e.target.value });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="bg-teal/10 px-4 py-2 text-center font-sinhala text-sm font-semibold text-ink">
        පසුගිය මාස 12 තුළ විකුණූ මැණික් සම්බන්ධ විස්තර
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-t border-line">
            <th className="border-r border-line px-4 py-2 font-sinhala text-sm font-medium text-ink-muted">
              විකිණීමේ ස්වභාවය (පුද්ගලික/වෙන්දේසි)
            </th>
            <th className="px-4 py-2 font-sinhala text-sm font-medium text-ink-muted">
              විකුණුම් වටිනාකම (රු.)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-line">
            <td className="border-r border-line px-4 py-2 font-sinhala text-sm text-ink">පුද්ගලික</td>
            <td className="px-4 py-2">
              <input type="number" className={cellInputClass} value={privateValue} onChange={update("privateValue")} />
            </td>
          </tr>
          <tr className="border-t border-line">
            <td className="border-r border-line px-4 py-2 font-sinhala text-sm text-ink">වෙන්දේසි</td>
            <td className="px-4 py-2">
              <input type="number" className={cellInputClass} value={auctionValue} onChange={update("auctionValue")} />
            </td>
          </tr>
          <tr className="border-t border-line bg-base/60">
            <td className="border-r border-line px-4 py-2 font-sinhala text-sm font-semibold text-ink">මුළු එකතුව</td>
            <td className="px-4 py-2 font-mono text-sm font-semibold text-ink">{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}