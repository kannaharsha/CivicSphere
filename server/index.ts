import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './db.js';
import authRoutes from './routes/authRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

