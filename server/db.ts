import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;

const poolConfig: pg.PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'civicsphere_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Harshatej9106',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool(poolConfig);

export async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      firebase_uid VARCHAR(128) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      auth_provider VARCHAR(50) DEFAULT 'password',
      email_verified BOOLEAN DEFAULT false,
      photo_url TEXT DEFAULT NULL,
      phone_number VARCHAR(50) DEFAULT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    client.release();
    console.log('PostgreSQL users table verified/created.');
  } catch (err) {
    console.error('PostgreSQL database initialization warning:', err);
  }
}
