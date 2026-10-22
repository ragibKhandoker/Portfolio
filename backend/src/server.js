import 'dotenv/config';
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import portfolioRoutes from './routes/portfolio.js';
import { storageMode, checkConnection, supabaseConfigError } from './db.js';
import { runMigrations } from './migrate.js';

const SERVICE_NAME = 'portfolio-api';
const app = express();
const PORT = Number(process.env.PORT) || 5001;
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());

app.use(cors({ origin: origins }));
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', async (_req, res) => {
  const db = await checkConnection();
  res.status(db.ok ? 200 : 503).json({ success: db.ok, service: SERVICE_NAME, storage: storageMode, ...(db.errors && { errors: db.errors }), ...(supabaseConfigError && { configError: supabaseConfigError }) });
});
app.use('/api/portfolio', portfolioRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Invalid JSON body.' });
  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
});

async function logDatabaseStatus() {
  if (supabaseConfigError) {
    console.log(`❌ Supabase config error: ${supabaseConfigError}`);
    console.log('⚠️  Falling back to local JSON storage.');
    return;
  }
  if (storageMode === 'local') {
    console.log('⚠️  Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing) — using local JSON storage.');
    return;
  }
  try {
    const { skipped } = await runMigrations();
    if (!skipped) console.log('✅ Database schema applied (tables + seed data).');
  } catch (err) {
    console.log('❌ Could not apply database schema (check DATABASE_URL):', err.message);
  }
  try {
    const db = await checkConnection();
    if (db.ok) console.log('✅ Supabase Database Connected!');
    else {
      console.log('❌ Supabase Database Connection Failed:');
      db.errors.forEach(e => console.log(`   - ${e}`));
    }
  } catch (err) {
    console.log('❌ Supabase Database Connection Failed:', err.message);
  }
}

// When the port is taken, check whether it is already this API so a second start is harmless.
function handlePortInUse() {
  const req = http.get(`http://127.0.0.1:${PORT}/api/health`, res => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      try {
        if (JSON.parse(body).service === SERVICE_NAME) {
          console.log(`Portfolio API is already running at http://localhost:${PORT}/api; reusing it.`);
          process.exit(0);
        }
      } catch { /* not JSON, so not our API */ }
      console.error(`Port ${PORT} is occupied by a service that is not the Portfolio API. Stop it or set a different PORT in backend/.env.`);
      process.exit(1);
    });
  });
  req.setTimeout(2000, () => req.destroy(new Error('Health check timed out')));
  req.on('error', err => {
    console.error(`Port ${PORT} is already in use and the existing service could not be verified: ${err.message}`);
    process.exit(1);
  });
}

async function startServer() {
  await logDatabaseStatus();

  const server = app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(' 🚀 Portfolio API is running!');
    console.log(` ➜  API URL:     http://localhost:${PORT}/api`);
    console.log(` ➜  API Status:  http://localhost:${PORT}/api/health`);
    console.log(` ➜  Storage:     ${storageMode}`);
    console.log(` ➜  CORS:        ${origins.join(', ')}`);
    console.log('======================================================\n');
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') return handlePortInUse();
    console.error('Server listen error:', err.message);
    process.exit(1);
  });
}

startServer();
