// Citizen profile type — stored in local state & retrieved from PostgreSQL citizen_profiles table
export interface CitizenProfile {
  profileId?: string;
  citizenId?: string;
  firebaseUid?: string;
  email: string;
  fullName: string;
  dateOfBirth?: string | null;
  age?: number | null;
  gender?: string;
  maritalStatus?: string;
  casteCategory?: string;
  occupation?: string;
  employmentStatus?: string;
  educationQualification?: string;
  annualFamilyIncome?: number | null;
  state?: string;
  district?: string;
  mandal?: string;
  villageCity?: string;
  residenceType?: string;
  pincode?: string;
  disabilityPercentage?: number;
  preferredLanguage?: string;
  profilePhotoUrl?: string;
  profileCompleted: boolean;
  // Legacy / alias fields for backward compatibility
  uid?: string;
  phone?: string;
  provider?: string;
  language?: string;
  annualIncome?: number;
  avatarUrl?: string;
  dob?: string | null;
}

