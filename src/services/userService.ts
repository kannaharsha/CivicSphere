import axios from 'axios';
import { supabase } from '../lib/supabase';

export interface CitizenProfile {
  profileId?: string;
  citizenId?: string;
  firebaseUid: string;
  email?: string;
  phoneNumber?: string | null;
  fullName: string;
  dateOfBirth?: string | null;
  age?: number | null;
  gender?: string | null;
  maritalStatus?: string | null;
  casteCategory?: string | null;
  occupation?: string | null;
  employmentStatus?: string | null;
  educationQualification?: string | null;
  annualFamilyIncome?: number | null;
  state?: string | null;
  district?: string | null;
  mandal?: string | null;
  villageCity?: string | null;
  residenceType?: string | null;
  pincode?: string | null;
  disabilityPercentage?: number | null;
  preferredLanguage?: string;
  profilePhotoUrl?: string | null;
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};

const API_BASE = getApiBase();

function mapRowToCitizenProfile(row: any): CitizenProfile {
  const profileId = row.profile_id || row.citizen_id || 'Civs1001';
  return {
    profileId,
    citizenId: profileId,
    firebaseUid: row.firebase_uid || '',
    email: row.email || '',
    phoneNumber: row.phone_number || '',
    fullName: row.full_name || 'Citizen',
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth).toISOString().split('T')[0] : null,
    age: row.age !== undefined && row.age !== null ? Number(row.age) : null,
    gender: row.gender || '',
    maritalStatus: row.marital_status || '',
    casteCategory: row.caste_category || '',
    occupation: row.occupation || '',
    employmentStatus: row.employment_status || '',
    educationQualification: row.education_qualification || '',
    annualFamilyIncome: row.annual_family_income !== undefined && row.annual_family_income !== null ? Number(row.annual_family_income) : null,
    state: row.state || '',
    district: row.district || '',
    mandal: row.mandal || '',
    villageCity: row.village_city || '',
    residenceType: row.residence_type || '',
    pincode: row.pincode || '',
    disabilityPercentage: row.disability_percentage !== undefined && row.disability_percentage !== null ? Number(row.disability_percentage) : 0,
    preferredLanguage: row.preferred_language || 'English',
    profilePhotoUrl: row.profile_photo_url || row.photo_url || '',
    profileCompleted: Boolean(row.profile_completed),
  };
}

export async function fetchCitizenProfileApi(uid: string, email?: string, phone?: string): Promise<CitizenProfile | null> {
  // 1. Try Supabase direct query
  if (supabase && uid) {
    try {
      const { data: sbProfile, error } = await supabase
        .from('citizen_profiles')
        .select('*')
        .eq('firebase_uid', uid)
        .maybeSingle();

      if (sbProfile && !error) {
        return mapRowToCitizenProfile(sbProfile);
      }
    } catch (sbErr) {
      console.warn('Supabase fetch error in userService:', sbErr);
    }
  }

  // 2. Fallback to backend API
  if (API_BASE && uid) {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const res = await axios.get(`${API_BASE}/api/auth/citizen-profile/${uid}${queryString}`);
      if (res.data && res.data.profile) {
        return mapRowToCitizenProfile(res.data.profile);
      }
    } catch (err) {
      console.warn('fetchCitizenProfileApi error:', err);
    }
  }

  return null;
}

export async function saveCitizenProfileApi(profileData: Partial<CitizenProfile>): Promise<CitizenProfile> {
  const profileId = profileData.citizenId || profileData.profileId || ('Civs' + Math.floor(1000 + Math.random() * 9000));
  const firebaseUid = profileData.firebaseUid;

  if (!firebaseUid) {
    throw new Error('Firebase UID is required to save citizen profile');
  }

  const payload = {
    profile_id: profileId,
    firebase_uid: firebaseUid,
    email: profileData.email ? profileData.email.trim().toLowerCase() : null,
    full_name: profileData.fullName || 'Citizen',
    phone_number: profileData.phoneNumber || null,
    date_of_birth: profileData.dateOfBirth || null,
    age: profileData.age !== undefined && profileData.age !== null ? Number(profileData.age) : null,
    gender: profileData.gender || null,
    marital_status: profileData.maritalStatus || null,
    caste_category: profileData.casteCategory || null,
    occupation: profileData.occupation || null,
    employment_status: profileData.employmentStatus || null,
    education_qualification: profileData.educationQualification || null,
    annual_family_income: profileData.annualFamilyIncome !== undefined && profileData.annualFamilyIncome !== null ? Number(profileData.annualFamilyIncome) : null,
    state: profileData.state || null,
    district: profileData.district || null,
    mandal: profileData.mandal || null,
    village_city: profileData.villageCity || null,
    residence_type: profileData.residenceType || null,
    pincode: profileData.pincode || null,
    disability_percentage: profileData.disabilityPercentage !== undefined ? Number(profileData.disabilityPercentage) : 0,
    preferred_language: profileData.preferredLanguage || 'English',
    profile_photo_url: profileData.profilePhotoUrl || null,
    profile_completed: true,
  };

  // 1. Direct Supabase Upsert
  if (supabase) {
    try {
      // Upsert parent user record first to satisfy foreign key
      await supabase.from('users').upsert({
        firebase_uid: firebaseUid,
        full_name: payload.full_name,
        email: payload.email,
        phone_number: payload.phone_number,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'firebase_uid' });

      // Upsert citizen profile
      const { data: sbProfile, error: sbErr } = await supabase
        .from('citizen_profiles')
        .upsert(payload, { onConflict: 'firebase_uid' })
        .select()
        .maybeSingle();

      if (sbProfile && !sbErr) {
        return mapRowToCitizenProfile(sbProfile);
      }
      if (sbErr) {
        console.warn('Supabase save error in userService:', sbErr);
      }
    } catch (sbEx) {
      console.warn('Supabase save exception in userService:', sbEx);
    }
  }

  // 2. Fallback to API
  if (API_BASE) {
    const res = await axios.post(`${API_BASE}/api/auth/citizen-profile/save`, payload);
    if (res.data && res.data.profile) {
      return mapRowToCitizenProfile(res.data.profile);
    }
  }

  return mapRowToCitizenProfile(payload);
}
