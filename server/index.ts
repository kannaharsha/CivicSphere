import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDb, pool } from './db.js';
import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logging middleware for Vercel & local server debugging
app.use((req, res, next) => {
  console.log(`[API REQUEST] ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Init DB table on server boot
initDb().catch(err => {
  console.warn('PostgreSQL DB initialization warning on startup:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/ai', aiRoutes);

// Health check with PostgreSQL connection status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let dbError = null;
  let userCount = 0;
  let schemeCount = 0;

  try {
    const dbRes = await pool.query('SELECT NOW() as current_time');
    if (dbRes.rows.length > 0) {
      dbStatus = 'connected';
      const usersRes = await pool.query('SELECT COUNT(*) FROM users').catch(() => ({ rows: [{ count: 0 }] }));
      const schemesRes = await pool.query('SELECT COUNT(*) FROM agriculture_schemes').catch(() => ({ rows: [{ count: 0 }] }));
      userCount = parseInt(usersRes.rows[0].count, 10);
      schemeCount = parseInt(schemesRes.rows[0].count, 10);
    }
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err.message;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      users: userCount,
      schemes: schemeCount,
      error: dbError,
    }
  });
});

app.get('/api/db-health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as db_time, version() as pg_version');
    res.json({
      success: true,
      status: 'connected',
      dbTime: dbRes.rows[0].db_time,
      pgVersion: dbRes.rows[0].pg_version,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      status: 'disconnected',
      error: err.message,
    });
  }
});

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Silence Chrome DevTools probe (serves DevTools workspace config to eliminate 404 & CSP error)
app.all('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src * 'self' http://localhost:5000;");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  res.status(200).json({
    workspace: {
      root: path.resolve(process.cwd()),
      uuid: '4c522da4-754e-4f70-b19e-114bf50be123'
    }
  });
});

// Custom 404 handler to prevent Express default finalhandler from sending 'default-src none' CSP
app.use((req, res) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src * 'self' http://localhost:5000;");
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});



// Start standalone server if executed directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CivicSphere Backend API running on http://localhost:${PORT}`);
  });
}

export default app;

