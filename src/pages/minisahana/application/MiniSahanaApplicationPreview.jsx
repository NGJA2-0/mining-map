import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // adjust path if your context lives elsewhere

// ─────────────────────────── Sinhala grapheme splitting (same as MiniSahanaForm) ───────────────────────────
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

// ─────────────────────────── Read-only grid (visual clone of CharGrid, no editing) ───────────────────────────
const ReadOnlyGrid = ({ length, rows = 1, value = '' }) => {
  const graphemes = splitGraphemes(value || '');
  const totalBoxes = rows * length;
  const chars = Array.from({ length: totalBoxes }, (_, i) => graphemes[i] ?? '');

  return (
    <div className="flex flex-col py-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
          {Array.from({ length }).map((_, i) => {
            const flatIndex = r * length + i;
            const char = chars[flatIndex];
            return (
              <div
                key={i}
                className={`
                  font-sinhala p-0 leading-none w-full min-w-0 aspect-square text-xs sm:text-sm
                  flex items-center justify-center uppercase font-medium
                  border border-black bg-gray-50 text-gray-700
                  ${i > 0 ? '-ml-px' : ''} ${r > 0 ? '-mt-px' : ''}
                `}
              >
                {char && char !== ' ' ? char : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ReadOnlyField = ({ value, multiline = false }) => (
  <div
    className={`w-full h-full bg-gray-50 text-gray-700 px-1 ${multiline ? 'whitespace-pre-wrap min-h-[3rem]' : 'truncate'}`}
  >
    {value || <span className="text-gray-400">—</span>}
  </div>
);

const MiniSahanaApplicationPreview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [record, setRecord] = useState(location.state?.record ?? null);
  const [loading, setLoading] = useState(!location.state?.record);
  const [error, setError] = useState('');

  // If the page was opened directly (or refreshed) without router state,
  // fall back to fetching the record by id.
  useEffect(() => {
    if (record) return;

    if (!token) {
      navigate('/login');
      return;
    }

    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError('');
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${API_BASE_URL}/api/mini-sahana-form/${id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error('Failed to load application');

        const data = await res.json();
        setRecord(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err);
          setError("මෙම අයදුම්පත ලබාගැනීමට නොහැකි විය. (Couldn't load this application.)");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, token, record, logout, navigate]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center text-gray-500">
        පූරණය වෙමින්... (Loading...)
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Application not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/minisahana/dashboard')}
          className="bg-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>
    );
  }

  // ── derive display values from the API response shape ──
  const nameMatch = (record.applicantFullNameSinhala || '').match(/^(.*)\s\((.*)\)\s*$/);
  const applicantName = nameMatch ? nameMatch[1] : record.applicantFullNameSinhala;
  const applicantTitle = nameMatch ? nameMatch[2] : '';

  const [dobYear = '', dobMonth = '', dobDay = ''] = (record.dateOfBirth || '').split('-');
  const yearDigits = String(record.year || '').slice(-2);

  const genderLabel = record.gender === 'female' ? 'ස්ත්‍රී' : record.gender === 'male' ? 'පුරුෂ' : '';
  const maritalLabel = record.maritalStatus === 'married' ? 'විවාහක' : record.maritalStatus === 'unmarried' ? 'අවිවාහක' : '';

  const attachment1 =
    record.attachments?.bankPassbookCopy === 'Yes' ? 'has' :
    record.attachments?.bankPassbookCopy === 'No' ? 'no' : 'other';
  const attachment2 =
    record.attachments?.birthCertificateCopy === 'Yes' ? 'has' :
    record.attachments?.birthCertificateCopy === 'No' ? 'no' : 'other';

  const categories = record.eligibilityCategory || [];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala">
      {/* Back bar */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/minisahana/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
        >
          ← ආපසු (Back)
        </button>
        <span className="text-xs text-gray-400">
          {record.refNumber ? `Ref: ${record.refNumber}` : ''}
          {record.createdBy ? ` · Created by ${record.createdBy}` : ''}
          {record.createdAt ? ` · ${new Date(record.createdAt).toLocaleDateString()}` : ''}
        </span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1 flex flex-wrap items-baseline gap-1">
            <span>මිණිපහන ශිෂ්‍යත්ව අයදුම්පත -20</span>
            <span className="flex items-baseline">
              <span className="w-3 sm:w-3.5 border-b-2 border-black text-center inline-block">{yearDigits[0] || ''}</span>
              <span className="w-3 sm:w-3.5 border-b-2 border-black text-center inline-block">{yearDigits[1] || ''}</span>
            </span>
          </h1>
          <h2 className="text-base font-semibold">ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය</h2>
        </div>
        <div className="border border-black p-2 w-full sm:w-48 text-center text-xs bg-gray-50 text-gray-700">
          {record.refNumber || 'කාර්යාලීය ප්‍රයෝජනය සඳහා'}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="border-2 border-black flex flex-col text-xs sm:text-sm">

        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            1. අයදුම්කරුගේ සම්පූර්ණ නම ({applicantTitle})
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyField value={applicantName} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            2. සම්පූර්ණ නම (ඉංග්‍රීසි කැපිටල් අකුරෙන්)
          </div>
          <div className="sm:w-[75%] p-2">
            <ReadOnlyGrid length={32} rows={2} value={record.applicantFullNameEnglish} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            3. මුලකුරු සමඟ නම ඉංග්‍රීසියෙන්
          </div>
          <div className="sm:w-[75%] p-2">
            <ReadOnlyGrid length={32} rows={2} value={record.nameWithInitialsEnglish} />
          </div>
        </div>

        {/* Row 4 & 5 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[60%] flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              4. උපන් දිනය (DD/MM/YYYY)
            </div>
            <div className="sm:w-1/2 p-2 flex flex-wrap items-center gap-1 sm:gap-2">
              <ReadOnlyGrid length={2} value={dobDay} />
              <ReadOnlyGrid length={2} value={dobMonth} />
              <ReadOnlyGrid length={4} value={dobYear} />
            </div>
          </div>
          <div className="sm:w-[40%] flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              5. ස්ත්‍රී/පුරුෂ
            </div>
            <div className="sm:w-[55%] p-2 flex items-center justify-around">
              <label className="flex items-center gap-1"><input type="radio" checked={record.gender === 'female'} disabled /> ස්ත්‍රී</label>
              <label className="flex items-center gap-1"><input type="radio" checked={record.gender === 'male'} disabled /> පුරුෂ</label>
            </div>
          </div>
        </div>

        {/* Row 6 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            6. ඉගෙනුම ලබන පාසල
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyField value={record.school} />
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
                  <input type="radio" checked={record.grade === grade} disabled className="w-4 h-4" />
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
            <ReadOnlyField value={record.schoolAddressAndPhone} multiline />
          </div>
        </div>

        {/* Row 9 (Header) */}
        <div className="border-b border-black p-2 font-medium bg-gray-50 text-sm">
          9. ශිෂ්‍යත්ව මුදල් බැර කිරීම සඳහා ළමා ඉතුරුම් ගිණුම විස්තර
        </div>

        {/* Row 10 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            10. ගිණුමේ සඳහන් ආකාරයට නම
          </div>
          <div className="sm:w-[75%] p-2">
            <ReadOnlyGrid length={32} rows={2} value={record.bankAccountName} />
          </div>
        </div>

        {/* Row 11 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            11. ලංකා බැංකු ශාඛාව
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyField value={record.bankBranch} />
          </div>
        </div>

        {/* Row 12 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            12. ගිණුම් අංකය
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyGrid length={20} value={record.bankAccountNumber} />
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
                <input type="checkbox" checked={categories.includes(item.id)} disabled className="w-5 h-5" />
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
            15. {record.parentGuardianRelation}ගේ නම
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyField value={record.parentGuardianName} />
          </div>
        </div>

        {/* Row 16 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            16. ස්ථීර ලිපිනය
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyField value={record.permanentAddress} multiline />
          </div>
        </div>

        {/* Row 17 & 18 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              17. දුරකථන අංකය
            </div>
            <div className="sm:w-[60%] p-2">
              <ReadOnlyField value={record.phoneNumber} />
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              18. ජාතික හැඳුනුම්පත් අංකය
            </div>
            <div className="sm:w-[55%] p-2">
              <ReadOnlyGrid length={12} value={record.nic} />
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
              <ReadOnlyField value={record.age} />
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              20. රැකියාව
            </div>
            <div className="sm:w-[55%] p-2">
              <ReadOnlyField value={record.occupation} />
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
              <ReadOnlyField value={record.monthlyIncome} />
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              22. විවාහක/අවිවාහක
            </div>
            <div className="sm:w-[55%] p-2 flex items-center justify-around">
              <label className="flex items-center gap-1"><input type="radio" checked={record.maritalStatus === 'married'} disabled /> විවාහක</label>
              <label className="flex items-center gap-1"><input type="radio" checked={record.maritalStatus === 'unmarried'} disabled /> අවිවාහක</label>
            </div>
          </div>
        </div>

        {/* Row 23 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            23. {record.spouseRelation && record.spouseRelation !== 'N/A' ? record.spouseRelation : 'ස්වාමිපුරුෂයා/බිරිඳ'}ගේ නම
          </div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyField value={record.spouseName !== 'N/A' ? record.spouseName : ''} />
          </div>
        </div>

        {/* Row 24 & 25 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-2/3 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              24. රැකියාව
            </div>
            <div className="sm:w-1/2 p-2">
              <ReadOnlyField value={record.spouseOccupation !== 'N/A' ? record.spouseOccupation : ''} />
            </div>
          </div>
          <div className="sm:w-1/3 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              25. දරුවන් ගණන
            </div>
            <div className="sm:w-[55%] p-2">
              <ReadOnlyField value={record.childrenCount} />
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
              <ReadOnlyField value={record.licenseNumber} />
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              27. ලිපිගොනු අංකය
            </div>
            <div className="sm:w-[55%] p-2">
              <ReadOnlyField value={record.fileNumber} />
            </div>
          </div>
        </div>

        {/* Row 28 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            28. බලපත්‍රයට අදාළ ප්‍රාදේශීය කාර්යාලය හා කලාපය
          </div>
          <div className="sm:w-1/2 p-2">
            <ReadOnlyField value={record.licenseRegionalOfficeAndZone} />
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
            <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" checked={attachment1 === 'has'} disabled /></div>
            <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" checked={attachment1 === 'no'} disabled /></div>
            <div className="w-[13.3%] p-2 flex justify-center items-center"><input type="radio" checked={attachment1 === 'other'} disabled /></div>
          </div>

          <div className="flex flex-row text-xs sm:text-sm">
            <div className="w-[10%] p-2 border-r border-black flex items-center justify-center">02</div>
            <div className="w-[50%] p-2 border-r border-black">ග්‍රාම නිලධාරී සහතික කරන ලද උප්පැන්න සහතිකයේ පිටපතක්</div>
            <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" checked={attachment2 === 'has'} disabled /></div>
            <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" checked={attachment2 === 'no'} disabled /></div>
            <div className="w-[13.3%] p-2 flex justify-center items-center"><input type="radio" checked={attachment2 === 'other'} disabled /></div>
          </div>
        </div>

        {/* Declaration */}
        <div className="p-4 sm:p-8 flex flex-col gap-6 bg-white">
          <p className="font-medium">
            {record.declarationSigned
              ? 'ඉහත දක්වා ඇති තොරතුරු සත්‍ය තොරතුරු බව සනාථ කර ඇත.'
              : 'ප්‍රකාශය තහවුරු කර නොමැත.'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default MiniSahanaApplicationPreview;