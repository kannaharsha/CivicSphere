import axios from 'axios';

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

export async function fetchCitizenProfileApi(uid: string, email?: string, phone?: string): Promise<CitizenProfile | null> {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    if (phone) params.append('phone', phone);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const res = await axios.get(`${API_BASE}/api/auth/citizen-profile/${uid}${queryString}`);
    if (res.data && res.data.profile) {
      return res.data.profile;
    }
    return null;
  } catch (err) {
    console.warn('fetchCitizenProfileApi error:', err);
    return null;
  }
}

export async function saveCitizenProfileApi(profileData: Partial<CitizenProfile>): Promise<CitizenProfile> {
  const res = await axios.post(`${API_BASE}/api/auth/citizen-profile/save`, profileData);
  if (res.data && res.data.profile) {
    return res.data.profile;
  }
  throw new Error(res.data?.message || 'Failed to save citizen profile');
}
