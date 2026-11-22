/*
  Let deleting a user delete their quiz profile too.

  quiz_profiles.user_id referenced users(id) with no ON DELETE rule, so
  `DELETE FROM users` failed with a foreign-key error for anyone who had taken
  the quiz. product_events and saved_products (003) already cascade; this makes
  "delete my account" remove everything in one statement, as the privacy
  policy promises.
*/

BEGIN;

ALTER TABLE quiz_profiles DROP CONSTRAINT quiz_profiles_user_id_fkey;

ALTER TABLE quiz_profiles
  ADD CONSTRAINT quiz_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;
