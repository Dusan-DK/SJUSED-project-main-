/*
  Behaviour tracking — the data the recommender will learn from later.

  product_events: an append-only log, one row per action.
    view   → the product was shown in a user's shortlist
    click  → the user pressed "Buy now" (affiliate click)
    save   → the user hearted it
    unsave → the user removed the heart
  Never updated, only inserted, so the history stays honest: "saved then
  unsaved" is a real signal that a single boolean would erase.

  saved_products: the CURRENT state of each user's hearts, so the ♡ button can
  show filled/empty. The log above says what happened; this says what is true now.

  ON DELETE CASCADE on both: deleting a user or a product (like 002 deleting
  skincare) removes its rows instead of failing on the foreign key.
*/

BEGIN;

CREATE TABLE product_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('view', 'click', 'save', 'unsave')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Popularity later: "clicks on product X in the last 30 days".
CREATE INDEX product_events_product_type_time
  ON product_events (product_id, type, created_at);

-- Personal taste / fatigue later: "what has user Y done recently".
CREATE INDEX product_events_user_time
  ON product_events (user_id, created_at);

CREATE TABLE saved_products (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

COMMIT;
