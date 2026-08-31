/*
  Applies every .sql file in migrations/ that hasn't been applied yet, in
  filename order, and records what it ran in a schema_migrations table.

  Run with: npm run migrate

  Before this, migrations/001 existed but there was no way to apply it — a
  fresh clone would create the tables by hand and silently miss it. Re-running
  is safe: already-applied files are skipped.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from '../db.js';

const migrationsDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'migrations'
);

await db.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const { rows } = await db.query('SELECT name FROM schema_migrations');
const alreadyApplied = new Set(rows.map((r) => r.name));

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort(); // 001_, 002_… so the numeric prefix defines the order

let appliedCount = 0;

for (const file of files) {
  if (alreadyApplied.has(file)) {
    console.log(`  skip     ${file}`);
    continue;
  }

  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

  try {
    /*
      Each file wraps itself in BEGIN/COMMIT, so a failure part-way through
      rolls back that file's changes. We only record it as applied once the
      SQL has actually succeeded.
    */
    await db.query(sql);
    await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    console.log(`  applied  ${file}`);
    appliedCount++;
  } catch (err) {
    console.error(`  FAILED   ${file}`);
    console.error(`           ${err.message}`);
    await db.end();
    process.exit(1);
  }
}

console.log(
  appliedCount === 0
    ? 'Database is up to date; nothing to apply.'
    : `Applied ${appliedCount} migration(s).`
);

await db.end();
