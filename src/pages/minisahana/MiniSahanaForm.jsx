import React, { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // adjust path to wherever your AuthContext.jsx lives

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
  value = "",
  onChange,
  error = false,
}) => {
  const exampleRows = example
    ? Array.from({ length: rows }).map((_, r) => example.slice(r * length, r * length + length))
    : [];

  const inputRefs = useRef([]);
  const totalBoxes = rows * length;

  const chars = useMemo(() => {
    if (readOnly) return Array(totalBoxes).fill("");
    const parsed = splitGraphemes(value || "");
    const arr = Array(totalBoxes).fill("");
    parsed.forEach((c, i) => { 
      if (i < totalBoxes) arr[i] = c === " " ? "" : c; 
    });
    return arr;
  }, [value, totalBoxes, readOnly]);

  const focusBox = (index) => {
    const el = inputRefs.current[index];
    if (el) el.focus();
  };

  const handleChange = (index, e) => {
    const graphemes = splitGraphemes(e.target.value);
    const val = graphemes[graphemes.length - 1] ?? '';
    const newChars = [...chars];
    newChars[index] = val;
    
    const safeChars = newChars.map(c => c || " ");
    onChange?.(safeChars.join("").trimEnd());

    if (val && index < totalBoxes - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    const target = e.target;
    if (e.key === 'Backspace' && !chars[index] && index > 0) {
      e.preventDefault();
      focusBox(index - 1);
      const newChars = [...chars];
      newChars[index - 1] = '';
      const safeChars = newChars.map(c => c || " ");
      onChange?.(safeChars.join("").trimEnd());
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
    const cleaned = pasted.replace(/\s/g, '');
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
    
    const safeChars = newChars.map(c => c || " ");
    onChange?.(safeChars.join("").trimEnd());

    const nextIndex = Math.min(lastFilledIndex + 1, totalBoxes - 1);
    focusBox(nextIndex);
  };

  return (
    <div className={`flex flex-col py-1 ${fitWidth ? '' : 'overflow-x-auto'} ${className} ${error ? 'bg-red-50 p-1 rounded border border-red-500' : ''}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={fitWidth ? "grid" : "flex min-w-max"}
          style={fitWidth ? { gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` } : undefined}
        >
          {Array.from({ length }).map((_, i) => {
            const char = exampleRows[r]?.[i];
            const flatIndex = r * length + i;
            const isFilled = !readOnly && chars[flatIndex] !== "";
            return (
              <input
                key={i}
                ref={(el) => { if (!readOnly) inputRefs.current[flatIndex] = el; }}
                maxLength={1}
                readOnly={readOnly}
                tabIndex={readOnly ? -1 : 0}
                value={readOnly ? (char && char !== " " ? char : "") : chars[flatIndex]}
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
                      : error
                        ? 'border border-red-500 bg-white text-black focus:bg-red-100 focus:border-red-500'
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

const ToggleStrikeGroup = ({ options, value, onChange, error }) => {
  const handleToggle = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter(o => o !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 ${error ? 'border border-red-500 bg-red-50 px-1 rounded' : ''}`}>
      {options.map((opt, idx) => {
        const isStruck = !value.includes(opt);
        return (
          <React.Fragment key={opt}>
            <span
              onClick={() => handleToggle(opt)}
              className={`cursor-pointer select-none ${isStruck ? 'line-through text-gray-400' : ''}`}
            >
              {opt}
            </span>
            {idx < options.length - 1 && <span>/</span>}
          </React.Fragment>
        );
      })}
    </span>
  );
};

const MiniSahanaForm = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const yearDigit1Ref = useRef(null);
  const yearDigit2Ref = useRef(null);

  const [formData, setFormData] = useState({
    yearDigit1: '',
    yearDigit2: '',
    officeUse: '',
    applicantName: '',
    applicantTitle: ['ශිෂ්‍ය', 'ශිෂ්‍යාව'],
    nameEnglish: '',
    nameInitialsEnglish: '',
    dobDay: '',
    dobMonth: '',
    dobYear: '',
    gender: '',
    schoolName: '',
    grade: '',
    schoolAddressPhone: '',
    bankAccountName: '',
    bankBranch: '',
    bankAccountNumber: '',
    categoryA: false,
    categoryB: false,
    categoryC: false,
    parentType: ['මව', 'පියා', 'භාරකරු'],
    parentName: '',
    parentAddress: '',
    parentPhone: '',
    parentNIC: '',
    parentAge: '',
    parentOccupation: '',
    parentIncome: '',
    parentMaritalStatus: '',
    spouseType: ['ස්වාමිපුරුෂයා', 'බිරිඳ'],
    spouseName: '',
    spouseOccupation: '',
    numberOfChildren: '',
    licenseNumber: '',
    fileNumber: '',
    regionalOffice: '',
    attachment1: '',
    attachment2: '',
  });

  const [errors, setErrors] = useState({});

  const handleYearDigitChange = (e, nextRef, field) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    setFormData(prev => ({ ...prev, [field]: digit }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
    if (digit && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  const handleYearDigitKeyDown = (e, prevRef) => {
    if (e.key === 'Backspace' && !e.target.value && prevRef?.current) {
      prevRef.current.focus();
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/[^\d+]/g, '');
    handleChange('parentPhone', val);
  };

  const handleAgeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    handleChange('parentAge', val);
  };

  const handleNumberChildrenChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    handleChange('numberOfChildren', val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('ඔබගේ සැසිය අවසන් වී ඇත. කරුණාකර නැවත පිවිසෙන්න. (Your session has expired. Please log in again.)');
      navigate('/login');
      return;
    }

    const newErrors = {};

    const checkRequired = (fields) => {
      fields.forEach(f => {
        if (!formData[f] || String(formData[f]).trim() === '') {
          newErrors[f] = true;
        }
      });
    };

    checkRequired([
      'yearDigit1', 'yearDigit2',
      'applicantName', 'nameEnglish', 'nameInitialsEnglish',
      'dobDay', 'dobMonth', 'dobYear', 'gender',
      'schoolName', 'grade', 'schoolAddressPhone',
      'bankAccountName', 'bankBranch', 'bankAccountNumber',
      'parentName', 'parentAddress', 'parentPhone', 'parentNIC',
      'parentAge', 'parentOccupation', 'parentIncome', 'parentMaritalStatus',
      'licenseNumber', 'fileNumber', 'regionalOffice',
      'attachment1', 'attachment2'
    ]);

    if (formData.applicantTitle.length !== 1) newErrors.applicantTitle = true;
    if (formData.parentType.length !== 1) newErrors.parentType = true;

    // Sri Lankan phone number validation (starts with 0, 0094, or +94 followed by 9 digits)
    const phoneRegex = /^(?:0|0094|\+94)[0-9]{9}$/;
    if (formData.parentPhone && !phoneRegex.test(formData.parentPhone)) {
      newErrors.parentPhone = true;
    }

    if (formData.parentMaritalStatus === 'married') {
      checkRequired(['spouseName', 'spouseOccupation', 'numberOfChildren']);
      if (formData.spouseType.length !== 1) newErrors.spouseType = true;
    }

    if (!formData.categoryA && !formData.categoryB && !formData.categoryC) {
      newErrors.category = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('කරුණාකර සියලුම අනිවාර්ය ක්ෂේත්‍ර නිවැරදිව සම්පූර්ණ කරන්න. (Please fill all required fields correctly.)');
      
      if (newErrors.parentPhone) {
         alert('දුරකථන අංකය නිවැරදි ආකෘතියෙන් ඇතුළත් කරන්න (උදා: 0712345678 හෝ +94712345678).');
      }
      return;
    }

    try {
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
        grade: formData.grade,
        schoolAddressAndPhone: formData.schoolAddressPhone,
        
        bankAccountName: formData.bankAccountName,
        bankBranch: formData.bankBranch,
        bankAccountNumber: formData.bankAccountNumber,
        
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
        
        attachments: {
          bankPassbookCopy: formData.attachment1 === 'has' ? 'Yes' : formData.attachment1 === 'no' ? 'No' : 'Other',
          birthCertificateCopy: formData.attachment2 === 'has' ? 'Yes' : formData.attachment2 === 'no' ? 'No' : 'Other'
        },
        
        declarationSigned: true
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/mini-sahana-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert('සාර්ථකව යවන ලදී! (Submitted successfully!)');
      } else if (response.status === 401) {
        alert('ඔබගේ සැසිය අවසන් වී ඇත. කරුණාකර නැවත පිවිසෙන්න. (Your session has expired. Please log in again.)');
        logout();
        navigate('/login');
      } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Backend validation failed:', errData);
        alert('යැවීමේ දෝෂයක්. (Submission error.)\n' + (errData.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert('යැවීමේ දෝෂයක්. (Submission error.)');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1 flex flex-wrap items-baseline gap-1">
            <span>මිණිපහන ශිෂ්‍යත්ව අයදුම්පත -20</span>
            <span className="flex items-baseline relative">
              <input
                type="text"
                maxLength={1}
                inputMode="numeric"
                aria-label="අවුරුද්ද - පළමු අංකය"
                ref={yearDigit1Ref}
                value={formData.yearDigit1}
                onChange={(e) => handleYearDigitChange(e, yearDigit2Ref, 'yearDigit1')}
                onKeyDown={(e) => handleYearDigitKeyDown(e, null)}
                className={`w-3 sm:w-3.5 border-b-2 text-center focus:outline-none focus:bg-blue-100 bg-transparent ${errors.yearDigit1 ? 'border-red-500 bg-red-50' : 'border-black'}`}
              />
              <input
                type="text"
                maxLength={1}
                inputMode="numeric"
                aria-label="අවුරුද්ද - දෙවන අංකය"
                ref={yearDigit2Ref}
                value={formData.yearDigit2}
                onChange={(e) => handleYearDigitChange(e, null, 'yearDigit2')}
                onKeyDown={(e) => handleYearDigitKeyDown(e, yearDigit1Ref)}
                className={`w-3 sm:w-3.5 border-b-2 text-center focus:outline-none focus:bg-blue-100 bg-transparent ${errors.yearDigit2 ? 'border-red-500 bg-red-50' : 'border-black'}`}
              />
            </span>
            {(errors.yearDigit1 || errors.yearDigit2) && <span className="text-red-500 text-lg">*</span>}
          </h1>
          <h2 className="text-base font-semibold">ජාතික මැණික් සහ ස්වර්ණාභරණ අධිකාරිය</h2>
        </div>
        <input
          type="text"
          placeholder="කාර්යාලීය ප්‍රයෝජනය සඳහා"
          value={formData.officeUse}
          onChange={(e) => handleChange('officeUse', e.target.value)}
          className="border border-black p-2 w-full sm:w-48 text-center text-xs focus:outline-none focus:bg-blue-100 cursor-text"
        />
      </div>

      {/* Main Form Container */}
      <div className="border-2 border-black flex flex-col text-xs sm:text-sm">
        
        {/* Row 1 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            1. අයදුම්කරුගේ සම්පූර්ණ නම (<ToggleStrikeGroup options={['ශිෂ්‍ය', 'ශිෂ්‍යාව']} value={formData.applicantTitle} onChange={(val) => handleChange('applicantTitle', val)} error={errors.applicantTitle} />) <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" value={formData.applicantName} onChange={(e) => handleChange('applicantName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.applicantName ? 'bg-red-50' : ''}`} />
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            2. සම්පූර්ණ නම (ඉංග්‍රීසි කැපිටල් අකුරෙන්)(නමේ කොටස් අතර එක් කොටුවක් හිස්ව තබමින් එක් අකුරකට එක් කොටුවක් භාවිතා කරන්න.) <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[75%] p-2 flex flex-col gap-2">
            <div>
                <span className="text-[10px] sm:text-xs text-gray-500 italic block mb-0.5">උදාහරණය / Example:</span>
                <CharGrid length={32} rows={1} example="GAMAGE ARUNA DE SILVA" fitWidth readOnly />
            </div>
            <CharGrid length={32} rows={2} fitWidth value={formData.nameEnglish} onChange={(val) => handleChange('nameEnglish', val)} error={errors.nameEnglish} />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[25%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            3. මුලකුරු සමඟ නම ඉංග්‍රීසියෙන් <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[75%] p-2">
            <CharGrid length={32} rows={2} fitWidth value={formData.nameInitialsEnglish} onChange={(val) => handleChange('nameInitialsEnglish', val)} error={errors.nameInitialsEnglish} />
          </div>
        </div>

        {/* Row 4 & 5 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[60%] flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
            <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              4. උපන් දිනය (DD/MM/YYYY) <span className="text-red-500">*</span>
            </div>
            <div className="sm:w-1/2 p-2 flex flex-wrap items-center gap-1 sm:gap-2">
              <CharGrid length={2} value={formData.dobDay} onChange={(val) => handleChange('dobDay', val)} error={errors.dobDay} /> 
              <CharGrid length={2} value={formData.dobMonth} onChange={(val) => handleChange('dobMonth', val)} error={errors.dobMonth} /> 
              <CharGrid length={4} value={formData.dobYear} onChange={(val) => handleChange('dobYear', val)} error={errors.dobYear} />
            </div>
          </div>
          <div className="sm:w-[40%] flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
              5. ස්ත්‍රී/පුරුෂ <span className="text-red-500">*</span>
            </div>
            <div className={`sm:w-[55%] p-2 flex items-center justify-around ${errors.gender ? 'bg-red-50' : ''}`}>
               <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" checked={formData.gender === 'female'} onChange={() => handleChange('gender', 'female')} /> ස්ත්‍රී</label>
               <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" checked={formData.gender === 'male'} onChange={() => handleChange('gender', 'male')} /> පුරුෂ</label>
            </div>
          </div>
        </div>

        {/* Row 6 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            6. ඉගෙනුම ලබන පාසල <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" value={formData.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.schoolName ? 'bg-red-50' : ''}`} />
          </div>
        </div>

        {/* Row 7 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            7. ඉගෙනුම ලබන ශ්‍රේණිය <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] flex flex-row flex-wrap w-full">
            {['6 වසර', '7 වසර', '8 වසර', '9 වසර', '10 වසර', '11 වසර', '12 වසර', '13 වසර'].map((grade, idx, arr) => (
              <div key={idx} className={`w-[25%] sm:w-[12.5%] flex flex-col ${idx !== arr.length - 1 ? 'border-r border-black' : ''} ${errors.grade ? 'bg-red-50' : ''}`}>
                <div className="p-1 text-center text-[10px] sm:text-xs font-medium border-b border-black h-10 flex items-center justify-center whitespace-nowrap">{grade}</div>
                <div className="p-2 flex-1 flex items-center justify-center">
                  <input type="radio" name="grade" checked={formData.grade === grade} onChange={() => handleChange('grade', grade)} className="w-4 h-4 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 8 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            8. පාසලේ ලිපිනය සහ දුරකථන අංකය <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <textarea value={formData.schoolAddressPhone} onChange={(e) => handleChange('schoolAddressPhone', e.target.value)} className={`w-full h-16 focus:outline-none bg-transparent resize-none ${errors.schoolAddressPhone ? 'bg-red-50' : ''}`} />
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
            10. ගිණුමේ සඳහන් ආකාරයට නම (පාස් පොතෙහි සඳහන් නම) <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[75%] p-2">
             <CharGrid length={32} rows={2} fitWidth value={formData.bankAccountName} onChange={(val) => handleChange('bankAccountName', val)} error={errors.bankAccountName} />
          </div>
        </div>

        {/* Row 11 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            11. ලංකා බැංකු ශාඛාව <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" value={formData.bankBranch} onChange={(e) => handleChange('bankBranch', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.bankBranch ? 'bg-red-50' : ''}`} />
          </div>
        </div>

        {/* Row 12 */}
         <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            12. ගිණුම් අංකය <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <CharGrid length={20} fitWidth value={formData.bankAccountNumber} onChange={(val) => handleChange('bankAccountNumber', val)} error={errors.bankAccountNumber} />
          </div>
        </div>

        {/* Row 13 - Eligibility Header */}
        <div className={`border-b border-black p-2 font-medium bg-gray-50 ${errors.category ? 'text-red-500' : ''}`}>
          13. ඔබ කුමන කාණ්ඩයක් යටතේ මෙම වැඩසටහනට අයත් වන්නේද? <span className="text-red-500">*</span>
        </div>

        {/* Row 13 Options */}
        <div className="flex flex-col border-b border-black">
          {[
            { id: 'categoryA', text: 'a) මැණික් පතල් කර්මාන්තයේ නියැලෙන්නෙකුගේ දරුවෙකි.' },
            { id: 'categoryB', text: 'b) මැණික් පතල් කර්මාන්තය සිදු කෙරෙන ප්‍රදේශ ආශ්‍රිතව ජීවත්වන්නෙකි.' },
            { id: 'categoryC', text: 'c) ජාතික මට්ටමෙන් විශේෂ දක්ෂතා දැක්වූ දරුවෙකි.' }
          ].map((item, idx, arr) => (
            <div key={item.id} className={`flex flex-row ${idx !== arr.length - 1 ? 'border-b border-black' : ''}`}>
              <div className="w-[85%] sm:w-[90%] p-2 border-r border-black">{item.text}</div>
              <div className={`w-[15%] sm:w-[10%] flex items-center justify-center p-2 ${errors.category ? 'bg-red-50' : ''}`}>
                <input type="checkbox" checked={formData[item.id]} onChange={(e) => handleChange(item.id, e.target.checked)} className="w-5 h-5 cursor-pointer" />
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
            15. <ToggleStrikeGroup options={['මව', 'පියා', 'භාරකරු']} value={formData.parentType} onChange={(val) => handleChange('parentType', val)} error={errors.parentType} />ගේ නම <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" value={formData.parentName} onChange={(e) => handleChange('parentName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentName ? 'bg-red-50' : ''}`} />
          </div>
        </div>

        {/* Row 16 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            16. ස්ථීර ලිපිනය <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-[60%] p-2">
            <textarea value={formData.parentAddress} onChange={(e) => handleChange('parentAddress', e.target.value)} className={`w-full h-12 focus:outline-none bg-transparent resize-none ${errors.parentAddress ? 'bg-red-50' : ''}`} />
          </div>
        </div>

        {/* Row 17 & 18 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                17. දුරකථන අංකය <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="tel" placeholder="0712345678" value={formData.parentPhone} onChange={handlePhoneChange} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentPhone ? 'bg-red-50' : ''}`} />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                18. ජාතික හැඳුනුම්පත් අංකය <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[55%] p-2">
                 <CharGrid length={12} fitWidth value={formData.parentNIC} onChange={(val) => handleChange('parentNIC', val)} error={errors.parentNIC} />
              </div>
           </div>
        </div>

        {/* Row 19 & 20 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                19. වයස <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="text" inputMode="numeric" value={formData.parentAge} onChange={handleAgeChange} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentAge ? 'bg-red-50' : ''}`} />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                20. රැකියාව <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[55%] p-2">
                 <input type="text" value={formData.parentOccupation} onChange={(e) => handleChange('parentOccupation', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentOccupation ? 'bg-red-50' : ''}`} />
              </div>
           </div>
        </div>

        {/* Row 21 & 22 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                21. මාසික ආදායම <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="text" value={formData.parentIncome} onChange={(e) => handleChange('parentIncome', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.parentIncome ? 'bg-red-50' : ''}`} />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                22. විවාහක/අවිවාහක <span className="text-red-500">*</span>
              </div>
              <div className={`sm:w-[55%] p-2 flex items-center justify-around ${errors.parentMaritalStatus ? 'bg-red-50' : ''}`}>
                 <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="marital" checked={formData.parentMaritalStatus === 'married'} onChange={() => handleChange('parentMaritalStatus', 'married')} /> විවාහක</label>
                 <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="marital" checked={formData.parentMaritalStatus === 'unmarried'} onChange={() => handleChange('parentMaritalStatus', 'unmarried')} /> අවිවාහක</label>
              </div>
           </div>
        </div>

        {/* Row 23 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            23. <ToggleStrikeGroup options={['ස්වාමිපුරුෂයා', 'බිරිඳ']} value={formData.spouseType} onChange={(val) => handleChange('spouseType', val)} error={errors.spouseType} />ගේ නම {formData.parentMaritalStatus === 'married' && <span className="text-red-500">*</span>}
          </div>
          <div className="sm:w-[60%] p-2">
            <input type="text" value={formData.spouseName} onChange={(e) => handleChange('spouseName', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.spouseName ? 'bg-red-50' : ''}`} />
          </div>
        </div>

        {/* Row 24 & 25 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-2/3 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                24. රැකියාව {formData.parentMaritalStatus === 'married' && <span className="text-red-500">*</span>}
              </div>
              <div className="sm:w-[60%] sm:w-1/2 p-2">
                 <input type="text" value={formData.spouseOccupation} onChange={(e) => handleChange('spouseOccupation', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.spouseOccupation ? 'bg-red-50' : ''}`} />
              </div>
           </div>
           <div className="sm:w-1/3 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                25. දරුවන් ගණන {formData.parentMaritalStatus === 'married' && <span className="text-red-500">*</span>}
              </div>
              <div className="sm:w-[55%] p-2">
                 <input type="text" inputMode="numeric" value={formData.numberOfChildren} onChange={handleNumberChildrenChange} className={`w-full h-full focus:outline-none bg-transparent ${errors.numberOfChildren ? 'bg-red-50' : ''}`} />
              </div>
           </div>
        </div>

        {/* Row 26 & 27 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
           <div className="sm:w-1/2 flex flex-col sm:flex-row border-b sm:border-b-0 sm:border-r border-black">
              <div className="sm:w-[40%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                26. බලපත්‍ර අංකය <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[60%] p-2">
                 <input type="text" value={formData.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.licenseNumber ? 'bg-red-50' : ''}`} />
              </div>
           </div>
           <div className="sm:w-1/2 flex flex-col sm:flex-row">
              <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
                27. ලිපිගොනු අංකය <span className="text-red-500">*</span>
              </div>
              <div className="sm:w-[55%] p-2">
                 <input type="text" value={formData.fileNumber} onChange={(e) => handleChange('fileNumber', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.fileNumber ? 'bg-red-50' : ''}`} />
              </div>
           </div>
        </div>

        {/* Row 28 */}
        <div className="flex flex-col sm:flex-row border-b border-black">
          <div className="sm:w-1/2 p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">
            28. බලපත්‍රයට අදාළ ප්‍රාදේශීය කාර්යාලය හා කලාපය <span className="text-red-500">*</span>
          </div>
          <div className="sm:w-1/2 p-2">
            <input type="text" value={formData.regionalOffice} onChange={(e) => handleChange('regionalOffice', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent ${errors.regionalOffice ? 'bg-red-50' : ''}`} />
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
           
           <div className={`flex flex-row border-b border-black text-xs sm:text-sm ${errors.attachment1 ? 'bg-red-50' : ''}`}>
             <div className="w-[10%] p-2 border-r border-black flex items-center justify-center">01 <span className="text-red-500 ml-1">*</span></div>
             <div className="w-[50%] p-2 border-r border-black">බැංකු පාස් පොතෙහි ගිණුම් අංකය පැහැදිලිව පෙනෙන සේ ගන්නා ලද පිටපතක්.</div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" name="attach1" checked={formData.attachment1 === 'has'} onChange={() => handleChange('attachment1', 'has')} className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" name="attach1" checked={formData.attachment1 === 'no'} onChange={() => handleChange('attachment1', 'no')} className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 flex justify-center items-center"><input type="radio" name="attach1" checked={formData.attachment1 === 'other'} onChange={() => handleChange('attachment1', 'other')} className="w-4 h-4 cursor-pointer" /></div>
           </div>

           <div className={`flex flex-row text-xs sm:text-sm ${errors.attachment2 ? 'bg-red-50' : ''}`}>
             <div className="w-[10%] p-2 border-r border-black flex items-center justify-center">02 <span className="text-red-500 ml-1">*</span></div>
             <div className="w-[50%] p-2 border-r border-black">ග්‍රාම නිලධාරී සහතික කරන ලද උප්පැන්න සහතිකයේ පිටපතක්</div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" name="attach2" checked={formData.attachment2 === 'has'} onChange={() => handleChange('attachment2', 'has')} className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 border-r border-black flex justify-center items-center"><input type="radio" name="attach2" checked={formData.attachment2 === 'no'} onChange={() => handleChange('attachment2', 'no')} className="w-4 h-4 cursor-pointer" /></div>
             <div className="w-[13.3%] p-2 flex justify-center items-center"><input type="radio" name="attach2" checked={formData.attachment2 === 'other'} onChange={() => handleChange('attachment2', 'other')} className="w-4 h-4 cursor-pointer" /></div>
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

          <div className="flex justify-end mt-4 border-t pt-4">
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition-colors">
              ඉදිරිපත් කරන්න (Submit)
            </button>
          </div>
        </div>

      </div>
    </form>
  );
};

export default MiniSahanaForm;