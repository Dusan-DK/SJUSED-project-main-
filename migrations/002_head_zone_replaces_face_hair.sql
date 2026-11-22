/*
  Replace the Face and Hair zones with a single Head zone (caps & headscarves).

  - Skincare products are deleted: the Face zone is gone, nothing shows them.
  - The 'accessories' products (the old Hair zone) were all caps, beanies,
    berets and hats, so they move into the new 'headwear' category instead of
    being deleted. To delete them instead, replace the UPDATE with:
        DELETE FROM products WHERE category = 'accessories';
  - skin_type (products + quiz_profiles) and primary_interest (quiz_profiles)
    only existed for skincare, so the columns are dropped.

  ORDER: deploy the code that no longer reads these columns BEFORE running
  this. The old server's INSERT names skin_type and would fail afterwards.

  Irreversible: dropped columns and deleted rows are gone. Take a dump first.
*/

BEGIN;

DELETE FROM products WHERE category = 'skincare';

UPDATE products SET category = 'headwear' WHERE category = 'accessories';

ALTER TABLE products DROP COLUMN IF EXISTS skin_type;

ALTER TABLE quiz_profiles
  DROP COLUMN IF EXISTS skin_type,
  DROP COLUMN IF EXISTS primary_interest;

COMMIT;
