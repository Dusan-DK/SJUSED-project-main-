import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiGet, apiSend } from '../lib/api';
/*
  FIELDS as data. Each option is { value, label }:
  - value → what's stored in DB (matches quiz contract exactly: oldMoney, other, etc.)
  - label → what the user sees (Old money, Non-binary)
  style_archetype is flagged multiSelect — it's a TEXT[] array and behaves
  differently from the single-value fields.
*/
const FIELDS = [
  {
    id: 'gender',
    label: 'Styling for',
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Non-binary' },
    ],
  },
  {
    id: 'style_archetype',
    label: 'Style',
    multiSelect: true,
    options: [
      { value: 'oldMoney', label: 'Old money' },
      { value: 'streetwear', label: 'Streetwear' },
      { value: 'casual', label: 'Casual' },
      { value: 'elegant', label: 'Elegant' },
      { value: 'minimalist', label: 'Minimalist' },
    ],
  },
  {
    id: 'skin_type',
    label: 'Skin type',
    options: [
      { value: 'oily', label: 'Oily' },
      { value: 'dry', label: 'Dry' },
      { value: 'combination', label: 'Combination' },
      { value: 'normal', label: 'Normal' },
      { value: 'sensitive', label: 'Sensitive' },
    ],
  },
  {
    id: 'budget',
    label: 'Budget',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'premium', label: 'Premium' },
    ],
  },
  {
    id: 'age_range',
    label: 'Age range',
    options: [
      { value: '<18', label: 'Under 18' },
      { value: '18-24', label: '18–24' },
      { value: '25-34', label: '25–34' },
      { value: '35+', label: '35 and up' },
    ],
  },
  {
    id: 'primary_interest',
    label: 'Interested in',
    options: [
      { value: 'fashion', label: 'Fashion' },
      { value: 'skincare', label: 'Skincare' },
      { value: 'both', label: 'Both' },
    ],
  },
];

// Helper: turn a stored value into its display label.
function labelFor(field, value) {
  const opt = field.options.find((o) => o.value === value);
  return opt ? opt.label : value;
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(null);

  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;

    apiGet('/api/avatar/profile')
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) return navigate('/login');
        if (err.status === 404) return navigate('/avatar/name');
        setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  /*
    Single-value save (gender, budget, etc.). The response used to be ignored
    entirely: the local state was updated whether or not the PATCH succeeded,
    so a rejected value looked saved until the page was reloaded. Now the
    server has to confirm before the UI moves.
  */
  async function handleChange(field, value) {
    setSaveError(null);
    try {
      await apiSend('/api/profile', 'PATCH', { field, value });
      setProfile({ ...profile, [field]: value });
      setEditing(null);
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      setSaveError(err.message);
    }
  }

  // Multi-select toggle (style): flip the value in the array, save the whole
  // array, keep the card open. Same toggle pattern as the quiz.
  async function handleStyleToggle(value) {
    const current = profile.style_archetype || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    setSaveError(null);
    try {
      await apiSend('/api/profile', 'PATCH', { field: 'style_archetype', value: updated });
      setProfile({ ...profile, style_archetype: updated });
      // note: no setEditing(null) — card stays open until user hits Done
    } catch (err) {
      if (err.status === 401) return navigate('/login');
      /*
        The server rejects an empty style array (it would break
        /api/recommendations), so deselecting the last style fails here and
        the UI correctly keeps showing the previous selection.
      */
      setSaveError(err.message);
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb]">
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fb]">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fb]">
      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* ── HEADER: avatar + email ── */}
        <div className="flex items-center gap-5">
          <div className="h-28 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <img
              src={profile.gender === 'male' ? '/img/MaleAvatar.png' : '/img/FemaleAvatar.png'}
              alt="Your avatar"
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-amber-600">
              Your profile
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
              {profile.email}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Tap any answer to update it. Your recommendations re-tune instantly.
            </p>
          </div>
        </div>

        {/* ── FIELD CARDS ── 2-col grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {FIELDS.map((field) => {
            const isEditing = editing === field.id;
            const isStyle = field.multiSelect;

            return (
              <div
                key={field.id}
                className={`rounded-2xl bg-white p-5 transition ${
                  isEditing ? 'ring-2 ring-amber-400' : 'ring-1 ring-slate-200'
                }`}
              >
                {/* Top row: label + value + Edit/Done */}
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-semibold uppercase tracking-wide text-slate-400">
                      {field.label}
                    </span>{' '}
                    <span className="ml-1 font-display text-base font-bold text-slate-900">
                      {isStyle
                        ? (profile.style_archetype || []).map((v) => labelFor(field, v)).join(', ')
                        : labelFor(field, profile[field.id])}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditing(isEditing ? null : field.id)}
                    className="text-sm font-semibold text-amber-600 transition hover:text-amber-700"
                  >
                    {isEditing ? 'Done' : 'Edit'}
                  </button>
                </div>

                {/* Expanded options */}
                {isEditing && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {field.options.map((option) => {
                      // active = currently selected (array-aware for style)
                      const isActive = isStyle
                        ? (profile.style_archetype || []).includes(option.value)
                        : profile[field.id] === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            isStyle
                              ? handleStyleToggle(option.value)
                              : handleChange(field.id, option.value)
                          }
                          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-amber-400 text-slate-900'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save failures used to be invisible — the UI showed the new value
            regardless and only a page reload revealed it hadn't stuck. */}
        {saveError && (
          <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {saveError}
          </p>
        )}

        {/* ── ACTIONS ── */}
        <div className="mt-10 flex items-center gap-3">
          <Link
            to="/avatar"
            className="rounded-full bg-amber-400 px-7 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-500"
          >
            Back to my avatar
          </Link>
          <button
            type="button"
            onClick={() => {
              fetch('/api/logout', { 
                method: 'POST',
                credentials: 'include' 
              }).then(
                () => navigate('/login')
              );
            }}
            className="rounded-full px-7 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-100"
          >
            Log out
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;




/* import { useState, useEffect } from 'react';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(null);

    useEffect(() => {
      fetch('/api/avatar/profile', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setProfile(data));
    }, []);
  
    if (!profile) return <p>Loading...</p>;

    async function handleChange(field, value) {
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ field, value })
    });
  
  setProfile({ ...profile, [field]: value });
  setEditing(null);
}
    
const fields = [
  { id: 'gender', label: 'Gender', options: ['male', 'female', 'other'] },
  { id: 'budget', label: 'Budget', options: ['low', 'medium', 'high', 'premium'] },
  { id: 'primary_interest', label: 'Primary Interest', options: ['fashion', 'skincare', 'both'] },
  { id: 'style_archetype', label: 'Style', options: ['oldmoney', 'streetwear', 'casual', 'elegant', 'minimalist'] },
  { id: 'skin_type', label: 'Skin Type', options: ['oily', 'dry', 'combination', 'normal', 'sensitive'] },
  { id: 'age_range', label: 'Age Range', options: ['<18', '18-24', '25-34', '35+'] },
];
    return (<div>
      <h2>Email: {profile.email} </h2>
      {fields.map(field => (<div key={field.id}>
        <p onClick={() => setEditing(field.id)} style={{ cursor: 'pointer' }}>
          {field.label}: {profile[field.id]}
        </p>
        {editing === field.id && (
          <div> 
            {field.options.map(option => (
              <button key={option} onClick={() => handleChange(field.id, option)} >
                {option}
              </button>
            ))}
          </div>
        )}
         </div>))}
  <button onClick={() => {
    fetch('/api/logout', { credentials: 'include' })
      .then(() => window.location.href = '/login');
     }}>
    Log Out
  </button>

    </div>)

    
}

export default Profile; 
 */
// it could update age rangeautomatically when the user has birthday.  
// 
