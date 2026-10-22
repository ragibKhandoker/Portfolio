import { readFile, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

function configError() {
  if (!/^https:\/\/.+\.supabase\.co\/?$/.test(SUPABASE_URL)) {
    return 'SUPABASE_URL must be the project API URL (https://<project-ref>.supabase.co), not a postgresql:// connection string.';
  }
  if (SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_')) {
    return 'SUPABASE_SERVICE_ROLE_KEY is a publishable key. Use the secret key (sb_secret_...) or the legacy service_role key.';
  }
  return null;
}

export const supabaseConfigError = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? configError() : null;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && !supabaseConfigError
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

export const storageMode = supabase ? 'supabase' : 'local';

const dataFile = name => new URL(`./data/${name}.json`, import.meta.url);
const readJson = async name => JSON.parse(await readFile(dataFile(name), 'utf8'));

async function fromSupabase(table, orderBy) {
  const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true });
  if (error) throw error;
  return data;
}

export async function checkConnection() {
  if (!supabase) return { ok: true };
  const results = await Promise.all(['projects', 'skills', 'contact_messages'].map(async table => {
    // A head request hides PostgREST errors (e.g. missing table), so fetch at most one row instead
    const { error, status } = await supabase.from(table).select('id').limit(1);
    if (!error) return null;
    const hint = status === 401 ? 'invalid SUPABASE_SERVICE_ROLE_KEY'
      : status === 404 || error.code === 'PGRST205' ? 'table not found (run supabase/schema.sql)'
      : error.message || `HTTP ${status}`;
    return `${table}: ${hint}`;
  }));
  const errors = results.filter(Boolean);
  return errors.length ? { ok: false, errors } : { ok: true };
}

export async function getProjects() {
  return supabase ? fromSupabase('projects', 'id') : readJson('projects');
}

export async function getSkills() {
  return supabase ? fromSupabase('skills', 'id') : readJson('skills');
}

export async function saveContactMessage(message) {
  if (supabase) {
    const { error } = await supabase.from('contact_messages').insert(message);
    if (error) throw error;
    return;
  }
  let messages = [];
  try { messages = await readJson('messages'); } catch { /* first message */ }
  messages.push({ id: messages.length + 1, ...message, created_at: new Date().toISOString() });
  await writeFile(dataFile('messages'), JSON.stringify(messages, null, 2));
}
