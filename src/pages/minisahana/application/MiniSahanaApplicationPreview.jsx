import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

// ─────────────────────────── Sinhala grapheme splitting ───────────────────────────
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

// ─────────────────────────── Read-only grid (view mode) ───────────────────────────
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
              <div key={i} className={`font-sinhala p-0 leading-none w-full min-w-0 aspect-square text-xs sm:text-sm flex items-center justify-center uppercase font-medium border border-black bg-gray-50 text-gray-700 ${i > 0 ? '-ml-px' : ''} ${r > 0 ? '-mt-px' : ''}`}>
                {char && char !== ' ' ? char : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────── Editable grid (edit mode) ───────────────────────────
const EditableGrid = ({ length, rows = 1, value = '', onChange, error = false }) => {
  const inputRefs = useRef([]);
  const totalBoxes = rows * length;

  const chars = useMemo(() => {
    const parsed = splitGraphemes(value || '');
    const arr = Array(totalBoxes).fill('');
    parsed.forEach((c, i) => { if (i < totalBoxes) arr[i] = c === ' ' ? '' : c; });
    return arr;
  }, [value, totalBoxes]);

  const focusBox = (index) => inputRefs.current[index]?.focus();

  const handleChange = (index, e) => {
    const graphemes = splitGraphemes(e.target.value);
    const val = graphemes[graphemes.length - 1] ?? '';
    const newChars = [...chars];
    newChars[index] = val;
    onChange?.(newChars.map(c => c || ' ').join('').trimEnd());
    if (val && index < totalBoxes - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
      const newChars = [...chars];
      newChars[index - 1] = '';
      onChange?.(newChars.map(c => c || ' ').join('').trimEnd());
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
    const cleaned = e.clipboardData.getData('text').replace(/\s/g, '');
    const pastedChars = splitGraphemes(cleaned);
    if (pastedChars.length === 0) return;
    let lastFilledIndex = index;
    const newChars = [...chars];
    pastedChars.forEach((char, offset) => {
      const targetIndex = index + offset;
      if (targetIndex >= totalBoxes) return;
      newChars[targetIndex] = char;
      lastFilledIndex = targetIndex;
    });
    onChange?.(newChars.map(c => c || ' ').join('').trimEnd());
    focusBox(Math.min(lastFilledIndex + 1, totalBoxes - 1));
  };

  return (
    <div className={`flex flex-col py-1 ${error ? 'bg-red-50 p-1 rounded border border-red-500' : ''}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
          {Array.from({ length }).map((_, i) => {
            const flatIndex = r * length + i;
            const isFilled = chars[flatIndex] !== '';
            return (
              <input
                key={i}
                ref={(el) => { inputRefs.current[flatIndex] = el; }}
                maxLength={1}
                value={chars[flatIndex]}
                onChange={(e) => handleChange(flatIndex, e)}
                onKeyDown={(e) => handleKeyDown(flatIndex, e)}
                onPaste={(e) => handlePaste(flatIndex, e)}
                onFocus={(e) => e.target.select()}
                className={`font-sinhala p-0 leading-none w-full min-w-0 aspect-square text-xs sm:text-sm text-center uppercase focus:outline-none font-medium relative z-0 focus:z-10 ${i > 0 ? '-ml-px' : ''} ${r > 0 ? '-mt-px' : ''} ${isFilled ? 'border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-blue-400 focus:bg-blue-50' : 'border border-black bg-white text-black focus:bg-blue-100 focus:border-blue-400'}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const ReadOnlyField = ({ value, multiline = false }) => (
  <div className={`w-full h-full bg-gray-50 text-gray-700 px-1 ${multiline ? 'whitespace-pre-wrap min-h-[3rem]' : 'truncate'}`}>
    {value || <span className="text-gray-400">—</span>}
  </div>
);

// Toggle group (edit mode only — e.g. ශිෂ්‍ය/ශිෂ්‍යාව, මව/පියා/භාරකරු)
const ToggleStrikeGroup = ({ options, value, onChange, error }) => {
  const handleToggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(o => o !== opt));
    else onChange([...value, opt]);
  };
  return (
    <span className={`inline-flex items-center gap-1 ${error ? 'border border-red-500 bg-red-50 px-1 rounded' : ''}`}>
      {options.map((opt, idx) => {
        const isStruck = !value.includes(opt);
        return (
          <span key={opt} className="inline-flex items-center gap-1">
            <span onClick={() => onChange ? handleToggle(opt) : undefined} className={`cursor-pointer select-none ${isStruck ? 'line-through text-gray-400' : ''}`}>{opt}</span>
            {idx < options.length - 1 && <span>/</span>}
          </span>
        );
      })}
    </span>
  );
};

// Reverse-maps API record shape → editable form-field shape
const recordToFormData = (record) => {
  const nameMatch = (record.applicantFullNameSinhala || '').match(/^(.*)\s\((.*)\)\s*$/);
  const applicantName = nameMatch ? nameMatch[1] : record.applicantFullNameSinhala || '';
  const applicantTitle = nameMatch ? [nameMatch[2]] : ['ශිෂ්‍ය'];
  const [dobYear = '', dobMonth = '', dobDay = ''] = (record.dateOfBirth || '').split('-');
  const yearStr = String(record.year || '');
  const isMarried = record.maritalStatus === 'married';

  return {
    yearDigit1: yearStr.slice(-2, -1) || '',
    yearDigit2: yearStr.slice(-1) || '',
    applicantName,
    applicantTitle,
    nameEnglish: record.applicantFullNameEnglish || '',
    nameInitialsEnglish: record.nameWithInitialsEnglish || '',
    dobDay, dobMonth, dobYear,
    gender: record.gender || '',
    schoolName: record.school || '',
    grade: record.grade ? `${record.grade} වසර` : '',
    schoolAddressPhone: record.schoolAddressAndPhone || '',
    bankAccountName: record.bankAccountName || '',
    bankBranch: record.bankBranch || '',
    categoryA: (record.eligibilityCategory || []).includes('a'),
    categoryB: (record.eligibilityCategory || []).includes('b'),
    categoryC: (record.eligibilityCategory || []).includes('c'),
    parentType: [record.parentGuardianRelation || 'මව'],
    parentName: record.parentGuardianName || '',
    parentAddress: record.permanentAddress || '',
    parentPhone: record.phoneNumber || '',
    parentNIC: record.nic || '',
    parentAge: String(record.age ?? ''),
    parentOccupation: record.occupation || '',
    parentIncome: String(record.monthlyIncome ?? ''),
    parentMaritalStatus: record.maritalStatus || '',
    spouseType: [isMarried ? (record.spouseRelation || 'ස්වාමිපුරුෂයා') : 'ස්වාමිපුරුෂයා'],
    spouseName: isMarried ? (record.spouseName || '') : '',
    spouseOccupation: isMarried ? (record.spouseOccupation || '') : '',
    numberOfChildren: isMarried ? String(record.childrenCount ?? '') : '',
    licenseNumber: record.licenseNumber || '',
    fileNumber: record.fileNumber || '',
    regionalOffice: record.licenseRegionalOfficeAndZone || '',
  };
};

const GRADES = ['6 වසර', '7 වසර', '8 වසර', '9 වසර', '10 වසර', '11 වසර', '12 වසර', '13 වසර'];

const MiniSahanaApplicationPreview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const [record, setRecord] = useState(location.state?.record ?? null);
  const [loading, setLoading] = useState(!location.state?.record);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const yearDigit1Ref = useRef(null);
  const yearDigit2Ref = useRef(null);

  useEffect(() => {
    if (record) return;
    if (!token) { navigate('/login'); return; }
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
        if (res.status === 401) { logout(); navigate('/login'); return; }
        if (!res.ok) throw new Error('Failed to load application');
        setRecord(await res.json());
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
    return <div className="max-w-5xl mx-auto p-8 text-center text-gray-500">පූරණය වෙමින්... (Loading...)</div>;
  }

  if (error || !record) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-red-600 mb-4">{error || 'Application not found.'}</p>
        <button type="button" onClick={() => navigate('/minisahana/dashboard')} className="bg-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300">← Back</button>
      </div>
    );
  }

  const startEditing = () => {
    setFormData(recordToFormData(record));
    setErrors({});
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };
  const handleYearDigitChange = (e, nextRef, field) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    handleChange(field, digit);
    if (digit && nextRef?.current) nextRef.current.focus();
  };
  const handleYearDigitKeyDown = (e, prevRef) => {
    if (e.key === 'Backspace' && !e.target.value && prevRef?.current) prevRef.current.focus();
  };
  const handlePhoneChange = (e) => handleChange('parentPhone', e.target.value.replace(/[^\d+]/g, ''));
  const handleAgeChange = (e) => handleChange('parentAge', e.target.value.replace(/\D/g, ''));
  const handleNumberChildrenChange = (e) => handleChange('numberOfChildren', e.target.value.replace(/\D/g, ''));

  const handleSave = async () => {
    if (!token) { alert('ඔබගේ සැසිය අවසන් වී ඇත.'); navigate('/login'); return; }

    const newErrors = {};
    const checkRequired = (fields) => fields.forEach(f => {
      if (!formData[f] || String(formData[f]).trim() === '') newErrors[f] = true;
    });
    checkRequired([
      'yearDigit1', 'yearDigit2', 'applicantName', 'nameEnglish', 'nameInitialsEnglish',
      'dobDay', 'dobMonth', 'dobYear', 'gender', 'schoolName', 'grade', 'schoolAddressPhone',
      'bankAccountName', 'bankBranch', 'parentName', 'parentAddress', 'parentPhone', 'parentNIC',
      'parentAge', 'parentOccupation', 'parentIncome', 'parentMaritalStatus',
      'licenseNumber', 'fileNumber', 'regionalOffice'
    ]);
    if (formData.applicantTitle.length !== 1) newErrors.applicantTitle = true;
    if (formData.parentType.length !== 1) newErrors.parentType = true;
    const phoneRegex = /^(?:0|0094|\+94)[0-9]{9}$/;
    if (formData.parentPhone && !phoneRegex.test(formData.parentPhone)) newErrors.parentPhone = true;
    if (formData.parentMaritalStatus === 'married') {
      checkRequired(['spouseName', 'spouseOccupation', 'numberOfChildren']);
      if (formData.spouseType.length !== 1) newErrors.spouseType = true;
    }
    if (!formData.categoryA && !formData.categoryB && !formData.categoryC) newErrors.category = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('කරුණාකර සියලුම අනිවාර්ය ක්ෂේත්‍ර නිවැරදිව සම්පූර්ණ කරන්න.');
      return;
    }

    try {
      setSubmitting(true);
      const categories = [];
      if (formData.categoryA) categories.push('a');
      if (formData.categoryB) categories.push('b');
      if (formData.categoryC) categories.push('c');
      if (categories.length === 0) categories.push('none');

      const payload = {
        formType: 'MINI_SAHANA',
        year: `20${formData.yearDigit1}${formData.yearDigit2}`,
        applicantFullNameSinhala: `${formData.applicantName} (${formData.applicantTitle[0]})`,
        applicantFullNameEnglish: formData.nameEnglish,
        nameWithInitialsEnglish: formData.nameInitialsEnglish,
        dateOfBirth: `${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`,
        gender: formData.gender,
        school: formData.schoolName,
        grade: formData.grade.replace(' වසර', ''),
        schoolAddressAndPhone: formData.schoolAddressPhone,
        bankAccountName: formData.bankAccountName,
        bankBranch: formData.bankBranch,
        bankAccountNumber: record.bankAccountNumber, // locked — never edited here
        eligibilityCategory: categories,
        parentGuardianRelation: formData.parentType[0],
        parentGuardianName: formData.parentName,
        permanentAddress: formData.parentAddress,
        phoneNumber: formData.parentPhone,
        nic: formData.parentNIC,
        age: Number(formData.parentAge) || 0,
        occupation: formData.parentOccupation,
        monthlyIncome: Number(formData.parentIncome) || 0,
        maritalStatus: formData.parentMaritalStatus,
        spouseRelation: formData.parentMaritalStatus === 'married' && formData.spouseType.length > 0 ? formData.spouseType[0] : 'N/A',
        spouseName: formData.parentMaritalStatus === 'married' ? formData.spouseName : 'N/A',
        spouseOccupation: formData.parentMaritalStatus === 'married' ? formData.spouseOccupation : 'N/A',
        childrenCount: Number(formData.numberOfChildren) || 0,
        licenseNumber: formData.licenseNumber,
        fileNumber: formData.fileNumber,
        licenseRegionalOfficeAndZone: formData.regionalOffice,
        attachments: record.attachments || { bankPassbookCopy: 'Yes', birthCertificateCopy: 'Yes' },
        declarationSigned: true,
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/mini-sahana-form/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updated = await response.json();
        setRecord(prev => ({ ...prev, ...payload, refNumber: updated.refNumber, updatedBy: updated.updatedBy ?? prev.updatedBy }));
        setIsEditing(false);
        setFormData(null);
        alert('යාවත්කාලීන කරන ලදී! (Updated successfully!)');
      } else if (response.status === 401) {
        logout(); navigate('/login');
      } else {
        const errData = await response.json().catch(() => ({}));
        alert('යාවත්කාලීන කිරීමේ දෝෂයක්. (Update error.)\n' + (errData.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert('යාවත්කාලීන කිරීමේ දෝෂයක්. (Update error.)');
    } finally {
      setSubmitting(false);
    }
  };

  // ── derive display values ──
  const nameMatch = (record.applicantFullNameSinhala || '').match(/^(.*)\s\((.*)\)\s*$/);
  const applicantName = nameMatch ? nameMatch[1] : record.applicantFullNameSinhala;
  const applicantTitle = nameMatch ? nameMatch[2] : '';
  const [dobYear = '', dobMonth = '', dobDay = ''] = (record.dateOfBirth || '').split('-');
  const yearDigits = String(record.year || '').slice(-2);
  const attachment1 = record.attachments?.bankPassbookCopy === 'Yes' ? 'has' : record.attachments?.bankPassbookCopy === 'No' ? 'no' : 'other';
  const attachment2 = record.attachments?.birthCertificateCopy === 'Yes' ? 'has' : record.attachments?.birthCertificateCopy === 'No' ? 'no' : 'other';
  const categories = record.eligibilityCategory || [];
  const changes = record.changes ?? [];

  const FIELD_LABELS = {
    applicantFullNameSinhala: 'අයදුම්කරුගේ නම', applicantFullNameEnglish: 'නම (ඉංග්‍රීසි)',
    nameWithInitialsEnglish: 'මුලකුරු සමඟ නම', dateOfBirth: 'උපන් දිනය', gender: 'ස්ත්‍රී/පුරුෂ',
    school: 'පාසල', grade: 'ශ්‍රේණිය', schoolAddressAndPhone: 'පාසල් ලිපිනය/දුරකථනය',
    bankAccountName: 'ගිණුමේ නම', bankBranch: 'බැංකු ශාඛාව', bankAccountNumber: 'ගිණුම් අංකය',
    eligibilityCategory: 'කාණ්ඩය', parentGuardianRelation: 'දෙමාපිය සම්බන්ධතාවය',
    parentGuardianName: 'දෙමාපිය/භාරකරු නම', permanentAddress: 'ස්ථීර ලිපිනය', phoneNumber: 'දුරකථන අංකය',
    nic: 'ජාතික හැඳුනුම්පත් අංකය', age: 'වයස', occupation: 'රැකියාව', monthlyIncome: 'මාසික ආදායම',
    maritalStatus: 'විවාහක/අවිවාහක', spouseRelation: 'ස්වාමිපුරුෂයා/බිරිඳ සම්බන්ධතාවය',
    spouseName: 'ස්වාමිපුරුෂයා/බිරිඳ නම', spouseOccupation: 'ස්වාමිපුරුෂයා/බිරිඳ රැකියාව',
    childrenCount: 'දරුවන් ගණන', licenseNumber: 'බලපත්‍ර අංකය', fileNumber: 'ලිපිගොනු අංකය',
    licenseRegionalOfficeAndZone: 'ප්‍රාදේශීය කාර්යාලය/කලාපය',
  };
  const formatDiffValue = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (Array.isArray(val)) return val.length ? val.join(', ') : '—';
    return String(val);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala">
      {/* Back bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => (isEditing ? cancelEditing() : navigate('/minisahana/dashboard'))} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black">
          ← {isEditing ? 'ආපසු (Cancel)' : 'ආපසු (Back)'}
        </button>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="text-xs text-gray-400">
            {record.refNumber ? `${isEditing ? 'Editing ' : ''}Ref: ${record.refNumber}` : ''}
            {record.createdBy ? ` · Created by ${record.createdBy}` : ''}
            {record.createdAt ? ` · ${new Date(record.createdAt).toLocaleDateString()}` : ''}
            {record.updatedBy ? ` · Updated by ${record.updatedBy}` : ''}
          </span>

          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button type="button" onClick={startEditing} className="text-xs font-medium border border-black px-3 py-1.5 rounded hover:bg-gray-100">
                  සංස්කරණය (Edit)
                </button>
                <button type="button" onClick={() => navigate(`/minisahana/applications/${id}/edit-account-number`, { state: { record } })} className="text-xs font-medium border border-black px-3 py-1.5 rounded hover:bg-gray-100">
                  ගිණුම් අංකය සංස්කරණය (Edit Account No.)
                </button>
              </>
            )}
            {isEditing && (
              <button type="button" disabled={submitting} onClick={handleSave} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'සුරකිමින්...' : 'යාවත්කාලීන කරන්න (Save Changes)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1 flex flex-wrap items-baseline gap-1">
            <span>මිණිපහන ශිෂ්‍යත්ව අයදුම්පත -20</span>
            {isEditing ? (
              <span className="flex items-baseline relative">
                <input type="text" maxLength={1} inputMode="numeric" ref={yearDigit1Ref} value={formData.yearDigit1}
                  onChange={(e) => handleYearDigitChange(e, yearDigit2Ref, 'yearDigit1')}
                  onKeyDown={(e) => handleYearDigitKeyDown(e, null)}
                  className={`w-3 sm:w-3.5 border-b-2 text-center focus:outline-none focus:bg-blue-100 bg-transparent ${errors.yearDigit1 ? 'border-red-500 bg-red-50' : 'border-black'}`} />
                <input type="text" maxLength={1} inputMode="numeric" ref={yearDigit2Ref} value={formData.yearDigit2}
                  onChange={(e) => handleYearDigitChange(e, null, 'yearDigit2')}
                  onKeyDown={(e) => handleYearDigitKeyDown(e, yearDigit1Ref)}
                  className={`w-3 sm:w-3.5 border-b-2 text-center focus:outline-none focus:bg-blue-100 bg-transparent ${errors.yearDigit2 ? 'border-red-500 bg-red-50' : 'border-black'}`} />
              </span>
            ) : (
              <span className="flex items-baseline">
                <span className="w-3 sm:w-3.5 border-b-2 border-black text-center inline-block">{yearDigits[0] || ''}</span>
                <span className="w-3 sm:w-3.5 border-b-2 border-black text-center inline-block">{yearDigits[1] || ''}</span>
              </span>
            )}
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
            1. අයදුම්කරුගේ සම්පූර්ණ නම ({isEditing
              ? <ToggleStrikeGroup options={['ශිෂ්‍ය', 'ශිෂ්‍යාව']} value={formData.applicantTitle} onChange={(v) => handleChange('applicantTitle', v)} error={errors.applicantTitle} />
              : applicantTitle})
          </div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <input type="text" value={formData.applicantName} onChange={(e) => handleChange('applicantName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.applicantName ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={applicantName} />}
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            2. සම්පූර්ණ නම (ඉංග්‍රීසි කැපිටල් අකුරෙන්)
          </div>
          <div className="sm:w-[75%] p-2">
            {isEditing
              ? <EditableGrid length={32} rows={2} value={formData.nameEnglish} onChange={(v) => handleChange('nameEnglish', v)} error={errors.nameEnglish} />
              : <ReadOnlyGrid length={32} rows={2} value={record.applicantFullNameEnglish} />}
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            3. මුලකුරු සමඟ නම ඉංග්‍රීසියෙන්
          </div>
          <div className="sm:w-[75%] p-2">
            {isEditing
              ? <EditableGrid length={32} rows={2} value={formData.nameInitialsEnglish} onChange={(v) => handleChange('nameInitialsEnglish', v)} error={errors.nameInitialsEnglish} />
              : <ReadOnlyGrid length={32} rows={2} value={record.nameWithInitialsEnglish} />}
          </div>
        </div>

        {/* Row 4 & 5 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[60%] flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">4. උපන් දිනය (DD/MM/YYYY)</div>
            <div className="sm:w-1/2 p-2 flex flex-wrap items-center gap-1 sm:gap-2">
              {isEditing ? (
                <>
                  <EditableGrid length={2} value={formData.dobDay} onChange={(v) => handleChange('dobDay', v)} error={errors.dobDay} />
                  <EditableGrid length={2} value={formData.dobMonth} onChange={(v) => handleChange('dobMonth', v)} error={errors.dobMonth} />
                  <EditableGrid length={4} value={formData.dobYear} onChange={(v) => handleChange('dobYear', v)} error={errors.dobYear} />
                </>
              ) : (
                <>
                  <ReadOnlyGrid length={2} value={dobDay} />
                  <ReadOnlyGrid length={2} value={dobMonth} />
                  <ReadOnlyGrid length={4} value={dobYear} />
                </>
              )}
            </div>
          </div>
          <div className="sm:w-[40%] flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">5. ස්ත්‍රී/පුරුෂ</div>
            <div className={`sm:w-[55%] p-2 flex items-center justify-around ${errors.gender ? 'bg-red-50' : ''}`}>
              <label className="flex items-center gap-1"><input type="radio" checked={(isEditing ? formData.gender : record.gender) === 'female'} disabled={!isEditing} onChange={() => handleChange('gender', 'female')} /> ස්ත්‍රී</label>
              <label className="flex items-center gap-1"><input type="radio" checked={(isEditing ? formData.gender : record.gender) === 'male'} disabled={!isEditing} onChange={() => handleChange('gender', 'male')} /> පුරුෂ</label>
            </div>
          </div>
        </div>

        {/* Row 6 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">6. ඉගෙනුම ලබන පාසල</div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <input type="text" value={formData.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.schoolName ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.school} />}
          </div>
        </div>

        {/* Row 7 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">7. ඉගෙනුම ලබන ශ්‍රේණිය</div>
          <div className="sm:w-[60%] flex flex-row flex-wrap w-full">
            {GRADES.map((grade, idx, arr) => (
              <div key={idx} className={`w-[25%] sm:w-[12.5%] flex flex-col ${idx !== arr.length - 1 ? 'border-r border-black' : ''} ${errors.grade ? 'bg-red-50' : ''}`}>
                <div className="p-1 text-center text-[10px] sm:text-xs font-medium border-b border-black h-10 flex items-center justify-center whitespace-nowrap">{grade}</div>
                <div className="p-2 flex-1 flex items-center justify-center">
                  <input type="radio" checked={(isEditing ? formData.grade : record.grade + ' වසර') === grade} disabled={!isEditing} onChange={() => handleChange('grade', grade)} className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 8 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">8. පාසලේ ලිපිනය සහ දුරකථන අංකය</div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <textarea value={formData.schoolAddressPhone} onChange={(e) => handleChange('schoolAddressPhone', e.target.value)} className={`w-full h-16 focus:outline-none bg-transparent resize-none ${errors.schoolAddressPhone ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.schoolAddressAndPhone} multiline />}
          </div>
        </div>

        {/* Row 9 (Header) */}
        <div className="border-b border-black p-2 font-medium bg-gray-50 text-sm">
          9. ශිෂ්‍යත්ව මුදල් බැර කිරීම සඳහා ළමා ඉතුරුම් ගිණුම විස්තර
        </div>

        {/* Row 10 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">10. ගිණුමේ සඳහන් ආකාරයට නම</div>
          <div className="sm:w-[75%] p-2">
            {isEditing
              ? <EditableGrid length={32} rows={2} value={formData.bankAccountName} onChange={(v) => handleChange('bankAccountName', v)} error={errors.bankAccountName} />
              : <ReadOnlyGrid length={32} rows={2} value={record.bankAccountName} />}
          </div>
        </div>

        {/* Row 11 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">11. ලංකා බැංකු ශාඛාව</div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <input type="text" value={formData.bankBranch} onChange={(e) => handleChange('bankBranch', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.bankBranch ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.bankBranch} />}
          </div>
        </div>

        {/* Row 12 — ALWAYS locked, even in edit mode */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">12. ගිණුම් අංකය</div>
          <div className="sm:w-[60%] p-2">
            <ReadOnlyGrid length={20} value={record.bankAccountNumber} />
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                ගිණුම් අංකය වෙනස් කිරීමට "ගිණුම් අංකය සංස්කරණය" විකල්පය භාවිතා කරන්න. (Use "Edit Account No." to change this.)
              </p>
            )}
          </div>
        </div>

        {/* Row 13 - Eligibility Header */}
        <div className={`border-b border-black p-2 font-medium bg-gray-50 ${errors.category ? 'text-red-500' : ''}`}>
          13. ඔබ කුමන කාණ්ඩයක් යටතේ මෙම වැඩසටහනට අයත් වන්නේද?
        </div>
        <div className="flex flex-col border-b border-black">
          {[
            { editId: 'categoryA', viewId: 'a', text: 'a) මැණික් පතල් කර්මාන්තයේ නියැලෙන්නෙකුගේ දරුවෙකි.' },
            { editId: 'categoryB', viewId: 'b', text: 'b) මැණික් පතල් කර්මාන්තය සිදු කෙරෙන ප්‍රදේශ ආශ්‍රිතව ජීවත්වන්නෙකි.' },
            { editId: 'categoryC', viewId: 'c', text: 'c) ජාතික මට්ටමෙන් විශේෂ දක්ෂතා දැක්වූ දරුවෙකි.' }
          ].map((item, idx, arr) => (
            <div key={item.editId} className={`flex flex-row ${idx !== arr.length - 1 ? 'border-b border-black' : ''}`}>
              <div className="w-[85%] sm:w-[90%] p-2 border-r border-black">{item.text}</div>
              <div className={`w-[15%] sm:w-[10%] flex items-center justify-center p-2 ${errors.category ? 'bg-red-50' : ''}`}>
                <input type="checkbox" checked={isEditing ? formData[item.editId] : categories.includes(item.viewId)} disabled={!isEditing} onChange={(e) => handleChange(item.editId, e.target.checked)} className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Row 14 - Parent Info Header */}
        <div className="border-b border-black p-2 font-medium bg-gray-50">14. දෙමාපිය/භාරකරු පිළිබඳ තොරතුරු</div>

        {/* Row 15 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            15. {isEditing
              ? <ToggleStrikeGroup options={['මව', 'පියා', 'භාරකරු']} value={formData.parentType} onChange={(v) => handleChange('parentType', v)} error={errors.parentType} />
              : record.parentGuardianRelation}ගේ නම
          </div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <input type="text" value={formData.parentName} onChange={(e) => handleChange('parentName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentName ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.parentGuardianName} />}
          </div>
        </div>

        {/* Row 16 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">16. ස්ථීර ලිපිනය</div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <textarea value={formData.parentAddress} onChange={(e) => handleChange('parentAddress', e.target.value)} className={`w-full h-12 focus:outline-none bg-transparent resize-none ${errors.parentAddress ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.permanentAddress} multiline />}
          </div>
        </div>

        {/* Row 17 & 18 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">17. දුරකථන අංකය</div>
            <div className="sm:w-[60%] p-2">
              {isEditing
                ? <input type="tel" value={formData.parentPhone} onChange={handlePhoneChange} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentPhone ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.phoneNumber} />}
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">18. ජාතික හැඳුනුම්පත් අංකය</div>
            <div className="sm:w-[55%] p-2">
              {isEditing
                ? <EditableGrid length={12} value={formData.parentNIC} onChange={(v) => handleChange('parentNIC', v)} error={errors.parentNIC} />
                : <ReadOnlyGrid length={12} value={record.nic} />}
            </div>
          </div>
        </div>

        {/* Row 19 & 20 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">19. වයස</div>
            <div className="sm:w-[60%] p-2">
              {isEditing
                ? <input type="text" inputMode="numeric" value={formData.parentAge} onChange={handleAgeChange} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentAge ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.age} />}
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">20. රැකියාව</div>
            <div className="sm:w-[55%] p-2">
              {isEditing
                ? <input type="text" value={formData.parentOccupation} onChange={(e) => handleChange('parentOccupation', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentOccupation ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.occupation} />}
            </div>
          </div>
        </div>

        {/* Row 21 & 22 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">21. මාසික ආදායම</div>
            <div className="sm:w-[60%] p-2">
              {isEditing
                ? <input type="text" value={formData.parentIncome} onChange={(e) => handleChange('parentIncome', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentIncome ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.monthlyIncome} />}
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">22. විවාහක/අවිවාහක</div>
            <div className={`sm:w-[55%] p-2 flex items-center justify-around ${errors.parentMaritalStatus ? 'bg-red-50' : ''}`}>
              <label className="flex items-center gap-1"><input type="radio" checked={(isEditing ? formData.parentMaritalStatus : record.maritalStatus) === 'married'} disabled={!isEditing} onChange={() => handleChange('parentMaritalStatus', 'married')} /> විවාහක</label>
              <label className="flex items-center gap-1"><input type="radio" checked={(isEditing ? formData.parentMaritalStatus : record.maritalStatus) === 'unmarried'} disabled={!isEditing} onChange={() => handleChange('parentMaritalStatus', 'unmarried')} /> අවිවාහක</label>
            </div>
          </div>
        </div>

        {/* Row 23 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            23. {isEditing
              ? <ToggleStrikeGroup options={['ස්වාමිපුරුෂයා', 'බිරිඳ']} value={formData.spouseType} onChange={(v) => handleChange('spouseType', v)} error={errors.spouseType} />
              : (record.spouseRelation && record.spouseRelation !== 'N/A' ? record.spouseRelation : 'ස්වාමිපුරුෂයා/බිරිඳ')}ගේ නම
          </div>
          <div className="sm:w-[60%] p-2">
            {isEditing
              ? <input type="text" value={formData.spouseName} onChange={(e) => handleChange('spouseName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.spouseName ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.spouseName !== 'N/A' ? record.spouseName : ''} />}
          </div>
        </div>

        {/* Row 24 & 25 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-2/3 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">24. රැකියාව</div>
            <div className="sm:w-1/2 p-2">
              {isEditing
                ? <input type="text" value={formData.spouseOccupation} onChange={(e) => handleChange('spouseOccupation', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.spouseOccupation ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.spouseOccupation !== 'N/A' ? record.spouseOccupation : ''} />}
            </div>
          </div>
          <div className="sm:w-1/3 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">25. දරුවන් ගණන</div>
            <div className="sm:w-[55%] p-2">
              {isEditing
                ? <input type="text" inputMode="numeric" value={formData.numberOfChildren} onChange={handleNumberChildrenChange} className={`w-full h-full focus:outline-none bg-transparent ${errors.numberOfChildren ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.childrenCount} />}
            </div>
          </div>
        </div>

        {/* Row 26 & 27 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">26. බලපත්‍ර අංකය</div>
            <div className="sm:w-[60%] p-2">
              {isEditing
                ? <input type="text" value={formData.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.licenseNumber ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.licenseNumber} />}
            </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">27. ලිපිගොනු අංකය</div>
            <div className="sm:w-[55%] p-2">
              {isEditing
                ? <input type="text" value={formData.fileNumber} onChange={(e) => handleChange('fileNumber', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.fileNumber ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.fileNumber} />}
            </div>
          </div>
        </div>

        {/* Row 28 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">28. බලපත්‍රයට අදාළ ප්‍රාදේශීය කාර්යාලය හා කලාපය</div>
          <div className="sm:w-1/2 p-2">
            {isEditing
              ? <input type="text" value={formData.regionalOffice} onChange={(e) => handleChange('regionalOffice', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.regionalOffice ? 'bg-red-50' : ''}`} />
              : <ReadOnlyField value={record.licenseRegionalOfficeAndZone} />}
          </div>
        </div>

        {/* Attachments Table — view only, never editable here */}
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
            {record.declarationSigned ? 'ඉහත දක්වා ඇති තොරතුරු සත්‍ය තොරතුරු බව සනාථ කර ඇත.' : 'ප්‍රකාශය තහවුරු කර නොමැත.'}
          </p>
        </div>
      </div>

      {/* Changes timeline */}
      {changes.length > 0 && (
        <div className="mt-6 border-2 border-black">
          <div className="p-2 font-medium bg-gray-50 border-b border-black text-sm">වෙනස්කම් ඉතිහාසය (Change History)</div>
          <div className="flex flex-col divide-y divide-black">
            {changes.slice().reverse().map((entry, idx) => (
              <div key={idx} className="p-3 sm:p-4 text-xs sm:text-sm flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2 text-gray-500">
                  <span className={`px-2 py-0.5 rounded text-white text-[10px] font-semibold ${entry.editType === 'acc_number' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                    {entry.editType === 'acc_number' ? 'ACC NUMBER EDIT' : 'NORMAL EDIT'}
                  </span>
                  <span>{entry.changedBy || 'Unknown'}</span>
                  <span>·</span>
                  <span>{entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Object.keys(entry.newValues || {}).map((field) => (
                    <div key={field} className="grid grid-cols-1 sm:grid-cols-[minmax(0,180px)_1fr] gap-x-3 gap-y-0.5">
                      <span className="font-medium text-gray-700">{FIELD_LABELS[field] || field}</span>
                      <span>
                        <span className="line-through text-red-500">{formatDiffValue(entry.oldValues?.[field])}</span>
                        {' → '}
                        <span className="text-green-700 font-medium">{formatDiffValue(entry.newValues?.[field])}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniSahanaApplicationPreview;