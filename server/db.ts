import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory if needed
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const poolConfig: pg.PoolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
      ssl:
        isProduction ||
        databaseUrl.includes('supabase.co') ||
        databaseUrl.includes('pooler.supabase.com') ||
        databaseUrl.includes('neon.tech') ||
        databaseUrl.includes('render.com') ||
        databaseUrl.includes('aws.neon')
          ? { rejectUnauthorized: false }
          : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      database: process.env.DB_NAME || 'civicsphere_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
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

  const createAgricultureSchemesTableQuery = `
    CREATE SEQUENCE IF NOT EXISTS agriculture_schemes_seq START WITH 1001;

    CREATE TABLE IF NOT EXISTS agriculture_schemes (
      scheme_id VARCHAR(50) PRIMARY KEY DEFAULT ('AGRI' || nextval('agriculture_schemes_seq')),
      scheme_name TEXT NOT NULL,
      category TEXT NOT NULL,
      state TEXT NOT NULL,
      description TEXT,
      eligibility JSONB,
      benefits JSONB,
      documents JSONB,
      application_process JSONB,
      official_urls TEXT[],
      registration_links TEXT[],
      faq JSONB,
      tags TEXT[]
    );
  `;

  try {
    const client = await pool.connect();
    await client.query(createUsersTableQuery);
    await client.query(createCitizenProfilesTableQuery);
    await client.query(createAgricultureSchemesTableQuery);

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

    // Migration adding Phase 1 Step 6 metadata columns to agriculture_schemes
    const metadataMigrations = [
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS ministry TEXT;`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS sector TEXT;`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS sub_sector TEXT;`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS target_demographic TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS beneficiary_category TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS occupation_category TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English';`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS scheme_level VARCHAR(100);`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS document_language TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS application_mode VARCHAR(100);`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS eligibility_tags TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS benefit_tags TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS keyword_tags TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS crop_tags TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS farmer_tags TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS government_tags TEXT[];`,
      `ALTER TABLE agriculture_schemes ADD COLUMN IF NOT EXISTS normalized_summary TEXT;`,
    ];
    for (const sql of metadataMigrations) {
      await client.query(sql).catch(() => {});
    }

    // Embeddings & Semantic Chunks Table initialization
    await client.query(`
      CREATE TABLE IF NOT EXISTS agriculture_schemes_embeddings (
        embedding_id VARCHAR(120) PRIMARY KEY,
        chunk_id VARCHAR(100) NOT NULL,
        scheme_id VARCHAR(50) NOT NULL,
        chunk_type VARCHAR(50),
        chunk_index INT,
        chunk_text TEXT NOT NULL,
        embedding_model VARCHAR(100) DEFAULT 'BAAI/bge-small-en-v1.5',
        embedding_dimension INT DEFAULT 384,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `).catch(() => {});

    // Attempt to add vector column if pgvector extension is present
    await client.query(`ALTER TABLE agriculture_schemes_embeddings ADD COLUMN IF NOT EXISTS embedding vector(384);`).catch(() => {});

    client.release();
    console.log('PostgreSQL users, citizen_profiles, agriculture_schemes & embeddings tables verified.');
  } catch (err: any) {
    console.error('PostgreSQL database initialization warning:', err.message);
  }
}
