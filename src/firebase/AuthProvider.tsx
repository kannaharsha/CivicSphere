import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { auth, googleProvider } from './firebase';
import type { CitizenProfile } from '../services/userService';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state — fetch & load PostgreSQL profile for authenticated existing user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        axios.get(`/api/auth/profile/${firebaseUser.uid}?email=${encodeURIComponent(firebaseUser.email || '')}`)
          .then(res => {
            if (res.data && res.data.user) {
              const u = res.data.user;
              setProfile({
                uid: u.firebase_uid,
                fullName: u.full_name || firebaseUser.displayName || 'Citizen',
                email: u.email || firebaseUser.email || '',
                phone: u.phone_number || firebaseUser.phoneNumber || '',
                provider: u.auth_provider || firebaseUser.providerData[0]?.providerId || 'email',
                language: 'English',
                occupation: '',
                state: '',
                district: '',
                gender: '',
                dob: null,
                avatarUrl: u.photo_url || firebaseUser.photoURL || '',
                profileCompleted: false,
              });
            } else {
              setProfile({
                uid: firebaseUser.uid,
                fullName: firebaseUser.displayName || 'Citizen',
                email: firebaseUser.email || '',
                phone: firebaseUser.phoneNumber || '',
                provider: firebaseUser.providerData[0]?.providerId || 'email',
                language: 'English',
                occupation: '',
                state: '',
                district: '',
                gender: '',
                dob: null,
                avatarUrl: firebaseUser.photoURL || '',
                profileCompleted: false,
              });
            }
          })
          .catch(() => {
            setProfile({
              uid: firebaseUser.uid,
              fullName: firebaseUser.displayName || 'Citizen',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              provider: firebaseUser.providerData[0]?.providerId || 'email',
              language: 'English',
              occupation: '',
              state: '',
              district: '',
              gender: '',
              dob: null,
              avatarUrl: firebaseUser.photoURL || '',
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

  // Email + Password Login with Firebase lookup & PostgreSQL sync
  const login = async (email: string, pass: string) => {
    try {
      // 1. Call Backend Sync API (signInWithPassword + accounts:lookup + Postgres Insert/Update)
      const syncRes = await axios.post('/api/auth/verify-sync', {
        email: email.trim(),
        password: pass,
      });

      if (!syncRes.data || !syncRes.data.verified) {
        toast.error(syncRes.data?.message || 'Please verify your email before logging in.');
        const err = new Error(syncRes.data?.message || 'Please verify your email before logging in.');
        (err as any).code = 'auth/email-not-verified';
        throw err;
      }

      // 2. Sign in locally with Firebase Auth SDK
      await signInWithEmailAndPassword(auth, email.trim(), pass);
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

  // Email + Password Signup (Authentication-only flow)
  const signup = async (email: string, pass: string, fullName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: fullName });
        await sendEmailVerification(cred.user);
      }
      toast.success('Account created successfully. Please verify your email before logging in.');
      // Sign out user so unverified session is not kept active
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

  // Resend verification email helper
  const resendVerification = async (targetUser?: FirebaseUser) => {
    const u = targetUser || auth.currentUser;
    if (u) {
      await sendEmailVerification(u);
      toast.success('Verification email sent! Please check your inbox.');
    } else {
      toast.error('No active session found to resend verification.');
    }
  };

  // Google Sign In with PostgreSQL sync and provider linking
  const googleLogin = async () => {
    try {
      let u: FirebaseUser | null = null;
      try {
        const res = await signInWithPopup(auth, googleProvider);
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
        await axios.post('/api/auth/google-sync', {
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

  // Forgot Password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
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
