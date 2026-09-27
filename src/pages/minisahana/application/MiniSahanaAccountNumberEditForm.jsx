import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const MiniSahanaAccountNumberEditForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const record = location.state?.record;

  if (!record) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <p className="text-red-600 mb-4">Application data not found. Please open this from the preview page.</p>
        <button
          type="button"
          onClick={() => navigate(`/minisahana/applications/${id}`)}
          className="bg-gray-200 px-4 py-2 rounded font-medium hover:bg-gray-300"
        >
          ← Back to Preview
        </button>
      </div>
    );
  }

  const [accountNumber, setAccountNumber] = useState(record.bankAccountNumber || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      alert('ඔබගේ සැසිය අවසන් වී ඇත. කරුණාකර නැවත පිවිසෙන්න.');
      navigate('/login');
      return;
    }

    const trimmed = accountNumber.trim();
    if (!trimmed) {
      setError('ගිණුම් අංකය අවශ්‍යයි. (Account number is required.)');
      return;
    }
    if (trimmed === record.bankAccountNumber) {
      setError('නව ගිණුම් අංකය වත්මන් අගයට වඩා වෙනස් විය යුතුය. (New number must differ from current.)');
      return;
    }

    try {
      setSubmitting(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/mini-sahana-form/${id}/account-number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bankAccountNumber: trimmed }),
      });

      if (response.ok) {
        alert('ගිණුම් අංකය යාවත්කාලීන කරන ලදී! (Account number updated!)');
        navigate(`/minisahana/applications/${id}`, {
          state: { record: { ...record, bankAccountNumber: trimmed } },
        });
      } else if (response.status === 401) {
        logout();
        navigate('/login');
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || 'යාවත්කාලීන කිරීමේ දෝෂයක්.');
      }
    } catch (err) {
      console.error(err);
      setError('යාවත්කාලීන කිරීමේ දෝෂයක්.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 sm:p-8 bg-white text-black font-sinhala">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/minisahana/applications/${id}`, { state: { record } })}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-black"
        >
          ← ආපසු (Cancel)
        </button>
        <span className="text-xs text-gray-500">Ref: {record.refNumber}</span>
      </div>

      <h1 className="text-lg font-bold mb-4">ගිණුම් අංකය සංස්කරණය (Edit Account Number)</h1>

      <div className="border border-black">
        <div className="p-2 border-b border-black font-medium bg-gray-50">
          වත්මන් ගිණුම් අංකය (Current Account Number)
        </div>
        <div className="p-2 border-b border-black text-gray-500">
          {record.bankAccountNumber}
        </div>
        <div className="p-2 border-b border-black font-medium bg-gray-50">
          නව ගිණුම් අංකය (New Account Number) <span className="text-red-500">*</span>
        </div>
        <div className={`p-2 ${error ? 'bg-red-50' : ''}`}>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full focus:outline-none bg-transparent border-b border-gray-300 py-1"
            autoFocus
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <div className="flex justify-end mt-6 border-t pt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-8 py-3 rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'සුරකිමින්...' : 'යාවත්කාලීන කරන්න (Save)'}
        </button>
      </div>
    </form>
  );
};

export default MiniSahanaAccountNumberEditForm;