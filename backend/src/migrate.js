import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const schemaFile = new URL('../supabase/schema.sql', import.meta.url);

// Creates the tables and seed data via a direct Postgres connection (supabase-js cannot run DDL).
export async function runMigrations() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) return { skipped: true };
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(await readFile(schemaFile, 'utf8'));
  } finally {
    await client.end();
  }
  return { skipped: false };
}

// `npm run db:setup`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMigrations()
    .then(({ skipped }) => console.log(skipped ? '⚠️  DATABASE_URL not set — nothing to do.' : '✅ Database schema is up to date.'))
    .catch(err => { console.error('❌ Migration failed:', err.message); process.exit(1); });
}
