import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActivitySquare, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { completeProfile } from '../api';

// ─── Tag Input Helper ─────────────────────────────────────────────────────────

const TagInput = ({ id, label, tags, setTags, placeholder }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) setTags([...tags, val]);
    setInput('');
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          type="button"
          onClick={addTag}
          className="w-10 h-10 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition"
          aria-label={`Add ${label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="hover:text-blue-900 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Emergency Contact Row ────────────────────────────────────────────────────

const ContactRow = ({ contact, index, onChange, onRemove }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Contact {index + 1}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove contact"
        className="text-slate-400 hover:text-red-500 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
    {['name', 'phone', 'email', 'relation'].map((field) => (
      <input
        key={field}
        type={field === 'phone' ? 'tel' : field === 'email' ? 'email' : 'text'}
        value={contact[field]}
        onChange={(e) => onChange(index, field, e.target.value)}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || '');
  const [allergies, setAllergies] = useState(user?.allergies || []);
  const [conditions, setConditions] = useState(user?.medicalConditions || []);
  const [contacts, setContacts] = useState(
    user?.emergencyContacts?.length > 0 
      ? user.emergencyContacts 
      : [{ name: '', phone: '', email: '', relation: '' }]
  );

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-redirect if somehow already complete
  useEffect(() => {
    if (user?.profileComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const updateContact = (idx, field, value) => {
    setContacts((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const addContact = () => {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: '', phone: '', email: '', relation: '' }]);
    }
  };

  const removeContact = (idx) => setContacts(contacts.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bloodGroup) return setError('Please select your blood group.');

    const validContacts = contacts.filter((c) => c.name && c.phone && c.email);

    setSubmitting(true);
    try {
      await completeProfile({
        bloodGroup,
        allergies,
        medicalConditions: conditions,
        emergencyContacts: validContacts,
      });

      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err) {
      setError(err.message || 'Saving profile failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex flex-col items-center justify-center bg-white px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Profile Completed!</h2>
        <p className="text-slate-500 text-sm">Taking you to the dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="bg-blue-600 px-6 pt-12 pb-8 border-b border-blue-700">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-2 text-white">
              <ActivitySquare className="w-6 h-6" />
              <h1 className="text-xl font-bold">Complete Your Profile</h1>
           </div>
           {user?.avatar && (
             <img src={user.avatar} alt="Avatar" className="w-10 h-10 border-2 border-white rounded-full bg-blue-200" />
           )}
        </div>
        <p className="text-blue-100 text-sm">
          Welcome, {user?.name}! We need a little more medical information to setup your AI responder.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="px-6 py-8 space-y-6">
        {/* Error */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg p-3">
            ⚠️ {error}
          </div>
        )}

        {/* Read-only name/email area */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Google Account</p>
          <p className="text-slate-900 text-sm font-medium">{user?.email}</p>
        </div>

        {/* Blood Group */}
        <div>
          <label htmlFor="blood-group" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Blood Group *
          </label>
          <select
            id="blood-group"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
          >
            <option value="">Select blood group…</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        {/* Allergies */}
        <TagInput
          id="allergies"
          label="Known Allergies"
          tags={allergies}
          setTags={setAllergies}
          placeholder="e.g. Penicillin"
        />

        {/* Conditions */}
        <TagInput
          id="medical-conditions"
          label="Medical Conditions"
          tags={conditions}
          setTags={setConditions}
          placeholder="e.g. Hypertension"
        />

        {/* Emergency Contacts */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">
            Emergency Contacts
          </h3>
          <div className="space-y-3">
            {contacts.map((c, i) => (
              <ContactRow
                key={i}
                contact={c}
                index={i}
                onChange={updateContact}
                onRemove={() => removeContact(i)}
              />
            ))}
          </div>
          {contacts.length < 3 && (
            <button
              type="button"
              onClick={addContact}
              className="mt-3 flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add another contact
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg shadow-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-60 mt-4"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {submitting ? 'Saving...' : 'Finish Setup'}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;
