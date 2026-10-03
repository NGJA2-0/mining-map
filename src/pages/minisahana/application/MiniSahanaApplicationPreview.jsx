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
const EditableGrid = ({ length, rows = 1, value = '', onChange, error = false, fitWidth = true }) => {
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
    <div className={`flex flex-col py-1 ${fitWidth ? '' : 'overflow-x-auto'} ${error ? 'bg-red-50 p-1 rounded border border-red-500' : ''}`}>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className={fitWidth ? 'grid' : 'flex min-w-max'}
          style={fitWidth ? { gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` } : undefined}
        >
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
                className={`
                  font-sinhala p-0 leading-none
                  ${fitWidth ? 'w-full min-w-0 aspect-square text-xs sm:text-sm' : 'w-5 sm:w-6 h-6 sm:h-7 text-xs sm:text-sm'}
                  text-center uppercase focus:outline-none font-medium relative z-0 focus:z-10
                  ${i > 0 ? '-ml-px' : ''} ${r > 0 ? '-mt-px' : ''}
                  ${isFilled
                    ? 'border border-slate-300 bg-slate-50 text-slate-900 font-semibold focus:border-blue-400 focus:bg-blue-50'
                    : 'border border-black bg-white text-black focus:bg-blue-100 focus:border-blue-400'}
                `}
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

// ─────────────────────────── Change History panel ───────────────────────────
const EDIT_TYPE_STYLES = {
  normal: { label: 'NORMAL EDIT', badge: 'bg-indigo-600 text-white', dot: 'bg-indigo-600' },
  acc_number: { label: 'ACC NUMBER EDIT', badge: 'bg-amber-500 text-white', dot: 'bg-amber-500' },
};

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

const ChangeHistoryPanel = ({ changes, fieldLabels, formatDiffValue }) => {
  const ordered = changes.slice().reverse();

  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          වෙනස්කම් ඉතිහාසය <span className="text-gray-400 font-normal">(Change History)</span>
        </h3>
        <span className="text-xs font-medium bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
          {changes.length}
        </span>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        <div className="relative px-4 py-4">
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gray-200" aria-hidden="true" />
          <div className="flex flex-col gap-5">
            {ordered.map((entry, idx) => {
              const style = EDIT_TYPE_STYLES[entry.editType] || EDIT_TYPE_STYLES.normal;
              const fields = Object.keys(entry.newValues || {});
              return (
                <div key={idx} className="relative pl-8">
                  <span className={`absolute left-0 top-1.5 w-4 h-4 rounded-full ring-4 ring-white ${style.dot}`} />

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] font-semibold flex items-center justify-center">
                        {getInitials(entry.changedBy)}
                      </span>
                      <span className="font-medium text-gray-700">{entry.changedBy || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 mb-2 ml-0.5">
                    {entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}
                  </div>

                  <div className="flex flex-col gap-1.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    {fields.map((field) => (
                      <div key={field} className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-600">
                          {fieldLabels[field] || field}
                        </span>
                        <div className="flex items-center flex-wrap gap-1 text-xs">
                          <span className="line-through text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            {formatDiffValue(entry.oldValues?.[field])}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                            {formatDiffValue(entry.newValues?.[field])}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reconstructs the document exactly as it was first submitted,
// by undoing each change entry in reverse chronological order.
const reconstructOriginalRecord = (record) => {
  const changes = record.changes ?? [];
  const original = { ...record };

  for (let i = changes.length - 1; i >= 0; i--) {
    const entry = changes[i];
    Object.entries(entry.oldValues || {}).forEach(([field, oldVal]) => {
      original[field] = oldVal;
    });
  }

  // Metadata should reflect the original submission too
  original.refNumber = (record.refNumber || '').split('.')[0]; // e.g. "A6.2" → "A6"
  original.updatedBy = '';
  original.changes = [];

  return original;
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
    grade: record.grade ? `${String(record.grade).replace(' වසර', '').trim()} වසර` : '',
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
    licenseNumber: record.licenseNumber && record.licenseNumber !== 'N/A' ? record.licenseNumber : '',
    fileNumber: record.fileNumber && record.fileNumber !== 'N/A' ? record.fileNumber : '',
    regionalOffice: record.licenseRegionalOfficeAndZone || '',
  };
};

const DOC_SLOTS = [
  { key: 'hard_copy', label: 'Submitted Hard Copy' },
  { key: 'bank_passbook', label: 'Copy of the Bank Passbook' },
  { key: 'birth_certificate', label: 'Copy of the Birth Certificate' },
  { key: 'additional', label: 'O/L Certificate' },
];

const DocumentsPanel = ({ recordId, documents, grade, token, disabled, onRecordUpdated, onUnauthorized }) => {
  const [busyKey, setBusyKey] = useState(null);
  const API = import.meta.env.VITE_API_BASE_URL || '';

  const fetchBlob = async (key, version, download) => {
    const res = await fetch(
      `${API}/api/mini-sahana-form/${recordId}/documents/${key}/versions/${version}${download ? '?download=1' : ''}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 401) { onUnauthorized(); return null; }
    if (!res.ok) { alert('ගොනුව ලබාගත නොහැක. (Could not load the file.)'); return null; }
    return res.blob();
  };

  const view = async (key, version) => {
    const w = window.open('', '_blank');
    const blob = await fetchBlob(key, version, false);
    if (!blob) { w?.close(); return; }
    const url = URL.createObjectURL(blob);
    if (w) w.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const download = async (key, version, fileName) => {
    const blob = await fetchBlob(key, version, true);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName || 'document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const replace = async (key, file) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return alert('PDF ගොනු පමණි. (PDF files only.)');
    if (file.size > 10 * 1024 * 1024) return alert('ගොනුව 10MB ට වැඩියි. (File exceeds 10MB.)');
    setBusyKey(key);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch(`${API}/api/mini-sahana-form/${recordId}/documents/${key}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body,
      });
      if (res.status === 401) return onUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return alert('යාවත්කාලීන කිරීමේ දෝෂයක්. (Update error.)\n' + (data.error || ''));
      onRecordUpdated(data);
    } finally { setBusyKey(null); }
  };

  return (
    <div className="border-b border-black">
      <div className="p-2 font-medium bg-gray-50 border-b border-black text-sm">
        ආධාරක ලේඛන (Supporting Documents)
      </div>
      {DOC_SLOTS.map(({ key, label }) => {
        const doc = (documents || []).find(d => d.key === key);
        const versions = doc?.versions ?? [];
        if (!doc && key === 'additional' && (disabled || String(grade).trim() !== '12')) return null;
        return (
          <div key={key} className="p-3 border-b border-black last:border-b-0 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{label}</span>
              {!disabled && (
                <label className={`text-xs font-medium border border-black px-3 py-1.5 rounded cursor-pointer hover:bg-gray-100 ${busyKey === key ? 'opacity-50 pointer-events-none' : ''}`}>
                  {busyKey === key ? 'උඩුගත වෙමින්...' : (doc ? 'ප්‍රතිස්ථාපනය (Replace)' : 'එක් කරන්න (Add)')}
                  <input type="file" accept="application/pdf,.pdf" className="hidden"
                    onChange={(e) => { replace(key, e.target.files?.[0]); e.target.value = ''; }} />
                </label>
              )}
            </div>
            {versions.length === 0 && <span className="text-gray-400 text-xs">— No file uploaded —</span>}
            {versions.slice().reverse().map(v => {
              const isCurrent = v.version === doc.currentVersion;
              return (
                <div key={v.version} className={`flex flex-wrap items-center gap-2 text-xs rounded px-2 py-1.5 ${isCurrent ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <span className={`px-1.5 py-0.5 rounded text-white text-[10px] font-semibold ${isCurrent ? 'bg-green-600' : 'bg-gray-500'}`}>
                    {isCurrent ? 'CURRENT' : 'PREVIOUS'} v{v.version}
                  </span>
                  <span className="truncate max-w-[16rem]">{v.fileName}</span>
                  <span className="text-gray-400">
                    {(v.size / 1024).toFixed(0)} KB · {v.uploadedBy} · {new Date(v.uploadedAt).toLocaleString()}
                  </span>
                  <span className="ml-auto flex gap-1.5">
                    <button type="button" onClick={() => view(key, v.version)} className="border border-black px-2 py-0.5 rounded hover:bg-white">View</button>
                    <button type="button" onClick={() => download(key, v.version, v.fileName)} className="border border-black px-2 py-0.5 rounded hover:bg-white">Download</button>
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
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
  const [viewingOriginal, setViewingOriginal] = useState(false);
  const original = useMemo(() => reconstructOriginalRecord(record), [record]);
  const displayRecord = viewingOriginal ? original : record;
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

  const handleCategorySelect = (id, checked) => {
    setFormData(prev => {
      const next = { ...prev, categoryA: false, categoryB: false, categoryC: false, [id]: checked };
      if (!next.categoryA) { next.licenseNumber = ''; next.fileNumber = ''; }
      return next;
    });
    setErrors(prev => ({ ...prev, category: false, licenseNumber: false, fileNumber: false }));
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
      'regionalOffice'
    ]);
    if (formData.categoryA) checkRequired(['licenseNumber', 'fileNumber']);
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
        licenseNumber: formData.categoryA ? formData.licenseNumber : 'N/A',
        fileNumber: formData.categoryA ? formData.fileNumber : 'N/A',
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
  const gradeLabel = record.grade ? `${String(record.grade).replace(' වසර', '').trim()} වසර` : ''
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

  const fieldLabel = (field) => {
    if (field.startsWith('documents.')) {
      const slot = DOC_SLOTS.find(s => s.key === field.slice('documents.'.length));
      return `📄 ${slot?.label ?? field}`;
    }
    return FIELD_LABELS[field] || field;
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
            {!isEditing && !viewingOriginal && (
              <>
                <button type="button" onClick={startEditing} className="text-xs font-medium border border-black px-3 py-1.5 rounded hover:bg-gray-100">
                  සංස්කරණය (Edit)
                </button>
                <button type="button" onClick={() => navigate(`/minisahana/applications/${id}/edit-account-number`, { state: { record } })} className="text-xs font-medium border border-black px-3 py-1.5 rounded hover:bg-gray-100">
                  ගිණුම් අංකය සංස්කරණය (Edit Account No.)
                </button>
              </>
            )}
            {!isEditing && changes.length > 0 && (
              <button
                type="button"
                onClick={() => setViewingOriginal(v => !v)}
                className={`text-xs font-medium border px-3 py-1.5 rounded hover:bg-gray-100 ${viewingOriginal ? 'border-amber-600 text-amber-700 bg-amber-50' : 'border-black'}`}
              >
                {viewingOriginal ? 'වර්තමාන අයදුම්පත බලන්න (View Current)' : 'මුල් අයදුම්පත බලන්න (View Original)'}
              </button>
            )}
            {isEditing && (
              <button type="button" disabled={submitting} onClick={handleSave} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'සුරකිමින්...' : 'යාවත්කාලීන කරන්න (Save Changes)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {viewingOriginal && (
        <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-800 text-xs sm:text-sm px-3 py-2 rounded">
          🕐 මුල් අයදුම්පත් දත්ත පෙන්වයි (Showing the originally submitted data — read only).
        </div>
      )}

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
                  <EditableGrid length={2} value={formData.dobDay} onChange={(v) => handleChange('dobDay', v)} error={errors.dobDay} fitWidth={false} />
                  <EditableGrid length={2} value={formData.dobMonth} onChange={(v) => handleChange('dobMonth', v)} error={errors.dobMonth} fitWidth={false} />
                  <EditableGrid length={4} value={formData.dobYear} onChange={(v) => handleChange('dobYear', v)} error={errors.dobYear} fitWidth={false} />
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
                  <input type="radio" checked={(isEditing ? formData.grade : gradeLabel) === grade} disabled={!isEditing} onChange={() => handleChange('grade', grade)} className="w-4 h-4" />
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
                <input type="checkbox" checked={isEditing ? formData[item.editId] : categories.includes(item.viewId)} disabled={!isEditing} onChange={(e) => handleCategorySelect(item.editId, e.target.checked)} className="w-5 h-5" />
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
                ? <input type="text" disabled={!formData.categoryA} value={formData.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.licenseNumber ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.licenseNumber !== 'N/A' ? record.licenseNumber : ''} />} </div>
          </div>
          <div className="sm:w-1/2 flex flex-col sm:flex-row">
            <div className="sm:w-[45%] p-2 border-b sm:border-b-0 sm:border-r border-black font-medium">27. ලිපිගොනු අංකය</div>
            <div className="sm:w-[55%] p-2">
              {isEditing
                ? <input type="text" disabled={!formData.categoryA} value={formData.fileNumber} onChange={(e) => handleChange('fileNumber', e.target.value)} className={`w-full h-full focus:outline-none bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.fileNumber ? 'bg-red-50' : ''}`} />
                : <ReadOnlyField value={record.fileNumber !== 'N/A' ? record.fileNumber : ''} />}
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

        <DocumentsPanel
          recordId={id}
          documents={record.documents}
          grade={record.grade}
          token={token}
          disabled={isEditing || viewingOriginal}
          onRecordUpdated={(updated) => setRecord(updated)}
          onUnauthorized={() => { logout(); navigate('/login'); }}
        />

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
                  <span className={`px-2 py-0.5 rounded text-white text-[10px] font-semibold ${entry.editType === 'acc_number' ? 'bg-amber-600'
                    : entry.editType === 'document' ? 'bg-emerald-600'
                      : 'bg-blue-600'
                    }`}>
                    {entry.editType === 'acc_number' ? 'ACC NUMBER EDIT'
                      : entry.editType === 'document' ? 'DOCUMENT EDIT'
                        : 'NORMAL EDIT'}
                  </span>
                  <span>{entry.changedBy || 'Unknown'}</span>
                  <span>·</span>
                  <span>{entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {Object.keys(entry.newValues || {}).map((field) => (
                    <div key={field} className="grid grid-cols-1 sm:grid-cols-[minmax(0,180px)_1fr] gap-x-3 gap-y-0.5">
                      <span className="font-medium text-gray-700">{fieldLabel(field)}</span>
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