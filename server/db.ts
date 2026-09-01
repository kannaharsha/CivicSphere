import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;

// Use discrete parameters to avoid URL encoding issues with special characters in password
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'civicsphere_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Harsha@9106',
});

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
