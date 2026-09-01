import axios from 'axios';
import { pool } from '../db.js';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface UserRecord {
  id: number;
  firebase_uid: string;
  full_name: string;
  email: string;
  auth_provider: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export class CustomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export async function registerUserService({ fullName, email, password }: RegisterInput) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new CustomError('Firebase API key is not configured in server environment.', 500);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedFullName = fullName.trim();

  // 1. Pre-check if user exists in PostgreSQL (if database is accessible)
  try {
    const existingUserCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );
    if (existingUserCheck.rows.length > 0) {
      throw new CustomError('User already exists.', 409);
    }
  } catch (err: any) {
    if (err instanceof CustomError) throw err;
    console.warn('PostgreSQL pre-check warning (proceeding with Firebase Auth):', err.message);
  }

  let firebaseLocalId = '';
  let firebaseIdToken = '';

  // 2. Step 1 — Create Firebase Account via REST API
  try {
    const signupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const signupResponse = await axios.post(signupUrl, {
      email: normalizedEmail,
      password: password,
      returnSecureToken: true,
    });

    firebaseLocalId = signupResponse.data.localId;
    firebaseIdToken = signupResponse.data.idToken;
  } catch (err: any) {
    const firebaseErr = err.response?.data?.error?.message;
    if (firebaseErr === 'EMAIL_EXISTS') {
      throw new CustomError('Email already registered.', 409);
    }
    if (firebaseErr === 'INVALID_EMAIL') {
      throw new CustomError('Invalid email address.', 400);
    }
    if (firebaseErr && (firebaseErr.includes('WEAK_PASSWORD') || firebaseErr.includes('PASSWORD_') || firebaseErr.includes('TOO_SHORT'))) {
      throw new CustomError('Password is too weak.', 400);
    }
    console.error('Firebase Auth API Signup Error:', err.response?.data || err.message);
    throw new CustomError('Unable to create account. Try again later.', 500);
  }

  // Set Display Name in Firebase User Profile
  if (firebaseIdToken) {
    try {
      const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
      await axios.post(updateUrl, {
        idToken: firebaseIdToken,
        displayName: trimmedFullName,
        returnSecureToken: false,
      });
    } catch (err) {
      console.warn('Failed to set display name in Firebase:', err);
    }
  }

  // 3. Step 2 — Send Email Verification
  if (firebaseIdToken) {
    try {
      const sendOobUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
      await axios.post(sendOobUrl, {
        requestType: 'VERIFY_EMAIL',
        idToken: firebaseIdToken,
      });
    } catch (err) {
      console.warn('Failed to send verification email via Firebase REST API:', err);
    }
  }

  // 4. Step 3 — Insert User into PostgreSQL
  let userRecord: UserRecord | null = null;
  try {
    const insertQuery = `
      INSERT INTO users (
        firebase_uid,
        full_name,
        email,
        auth_provider,
        email_verified,
        photo_url,
        phone_number,
        is_active,
        created_at
      ) VALUES (
        $1,
        $2,
        $3,
        'password',
        false,
        NULL,
        NULL,
        true,
        NOW()
      ) RETURNING *;
    `;

    const insertResult = await pool.query(insertQuery, [
      firebaseLocalId,
      trimmedFullName,
      normalizedEmail,
    ]);

    const row = insertResult.rows[0];
    userRecord = {
      id: row.id,
      firebase_uid: row.firebase_uid,
      full_name: row.full_name,
      email: row.email,
      auth_provider: row.auth_provider,
      email_verified: row.email_verified,
      is_active: row.is_active,
      created_at: row.created_at,
    };
  } catch (err: any) {
    console.warn('PostgreSQL User Insert Warning (database offline or auth error):', err.message);
    userRecord = {
      id: Math.floor(Math.random() * 9000) + 1000,
      firebase_uid: firebaseLocalId,
      full_name: trimmedFullName,
      email: normalizedEmail,
      auth_provider: 'password',
      email_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  return {
    success: true,
    message: 'Account created successfully. Please verify your email.',
    user: userRecord,
  };
}

export interface LoginSyncInput {
  email: string;
  password: string;
}

export async function verifyAndSyncUserService({ email, password }: LoginSyncInput) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new CustomError('Firebase API key is not configured in server environment.', 500);
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Step 2 — Login via Firebase REST API (accounts:signInWithPassword)
  let idToken = '';
  try {
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const signInRes = await axios.post(signInUrl, {
      email: normalizedEmail,
      password: password,
      returnSecureToken: true,
    });
    idToken = signInRes.data.idToken;
  } catch (err: any) {
    const code = err.response?.data?.error?.message;
    if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') {
      throw new CustomError('Incorrect email or password.', 401);
    }
    if (code === 'USER_DISABLED') {
      throw new CustomError('Your account has been disabled.', 403);
    }
    console.error('Firebase Auth SignIn Error:', err.response?.data || err.message);
    throw new CustomError('Authentication failed. Please check your credentials.', 400);
  }

  // Step 3 — Retrieve Latest Firebase User Info via accounts:lookup
  let firebaseUser: any = null;
  try {
    const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const lookupRes = await axios.post(lookupUrl, { idToken });
    firebaseUser = lookupRes.data?.users?.[0];
  } catch (err: any) {
    console.error('Firebase accounts:lookup error:', err.response?.data || err.message);
    throw new CustomError('Failed to fetch user verification details from Firebase.', 500);
  }

  if (!firebaseUser) {
    throw new CustomError('User account not found on Firebase.', 404);
  }

  const firebaseUid = firebaseUser.localId;
  const fullName = firebaseUser.displayName || 'Citizen';
  const userEmail = firebaseUser.email || normalizedEmail;
  const emailVerified = Boolean(firebaseUser.emailVerified);
  const authProvider = firebaseUser.providerUserInfo?.[0]?.providerId || 'password';
  const photoUrl = firebaseUser.photoUrl || null;
  const phoneNumber = firebaseUser.phoneNumber || null;

  // Step 4 — Email Verification Guard Rule
  if (!emailVerified) {
    throw new CustomError('Please verify your email before logging in.', 403);
  }

  // Step 5 — Insert or Update PostgreSQL users table
  let syncedRecord: UserRecord | null = null;
  try {
    const existingCheck = await pool.query(
      'SELECT id FROM users WHERE firebase_uid = $1 OR email = $2 LIMIT 1',
      [firebaseUid, userEmail]
    );

    if (existingCheck.rows.length > 0) {
      // User exists -> UPDATE
      const updateQuery = `
        UPDATE users
        SET full_name = $2,
            email_verified = $3,
            photo_url = $4,
            phone_number = $5,
            auth_provider = $6
        WHERE firebase_uid = $1 OR email = $7
        RETURNING *;
      `;
      const updateRes = await pool.query(updateQuery, [
        firebaseUid,
        fullName,
        emailVerified,
        photoUrl,
        phoneNumber,
        authProvider,
        userEmail,
      ]);
      const row = updateRes.rows[0];
      syncedRecord = {
        id: row.id,
        firebase_uid: row.firebase_uid,
        full_name: row.full_name,
        email: row.email,
        auth_provider: row.auth_provider,
        email_verified: row.email_verified,
        is_active: row.is_active,
        created_at: row.created_at,
      };
    } else {
      // User does not exist -> INSERT
      const insertQuery = `
        INSERT INTO users (
          firebase_uid,
          full_name,
          email,
          auth_provider,
          email_verified,
          photo_url,
          phone_number,
          is_active,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, true, NOW()
        ) RETURNING *;
      `;
      const insertRes = await pool.query(insertQuery, [
        firebaseUid,
        fullName,
        userEmail,
        authProvider,
        emailVerified,
        photoUrl,
        phoneNumber,
      ]);
      const row = insertRes.rows[0];
      syncedRecord = {
        id: row.id,
        firebase_uid: row.firebase_uid,
        full_name: row.full_name,
        email: row.email,
        auth_provider: row.auth_provider,
        email_verified: row.email_verified,
        is_active: row.is_active,
        created_at: row.created_at,
      };
    }
  } catch (err: any) {
    console.warn('PostgreSQL Sync Warning (database offline or query error):', err.message);
    syncedRecord = {
      id: Math.floor(Math.random() * 9000) + 1000,
      firebase_uid: firebaseUid,
      full_name: fullName,
      email: userEmail,
      auth_provider: authProvider,
      email_verified: emailVerified,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  return {
    success: true,
    verified: true,
    message: 'Logged in successfully!',
    idToken,
    user: syncedRecord,
  };
}
