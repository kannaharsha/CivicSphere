// Citizen profile type — stored in local state from Firebase Auth data
export interface CitizenProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  provider: string;
  language: string;
  occupation: string;
  state: string;
  district: string;
  gender: string;
  dob: string | null;
  annualIncome?: number;
  avatarUrl?: string;
  profileCompleted: boolean;
}
