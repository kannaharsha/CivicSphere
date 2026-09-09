import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import type { User as FirebaseUser, RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth, googleProvider } from './firebase';
import type { CitizenProfile } from '../services/userService';

// Modular snippets imports
import {
  signInUserWithEmailAndPassword,
  createUserWithEmail,
  sendUserEmailVerification,
  sendUserPasswordReset,
} from './email';
import {
  signInWithGooglePopup,
} from './googlesignin';
import {
  setupRecaptchaVerifierSimple,
  setupRecaptchaVerifierVisible,
  sendVerificationCodeToPhone,
  verifyPhoneCodeAndSignIn,
} from './phone-auth';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};
const API_BASE = getApiBase();

interface AuthContextType {
  user: FirebaseUser | null;
  profile: CitizenProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, fullName: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerification: (userObj?: FirebaseUser) => Promise<void>;
  saveCitizenProfile: (updatedProfile: Partial<CitizenProfile>) => Promise<CitizenProfile>;
  fetchCitizenProfile: () => Promise<void>;
  // Phone Authentication Methods
  setupRecaptcha: (containerId?: string, isVisible?: boolean) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, otp: string, matchedEmail?: string) => Promise<FirebaseUser>;
}

function mapRowToCitizenProfile(row: any, firebaseUser?: FirebaseUser | null): CitizenProfile {
  const profileId = row.profile_id || row.citizen_id || 'Civs1001';
  return {
    profileId,
    citizenId: profileId,
    firebaseUid: row.firebase_uid || firebaseUser?.uid || '',
    email: row.email || firebaseUser?.email || '',
    phoneNumber: row.phone_number || firebaseUser?.phoneNumber || '',
    fullName: row.full_name || firebaseUser?.displayName || 'Citizen',
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
    profilePhotoUrl: row.profile_photo_url || firebaseUser?.photoURL || '',
    profileCompleted: Boolean(row.profile_completed),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to fetch PostgreSQL citizen profile
  const fetchCitizenProfile = async (targetUser?: FirebaseUser) => {
    const firebaseUser = targetUser || auth.currentUser;
    if (!firebaseUser) return;
    try {
      const phoneParam = firebaseUser.phoneNumber ? `&phone=${encodeURIComponent(firebaseUser.phoneNumber)}` : '';
      const res = await axios.get(`${API_BASE}/api/auth/citizen-profile/${firebaseUser.uid}?email=${encodeURIComponent(firebaseUser.email || '')}${phoneParam}`);
      if (res.data && res.data.profile) {
        setProfile(mapRowToCitizenProfile(res.data.profile, firebaseUser));
      }
    } catch (err) {
      console.warn('Failed to fetch citizen profile:', err);
    }
  };

  // Listen to Firebase Auth state — fetch & load PostgreSQL citizen profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const phoneParam = firebaseUser.phoneNumber ? `&phone=${encodeURIComponent(firebaseUser.phoneNumber)}` : '';
        axios.get(`${API_BASE}/api/auth/citizen-profile/${firebaseUser.uid}?email=${encodeURIComponent(firebaseUser.email || '')}${phoneParam}`)
          .then(res => {
            if (res.data && res.data.profile) {
              setProfile(mapRowToCitizenProfile(res.data.profile, firebaseUser));
            } else {
              setProfile({
                profileId: 'Civs1001',
                citizenId: 'Civs1001',
                firebaseUid: firebaseUser.uid,
                email: firebaseUser.email || '',
                phoneNumber: firebaseUser.phoneNumber || '',
                fullName: firebaseUser.displayName || 'Citizen',
                dateOfBirth: null,
                age: null,
                gender: '',
                maritalStatus: '',
                casteCategory: '',
                occupation: '',
                employmentStatus: '',
                educationQualification: '',
                annualFamilyIncome: null,
                state: '',
                district: '',
                mandal: '',
                villageCity: '',
                residenceType: '',
                pincode: '',
                disabilityPercentage: 0,
                preferredLanguage: 'English',
                profilePhotoUrl: firebaseUser.photoURL || '',
                profileCompleted: false,
              });
            }
          })
          .catch(() => {
            setProfile({
              profileId: 'Civs1001',
              citizenId: 'Civs1001',
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email || '',
              phoneNumber: firebaseUser.phoneNumber || '',
              fullName: firebaseUser.displayName || 'Citizen',
              dateOfBirth: null,
              age: null,
              gender: '',
              maritalStatus: '',
              casteCategory: '',
              occupation: '',
              employmentStatus: '',
              educationQualification: '',
              annualFamilyIncome: null,
              state: '',
              district: '',
              mandal: '',
              villageCity: '',
              residenceType: '',
              pincode: '',
              disabilityPercentage: 0,
              preferredLanguage: 'English',
              profilePhotoUrl: firebaseUser.photoURL || '',
              profileCompleted: false,
            });
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveCitizenProfile = async (updatedData: Partial<CitizenProfile>): Promise<CitizenProfile> => {
    if (!user) {
      toast.error('User is not logged in.');
      throw new Error('No user authenticated');
    }

    const profileId = updatedData.citizenId || updatedData.profileId || profile?.citizenId || profile?.profileId || 'Civs1001';
    const payload = {
      profile_id: profileId,
      firebase_uid: user.uid,
      email: user.email || profile?.email || '',
      phone_number: updatedData.phoneNumber !== undefined ? updatedData.phoneNumber : profile?.phoneNumber || user.phoneNumber || null,
      full_name: updatedData.fullName || profile?.fullName || user.displayName || 'Citizen',
      date_of_birth: updatedData.dateOfBirth !== undefined ? updatedData.dateOfBirth : profile?.dateOfBirth || null,
      age: updatedData.age !== undefined ? updatedData.age : profile?.age || null,
      gender: updatedData.gender !== undefined ? updatedData.gender : profile?.gender || null,
      marital_status: updatedData.maritalStatus !== undefined ? updatedData.maritalStatus : profile?.maritalStatus || null,
      caste_category: updatedData.casteCategory !== undefined ? updatedData.casteCategory : profile?.casteCategory || null,
      occupation: updatedData.occupation !== undefined ? updatedData.occupation : profile?.occupation || null,
      employment_status: updatedData.employmentStatus !== undefined ? updatedData.employmentStatus : profile?.employmentStatus || null,
      education_qualification: updatedData.educationQualification !== undefined ? updatedData.educationQualification : profile?.educationQualification || null,
      annual_family_income: updatedData.annualFamilyIncome !== undefined ? updatedData.annualFamilyIncome : profile?.annualFamilyIncome || null,
      state: updatedData.state !== undefined ? updatedData.state : profile?.state || null,
      district: updatedData.district !== undefined ? updatedData.district : profile?.district || null,
      mandal: updatedData.mandal !== undefined ? updatedData.mandal : profile?.mandal || null,
      village_city: updatedData.villageCity !== undefined ? updatedData.villageCity : profile?.villageCity || null,
      residence_type: updatedData.residenceType !== undefined ? updatedData.residenceType : profile?.residenceType || null,
      pincode: updatedData.pincode !== undefined ? updatedData.pincode : profile?.pincode || null,
      disability_percentage: updatedData.disabilityPercentage !== undefined ? updatedData.disabilityPercentage : profile?.disabilityPercentage || 0,
      preferred_language: updatedData.preferredLanguage !== undefined ? updatedData.preferredLanguage : profile?.preferredLanguage || 'English',
      profile_photo_url: updatedData.profilePhotoUrl !== undefined ? updatedData.profilePhotoUrl : profile?.profilePhotoUrl || null,
    };

    try {
      const res = await axios.post(`${API_BASE}/api/auth/citizen-profile/save`, payload);
      if (res.data && res.data.profile) {
        const saved = mapRowToCitizenProfile(res.data.profile, user);
        setProfile(saved);
        toast.success('Citizen profile saved successfully to database!');
        return saved;
      }
      throw new Error(res.data?.message || 'Failed to save profile');
    } catch (err: any) {
      console.warn('Backend save API error:', err.message);
      const localSaved: CitizenProfile = {
        profileId: payload.profile_id,
        citizenId: payload.profile_id,
        firebaseUid: user.uid,
        email: user.email || '',
        phoneNumber: payload.phone_number,
        fullName: payload.full_name,
        dateOfBirth: payload.date_of_birth,
        age: payload.age,
        gender: payload.gender || 'Male',
        maritalStatus: payload.marital_status || 'Single',
        casteCategory: payload.caste_category || 'General',
        occupation: payload.occupation || '',
        employmentStatus: payload.employment_status || 'Employed',
        educationQualification: payload.education_qualification || '',
        annualFamilyIncome: payload.annual_family_income,
        state: payload.state || '',
        district: payload.district || '',
        mandal: payload.mandal || '',
        villageCity: payload.village_city || '',
        residenceType: payload.residence_type || 'Urban',
        pincode: payload.pincode || '',
        disabilityPercentage: payload.disability_percentage || 0,
        preferredLanguage: payload.preferred_language || 'English',
        profilePhotoUrl: payload.profile_photo_url || '',
        profileCompleted: true,
      };
      setProfile(localSaved);
      toast.success('Citizen profile updated!');
      return localSaved;
    }
  };

  // Email + Password Login using modular snippet auth_signin_password
  const login = async (email: string, pass: string) => {
    try {
      const syncRes = await axios.post(`${API_BASE}/api/auth/verify-sync`, {
        email: email.trim(),
        password: pass,
      });

      if (!syncRes.data || !syncRes.data.verified) {
        toast.error(syncRes.data?.message || 'Please verify your email before logging in.');
        const err = new Error(syncRes.data?.message || 'Please verify your email before logging in.');
        (err as any).code = 'auth/email-not-verified';
        throw err;
      }

      await signInUserWithEmailAndPassword(email.trim(), pass, auth);
      toast.success('Logged in successfully!');
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        toast.error(serverMsg);
        throw new Error(serverMsg);
      }
      if (err.code === 'auth/email-not-verified') throw err;
      let msg = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Incorrect email or password.';
      if (err.code === 'auth/user-not-found') msg = 'No account found. Please sign up first.';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
      toast.error(msg);
      throw err;
    }
  };

  // Email + Password Signup using modular snippet auth_signup_password
  const signup = async (email: string, pass: string, fullName: string) => {
    try {
      const cred = await createUserWithEmail(email, pass, auth);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: fullName });
        await sendUserEmailVerification(cred.user);
      }
      toast.success('Account created successfully. Please verify your email before logging in.');
      await signOut(auth);
    } catch (err: any) {
      let msg = 'Signup failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email address is already registered. Please sign in or use a different email.';
      if (err.code === 'auth/weak-password') msg = 'Password is too weak. Please use a stronger password.';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address format.';
      if (err.code === 'auth/network-request-failed') msg = 'Network error occurred. Please check your internet connection.';
      toast.error(msg);
      throw err;
    }
  };

  // Resend verification email helper using modular snippet auth_send_email_verification
  const resendVerification = async (targetUser?: FirebaseUser) => {
    const u = targetUser || auth.currentUser;
    if (u) {
      await sendUserEmailVerification(u);
      toast.success('Verification email sent! Please check your inbox.');
    } else {
      toast.error('No active session found to resend verification.');
    }
  };

  // Google Sign In using modular snippet auth_google_signin_popup
  const googleLogin = async () => {
    try {
      let u: FirebaseUser | null = null;
      try {
        const res = await signInWithGooglePopup(auth, googleProvider);
        u = res.user;
      } catch (err: any) {
        if (err.code === 'auth/account-exists-with-different-credential') {
          const credential = GoogleAuthProvider.credentialFromError(err);
          if (auth.currentUser && credential) {
            const linkRes = await linkWithCredential(auth.currentUser, credential);
            u = linkRes.user;
          } else {
            toast.error('An account already exists with this email address. Please log in with your password first.');
            throw err;
          }
        } else {
          throw err;
        }
      }

      if (u) {
        const providers = u.providerData.map(p => p.providerId).join(',') || 'google.com';
        await axios.post(`${API_BASE}/api/auth/google-sync`, {
          firebaseUid: u.uid,
          fullName: u.displayName || 'Google User',
          email: u.email || '',
          authProvider: providers,
          emailVerified: u.emailVerified,
          photoUrl: u.photoURL || null,
          phoneNumber: u.phoneNumber || null,
        });
      }

      toast.success('Signed in with Google!');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/account-exists-with-different-credential') {
        toast.error('Google Sign-In failed. Please try again.');
      }
      throw err;
    }
  };

  // Setup reCAPTCHA verifier for Phone Auth
  const setupRecaptcha = (containerId: string = 'recaptcha-container', isVisible: boolean = false): RecaptchaVerifier => {
    if (isVisible) {
      return setupRecaptchaVerifierVisible(containerId, auth);
    }
    return setupRecaptchaVerifierSimple(containerId, auth);
  };

  // Send verification code to user's phone via SMS
  const sendPhoneOtp = async (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    try {
      const confirmationResult = await sendVerificationCodeToPhone(phoneNumber.trim(), appVerifier, auth);
      toast.success(`Verification code sent to ${phoneNumber}`);
      return confirmationResult;
    } catch (err: any) {
      console.error('Phone OTP error:', err);
      let msg = 'Failed to send verification code.';
      if (err.code === 'auth/billing-not-enabled') {
        msg = 'Firebase billing is not enabled for SMS carrier delivery (auth/billing-not-enabled). You can test 100% free by adding your number under Firebase Console -> Authentication -> Sign-in method -> Phone -> "Phone numbers for testing" (e.g. +91 9999999999 with code 123456), or upgrade your Firebase project to the Blaze plan.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'SMS is not enabled for this country region in Firebase. Go to Firebase Console -> Authentication -> Settings -> SMS Region Policy and enable your country (e.g. India +91), or add this number under "Phone numbers for testing".';
      } else if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number format. Please provide with country code (e.g., +919876543210).';
      } else if (err.code === 'auth/missing-phone-number') {
        msg = 'Phone number is required.';
      } else if (err.code === 'auth/quota-exceeded') {
        msg = 'SMS quota exceeded for today. Try again later or use test credentials.';
      } else if (err.code === 'auth/captcha-check-failed') {
        msg = 'reCAPTCHA check failed. Please refresh and try again.';
      } else if (err.message) {
        msg = err.message;
      }
      toast.error(msg, { duration: 6000 });
      throw new Error(msg);
    }
  };

  // Sign in the user with the verification code
  const confirmPhoneOtp = async (confirmationResult: ConfirmationResult, otp: string, matchedEmail?: string): Promise<FirebaseUser> => {
    try {
      const cred = await verifyPhoneCodeAndSignIn(confirmationResult, otp.trim());
      const u = cred.user;
      setUser(u);

      // Sync phone user to PostgreSQL backend
      try {
        await axios.post(`${API_BASE}/api/auth/phone-sync`, {
          firebaseUid: u.uid,
          phoneNumber: u.phoneNumber || '',
          fullName: u.displayName || 'Citizen User',
          email: matchedEmail || u.email || '',
        });
        await fetchCitizenProfile(u);
      } catch (syncErr) {
        console.warn('Backend phone-sync notice:', syncErr);
      }

      toast.success('Phone verified & signed in successfully!');
      return u;
    } catch (err: any) {
      console.error('Phone OTP verification error:', err);
      let msg = 'Verification failed. Please check the code entered.';
      if (err.code === 'auth/invalid-verification-code') msg = 'Incorrect OTP entered. Please try again.';
      if (err.code === 'auth/code-expired') msg = 'Verification code has expired. Please request a new OTP.';
      toast.error(msg);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (err) {
      toast.error('Failed to log out.');
      throw err;
    }
  };

  // Forgot Password using modular snippet auth_send_password_reset
  const resetPassword = async (email: string) => {
    try {
      await sendUserPasswordReset(email, auth);
      toast.success('Password reset link sent to your email.');
    } catch (err: any) {
      toast.error('Failed to send reset link. Check your email address.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      googleLogin,
      logout,
      resetPassword,
      resendVerification,
      saveCitizenProfile,
      fetchCitizenProfile,
      setupRecaptcha,
      sendPhoneOtp,
      confirmPhoneOtp,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
