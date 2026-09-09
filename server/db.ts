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
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

export const pool = new Pool(poolConfig);

export async function initDb() {
  const createUsersTableQuery = `
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
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      profile_completed BOOLEAN DEFAULT false
    );
  `;

  const createCitizenProfilesTableQuery = `
    CREATE TABLE IF NOT EXISTS citizen_profiles (
      profile_id VARCHAR(100) PRIMARY KEY,
      firebase_uid VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) DEFAULT NULL,
      full_name VARCHAR(150) NOT NULL,
      phone_number VARCHAR(50) DEFAULT NULL,
      date_of_birth DATE,
      age INTEGER,
      gender VARCHAR(50),
      marital_status VARCHAR(50),
      caste_category VARCHAR(100),
      occupation VARCHAR(100),
      employment_status VARCHAR(100),
      education_qualification VARCHAR(100),
      annual_family_income NUMERIC(12,2),
      state VARCHAR(100),
      district VARCHAR(100),
      mandal VARCHAR(100),
      village_city VARCHAR(100),
      residence_type VARCHAR(20),
      pincode VARCHAR(10),
      disability_percentage NUMERIC(5,2) DEFAULT 0,
      preferred_language VARCHAR(50) DEFAULT 'English',
      profile_photo_url TEXT,
      profile_completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(createUsersTableQuery);
    await client.query(createCitizenProfilesTableQuery);

    // Migrations ensuring phone_number and relaxing email NOT NULL for phone auth
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) DEFAULT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50) DEFAULT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN email DROP NOT NULL;`).catch(() => {});

    // Migration altering profile_id type from UUID to VARCHAR(100) and dropping NOT NULL constraints if pre-existing
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN profile_id TYPE VARCHAR(100);`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN date_of_birth DROP NOT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN age DROP NOT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN occupation DROP NOT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN state DROP NOT NULL;`).catch(() => {});
    await client.query(`ALTER TABLE citizen_profiles ALTER COLUMN district DROP NOT NULL;`).catch(() => {});

    client.release();
    console.log('PostgreSQL users & citizen_profiles tables verified/migrated with phone_number support.');
  } catch (err: any) {
    console.error('PostgreSQL database initialization warning:', err.message);
  }
}
