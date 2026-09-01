import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './db.js';
import authRoutes from './routes/authRoutes.js';

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start standalone server if executed directly
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CivicSphere Backend API running on http://localhost:${PORT}`);
  });
}

export default app;
