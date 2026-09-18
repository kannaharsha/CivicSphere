/**
 * CivicSphere Supabase Eligibility Service (Database Only)
 * Directly interacts with Supabase PostgreSQL without any intermediate AI or backend APIs.
 * Fetches data from 'agriculture_schemes' and 'citizen_profiles' tables.
 */

import { supabase } from '../../lib/supabase';
import type { SchemeRecord, CitizenEligibilityProfile } from './eligibilityTypes';

// Session-level memory cache to eliminate redundant network roundtrips
let cachedSchemes: SchemeRecord[] | null = null;
let cachePromise: Promise<SchemeRecord[]> | null = null;

/**
 * Fetch all agriculture government schemes from Supabase PostgreSQL.
 * Caches in memory during the browser session for instant local evaluation.
 */
export async function fetchAgricultureSchemes(forceRefresh = false): Promise<SchemeRecord[]> {
  if (!forceRefresh && cachedSchemes && cachedSchemes.length > 0) {
    return cachedSchemes;
  }

  if (cachePromise && !forceRefresh) {
    return cachePromise;
  }

  cachePromise = (async () => {
    try {
      if (!supabase) {
        console.warn('[Eligibility Service] Supabase client not configured.');
        return [];
      }

      const { data, error } = await supabase
        .from('agriculture_schemes')
        .select(`
          scheme_id,
          scheme_name,
          category,
          state,
          description,
          eligibility,
          benefits,
          documents,
          application_process,
          official_urls,
          registration_links,
          tags,
          ministry,
          sector,
          sub_sector,
          target_demographic,
          beneficiary_category,
          occupation_category,
          scheme_level,
          eligibility_tags,
          benefit_tags,
          crop_tags,
          farmer_tags
        `);

      if (error) {
        console.error('[Eligibility Service] Error querying agriculture_schemes:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('[Eligibility Service] No schemes returned from Supabase.');
        return [];
      }

      cachedSchemes = data as SchemeRecord[];
      return cachedSchemes;
    } catch (err) {
      console.error('[Eligibility Service] Fetch schemes failed:', err);
      // If cached previously, return stale
      if (cachedSchemes) return cachedSchemes;
      throw err;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
}

/**
 * Fetch citizen profile from Supabase citizen_profiles by Firebase UID.
 */
export async function fetchCitizenProfileFromSupabase(firebaseUid: string): Promise<CitizenEligibilityProfile | null> {
  if (!firebaseUid || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('citizen_profiles')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .maybeSingle();

    if (error) {
      console.error('[Eligibility Service] Error fetching citizen profile:', error);
      return null;
    }

    if (!data) return null;

    // Convert raw database row into CitizenEligibilityProfile
    const profile: CitizenEligibilityProfile = {
      fullName: data.full_name || undefined,
      age: data.age ? Number(data.age) : undefined,
      gender: data.gender || 'Male',
      state: data.state || undefined,
      district: data.district || undefined,
      occupation: data.occupation || 'Farmer',
      caste: (data.caste_category as any) || 'General',
      annualFamilyIncome: data.annual_family_income ? Number(data.annual_family_income) : undefined,
      hasDisability: Boolean(data.disability_percentage && Number(data.disability_percentage) > 0),
      disabilityPercentage: Number(data.disability_percentage || 0),
      farmerCategory: 'Small', // default based on typical citizen or inferable
      landOwnershipAcres: 2.0,
      ownsLand: true,
      cropType: 'Paddy / Rice',
      irrigationType: 'Borewell / Tube well',
      isOrganicFarmer: false,
      hasLivestock: true,
      isWomanFarmer: data.gender === 'Female',
      isTenantFarmer: false,
      hasAadhaar: true,
      hasBankAccountLinked: true,
      isPmKisanBeneficiary: true,
      hasSoilHealthCard: true
    };

    return profile;
  } catch (err) {
    console.error('[Eligibility Service] Failed to load citizen profile:', err);
    return null;
  }
}
