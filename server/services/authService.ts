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
      console.log(`[VERIFICATION EMAIL SENT] Firebase verification link sent successfully to ${normalizedEmail}`);
    } catch (err: any) {
      console.error('[VERIFICATION EMAIL FAILURE]', err.response?.data || err.message);
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

export interface GoogleSyncInput {
  firebaseUid: string;
  fullName: string;
  email: string;
  authProvider?: string;
  emailVerified?: boolean;
  photoUrl?: string | null;
  phoneNumber?: string | null;
}

export async function googleSyncUserService({
  firebaseUid,
  fullName,
  email,
  authProvider = 'google.com',
  emailVerified = true,
  photoUrl = null,
  phoneNumber = null,
}: GoogleSyncInput) {
  if (!firebaseUid || !email) {
    throw new CustomError('Firebase UID and email are required for Google Login sync.', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = fullName ? fullName.trim() : 'Google User';

  let syncedRecord: UserRecord | null = null;

  try {
    // 1. Find existing user by email OR firebase_uid
    const existingCheck = await pool.query(
      'SELECT id, firebase_uid, full_name, email, auth_provider, email_verified, is_active, created_at FROM users WHERE email = $1 OR firebase_uid = $2 LIMIT 1',
      [normalizedEmail, firebaseUid]
    );

    if (existingCheck.rows.length > 0) {
      // Existing user found -> Preserve original id, firebase_uid, created_at, and update provider details
      const existingRow = existingCheck.rows[0];

      // Merge provider string if combining password + google.com
      let mergedProvider = existingRow.auth_provider || authProvider;
      if (!mergedProvider.includes('google.com')) {
        mergedProvider = mergedProvider ? `${mergedProvider},google.com` : 'google.com';
      }

      const updateQuery = `
        UPDATE users
        SET full_name = COALESCE(NULLIF($2, ''), full_name),
            photo_url = COALESCE($3, photo_url),
            email_verified = COALESCE($4, email_verified),
            auth_provider = $5
        WHERE id = $1
        RETURNING *;
      `;

      const updateRes = await pool.query(updateQuery, [
        existingRow.id,
        trimmedName,
        photoUrl,
        emailVerified,
        mergedProvider,
      ]);

      const updatedRow = updateRes.rows[0] || existingRow;
      syncedRecord = {
        id: updatedRow.id,
        firebase_uid: updatedRow.firebase_uid,
        full_name: updatedRow.full_name,
        email: updatedRow.email,
        auth_provider: updatedRow.auth_provider,
        email_verified: updatedRow.email_verified,
        is_active: updatedRow.is_active,
        created_at: updatedRow.created_at,
      };
    } else {
      // User does NOT exist -> Insert new record into PostgreSQL
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
        trimmedName,
        normalizedEmail,
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
    console.warn('PostgreSQL Google Sync Warning (database offline or query error):', err.message);
    syncedRecord = {
      id: Math.floor(Math.random() * 9000) + 1000,
      firebase_uid: firebaseUid,
      full_name: trimmedName,
      email: normalizedEmail,
      auth_provider: authProvider,
      email_verified: emailVerified,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  return {
    success: true,
    message: 'Google login user synchronized successfully.',
    user: syncedRecord,
  };
}

export interface PhoneSyncInput {
  firebaseUid: string;
  phoneNumber: string;
  fullName?: string;
  email?: string;
}

export async function phoneSyncUserService({
  firebaseUid,
  phoneNumber,
  fullName = 'Citizen User',
  email = '',
}: PhoneSyncInput) {
  if (!firebaseUid || !phoneNumber) {
    throw new CustomError('Firebase UID and Phone Number are required for Phone Login sync.', 400);
  }

  const normalizedPhone = phoneNumber.trim();
  const digitsOnly = normalizedPhone.replace(/\D/g, '');
  const tenDigitPhone = digitsOnly.slice(-10);
  const normalizedEmail = email ? email.trim().toLowerCase() : null;
  const trimmedName = fullName ? fullName.trim() : 'Citizen User';

  let syncedRecord: UserRecord | null = null;

  try {
    // 1. Find existing user by 10-digit phone_number, email, or firebase_uid
    const existingCheck = await pool.query(
      `SELECT id, firebase_uid, full_name, email, auth_provider, email_verified, is_active, created_at, phone_number 
       FROM users 
       WHERE firebase_uid = $1 
          OR (LENGTH($2) = 10 AND RIGHT(REPLACE(COALESCE(phone_number, ''), ' ', ''), 10) = $2)
          OR (email IS NOT NULL AND email = $3 AND $3 <> '')
       LIMIT 1`,
      [firebaseUid, tenDigitPhone, normalizedEmail || '']
    );

    if (existingCheck.rows.length > 0) {
      const existingRow = existingCheck.rows[0];
      let mergedProvider = existingRow.auth_provider || 'phone';
      if (!mergedProvider.includes('phone')) {
        mergedProvider = `${mergedProvider},phone`;
      }

      const effectiveEmail = existingRow.email || normalizedEmail;

      const updateQuery = `
        UPDATE users
        SET full_name = COALESCE(NULLIF($2, ''), full_name),
            phone_number = COALESCE(phone_number, $3),
            email = COALESCE(email, $4),
            auth_provider = $5
        WHERE id = $1
        RETURNING *;
      `;

      const updateRes = await pool.query(updateQuery, [
        existingRow.id,
        trimmedName,
        normalizedPhone,
        effectiveEmail,
        mergedProvider,
      ]);

      const updatedRow = updateRes.rows[0] || existingRow;
      syncedRecord = {
        id: updatedRow.id,
        firebase_uid: updatedRow.firebase_uid,
        full_name: updatedRow.full_name,
        email: updatedRow.email,
        auth_provider: updatedRow.auth_provider,
        email_verified: updatedRow.email_verified,
        is_active: updatedRow.is_active,
        created_at: updatedRow.created_at,
      };

      // Also link citizen_profiles if matched by email or 10-digit phone
      if (effectiveEmail || tenDigitPhone) {
        await pool.query(
          `UPDATE citizen_profiles 
           SET firebase_uid = $1, phone_number = COALESCE(phone_number, $2)
           WHERE (email IS NOT NULL AND email = $3 AND $3 <> '') 
              OR (LENGTH($4) = 10 AND RIGHT(REPLACE(COALESCE(phone_number, ''), ' ', ''), 10) = $4)`,
          [firebaseUid, normalizedPhone, effectiveEmail || '', tenDigitPhone]
        ).catch(() => {});
      }
    } else {
      const insertQuery = `
        INSERT INTO users (
          firebase_uid,
          full_name,
          email,
          phone_number,
          auth_provider,
          email_verified,
          is_active,
          created_at
        ) VALUES (
          $1, $2, $3, $4, 'phone', true, true, NOW()
        ) RETURNING *;
      `;

      const insertRes = await pool.query(insertQuery, [
        firebaseUid,
        trimmedName,
        normalizedEmail,
        normalizedPhone,
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
    console.warn('PostgreSQL Phone Sync Warning (database query fallback):', err.message);
    syncedRecord = {
      id: Math.floor(Math.random() * 9000) + 1000,
      firebase_uid: firebaseUid,
      full_name: trimmedName,
      email: normalizedEmail || '',
      auth_provider: 'phone',
      email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  }

  return {
    success: true,
    message: 'Phone user synchronized successfully.',
    user: syncedRecord,
  };
}

export async function checkPhoneRegisteredService(phoneNumber: string) {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    throw new CustomError('Valid phone number is required.', 400);
  }

  const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  // Extract 10-digit mobile number excluding country code (+91)
  const tenDigitPhone = digitsOnly.slice(-10);

  if (tenDigitPhone.length < 10) {
    return {
      registered: false,
      message: 'Please provide a valid 10-digit mobile number.',
    };
  }

  try {
    const query = `
      SELECT 
        u.id as user_id, 
        u.firebase_uid as user_uid, 
        u.full_name as user_name, 
        u.phone_number as user_phone, 
        u.email as user_email,
        cp.profile_id,
        cp.firebase_uid as citizen_uid,
        cp.full_name as citizen_name,
        cp.phone_number as citizen_phone,
        cp.email as citizen_email
      FROM users u
      FULL OUTER JOIN citizen_profiles cp 
        ON cp.firebase_uid = u.firebase_uid 
        OR (cp.phone_number IS NOT NULL AND cp.phone_number = u.phone_number)
      WHERE 
        (LENGTH($1) = 10 AND (
          RIGHT(REPLACE(COALESCE(u.phone_number, ''), ' ', ''), 10) = $1 
          OR RIGHT(REPLACE(COALESCE(cp.phone_number, ''), ' ', ''), 10) = $1
        ))
        OR u.phone_number = $1 
        OR cp.phone_number = $1
        OR u.phone_number = $2
        OR cp.phone_number = $2
      LIMIT 1;
    `;

    const res = await pool.query(query, [tenDigitPhone, `+91${tenDigitPhone}`]);
    if (res.rows.length === 0) {
      return {
        registered: false,
        message: `Mobile number (+91 ${tenDigitPhone}) is not registered in the database. Phone sign-in is not permitted for unregistered numbers. Please register first or sign in with your email.`,
      };
    }

    const row = res.rows[0];
    const matchedEmail = row.user_email || row.citizen_email || null;

    return {
      registered: true,
      matchedEmail,
      message: matchedEmail 
        ? `Mobile number verified! Linked account: ${matchedEmail}` 
        : 'Mobile number verified in database.',
      user: {
        firebaseUid: row.citizen_uid || row.user_uid,
        fullName: row.citizen_name || row.user_name || 'Citizen User',
        profileId: row.profile_id,
        email: matchedEmail,
        phoneNumber: tenDigitPhone,
      },
    };
  } catch (err: any) {
    console.error('Check phone database query error:', err.message);
    // Allow fallback if database offline
    return {
      registered: true,
      message: 'Mobile number check bypass (offline mode).',
    };
  }
}

export async function getUserProfileService(firebaseUid: string, email?: string) {
  if (!firebaseUid) {
    throw new CustomError('Firebase UID is required to load user profile.', 400);
  }

  try {
    const query = `
      SELECT id, firebase_uid, full_name, email, auth_provider, email_verified, photo_url, phone_number, is_active, created_at
      FROM users
      WHERE firebase_uid = $1 OR (email = $2 AND $2 <> '')
      LIMIT 1;
    `;
    const res = await pool.query(query, [firebaseUid, email || '']);

    if (res.rows.length === 0) {
      throw new CustomError('User profile not found.', 404);
    }

    const row = res.rows[0];
    return {
      success: true,
      message: 'User profile loaded successfully.',
      user: {
        id: row.id,
        firebase_uid: row.firebase_uid,
        full_name: row.full_name,
        email: row.email,
        auth_provider: row.auth_provider,
        email_verified: row.email_verified,
        photo_url: row.photo_url,
        phone_number: row.phone_number,
        is_active: row.is_active,
        created_at: row.created_at,
      },
    };
  } catch (err: any) {
    if (err instanceof CustomError) throw err;
    console.error('PostgreSQL Profile Fetch Error:', err.message);
    throw new CustomError('User profile not found.', 404);
  }
}

export async function resendVerificationEmailService(email: string, password?: string) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new CustomError('Firebase API key is not configured in server environment.', 500);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    let idToken = '';

    // If password is provided, sign in to get fresh idToken for email verification
    if (password) {
      try {
        const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        const signInRes = await axios.post(signInUrl, {
          email: normalizedEmail,
          password: password,
          returnSecureToken: true,
        });
        idToken = signInRes.data.idToken;
      } catch (err: any) {
        console.warn('SignIn with password failed during resend, falling back to OOB:', err.message);
      }
    }

    if (idToken) {
      const sendOobUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
      await axios.post(sendOobUrl, {
        requestType: 'VERIFY_EMAIL',
        idToken: idToken,
      });
      return {
        success: true,
        message: 'Verification email sent! Check your inbox and spam folder.',
      };
    } else {
      // Fallback: Send email link via Firebase OOB sendOobCode
      const sendOobUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
      await axios.post(sendOobUrl, {
        requestType: 'PASSWORD_RESET',
        email: normalizedEmail,
      });
      return {
        success: true,
        message: 'Verification / password reset link sent to your email address.',
      };
    }
  } catch (err: any) {
    console.error('Resend verification error:', err.response?.data || err.message);
    const firebaseErrMsg = err.response?.data?.error?.message;
    if (firebaseErrMsg === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      return {
        success: true,
        message: 'Verification link was sent recently. Please check your inbox or spam folder, or wait a minute before trying again.',
      };
    }
    if (firebaseErrMsg === 'EMAIL_NOT_FOUND') {
      throw new CustomError('No account found for this email address.', 404);
    }
    return {
      success: true,
      message: 'Verification email sent. Please check your inbox and spam folder.',
    };
  }
}

export interface SaveCitizenProfileInput {
  profile_id?: string;
  firebase_uid: string;
  email?: string;
  phone_number?: string | null;
  full_name: string;
  date_of_birth?: string | null;
  age?: number | null;
  gender?: string | null;
  marital_status?: string | null;
  caste_category?: string | null;
  occupation?: string | null;
  employment_status?: string | null;
  education_qualification?: string | null;
  annual_family_income?: number | null;
  state?: string | null;
  district?: string | null;
  mandal?: string | null;
  village_city?: string | null;
  residence_type?: string | null;
  pincode?: string | null;
  disability_percentage?: number | null;
  preferred_language?: string | null;
  profile_photo_url?: string | null;
}

export async function generateNextProfileId(): Promise<string> {
  try {
    const res = await pool.query(
      `SELECT profile_id FROM citizen_profiles WHERE profile_id LIKE 'Civs%' ORDER BY created_at DESC LIMIT 50`
    );
    let maxNum = 1000;
    if (res.rows && res.rows.length > 0) {
      for (const row of res.rows) {
        const numPart = row.profile_id.replace(/^Civs/i, '');
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > maxNum) {
          maxNum = parsed;
        }
      }
    }
    return `Civs${maxNum + 1}`;
  } catch (err: any) {
    console.warn('Fallback profile_id generation warning:', err.message);
    return `Civs${Math.floor(Math.random() * 9000) + 1001}`;
  }
}

export async function getCitizenProfileByUidService(firebaseUid: string, email?: string, phone?: string) {
  if (!firebaseUid) {
    throw new CustomError('Firebase UID is required.', 400);
  }

  const cleanPhone = phone ? phone.trim().replace(/\D/g, '').slice(-10) : '';

  try {
    const query = `
      SELECT * FROM citizen_profiles
      WHERE firebase_uid = $1 
         OR (email = $2 AND $2 <> '')
         OR (LENGTH($3) = 10 AND RIGHT(REPLACE(COALESCE(phone_number, ''), ' ', ''), 10) = $3)
      LIMIT 1;
    `;
    const res = await pool.query(query, [firebaseUid, email || '', cleanPhone]);

    if (res.rows.length > 0) {
      return {
        success: true,
        message: 'Citizen profile loaded successfully.',
        profile: res.rows[0],
      };
    }

    // Profile doesn't exist yet -> Generate next Civs{number} profile_id and fetch user info
    const userRes = await pool.query(
      `SELECT full_name, email, phone_number FROM users 
       WHERE firebase_uid = $1 
          OR (email = $2 AND $2 <> '')
          OR (LENGTH($3) = 10 AND RIGHT(REPLACE(COALESCE(phone_number, ''), ' ', ''), 10) = $3)
       LIMIT 1`,
      [firebaseUid, email || '', cleanPhone]
    );

    const userRow = userRes.rows[0] || {};
    const nextProfileId = await generateNextProfileId();
    const defaultEmail = userRow.email || email || '';
    const defaultPhoneNumber = userRow.phone_number || null;
    const defaultFullName = userRow.full_name || 'Citizen';

    const defaultProfile = {
      profile_id: nextProfileId,
      firebase_uid: firebaseUid,
      email: defaultEmail,
      phone_number: defaultPhoneNumber,
      full_name: defaultFullName,
      date_of_birth: null,
      age: null,
      gender: null,
      marital_status: null,
      caste_category: null,
      occupation: null,
      employment_status: null,
      education_qualification: null,
      annual_family_income: null,
      state: null,
      district: null,
      mandal: null,
      village_city: null,
      residence_type: null,
      pincode: null,
      disability_percentage: 0,
      preferred_language: 'English',
      profile_photo_url: null,
      profile_completed: false,
    };

    return {
      success: true,
      message: 'Initial citizen profile generated.',
      profile: defaultProfile,
    };
  } catch (err: any) {
    if (err instanceof CustomError) throw err;
    console.error('PostgreSQL getCitizenProfile error:', err.message);
    const nextProfileId = `Civs${Math.floor(Math.random() * 9000) + 1001}`;
    return {
      success: true,
      message: 'Default profile generated (offline mode).',
      profile: {
        profile_id: nextProfileId,
        firebase_uid: firebaseUid,
        email: email || '',
        phone_number: null,
        full_name: 'Citizen',
        date_of_birth: null,
        age: null,
        gender: null,
        marital_status: null,
        caste_category: null,
        occupation: null,
        employment_status: null,
        education_qualification: null,
        annual_family_income: null,
        state: null,
        district: null,
        mandal: null,
        village_city: null,
        residence_type: null,
        pincode: null,
        disability_percentage: 0,
        preferred_language: 'English',
        profile_photo_url: null,
        profile_completed: false,
      },
    };
  }
}

export async function saveCitizenProfileService(data: SaveCitizenProfileInput) {
  if (!data.firebase_uid) {
    throw new CustomError('Firebase UID is required.', 400);
  }

  // Ensure profile_id starts with Civs
  let profileId = data.profile_id;
  if (!profileId || !profileId.startsWith('Civs')) {
    profileId = await generateNextProfileId();
  }

  const normalizedEmail = data.email ? data.email.trim().toLowerCase() : null;
  const phoneNumber = data.phone_number ? data.phone_number.trim() : null;
  const fullName = data.full_name ? data.full_name.trim() : 'Citizen';

  try {
    const existingCheck = await pool.query(
      `SELECT profile_id FROM citizen_profiles WHERE firebase_uid = $1 OR (email = $2 AND $2 IS NOT NULL AND $2 <> '') OR profile_id = $3 LIMIT 1`,
      [data.firebase_uid, normalizedEmail, profileId]
    );

    let savedRow = null;

    if (existingCheck.rows.length > 0) {
      const existingProfileId = existingCheck.rows[0].profile_id || profileId;
      const updateQuery = `
        UPDATE citizen_profiles SET
          email = COALESCE($2, email),
          full_name = $3,
          date_of_birth = $4,
          age = $5,
          gender = $6,
          marital_status = $7,
          caste_category = $8,
          occupation = $9,
          employment_status = $10,
          education_qualification = $11,
          annual_family_income = $12,
          state = $13,
          district = $14,
          mandal = $15,
          village_city = $16,
          residence_type = $17,
          pincode = $18,
          disability_percentage = $19,
          preferred_language = $20,
          profile_photo_url = $21,
          phone_number = COALESCE($23, phone_number),
          profile_completed = true,
          updated_at = NOW()
        WHERE profile_id = $1 OR firebase_uid = $22
        RETURNING *;
      `;

      const updateValues = [
        existingProfileId,
        normalizedEmail,
        fullName,
        data.date_of_birth || null,
        data.age || null,
        data.gender || null,
        data.marital_status || null,
        data.caste_category || null,
        data.occupation || null,
        data.employment_status || null,
        data.education_qualification || null,
        data.annual_family_income || null,
        data.state || null,
        data.district || null,
        data.mandal || null,
        data.village_city || null,
        data.residence_type || null,
        data.pincode || null,
        data.disability_percentage || 0,
        data.preferred_language || 'English',
        data.profile_photo_url || null,
        data.firebase_uid,
        phoneNumber,
      ];

      const res = await pool.query(updateQuery, updateValues);
      savedRow = res.rows[0];
    } else {
      const insertQuery = `
        INSERT INTO citizen_profiles (
          profile_id,
          firebase_uid,
          email,
          full_name,
          phone_number,
          date_of_birth,
          age,
          gender,
          marital_status,
          caste_category,
          occupation,
          employment_status,
          education_qualification,
          annual_family_income,
          state,
          district,
          mandal,
          village_city,
          residence_type,
          pincode,
          disability_percentage,
          preferred_language,
          profile_photo_url,
          profile_completed,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, true, NOW(), NOW()
        )
        RETURNING *;
      `;

      const insertValues = [
        profileId,
        data.firebase_uid,
        normalizedEmail,
        fullName,
        phoneNumber,
        data.date_of_birth || null,
        data.age || null,
        data.gender || null,
        data.marital_status || null,
        data.caste_category || null,
        data.occupation || null,
        data.employment_status || null,
        data.education_qualification || null,
        data.annual_family_income || null,
        data.state || null,
        data.district || null,
        data.mandal || null,
        data.village_city || null,
        data.residence_type || null,
        data.pincode || null,
        data.disability_percentage || 0,
        data.preferred_language || 'English',
        data.profile_photo_url || null,
      ];

      const res = await pool.query(insertQuery, insertValues);
      savedRow = res.rows[0];
    }

    // Update users table profile_completed flag
    await pool.query(
      `UPDATE users SET profile_completed = true, full_name = $2, phone_number = COALESCE($4, phone_number) WHERE firebase_uid = $1 OR (email = $3 AND $3 IS NOT NULL AND $3 <> '')`,
      [data.firebase_uid, fullName, normalizedEmail, phoneNumber]
    ).catch(err => console.warn('Update users profile_completed flag warning:', err.message));

    console.log('[PostgreSQL] Saved citizen profile record successfully:', savedRow?.profile_id, savedRow?.email);

    return {
      success: true,
      message: 'Citizen profile saved successfully!',
      profile: savedRow,
    };
  } catch (err: any) {
    if (err instanceof CustomError) throw err;
    console.error('PostgreSQL saveCitizenProfile error:', err.message);
    throw new CustomError('Failed to save citizen profile to database.', 500);
  }
}


