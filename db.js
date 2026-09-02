import 'dotenv/config';
import pg from 'pg';

/*
  POOL, not CLIENT.

  A pg.Client is ONE TCP connection. Every query in the whole app queues behind
  the previous one, and if that single connection ever drops (DB restart, idle
  timeout, network blip) it does NOT reconnect — every query after that point
  fails forever until you restart the server.

  A pg.Pool keeps a set of connections, hands one out per query, and replaces
  any that die. Same `.query()` signature, so nothing else in the app changes.
*/
const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,

  max: 10,                      // max simultaneous connections
  idleTimeoutMillis: 30_000,    // release idle connections after 30s
  connectionTimeoutMillis: 5_000, // fail fast instead of hanging forever
});

/*
  REQUIRED, not optional. An idle pooled client can emit 'error' on its own
  (e.g. Postgres restarts and drops the connection). Node treats an unhandled
  'error' event as fatal — without this listener that would crash the process.
  The pool discards the broken client and creates a fresh one, so logging is
  all we need to do here.
*/
db.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client:', err);
});

/*
  Fail fast at boot. The old code called db.connect() with no .catch(), so bad
  credentials surfaced as an unhandled rejection and the server carried on
  listening while every request 500'd. Better to check once and say why.
*/
try {
  const client = await db.connect();
  client.release();
  console.log(`Connected to Postgres db "${client.database}"`);
} catch (err) {
  console.error('Could not connect to Postgres:', err.message);
  process.exit(1);
}

export default db;
