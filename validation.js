/*
  One place that defines what the API will accept.

  Every validator returns either { error: 'message' } or { value: <cleaned> }.
  Callers check `error` first and return 400; otherwise they use `value`, which
  is the trimmed/normalised version — never the raw req.body.

  PROFILE_OPTIONS is also the single source of truth for the quiz answers. The
  same lists are currently duplicated in client/src/pages/Quiz.jsx and
  Profile.jsx; those should eventually import from here so the frontend and the
  backend can never drift apart.
*/

export const PROFILE_OPTIONS = {
  gender: ['female', 'male', 'other'],
  style_archetype: ['oldMoney', 'streetwear', 'casual', 'elegant', 'minimalist'],
  skin_type: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
  budget: ['low', 'medium', 'high', 'premium'],
  age_range: ['<18', '18-24', '25-34', '35+'],
  primary_interest: ['fashion', 'skincare', 'both'],
};

// style_archetype is a TEXT[] column — it takes an array, everything else a string.
const MULTI_VALUE_FIELDS = ['style_archetype'];

export const PASSWORD_MIN = 8;
/*
  bcrypt only reads the first 72 BYTES of input and silently ignores the rest,
  so a longer password gives a false sense of strength. Reject instead.
*/
export const PASSWORD_MAX = 72;

export const AVATAR_NAME_MAX = 40;
const EMAIL_MAX = 254; // RFC 5321 limit on a full address

// Deliberately loose. Anything stricter rejects valid addresses; the real
// proof that an address works is sending mail to it.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

/*
  Whitespace is trimmed but CASE IS PRESERVED — the address is stored exactly
  as the user typed it, so mail we send later goes to what they gave us and the
  profile page can display it properly.

  Uniqueness and lookups are case-insensitive instead, via the unique index on
  lower(email) (migrations/001_email_case_insensitive.sql). So Bob@x.com is
  stored as "Bob@x.com" but still collides with bob@x.com.
*/
export function validateCredentials(body) {
  const { email, password } = body ?? {};

  if (!isNonEmptyString(email)) {
    return { error: 'Email is required' };
  }

  const cleanEmail = email.trim();

  if (cleanEmail.length > EMAIL_MAX || !EMAIL_PATTERN.test(cleanEmail)) {
    return { error: 'Enter a valid email address' };
  }

  // Not isNonEmptyString: a password of only spaces is a real (bad) password,
  // and trimming it would change what the user typed.
  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Password is required' };
  }

  if (password.length < PASSWORD_MIN) {
    return { error: `Password must be at least ${PASSWORD_MIN} characters` };
  }

  if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX) {
    return { error: `Password must be at most ${PASSWORD_MAX} bytes` };
  }

  return { value: { email: cleanEmail, password } };
}

/*
  Used by PATCH /api/profile. The field name was already whitelisted there, but
  the VALUE was not — any string could be written into budget, gender, etc.
*/
export function validateProfileField(field, value) {
  const allowed = PROFILE_OPTIONS[field];

  if (!allowed) {
    return { error: 'Invalid field' };
  }

  if (MULTI_VALUE_FIELDS.includes(field)) {
    if (!Array.isArray(value) || value.length === 0) {
      return { error: `${field} must be a non-empty array` };
    }
    if (!value.every((v) => allowed.includes(v))) {
      return { error: `${field} contains an unknown value` };
    }
    // De-duplicate so the array can't grow without bound on repeated toggles.
    return { value: [...new Set(value)] };
  }

  if (!allowed.includes(value)) {
    return { error: `${field} must be one of: ${allowed.join(', ')}` };
  }

  return { value };
}

/*
  Used by POST /api/quiz. Every profile field is required here — a half-filled
  profile produces broken recommendations, since /api/recommendations filters
  on all of them.
*/
export function validateQuiz(body) {
  const clean = {};

  for (const field of Object.keys(PROFILE_OPTIONS)) {
    const result = validateProfileField(field, body?.[field]);
    if (result.error) {
      return { error: result.error };
    }
    clean[field] = result.value;
  }

  // avatar_name is free text, so it only needs to be present and bounded.
  if (!isNonEmptyString(body?.avatar_name)) {
    return { error: 'Avatar name is required' };
  }

  const avatarName = body.avatar_name.trim();
  if (avatarName.length > AVATAR_NAME_MAX) {
    return { error: `Avatar name must be at most ${AVATAR_NAME_MAX} characters` };
  }

  clean.avatar_name = avatarName;
  return { value: clean };
}
