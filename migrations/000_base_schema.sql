/*
  The original tables (users, products, quiz_profiles), so a brand-new empty
  database can be built from the migrations alone. Before this, they existed
  only because they were created by hand, and migrations 001–004 failed on a
  fresh database with 'relation "users" does not exist'.

  Written in their ORIGINAL shape, deliberately: 001 expects
  users_email_key to exist (it drops it), 002 drops skin_type and
  primary_interest, 004 replaces quiz_profiles_user_id_fkey. Later migrations
  then take a fresh database to exactly the same place as the existing one.

  SAFE ON AN EXISTING DATABASE: everything is IF NOT EXISTS, so on a database
  that already has these tables it changes nothing.

  Not here: `session` (connect-pg-simple creates it at server start) and
  `schema_migrations` (the migration runner creates it).
*/

BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  created_at    TIMESTAMP DEFAULT now(),
  google_id     TEXT,
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_google_id_key UNIQUE (google_id)
);

CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  gender          VARCHAR(20),
  budget_range    VARCHAR(50),
  image_url       TEXT,
  affiliate_url   TEXT NOT NULL,
  created_at      TIMESTAMP DEFAULT now(),
  style_archetype TEXT[],
  brand           TEXT,
  description     TEXT,
  skin_type       TEXT[]
);

CREATE TABLE IF NOT EXISTS quiz_profiles (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER,
  gender           VARCHAR(20),
  style_archetype  TEXT[],
  skin_type        VARCHAR(50),
  budget           VARCHAR(20),
  age_range        VARCHAR(20),
  primary_interest VARCHAR(20),
  created_at       TIMESTAMP DEFAULT now(),
  avatar_name      TEXT,
  CONSTRAINT quiz_profiles_user_id_unique UNIQUE (user_id),
  CONSTRAINT quiz_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMIT;
