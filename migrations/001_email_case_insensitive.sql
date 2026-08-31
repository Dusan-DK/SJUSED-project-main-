/*
  Make email uniqueness case-insensitive WITHOUT flattening what the user typed.

  Before: UNIQUE (email) — a byte comparison, so Bob@x.com and bob@x.com were
  two separate accounts for one real inbox. That also broke Google account
  linking, because Google always reports the address lowercased.

  After: a unique index on lower(email). Bob@x.com is stored exactly as typed
  (so outgoing mail goes to the address they gave us, and the profile page can
  display it properly), but no second row can differ only by case.

  RFC 5321 §2.4 does say local-parts are case-sensitive, but adds that relying
  on that "impedes interoperability and is discouraged". No mainstream provider
  distinguishes them.

  SAFETY: if any case-duplicate emails already exist, CREATE UNIQUE INDEX fails
  and the whole transaction rolls back. Nothing is lost — resolve the duplicates
  and run it again.
*/

BEGIN;

CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));

ALTER TABLE users DROP CONSTRAINT users_email_key;

COMMIT;
