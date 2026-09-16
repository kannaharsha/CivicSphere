import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).trim();

const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('[Supabase] Initialized Supabase client successfully with URL:', supabaseUrl);
  } catch (err: any) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.warn('[Supabase] Supabase credentials not found or incomplete in environment.');
}

export interface SupabaseUserPayload {
  firebase_uid: string;
  full_name: string;
  email?: string | null;
  auth_provider?: string;
  email_verified?: boolean;
  photo_url?: string | null;
  phone_number?: string | null;
  is_active?: boolean;
  profile_completed?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

/**
 * Perform mirror INSERT / UPDATE / UPSERT operation on Supabase `users` table
 */
export async function syncUserToSupabase(userData: SupabaseUserPayload) {
  if (!supabase) return null;
  try {
    const payload: Record<string, any> = { ...userData };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'firebase_uid' })
      .select();

    if (error) {
      console.warn('[Supabase users sync warning]:', error.message);
      return null;
    }
    console.log('[Supabase] Synced user successfully to Supabase:', userData.firebase_uid, userData.email || userData.phone_number);
    return data;
  } catch (err: any) {
    console.warn('[Supabase users sync exception]:', err.message);
    return null;
  }
}

/**
 * Perform mirror INSERT / UPDATE / UPSERT operation on Supabase `citizen_profiles` table
 */
export async function syncCitizenProfileToSupabase(profileData: Record<string, any>) {
  if (!supabase) return null;
  try {
    const payload: Record<string, any> = { ...profileData };
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const { data, error } = await supabase
      .from('citizen_profiles')
      .upsert(payload, { onConflict: 'profile_id' })
      .select();

    if (error) {
      console.warn('[Supabase citizen_profiles sync warning]:', error.message);
      return null;
    }
    console.log('[Supabase] Synced citizen profile successfully to Supabase:', profileData.profile_id, profileData.firebase_uid);
    return data;
  } catch (err: any) {
    console.warn('[Supabase citizen_profiles sync exception]:', err.message);
    return null;
  }
}

/**
 * Fallback fetch for user from Supabase if PostgreSQL is unavailable
 */
export async function fetchUserFromSupabase(firebaseUid: string, email?: string) {
  if (!supabase) return null;
  try {
    let query = supabase.from('users').select('*');
    if (email) {
      query = query.or(`firebase_uid.eq.${firebaseUid},email.eq.${email}`);
    } else {
      query = query.eq('firebase_uid', firebaseUid);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      console.warn('[Supabase user fetch warning]:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('[Supabase user fetch exception]:', err.message);
    return null;
  }
}

/**
 * Fallback fetch for citizen profile from Supabase
 */
export async function fetchCitizenProfileFromSupabase(firebaseUid: string, email?: string, phone?: string) {
  if (!supabase) return null;
  try {
    let query = supabase.from('citizen_profiles').select('*');
    if (email) {
      query = query.or(`firebase_uid.eq.${firebaseUid},email.eq.${email}`);
    } else {
      query = query.eq('firebase_uid', firebaseUid);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      console.warn('[Supabase citizen profile fetch warning]:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('[Supabase citizen profile fetch exception]:', err.message);
    return null;
  }
}
