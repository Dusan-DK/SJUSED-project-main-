import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import db from './db.js';
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import rateLimit from 'express-rate-limit';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import { validateCredentials, validateProfileField, validateQuiz } from './validation.js';

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;
const isProduction = process.env.NODE_ENV === 'production';

/*
  A real bcrypt hash of a value nobody can log in with, used to burn the same
  ~70ms when there is no password to check as when there is.

  Why: comparing a password takes bcrypt real work, but returning early for an
  unknown email costs nothing. That made login answer in ~0.003s for an address
  that is not registered and ~0.069s for one that is — identical JSON, but a
  20x timing gap that reliably reveals which emails have accounts.

  Computed once at boot; hashSync is fine here because nothing is serving yet.
*/
const TIMING_DECOY_HASH = bcrypt.hashSync('timing-decoy-never-a-real-password', saltRounds);

// Fail loudly at boot rather than signing every cookie with `undefined`.
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET is not set. See .env.example.');
  process.exit(1);
}
/*
  Security response headers. First in the chain so they are set even on
  responses that never reach a route (404s, errors, rate-limit rejections).

  Worth being clear about what actually helps here: this server sends JSON and
  never an HTML document, so the headers helmet is best known for — CSP and
  X-Frame-Options — protect nothing, since there is no page of ours for a
  browser to render or frame. They stay on because they cost nothing.

  The ones that do earn their place:
    X-Content-Type-Options: nosniff  — stops a browser re-interpreting a JSON
                                       response as HTML or script
    Referrer-Policy                  — keeps our URLs out of Referer headers
    Strict-Transport-Security        — HTTPS-only, once actually on HTTPS
    (X-Powered-By is removed, so responses stop advertising Express)

  NOTE for deployment: helmet also sets Cross-Origin-Resource-Policy:
  same-origin. That does not affect fetch() calls, which are governed by CORS,
  so it is safe with a separately hosted frontend. But this app has no cors
  middleware at all — if you ever serve the client from a different domain
  than the API, that has to be added, along with sameSite:'none' on the
  session cookie.
*/
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minút
  max: 10,                   // max 10 pokusov per IP
  message: { error: 'Too many attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/*
  Behind a reverse proxy (Render, Railway, nginx…) Express sees the proxy's IP
  and thinks the connection is plain HTTP, so `secure` cookies would never be
  sent. `trust proxy` makes it read X-Forwarded-For / -Proto instead.

  Gated on production on purpose: trusting those headers locally would let any
  client spoof its IP and walk straight past authLimiter's per-IP counting.
  The value is 1, not `true` — trust exactly one hop, not an arbitrary chain.
*/
if (isProduction) {
  app.set('trust proxy', 1);
}

/*
  SESSION STORE — was the default MemoryStore, which (a) leaks memory because
  it never evicts expired sessions and (b) logs everyone out on every restart
  and every deploy. Postgres is already here, so sessions live there now.

  createTableIfMissing builds the `session` table on first boot; no migration
  to run by hand.
*/
const PgSession = connectPgSimple(session);

app.use(session({
  store: new PgSession({
    pool: db,                   // reuse the same pool, don't open a second one
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,             // JS in the page can't read the cookie (XSS defence)
    secure: isProduction,       // HTTPS-only in prod; off locally so http works
    sameSite: 'lax',            // blocks cross-site POSTs (CSRF) but still allows
                                // the top-level GET redirect back from Google
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));


app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());





app.get('/api/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

app.get('/api/recommendations', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const userId = req.user.id;
    const zone = req.query.zone;
    const zoneToCategory = {
      face: ['skincare'],
      hair: ['accessories'],
      torso: ['tops', 'dresses'],
      legs: ['bottoms', 'dresses'],
      feet: ['shoes']
    };

    const category = zoneToCategory[zone];
     if (!category) {
    return res.status(400).json({ error: 'Invalid zone' });
    }

    const profile = await db.query(
      'SELECT * FROM quiz_profiles WHERE user_id = $1',
      [userId]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'No profile found' });
    }

    const { gender, budget, style_archetype, skin_type } = profile.rows[0];

    const products = await db.query(
      `SELECT * FROM products 
       WHERE (gender = $1 OR gender = 'unisex')
       AND budget_range = $2
       AND category = ANY($3)
       AND style_archetype && $4
       AND (skin_type IS NULL OR $5 = ANY(skin_type))`,
      [gender, budget, category, style_archetype, skin_type]
    );

    res.json(products.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/avatar/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const userId = req.user.id;

    const profile = await db.query(
      'SELECT quiz_profiles.*, users.email FROM quiz_profiles JOIN users ON quiz_profiles.user_id = users.id WHERE quiz_profiles.user_id = $1',
      [userId]
    );

    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'No profile found' });
    }

    res.json(profile.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Štart — presmeruje usera na Google
app.get('/api/auth/google',
  passport.authenticate('google', 
  { 
    scope: ['email', 'profile'], 
    prompt: 'select_account'
  })
);

// Callback — Google vráti usera sem
app.get('/api/auth/google/callback',
  // failureRedirect was '/login' — a path on THIS server, which has no such
  // route, so a failed login showed an Express 404 instead of the React page.
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
  async (req, res) => {
    try {
      const profile = await db.query(
        'SELECT * FROM quiz_profiles WHERE user_id = $1',
        [req.user.id]
      );

      if (profile.rows.length > 0) {
        // Existujúci user s profilom → avatar
        res.redirect(`${process.env.FRONTEND_URL}/avatar`);
      } else {
        // Nový user bez profilu → pomenovanie avatara
        res.redirect(`${process.env.FRONTEND_URL}/avatar/name`);
      }
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/avatar/name`);
    }
  }
);

app.get('/api/quiz/status', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not logged in' });
  
  const profile = await db.query(
    'SELECT id FROM quiz_profiles WHERE user_id = $1',
    [req.user.id]
  );
  
  res.json({ completed: profile.rows.length > 0 });
});

app.patch('/api/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  const userId = req.user.id;
  const { field, value } = req.body;

  /*
    The field NAME was already whitelisted (which is what keeps the interpolated
    `SET ${field}` safe), but the VALUE was not — any string at all could be
    written into budget, gender, skin_type… and then silently break
    /api/recommendations, which filters on exactly these values.
  */
  const check = validateProfileField(field, value);
  if (check.error) {
    return res.status(400).json({ error: check.error });
  }

  try {
    const result = await db.query(
      `UPDATE quiz_profiles SET ${field} = $1 WHERE user_id = $2`,
      [check.value, userId]
    );

    // Previously a user with no profile row got {success:true} for an update
    // that changed nothing at all.
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No profile found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/profile failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/quiz', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  // Was completely unvalidated — nulls and junk went straight into the profile,
  // producing a row that /api/recommendations can never match against.
  const check = validateQuiz(req.body);
  if (check.error) {
    return res.status(400).json({ error: check.error });
  }

  const { gender, style_archetype, skin_type, budget, age_range, primary_interest, avatar_name } = check.value;
  const userId = req.user.id;

  try {
    await db.query(
  `INSERT INTO quiz_profiles 
   (user_id, gender, style_archetype, skin_type, budget, age_range, primary_interest, avatar_name)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   ON CONFLICT (user_id) DO UPDATE SET
     gender = EXCLUDED.gender,
     style_archetype = EXCLUDED.style_archetype,
     skin_type = EXCLUDED.skin_type,
     budget = EXCLUDED.budget,
     age_range = EXCLUDED.age_range,
     primary_interest = EXCLUDED.primary_interest,
     avatar_name = EXCLUDED.avatar_name`,
  [userId, gender, style_archetype, skin_type, budget, age_range, primary_interest, avatar_name]
);
    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post("/api/register", authLimiter,async (req, res) => {
  // Was unvalidated: a missing email reached bcrypt.hash(undefined) and threw
  // a 500, and an empty password was accepted and hashed happily.
  const check = validateCredentials(req.body);
  if (check.error) {
    return res.status(400).json({ error: check.error });
  }
  const { email, password } = check.value;

  try {
    const hash = await bcrypt.hash(password, saltRounds);

    /*
      The old code did SELECT-then-INSERT, which is a race: two requests could
      both find nothing and both try to insert. Let the UNIQUE(email)
      constraint decide instead — it is the only check that cannot be raced.
      23505 = unique_violation.
    */
    let result;
    try {
      result = await db.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
        [email, hash]
      );
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: 'Email already in use' });
      }
      throw err;
    }

    const user = result.rows[0];

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      res.json({ success: true });
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post("/api/login", authLimiter,(req, res, next) => {
  passport.authenticate("local", (err, user) => {
    // Distinguish "something broke" from "wrong password". Lumping them
    // together told a user to check their password during a DB outage.
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json({ success: true });
    });
  })(req, res, next);
});

app.post('/api/logout', (req, res) => {
  req.logout(function(err) {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
});


passport.use(
  "local",
  new Strategy({ usernameField: "email" }, async function verify(email, password, cb) {
    try {
      /*
        Matched case-insensitively so "Bob@x.com" and "bob@x.com" reach the same
        account, while the stored address keeps whatever case was registered.
        lower(email) is backed by the unique index from migration 001, so this
        still uses an index rather than scanning.

        Deliberately NOT run through validateCredentials: that enforces a
        minimum length, which would lock out anyone who registered before that
        rule existed.
      */
      if (typeof email !== 'string' || typeof password !== 'string') {
        return cb(null, false);
      }

      const result = await db.query(
        "SELECT id, email, password_hash FROM users WHERE lower(email) = lower($1)",
        [email.trim()]
      );

      /*
        Unknown email. Same answer AND the same duration as a wrong password —
        the decoy compare always fails, it exists purely to spend the time.
      */
      if (result.rows.length === 0) {
        await bcrypt.compare(password, TIMING_DECOY_HASH);
        return cb(null, false);
      }

      const user = result.rows[0];

      /*
        Google-only account: it was created by the OAuth strategy with no
        password, so password_hash is NULL. bcrypt.compare(password, null)
        rejects with "data and hash arguments required" — a thrown error, not
        a failed match. Now that the route reports errors as 500, that would
        turn a plain wrong-account-type login into a server error. Guard first.
      */
      if (!user.password_hash) {
        await bcrypt.compare(password, TIMING_DECOY_HASH);
        return cb(null, false);
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return cb(null, false);
      }

      // Hand back the user WITHOUT the hash — nothing downstream needs it.
      return cb(null, { id: user.id, email: user.email });
    } catch (err) {
      /*
        THE BUG: this catch used to log and fall through without calling cb().
        Passport then never got a verdict, no response was ever written, and the
        request hung open until the client timed out. Always call cb.
      */
      console.error('Local auth error:', err);
      return cb(err);
    }
  })
);

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;

    if (!email) {
      return cb(null, false, { message: 'Google account has no email address' });
    }

    /*
      We link accounts by email below, so we must know Google actually verified
      ownership of the address — otherwise someone could claim an address they
      don't own and take over the matching password account.
      Checked as "not explicitly false" so a missing field doesn't lock everyone
      out; Google sends email_verified for the 'email' scope.
    */
    const emailVerified = profile.emails[0].verified;
    if (emailVerified === false || emailVerified === 'false') {
      return cb(null, false, { message: 'Google email is not verified' });
    }

    // 1. Already linked → straight in.
    const byGoogleId = await db.query(
      'SELECT id, email, google_id, created_at FROM users WHERE google_id = $1',
      [googleId]
    );

    if (byGoogleId.rows.length > 0) {
      return cb(null, byGoogleId.rows[0]);
    }

    /*
      2. Not linked yet — either a brand new email, or one that already belongs
         to an account created with email + password.

         THE BUG: the old code always INSERTed here. users.email is UNIQUE, so
         for anyone who had registered with a password that INSERT threw a
         unique violation and they could never sign in with Google at all.

         One statement handles both cases: insert if new, otherwise attach the
         google_id to the row that already exists. Doing it as a single upsert
         also means two callbacks firing at once can't race each other.
         COALESCE so we never overwrite a google_id that is already set.
    */
    const result = await db.query(
      `INSERT INTO users (email, google_id)
       VALUES ($1, $2)
       ON CONFLICT (lower(email)) DO UPDATE
         SET google_id = COALESCE(users.google_id, EXCLUDED.google_id)
       RETURNING id, email, google_id, created_at`,
      [email, googleId]
    );

    const user = result.rows[0];

    /*
      If the row came back holding a DIFFERENT google_id, this email is already
      linked to another Google account. Refuse — logging this person in would
      hand them someone else's account.
    */
    if (user.google_id !== googleId) {
      return cb(null, false, { message: 'Email already linked to another Google account' });
    }

    return cb(null, user);
  } catch (err) {
    console.error('Google auth error:', err);
    return cb(err);
  }
}));


/*
  SERIALIZE = what gets written into the session. Store ONLY the id.

  Previously the whole user row went into the session — including password_hash,
  which then rode along in req.user and was sent to the browser by /api/me.
  An id is all we need to find the user again.
*/
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

/*
  DESERIALIZE = turn that id back into req.user on each authenticated request.

  Columns are listed explicitly rather than SELECT * so password_hash can never
  leak into req.user again, even if someone adds a sensitive column later.

  This costs one extra query per authenticated request, which is the accepted
  trade for never serving stale user data — and cheap now that db is a pool.
*/
passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query(
      'SELECT id, email, google_id, created_at FROM users WHERE id = $1',
      [id]
    );

    // User was deleted while their session was still alive → treat as logged out.
    if (result.rows.length === 0) return cb(null, false);

    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

/*
  404 — must come after every route, so it only runs when nothing matched.
  Without it Express falls back to its built-in handler, which answers an
  HTML error page. Every client of this server expects JSON, so a typo'd
  endpoint used to blow up in the browser as "Unexpected token '<'" rather
  than reporting a plain 404.
*/
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

/*
  Central error handler. Express identifies it by its FOUR arguments — drop
  `next` and it silently becomes ordinary middleware that never runs.

  Express 5 forwards rejected promises from async handlers here automatically,
  which is what previously reached the default handler: outside production
  that responds with the full stack trace, exposing absolute file paths, the
  project layout and library versions to anyone who can trigger an error.

  The real error is logged server-side; the client gets a flat message.
*/
app.use((err, req, res, next) => {
  console.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

  // If a handler already began streaming a response we cannot replace the
  // status; hand back to Express to close the connection.
  if (res.headersSent) {
    return next(err);
  }

  // Body-parser throws this for malformed JSON — a client mistake, not ours.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
